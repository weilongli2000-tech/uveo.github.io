"use strict";

const discovery = (() => {
  const guideTerms = {
    basketball: ["篮球", "篮球馆", "basketball", "硅PU", "硅聚氨酯", "丙烯酸"],
    racket: ["匹克球", "皮克球", "网球", "丙烯酸", "pickle ball", "tennis"],
    track: ["田径", "塑胶跑道", "塑胶田径场", "running track"],
    turf: ["足球场", "足球", "草坪", "人工草", "人工草坪", "仿真草", "artificial grass", "soccer field"],
    badminton: ["羽毛球", "羽球", "羽毛球馆", "PVC地胶", "badminton"]
  };

  const serviceTerms = {
    new: ["建设", "新建", "球场建设", "球场施工", "施工", "建球场", "铺装", "球场划线", "划线"],
    renew: ["翻新", "改造", "球场翻修", "翻修", "旧场更新", "重新铺装", "维修", "修补"],
    care: ["维护", "球场维护", "养护", "保养", "球场维修", "维修", "修补", "清洁", "巡检"]
  };

  const equipmentTerms = {
    "eq-basketball": ["篮球框", "篮筐", "篮框", "篮球篮板", "移动篮球架", "basketball hoop"],
    "eq-net": ["球网", "网柱", "皮克球网", "皮克球", "court net", "pickleball net"],
    "eq-goal": ["足球球门", "soccer goal", "football goal"],
    "eq-fence": ["球场围栏", "球场围网", "围栏", "court fence"],
    "eq-training": ["训练障碍", "球车", "training cones"],
    "eq-basketball-balls": ["basketball", "basketball ball"],
    "eq-pickleball": ["皮克球", "皮克球拍", "pickle ball", "pickleball paddle"],
    "eq-football-balls": ["soccer ball", "football"],
    "eq-badminton": ["羽球", "badminton racket"],
    "eq-volleyball": ["volleyball net"],
    "eq-table-tennis": ["乒乓", "乒乓球桌", "乒乓球拍", "table tennis", "ping pong"],
    "eq-fitness": ["健身设备", "gym equipment"],
    "eq-tennis": ["tennis racket"],
    "eq-athletics": ["田径训练", "track and field equipment"]
  };

  function compact(value) {
    return value.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  }

  function fields(values) {
    return values.filter(Boolean).map(compact).filter(Boolean);
  }

  const services = Object.entries(serviceTypes);
  const guideIndex = venueGuides.map(guide => ({
    item: guide,
    name: compact(guide.name),
    primary: fields([guide.english, guide.tag, ...guide.materials.map(material => material.name)]),
    aliases: fields(guideTerms[guide.id] || []),
    detail: fields([
      guide.summary, guide.intro,
      ...guide.materials.map(material => material.description),
      ...guide.layers.flatMap(layer => [layer.name, layer.description]),
      ...guide.steps.flatMap(step => [step.name, step.description]),
      ...guide.checks, ...guide.faqs.map(faq => faq.question)
    ])
  }));

  const sportContext = fields(venueGuides.flatMap(guide => [
    guide.name, guide.english, ...(guideTerms[guide.id] || []),
    ...guide.venueIds.map(id => venues.find(venue => venue.id === id)?.name)
  ]));

  const serviceIndex = services.map(entry => ({
    item: entry,
    name: compact(entry[1].name),
    primary: fields([entry[1].label]),
    aliases: fields(serviceTerms[entry[0]] || []),
    detail: fields([entry[1].intro]),
    context: sportContext
  }));

  const equipmentIndex = equipment.map(product => ({
    item: product,
    name: compact(product.name),
    primary: fields([product.tag, ...product.options, ...(product.sports.length === 1 ? product.sports : [])]),
    aliases: fields(equipmentTerms[product.id] || []),
    detail: fields([product.summary, product.description, product.group, ...product.specs])
  }));

  const vocabulary = [...new Set([...guideIndex, ...serviceIndex, ...equipmentIndex].flatMap(entry => [
    entry.name, ...entry.primary, ...entry.aliases
  ]))].filter(term => term.length > 1).sort((a, b) => b.length - a.length);

  function tokenize(query) {
    return String(query ?? "").slice(0, 120).normalize("NFKC").toLowerCase()
      .split(/[^\p{L}\p{N}]+/u).filter(Boolean).slice(0, 12);
  }

  // Support common unspaced Chinese phrases such as “篮球场维修”.
  function splitKnown(term) {
    if (!/\p{Script=Han}/u.test(term) || vocabulary.includes(term)) return [term];
    const parts = [];
    let rest = term;
    while (rest) {
      const part = vocabulary.find(word => rest.startsWith(word));
      if (!part) return [term];
      parts.push(part);
      rest = rest.slice(part.length);
    }
    return parts;
  }

  function includes(fields, term) {
    return fields.some(field => field.includes(term));
  }

  function score(entry, term) {
    if (entry.name === term) return 32;
    if (entry.name.startsWith(term)) return 24;
    if (entry.name.includes(term)) return 20;
    if (includes(entry.primary, term)) return 14;
    if (entry.aliases.includes(term)) return 12;
    if (term.length > 1 && includes(entry.aliases, term)) return 8;
    if (includes(entry.detail, term)) return 5;
    return 0;
  }

  function rank(index, query, boost = () => 0) {
    const tokens = tokenize(query);
    if (!tokens.length) return index.slice().sort((a, b) => boost(b.item) - boost(a.item)).map(entry => entry.item);
    const combined = tokens.join("");
    const spacedTerms = tokens.flatMap(splitKnown);
    const results = index.flatMap(entry => {
      const whole = score(entry, combined);
      const scores = spacedTerms.map(term => score(entry, term));
      const partial = scores.every((value, i) => value || (entry.context && includes(entry.context, spacedTerms[i])));
      const tokenScore = partial && scores.some(Boolean) ? scores.reduce((sum, value) => sum + value, 0) / scores.length : 0;
      if (!whole && !tokenScore) return [];
      return [{ item: entry.item, weight: Math.max(whole, tokenScore) + (whole ? 2 : 0) + boost(entry.item) }];
    });
    return results.sort((a, b) => b.weight - a.weight).map(result => result.item);
  }

  return Object.freeze({
    search(query) {
      if (!tokenize(query).length) {
        return { guides: venueGuides.slice(0, 2), services: services.slice(), products: equipment.slice(0, 3) };
      }
      return {
        guides: rank(guideIndex, query),
        services: rank(serviceIndex, query),
        products: rank(equipmentIndex, query)
      };
    },

    equipment(query, group = "全部") {
      if (group === "全部") return rank(equipmentIndex, query);
      const matchingSport = equipmentIndex.filter(entry => entry.item.sports.includes(group));
      return rank(matchingSport, query, product => product.sports.length === 1 ? 1 : 0);
    }
  });
})();
