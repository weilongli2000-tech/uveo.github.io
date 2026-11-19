"use strict";
const paths = {
  clipboard:'<rect x="5" y="4" width="14" height="17" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1" fill="white"/><path d="M8 11h8m-8 4h6"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.8"/><path d="m16 16 5 5"/>',
  heart:'<path d="M20.3 4.9a5.1 5.1 0 0 0-7.2 0L12 6l-1.1-1.1a5.1 5.1 0 0 0-7.2 7.2L12 20.5l8.3-8.4a5.1 5.1 0 0 0 0-7.2Z"/>',
  bag:'<path d="M5 7.5h14l1.2 13H3.8L5 7.5Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 18 18 0 0 1-7.8-2.8 18 18 0 0 1-5.5-5.5A18 18 0 0 1 3.7 5.7 2 2 0 0 1 5.7 3h3a2 2 0 0 1 2 1.7l.5 2.9a2 2 0 0 1-.6 2.1l-1.3 1.3a14 14 0 0 0 5 5l1.3-1.3a2 2 0 0 1 2.1-.6l2.9.5a2 2 0 0 1 1.4 2.3Z"/>',
  right:'<path d="m9 5 7 7-7 7"/>',left:'<path d="m15 5-7 7 7 7"/>',
  arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',up:'<path d="M5.5 18.5 18 6M6.5 6H18v11.5"/>',
  close:'<path d="m5 5 14 14M19 5 5 19"/>',menu:'<path d="M3 6h18M3 12h18M3 18h18"/>'
};
const icon = name => '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + paths[name] + '</svg>';
document.querySelectorAll("[data-icon]").forEach(el => el.innerHTML = icon(el.dataset.icon));
const venueById = new Map(venues.map(v => [v.id, v]));
const guideById = new Map(venueGuides.map(g=>[g.id,g]));
const guideForVenue = new Map(venueGuides.flatMap(g=>g.venueIds.map(id=>[id,g])));
const equipmentById = new Map(equipment.map(p => [p.id, p]));
const img = id => "assets/venues/" + id + ".jpg";
const main = document.getElementById("main");
const panel = document.getElementById("panel");
const content = document.getElementById("panel-content");
const titles = { all:"场地技术百科", build:"新建与翻新", new:"场地新建", renew:"旧场翻新", care:"场地维护" };
const html = str => String(str).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function save(key,value) { try { localStorage.setItem(key,JSON.stringify(value)); } catch {} }
const acceptArray = v => Array.isArray(v) ? v : [];
const saved = new Set(acceptArray(read("uveo.venues.saved",[])).map(id=>guideById.has(id)?id:guideForVenue.get(id)?.id).filter(Boolean));
let brief = acceptArray(read("uveo.venues.brief",[])).filter(row=>row && venueById.has(row.id) && Object.hasOwn(serviceTypes,row.service));
let notes = String(read("uveo.venues.notes",""));
const maxOrderQuantity = 99999;
let equipmentBrief = acceptArray(read("uveo.equipment.brief",[])).filter(r=>r && equipmentById.has(r.id) && equipmentById.get(r.id).options.includes(r.option) && Number.isInteger(r.quantity) && r.quantity>0 && r.quantity<=maxOrderQuantity);
let equipmentGroup="全部", equipmentQuery="", selectedEquipment="";
let slide=0, group="全部", selectedVenue="", selectedService="new", toastTimer;
let inquiryDraft = {};
let searchQuery = "", searchScope = "all";
const searchScopes = {all:"全部", guides:"场地百科", services:"工程服务", products:"设施装备"};
const campaigns=[
  {tag:"VENUES & EQUIPMENT",title:["建设好场地，","配齐好装备。"],desc:"体育场地新建、翻新、维护及装备批发，服务广东全省。",cta:"查看建设与维护服务",url:"#services",photo:"assets/court-hero.webp",alt:"俯瞰红色室外篮球场及白色场线"},
  {tag:"COURT RENOVATION",title:["旧场地，","新开局。"],desc:"从开裂的底线到磨损的面层，找到适合的翻新方案。",cta:"了解场地翻新",url:"#services",photo:img("tennis"),alt:"网球场硬地面层与球场标线"},
  {tag:"FACILITY CARE",title:["养好场，","再上场。"],desc:"让草坪梳理、接缝巡查与局部修复成为日常。",cta:"查看维护服务",url:"#services",photo:img("turf"),alt:"足球场草坪及边界线"}
];
function badge(){
  const el=document.querySelector(".bag-count");
  const count=brief.length+equipmentBrief.length;
  el.hidden=!count;el.textContent=count;
  document.querySelectorAll('[data-brief-count]').forEach(el=>el.textContent=count);
  document.querySelector(".mobile-quick-nav [data-brief-count]").hidden=!count;
  document.querySelector(".bag-icon").setAttribute("aria-label",`需求清单，${count} 项`);
  const summary=document.getElementById("quote-list-description");
  if(summary)summary.textContent=inquiryListSummary();
  if(count)document.getElementById("inquiry-form")?.elements.message.setCustomValidity("");
}
function notify(msg){
  const el=document.querySelector("#toast");el.textContent=msg;el.classList.add("on");
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("on"),1800);
}
function hero(){
  const c=campaigns[slide];
  return `<img class="hero-image" src="${c.photo}" alt="${c.alt}" fetchpriority="high"><div class="hero-shade"></div><div class="hero-content"><div class="eyebrow">${c.tag}</div><h1>${c.title.map(t=>"<span>"+t+"</span>").join("")}</h1><p class="hero-copy">${c.desc}</p><div class="hero-links"><a class="pill light" href="${c.url}">${c.cta} ${icon("arrow")}</a><a class="hero-secondary" href="#equipment">选购设施装备 ${icon("arrow")}</a></div></div><div class="hero-controls"><span class="hero-count">0${slide+1} <small>/ 03</small></span><button class="round" aria-label="上一组主视觉" data-slide="-1">${icon("left")}</button><button class="round" aria-label="下一组主视觉" data-slide="1">${icon("right")}</button></div>`;
}
function knowledgeCard(g){
  const liked=saved.has(g.id);
  return `<article class="product-card knowledge-card"><a class="product-link" href="#guide/${g.id}"><span class="photo"><img src="${img(g.photo)}" alt="${g.name}示意" loading="lazy"><span class="product-flag">材料与工艺</span></span><span class="product-info"><strong>${g.name}</strong>${icon("up")}</span><span class="product-type">${g.summary}</span><span class="knowledge-link">材料与工艺百科 ${icon("arrow")}</span></a><button class="round save-item ${liked?"is-saved":""}" data-save="${g.id}" aria-pressed="${liked}" aria-label="${liked?"取消收藏":"收藏"}${g.name}百科">${icon("heart")}</button></article>`;
}
function serviceCard(g,mode){
  return `<article class="product-card"><button class="product-link" data-venue="${g.venueIds[0]}" data-mode="${mode}"><span class="photo"><img src="${img(g.photo)}" alt="${g.name}示意" loading="lazy"><span class="product-flag">${serviceTypes[mode].name}</span></span><span class="product-info"><strong>${g.name}</strong>${icon("up")}</span><span class="product-type">${g.venueIds.length>1?"选择匹克球或网球项目，整理服务需求":"选择服务内容，整理项目需求"}</span></button></article>`;
}
function guideIndex(){
  main.innerHTML=`<section class="collection guide-index"><div class="crumb"><a href="#">首页</a>　/　场地技术百科</div><p class="overline">VENUE KNOWLEDGE</p><h1>先了解材料，再看懂工艺。</h1><p class="collection-intro">五类运动场地，从面层选材、系统构造到施工流程与质量关注点，逐步了解一片好场地如何形成。</p><div class="knowledge-grid">${venueGuides.map(knowledgeCard).join("")}</div></section>`;
}
function guidePage(id){
  const g=guideById.get(id);if(!g){guideIndex();return;}
  const chapterLinks=[["materials","材料选择"],["layers","系统构造"],["process","施工工艺"],["checks","质量关注点"],["faq","常见问题"]];
  main.innerHTML=`<article class="venue-guide collection" data-guide="${g.id}">
    <div class="crumb"><a href="#">首页</a>　/　<a href="#venues">场地类型</a>　/　${g.name}</div>
    <header class="guide-hero"><div><p class="overline">VENUE KNOWLEDGE / ${g.english}</p><h1>${g.name}</h1><p class="guide-subtitle">材料与施工工艺百科</p><p class="collection-intro">${g.intro}</p><div class="guide-topics"><span>面层选材</span><span>系统构造</span><span>施工工艺</span></div></div><img src="${img(g.photo)}" alt="${g.name}场地示意"></header>
    <nav class="guide-categories" aria-label="切换场地百科">${venueGuides.map(v=>`<a href="#guide/${v.id}" ${v.id===id?'aria-current="page"':''}>${v.name}</a>`).join("")}</nav>
    <div class="guide-layout"><aside class="guide-toc"><p>本页目录</p>${chapterLinks.map(([key,label],i)=>`<a href="#guide/${id}/${key}" data-chapter="${key}"><span>0${i+1}</span>${label}</a>`).join("")}<a href="#guide/${id}/sources" data-chapter="sources"><span>06</span>参考资料</a></aside><div class="guide-body">
      <section id="guide-materials" class="guide-section"><p class="overline">01 / MATERIALS</p><h2>材料怎么选？</h2><p class="guide-section-intro">比较完整的材料系统与适用环境，而不只看面层名称。</p><div class="material-grid">${g.materials.map(m=>`<article class="material-card"><h3>${m.name}</h3><p>${m.description}</p><dl><div><dt>适用方向</dt><dd>${m.suitable}</dd></div><div><dt>选择时关注</dt><dd>${m.attention}</dd></div></dl></article>`).join("")}</div></section>
      <section id="guide-layers" class="guide-section"><p class="overline">02 / SYSTEM BUILD-UP</p><h2>从基础到面层，看懂系统构造。</h2><p class="guide-section-intro">以下按从下到上的顺序理解常见构造；不同材料系统的层次与做法会有所不同。</p><ol class="layer-list">${g.layers.map(l=>`<li><strong>${l.name}</strong><p>${l.description}</p></li>`).join("")}</ol></section>
      <section id="guide-process" class="guide-section"><p class="overline">03 / CONSTRUCTION PROCESS</p><h2>施工工艺的关键环节。</h2><ol class="process-list">${g.steps.map(s=>`<li><h3>${s.name}</h3><p>${s.description}</p></li>`).join("")}</ol></section>
      <section id="guide-checks" class="guide-section"><p class="overline">04 / QUALITY CHECKPOINTS</p><h2>不只看外观，还要看这些。</h2><ul class="guide-checks">${g.checks.map(c=>`<li>${c}</li>`).join("")}</ul></section>
      <section id="guide-faq" class="guide-section"><p class="overline">05 / COMMON QUESTIONS</p><h2>常见问题</h2><div class="guide-faq">${g.faqs.map(f=>`<details><summary>${f.question}</summary><p>${f.answer}</p></details>`).join("")}</div></section>
      <section id="guide-sources" class="guide-section guide-sources"><p class="overline">06 / REFERENCES</p><h2>参考资料</h2><p>本文为材料与工艺的一般性介绍。具体系统、厚度、基础条件及实施参数，应结合项目设计和所选材料的技术文件确认。</p><ul>${g.sources.map(s=>`<li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.title} ${icon("up")}</a></li>`).join("")}</ul></section>
    </div></div><div class="guide-next"><a class="text-link" href="#venues">${icon("left")} 返回五类场地</a><a class="text-link" href="#services">建设与维护服务 ${icon("arrow")}</a></div>
  </article>`;
}
function home(){
  main.innerHTML=`<section class="hero" aria-label="体育场地服务">${hero()}</section><section class="section venue-knowledge-home" id="venues" aria-labelledby="venue-heading"><div class="section-head"><div><div class="overline">VENUE KNOWLEDGE</div><h2 id="venue-heading">场地类型</h2></div><a class="text-link" href="#shop/all">技术百科 ${icon("up")}</a></div><p class="section-intro">从材料选择到施工工艺，了解五类运动场地的技术知识。</p><div class="knowledge-grid">${venueGuides.map(knowledgeCard).join("")}</div></section><section class="section sport-section" id="services"><div class="section-head"><div><div class="overline">OUR SERVICES</div><h2>建设与维护服务</h2></div></div><p class="section-intro">选择新建、翻新或维护，再按运动项目整理服务与询价需求。</p><div class="sport-grid">${Object.entries(serviceTypes).map(([key,s])=>`<a class="sport-tile" href="#shop/${key}"><img src="${img(s.photo)}" loading="lazy" alt="${s.alt||""}"><strong>${s.name}</strong>${icon("up")}</a>`).join("")}</div></section>`;
  document.querySelector(".hero").setAttribute("aria-label","体育场地与设施装备");
  document.querySelector(".hero").insertAdjacentHTML("afterend", `<nav class="journey-grid" aria-label="快速找到所需">
    <a class="journey-card" href="#services"><span>场地工程</span><strong>新建、翻新或维护场地</strong><p>选择服务和运动项目，整理工程需求。</p>${icon("arrow")}</a>
    <a class="journey-card" href="#equipment"><span>装备采购</span><strong>采购设施与运动用品</strong><p>按运动项目查找装备，选择配置和数量。</p>${icon("arrow")}</a>
    <a class="journey-card" href="#venues"><span>选材参考</span><strong>了解场地材料与工艺</strong><p>查阅五类运动场地的技术百科。</p>${icon("arrow")}</a>
  </nav>`);
  main.insertAdjacentHTML("beforeend",`<section class="company-intro"><div><p class="overline">UVEO · GUANGDONG</p><h2>好材料，好手艺，好服务。</h2><p>${company.name}，专注体育场地建设、体育设施建设与体育用品批发。</p></div><div class="company-intro-side"><span>服务广东全省</span><a class="text-link" href="#about">了解 UVEO ${icon("arrow")}</a></div></section>`);
  main.insertAdjacentHTML("beforeend",`<section class="section equipment-home"><div class="section-head"><div><div class="overline">SPORTS EQUIPMENT</div><h2>好场地，也要好装备。</h2></div><a class="text-link" href="#equipment">浏览全部装备 ${icon("up")}</a></div><p class="section-intro">篮球、匹克球、足球、羽毛球、排球、乒乓球、健身器材、网球与田径，九大品类全部询价。</p><div class="product-grid">${[equipment[0],equipment[2],equipment[4]].map(equipmentCard).join("")}</div><div class="equipment-note">按需求选择配置，加入清单统一询价。${icon("arrow")}</div></section><section class="home-contact"><div><p class="overline">LET’S GET STARTED</p><h2>一片场地，一套装备。<br>从你的运动需求开始。</h2></div><a class="pill" href="#contact">联系我们 ${icon("arrow")}</a></section>`);
}
function equipmentCard(p){
  return `<article class="product-card equipment-card"><button class="product-link" data-equipment="${p.id}"><span class="photo"><img src="${p.image}" alt="" loading="lazy" decoding="async"><span class="product-flag">${p.tag}</span></span><span class="product-info"><strong>${p.name}</strong>${icon("up")}</span><span class="product-type">${p.summary}</span><span class="equipment-cta">全部询价 · 选择配置 ${icon("arrow")}</span></button></article>`;
}
function equipmentCollection(){
  main.innerHTML=`<section class="collection equipment-collection">
    <div class="crumb"><a href="#">首页</a>　/　设施装备</div>
    <h1>设施装备</h1><p class="collection-intro">按运动项目查找体育设施和运动用品，全部产品按需询价。照片为品类参考。</p>
    <div class="catalog-search-wrap"><label class="catalog-search">${icon("search")}<input type="search" id="catalog-search" aria-label="搜索设施装备" placeholder="搜索篮球架、球网、训练器材…" value="${html(equipmentQuery)}"></label></div>
    <div class="catalog-tools"><div class="chips">${["全部",...company.sports].map(g=>`<button class="chip" type="button" data-equipment-filter="${g}" aria-pressed="false">${g}</button>`).join("")}</div><span class="result-count" id="catalog-count" role="status"></span></div>
    <div id="equipment-results" class="product-grid"></div>
    <div class="catalog-consult"><p><strong>批量采购或整场配套</strong>有现成清单，或需要一起选型，可直接填写采购需求。</p><a class="pill" href="#contact/quote/equipment">整理采购询价 ${icon("arrow")}</a></div>
    <p class="catalog-disclaimer">具体款式、型号、规格、运送及安装范围以询价确认结果为准。</p>
  </section>`;
  renderEquipmentResults();
}
function renderEquipmentResults() {
  const products = discovery.equipment(equipmentQuery, equipmentGroup);
  main.querySelectorAll("[data-equipment-filter]").forEach(button => {
    const active = button.dataset.equipmentFilter === equipmentGroup;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  document.getElementById("catalog-count").textContent = `${products.length} 项装备`;
  document.getElementById("equipment-results").innerHTML = products.length
    ? products.map(equipmentCard).join("")
    : '<div class="search-empty"><p>没有找到符合条件的装备。可以换个关键词，或直接告诉我们你要采购什么。</p><button class="text-link" type="button" data-action="reset-equipment">清除搜索和筛选</button> <a class="text-link" href="#contact/quote/equipment">填写采购需求</a></div>';
}
function equipmentDetail(id,fromSearch=false){
  const p=equipmentById.get(id);
  if(!p)return;
  selectedEquipment=id;
  drawer("设施装备", `
    ${fromSearch ? `<button class="text-link" type="button" data-action="search">${icon("left")} 返回搜索结果</button>` : ""}
    <figure class="equipment-photo"><img class="panel-product equipment-cover" src="${p.image}" alt="${p.name}品类参考照片"><figcaption>品类参考图</figcaption></figure>
    <h3 class="detail-title">${p.name}</h3><p class="service-detail">${p.description}</p>
    <ul class="equipment-specs">${p.specs.map(s=>`<li>${s}</li>`).join("")}</ul>
    <label class="brief-label" for="equipment-option">需求配置</label><select id="equipment-option" class="equipment-select">${p.options.map(o=>`<option>${o}</option>`).join("")}</select>
    <label class="brief-label" for="equipment-quantity">采购数量（${p.unit}）</label>
    <div class="quantity-input"><button type="button" data-quantity="-1" aria-label="减少数量">−</button><input id="equipment-quantity" type="number" inputmode="numeric" min="1" max="${maxOrderQuantity}" step="1" value="1" required><button type="button" data-quantity="1" aria-label="增加数量">+</button></div>
    <div class="cart-added" id="item-added" role="status"></div>
    <button class="pill wide" type="button" data-action="add-equipment">加入需求清单 ${icon("arrow")}</button>
    <button class="pill outline wide" type="button" data-action="bag" id="item-view-list" hidden>查看需求清单</button>
    <p class="panel-hint">全部产品询价。具体款式、型号、价格与交付方式需确认。</p>
  `);
}
function about(){
  main.innerHTML=`<section class="collection about-page">
    <div class="crumb"><a href="#">首页</a>　/　关于我们</div>
    <div class="about-lead"><div><p class="overline">ABOUT UVEO</p><h1>好材料，<br>好手艺，好服务。</h1><p class="company-name">${company.name}</p><p class="collection-intro">${company.description}</p><span class="area-label">立足广州 · 服务${company.serviceArea}</span><a class="pill" href="#contact">聊聊你的需求 ${icon("arrow")}</a></div><img src="assets/venues/basketball.jpg" alt="篮球场地与体育设施示意" loading="lazy"></div>
    <div class="about-business"><article><span class="overline">01 / SPORTS VENUES</span><h2>体育场地与设施建设</h2><p>从新建规划、面层铺装，到旧场翻新、日常维护与设施配套，围绕场地实际使用需求安排服务，业务覆盖广东全省。</p><a class="text-link" href="#services">探索场地服务 ${icon("arrow")}</a></article><article><span class="overline">02 / SPORTS EQUIPMENT</span><h2>体育用品与装备批发</h2><p>涵盖篮球、匹克球、足球、羽毛球、排球、乒乓球、健身器材、网球及田径九大品类，支持独立采购与项目配套，全部询价。</p><a class="text-link" href="#equipment">浏览设施装备 ${icon("arrow")}</a></article></div>
    <div class="values-grid"><article><span>01 / MATERIALS</span><h3>用心选材</h3><p>结合运动项目、使用环境与预算，沟通适合的材料和设施配置。</p></article><article><span>02 / CRAFT</span><h3>扎实施工</h3><p>关注基础、面层与收口细节，以认真负责的手艺做好每一片场地。</p></article><article><span>03 / SERVICE</span><h3>周到服务</h3><p>从需求沟通到场地维护、用品配套，让每一个环节都有清晰回应。</p></article></div>
  </section>`;
}
const inquiryTypes = ["体育场地服务", "设施装备采购", "场地服务与装备配套", "体育用品批发"];
const inquirySchedules = ["尚未确定", "近期", "一个月内", "一至三个月", "三个月以后"];
function quoteForm(intent) {
  const preset = {
    new: "体育场地服务", renew: "体育场地服务", care: "体育场地服务",
    equipment: "设施装备采购"
  };
  const type = (Object.hasOwn(preset,intent)?preset[intent]:"") || inquiryDraft.business || (brief.length && equipmentBrief.length
    ? inquiryTypes[2] : equipmentBrief.length ? inquiryTypes[1] : inquiryTypes[0]);
  const value = field => html(inquiryDraft[field] || "");
  const count = brief.length + equipmentBrief.length;
  const typeOptions = inquiryTypes.map(option => `<option ${option===type?"selected":""}>${option}</option>`).join("");
  const scheduleOptions = inquirySchedules.map(option => `<option ${option===inquiryDraft.schedule?"selected":""}>${option}</option>`).join("");
  const hasOptionalDetails = inquiryDraft.scale || inquiryDraft.name || inquiryDraft.contact
    || (inquiryDraft.schedule && inquiryDraft.schedule !== inquirySchedules[0]);
  return `<form id="inquiry-form" class="inquiry-form" aria-labelledby="quote-title">
    <h2 id="quote-title" tabindex="-1">项目与采购询价</h2>
    <p class="form-intro">整理需求后，可复制到微信、生成邮件草稿或下载询价单。</p>
    <div class="quote-item-summary"><div>
      <strong>需求清单 <span data-brief-count>${count}</span> 项</strong>
      <p id="quote-list-description">${inquiryListSummary()}</p>
    </div><button class="text-link" type="button" data-action="bag">查看清单 ${icon("right")}</button></div>
    <div class="quote-fields">
      <label>需求类型<select name="business">${typeOptions}</select></label>
      <label>项目地点或收货城市<input name="location" maxlength="100" value="${value("location")}" placeholder="如 广州黄埔"></label>
    </div>
    ${Object.hasOwn(serviceTypes,intent) ? `<p class="panel-hint">咨询服务：${serviceTypes[intent].name}</p>` : ""}
    <label>需求说明<textarea name="message" maxlength="3000" placeholder="如运动项目、现有场地情况、希望采购的装备或其他要求">${value("message")}</textarea></label>
    <details class="quote-optional" ${hasOptionalDetails?"open":""}>
      <summary>补充规模、时间或联系人（选填）</summary>
      <div class="quote-fields">
        <label>项目规模或采购数量<input name="scale" maxlength="100" value="${value("scale")}" placeholder="如 2 片球场 / 20 套"></label>
        <label>计划时间<select name="schedule">${scheduleOptions}</select></label>
        <label>联系人<input name="name" autocomplete="name" maxlength="80" value="${value("name")}" placeholder="你的称呼"></label>
        <label>联系方式<input name="contact" maxlength="120" value="${value("contact")}" placeholder="电话、微信或邮箱"></label>
      </div>
    </details>
    <div class="quote-actions">
      <button class="pill" type="submit" name="delivery" value="copy">复制询价内容</button>
      <button class="pill outline" type="submit" name="delivery" value="email">打开邮件草稿</button>
      <button class="text-link" type="submit" name="delivery" value="download">下载询价单</button>
    </div>
    <p class="panel-hint">微信咨询请添加 ${company.wechat}，再粘贴询价内容。邮件将打开草稿，由你确认发送。</p>
    <p id="inquiry-status" class="quote-status" role="status"></p>
    <textarea id="inquiry-copy-fallback" class="quote-copy-fallback" aria-label="可手动复制的询价内容" readonly hidden></textarea>
  </form>`;
}
function inquiryListSummary(){
  const items = [];
  if(brief.length)items.push(`场地服务 ${brief.length} 项`);
  if(equipmentBrief.length)items.push(`装备采购 ${equipmentBrief.length} 项`);
  return items.length ? items.join(" · ") : "可直接填写需求，或从服务和装备页面添加项目。";
}
function contact(intent){
  main.innerHTML=`<section class="collection contact-page">
    <div class="crumb"><a href="#">首页</a>　/　联系我们</div>
    <div class="contact-layout"><div><p class="overline">CONTACT UVEO</p><h1>场地建设与用品采购，<br>直接聊聊你的需求。</h1><p class="company-name">${company.name}</p><p class="collection-intro">立足广州，服务${company.serviceArea}。体育场地建设、体育设施建设与体育用品批发，欢迎咨询，全部询价。</p>
      <div class="contact-methods"><a class="contact-method" href="tel:${company.phone}"><span>电话咨询</span><strong>${company.phone}</strong><small>点击拨打 ${icon("arrow")}</small></a><div class="contact-method"><span>微信咨询 · 手机同号</span><strong>${company.wechat}</strong><button class="text-link" data-action="copy-wechat">复制微信号 ${icon("clipboard")}</button></div></div><p id="wechat-status" class="contact-copy-status" role="status"></p>
      <dl class="company-details"><div><dt>电子邮箱</dt><dd><a href="mailto:${company.email}">${company.email}</a></dd></div><div><dt>公司地址</dt><dd>${company.address}</dd></div><div><dt>营业时间</dt><dd>${company.hours}</dd></div><div><dt>服务范围</dt><dd>${company.serviceArea}</dd></div></dl>
    </div>${quoteForm(intent)}</div>
  </section>`;
}
async function copyWechat(){
  const status=document.getElementById("wechat-status");
  try{await navigator.clipboard.writeText(company.wechat);if(status)status.textContent="微信号已复制，打开微信添加好友即可咨询。";}
  catch{if(status)status.textContent="请长按或选中上方微信号手动复制："+company.wechat;}
}
const routeKey=()=>location.hash.startsWith("#shop/") ? location.hash.slice(6) : "";
function collection(key){
  if(key==="all"){guideIndex();return;}
  const mode=Object.hasOwn(serviceTypes,key)?key:"new";
  const intro=serviceTypes[key]?.intro || "从新场选址与面层铺装，到旧场病害调查与翻新，按项目选择服务内容。";
  const matches=venueGuides.filter(g=>group==="全部" || group===g.name);
  main.innerHTML=`<section class="collection service-collection"><div class="crumb"><a href="#">首页</a>　/　<a href="#services">建设与维护服务</a>　/　${titles[key]}</div><p class="overline">OUR SERVICES</p><h1>${titles[key]}</h1><p class="collection-intro">${intro}</p><nav class="service-tabs" aria-label="服务类型">${Object.entries(serviceTypes).map(([id,s])=>`<a href="#shop/${id}" ${id===mode?'aria-current="page"':''}>${s.name}</a>`).join("")}</nav><div class="catalog-tools"><div class="chips">${["全部",...venueGuides.map(g=>g.name)].map(g=>`<button class="chip ${g===group?"active":""}" data-filter="${g}" aria-pressed="${g===group}">${g}</button>`).join("")}</div><span class="result-count">${matches.length} 类场地</span></div><div class="product-grid">${matches.map(g=>serviceCard(g,mode)).join("")}</div></section>`;
  const quotePath = key==="build" ? "#contact/quote" : `#contact/quote/${mode}`;
  main.querySelector(".service-tabs").insertAdjacentHTML("afterend",`<div class="catalog-consult service-quick-quote"><p><strong>还在规划，或有多个场地？</strong>可直接填写地点、运动项目和大致规模。</p><a class="pill" href="${quotePath}">填写工程需求 ${icon("arrow")}</a></div>`);
}
function scrollGuideChapter(chapter){
  const section=document.getElementById("guide-"+chapter);if(!section)return;
  section.tabIndex=-1;section.focus({preventScroll:true});section.scrollIntoView({block:"start"});
}
function route(){
  if(location.hash==="#main" && main.children.length){main.focus();return;}
  if(panel.open)panel.close();group="全部";
  closeVenueMenu();
  const key=routeKey();
  const section=location.hash.slice(1);
  const [pageName,guideId,chapter]=section.split("/");
  const isQuote = pageName==="contact" && guideId==="quote";
  if(pageName==="guide" && chapter && main.querySelector('.venue-guide')?.dataset.guide===guideId){scrollGuideChapter(chapter);return;}
  document.querySelectorAll(".main-nav a").forEach(a=>{const current=a.dataset.nav===(isQuote?"contact":section||"home");a.classList.toggle("current",current);if(current)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current");});
  document.querySelector(".nav-trigger").classList.toggle("current",section==="venues" || section==="services" || pageName==="guide" || Object.hasOwn(titles,key));
  if(pageName==="guide")guidePage(guideId);else if(section==="equipment")equipmentCollection();else if(section==="about")about();else if(pageName==="contact")contact(isQuote?chapter:undefined);else if(Object.hasOwn(titles,key))collection(key);else home();
  document.title=(pageName==="guide"?(guideById.get(guideId)?.name||"场地")+" · 技术百科":(isQuote?"项目与采购询价":{equipment:"设施装备",about:"关于我们",contact:"联系我们",venues:"场地类型",services:"建设与维护服务"}[section] || titles[key] || "体育场地 · 设施装备"))+"｜UVEO";
  requestAnimationFrame(() => positionRoute(section));
}
function positionRoute(section) {
  if(section !== location.hash.slice(1))return;
  const [page,subpage,chapter] = section.split("/");
  if(page==="guide" && chapter){scrollGuideChapter(chapter);return;}
  if(page==="contact" && subpage==="quote"){
    const form=document.getElementById("inquiry-form");
    document.getElementById("quote-title")?.focus({preventScroll:true});
    form?.scrollIntoView({block:"start"});
    return;
  }
  if(section==="venues" || section==="services"){
    document.getElementById(section)?.scrollIntoView({block:"start"});
    return;
  }
  if(section==="main"){main.focus();return;}
  window.scrollTo(0,0);
}
function closeVenueMenu(){const b=document.querySelector(".nav-trigger");b.setAttribute("aria-expanded","false");document.getElementById("venue-menu").hidden=true;}
function drawer(title,body){
  content.innerHTML=`<div class="panel-head"><h2 id="panel-title">${title}</h2><button class="round" aria-label="关闭" data-action="close">${icon("close")}</button></div>${body}`;
  panel.scrollTop=0;if(!panel.open)panel.showModal();document.body.classList.add("lock");
}
panel.addEventListener("close",()=>document.body.classList.remove("lock"));
panel.addEventListener("click",e=>{if(e.target===panel && e.clientX<panel.getBoundingClientRect().left)panel.close();});
function guideMini(g){return `<a class="mini-row" href="#guide/${g.id}"><img src="${img(g.photo)}" alt=""><span class="mini-text"><strong>${g.name}</strong><small>技术百科 · ${g.tag}</small></span>${icon("right")}</a>`;}
function savedPanel(){
  drawer("收藏的场地百科",saved.size ? [...saved].map(id=>guideMini(guideById.get(id))).join("") : '<p class="empty">点击场地图片上的爱心，保存感兴趣的材料与工艺百科。</p><a class="pill" href="#venues">浏览场地类型</a>');
}
function searchPanel() {
  drawer("搜索", `
    <label class="panel-search">${icon("search")}<input type="search" id="site-search" aria-label="搜索场地、服务或装备" value="${html(searchQuery)}" placeholder="如 篮球 翻新、丙烯酸、球网"></label>
    <div class="search-suggestions" aria-label="常用关键词">${["篮球 翻新","人造草","匹克球","篮球架"].map(q=>`<button class="chip" type="button" data-search-example="${q}">${q}</button>`).join("")}</div>
    <div class="search-scopes" aria-label="搜索范围">${Object.entries(searchScopes).map(([key,label])=>`<button class="chip" type="button" data-search-scope="${key}" aria-pressed="false">${label}</button>`).join("")}</div>
    <p class="panel-hint" id="search-count" role="status"></p>
    <div id="hits"></div>
  `);
  renderHits();
  document.getElementById("site-search").focus();
}
function renderHits(){
  const results = discovery.search(searchQuery);
  const show = key => searchScope === "all" || searchScope === key;
  const guides = show("guides") ? results.guides : [];
  const services = show("services") ? results.services : [];
  const products = show("products") ? results.products : [];
  const count = guides.length + services.length + products.length;
  content.querySelectorAll("[data-search-scope]").forEach(button=>{
    const active=button.dataset.searchScope===searchScope;
    button.classList.toggle("active",active);
    button.setAttribute("aria-pressed",String(active));
  });
  document.getElementById("search-count").textContent = searchQuery.trim() ? `找到 ${count} 项` : "常用入口";
  const sections = [
    ["场地技术百科",guides.map(guideMini)],
    ["建设与维护服务",services.map(([id,s])=>`<a class="mini-row" href="#shop/${id}"><span class="mini-text"><strong>${s.name}</strong><small>${s.intro}</small></span>${icon("right")}</a>`)],
    ["设施装备",products.map(p=>`<button class="mini-row" type="button" data-equipment="${p.id}" data-from-search><img src="${p.image}" alt=""><span class="mini-text"><strong>${p.name}</strong><small>${p.group}</small></span>${icon("right")}</button>`)]
  ];
  document.getElementById("hits").innerHTML=count
    ? sections.filter(([,rows])=>rows.length).map(([label,rows])=>`<h3 class="search-section-title">${label}</h3>${rows.join("")}`).join("")
    : '<div class="search-empty"><p>没有找到匹配的内容，试试更短的关键词或切换范围。</p><a class="text-link" href="#services">浏览工程服务</a> <a class="text-link" href="#equipment">浏览设施装备</a></div>';
}
function detail(id,mode="new"){
  const v=venueById.get(id);if(!v)return;
  const g=guideForVenue.get(id);
  selectedVenue=id;selectedService=Object.hasOwn(serviceTypes,mode)?mode:"new";
  const s=serviceTypes[selectedService];
  const exists=brief.some(entry=>entry.id===id && entry.service===selectedService);
  drawer("建设与维护服务",`<img class="panel-product venue-cover" src="${img(id)}" alt="${v.name}示意"><h3 class="detail-title">${v.name}</h3><p class="detail-meta">${s.name} · 项目服务需求</p>${g.venueIds.length>1?`<p class="size-label">运动项目</p><div class="size-grid">${g.venueIds.map(venue=>`<button data-service-venue="${venue}" aria-pressed="${venue===id}">${venueById.get(venue).name}</button>`).join("")}</div>`:""}<p class="size-label">服务类型</p><div class="size-grid">${Object.entries(serviceTypes).map(([k,val])=>`<button data-service="${k}" aria-pressed="${k===selectedService}">${val.name}</button>`).join("")}</div><p class="service-detail">${v[s.field]}</p><button class="pill wide" data-action="add">${exists?"查看项目需求清单":"加入项目需求"} ${icon("arrow")}</button><p class="panel-hint">服务覆盖广东全省，具体范围与报价结合现场条件沟通确认。</p>`);
}
function briefPanel(){
  if(!brief.length && !equipmentBrief.length){
    drawer("项目与采购需求清单",'<p class="empty">清单还是空的。可以先挑选所需服务或装备，也可以直接描述需求。</p><div class="quote-empty-links"><a class="pill" href="#services">选择场地服务</a><a class="pill outline" href="#equipment">浏览设施装备</a><a class="text-link" href="#contact/quote">直接填写询价</a></div>');
    return;
  }
  const rows=brief.map((r,i)=>{const v=venueById.get(r.id);return `<div class="mini-row"><img src="${img(v.id)}" alt=""><button class="mini-text" data-venue="${v.id}" data-mode="${r.service}"><strong>${v.name}</strong><small>${serviceTypes[r.service].name}</small></button><button class="remove-entry" data-remove="${i}" aria-label="移除${v.name}${serviceTypes[r.service].name}">移除</button></div>`;}).join("");
  const equipmentRows=equipmentBrief.map((r,i)=>{
    const product=equipmentById.get(r.id);
    return `<div class="cart-row">
      <div class="mini-row"><img src="${product.image}" alt=""><div class="mini-text"><strong>${product.name}</strong><small>${html(r.option)}</small><small id="line-quantity-${i}">${r.quantity} ${product.unit}</small></div><button class="remove-entry" type="button" data-remove-equipment="${i}" aria-label="移除 ${product.name} ${html(r.option)}">移除</button></div>
      <details><summary>修改数量</summary><form class="cart-edit" data-cart-index="${i}">
        <label for="line-edit-${i}">${product.unit}</label><input id="line-edit-${i}" name="quantity" aria-label="${product.name}采购数量（${product.unit}）" type="number" inputmode="numeric" min="1" max="${maxOrderQuantity}" step="1" value="${r.quantity}" required>
        <button class="pill outline" type="submit">保存数量</button>
      </form></details>
    </div>`;
  }).join("");
  drawer("项目与采购需求清单", `
    ${rows?'<h3 class="brief-section-title">体育场地服务</h3>'+rows:""}
    ${equipmentRows?'<h3 class="brief-section-title">设施装备采购</h3>'+equipmentRows:""}
    <label class="brief-label" for="project-notes">项目备注</label><textarea id="project-notes" maxlength="3000" placeholder="可补充场地情况、所需配置或交付要求。">${html(notes)}</textarea>
    <p class="quote-status" id="brief-status" role="status"></p>
    <div class="quote-list-actions"><a class="pill wide" href="#contact/quote">整理并发送询价 ${icon("arrow")}</a><button class="text-link" type="button" data-action="export">下载清单</button><button class="text-link" type="button" data-action="close">继续浏览</button></div>
    <p class="panel-hint">清单保存在当前浏览器。装备按所选配置询价。</p>
  `);
}
function inquiryText(inquiry = {}, intent = "") {
  const fields = [
    ["需求类型",inquiry.business],["咨询服务",Object.hasOwn(serviceTypes,intent)?serviceTypes[intent].name:""],
    ["项目地点或收货城市",inquiry.location],["项目规模或采购数量",inquiry.scale],
    ["计划时间",inquiry.schedule===inquirySchedules[0]?"":inquiry.schedule],
    ["联系人",inquiry.name],["联系方式",inquiry.contact]
  ];
  const sections = ["UVEO 项目与采购询价"];
  const details = fields.filter(([,value])=>value).map(([label,value])=>`${label}：${value}`);
  if(details.length)sections.push(details.join("\n"));
  if(brief.length)sections.push("场地服务\n"+brief.map((row,index)=>`${index+1}. ${venueById.get(row.id).name} · ${serviceTypes[row.service].name}`).join("\n"));
  if(equipmentBrief.length)sections.push("设施装备\n"+equipmentBrief.map((row,index)=>{
    const product=equipmentById.get(row.id);
    return `${index+1}. ${product.name} · ${row.option} · ${row.quantity}${product.unit}`;
  }).join("\n"));
  if(inquiry.message)sections.push("需求说明\n"+inquiry.message);
  if(notes.trim())sections.push("项目备注\n"+notes.trim());
  return sections.join("\n\n");
}
function downloadInquiry(text){
  const recipient = [company.name,`电话 / 微信：${company.phone}`,`邮箱：${company.email}`,`地址：${company.address}`,`服务范围：${company.serviceArea} · 营业时间：${company.hours}`].join("\n");
  text = `${text}\n\n${recipient}`.replace(/\n/g,"\r\n");
  const url=URL.createObjectURL(new Blob(["\uFEFF",text],{type:"text/plain;charset=utf-8"}));
  const a=document.createElement("a");a.href=url;a.download="UVEO项目与采购询价清单.txt";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
}
async function deliverInquiry(form, delivery) {
  const data = Object.fromEntries([...new FormData(form)].map(([key,value])=>[key,value.trim()]));
  if(!brief.length && !equipmentBrief.length && !notes.trim() && !data.message && !data.scale){
    form.elements.message.setCustomValidity("请描述采购或场地需求，也可以先添加一项到需求清单。");
    form.elements.message.reportValidity();
    return;
  }
  inquiryDraft = data;
  const status = document.getElementById("inquiry-status");
  const fallback = document.getElementById("inquiry-copy-fallback");
  fallback.hidden = true;
  const intent = location.hash.split("/")[2] || "";
  const text = inquiryText(data, intent);
  if(delivery==="download"){
    downloadInquiry(text);
    status.textContent="询价单已下载，可通过微信或邮箱发送给 UVEO。";
    return;
  }
  if(delivery==="email"){
    const subject = encodeURIComponent(`UVEO 询价｜${data.business}`);
    const link = `mailto:${company.email}?subject=${subject}&body=${encodeURIComponent(text.replace(/\n/g,"\r\n"))}`;
    if(link.length > 1800) {
      fallback.hidden=false;
      fallback.value=text;
      fallback.select();
      status.textContent=`询价内容较长，请下载询价单作为附件，或复制下方内容发送至 ${company.email}。`;
      return;
    }
    status.textContent=`已请求打开邮件草稿。也可复制内容发至 ${company.email}。`;
    window.location.href=link;
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    status.textContent=`已复制询价内容，添加微信 ${company.wechat} 后即可粘贴发送。`;
  } catch {
    fallback.hidden=false;
    fallback.value=text;
    fallback.focus();
    fallback.select();
    status.textContent="请选择下方文字并复制，或下载询价单。";
  }
}
function openAction(action){
  switch(action){
    case "venues-menu": {
      const b=document.querySelector(".nav-trigger"),open=b.getAttribute("aria-expanded")!=="true";
      b.setAttribute("aria-expanded",String(open));document.getElementById("venue-menu").hidden=!open;break;
    }
    case "copy-wechat":copyWechat();break;
    case "close":panel.close();break;
    case "search":searchPanel();break;
    case "saved":savedPanel();break;
    case "bag":briefPanel();break;
    case "reset-equipment":
      equipmentGroup="全部";
      equipmentQuery="";
      document.getElementById("catalog-search").value="";
      renderEquipmentResults();
      document.getElementById("catalog-search").focus();
      break;
    case "menu":
      drawer("浏览",'<a class="panel-link" href="#">首页</a><div class="mobile-nav-group"><h3>体育场地</h3><a href="#venues">场地类型 · 技术百科</a><a href="#services">建设与维护服务</a></div><a class="panel-link" href="#equipment">设施装备</a><a class="panel-link" href="#about">关于我们</a><a class="panel-link" href="#contact">联系我们</a><button class="panel-link" data-action="saved">收藏的场地百科</button>');break;
    case "add-equipment": {
      const input=document.getElementById("equipment-quantity");input.setCustomValidity("");if(!input.reportValidity())return;
      const quantity=Number(input.value),option=document.getElementById("equipment-option").value;
      const existing=equipmentBrief.find(r=>r.id===selectedEquipment && r.option===option);
      if(existing && existing.quantity+quantity>maxOrderQuantity){input.setCustomValidity("本项数量超出范围，请在需求清单中调整，或在询价说明中注明批量需求。");input.reportValidity();return;}
      if(existing)existing.quantity+=quantity;else equipmentBrief.push({id:selectedEquipment,option,quantity});
      save("uveo.equipment.brief",equipmentBrief);
      badge();
      const product=equipmentById.get(selectedEquipment);
      document.getElementById("item-added").textContent=`已加入 ${quantity} ${product.unit}，该配置共 ${existing?.quantity ?? quantity} ${product.unit}。`;
      document.getElementById("item-view-list").hidden=false;
      break;
    }
    case "add":
      if(!brief.some(r=>r.id===selectedVenue && r.service===selectedService)){brief.push({id:selectedVenue,service:selectedService});save("uveo.venues.brief",brief);badge();}
      briefPanel();break;
    case "export":downloadInquiry(inquiryText());break;
    case "help":
      drawer("服务说明",'<div class="help-body"><h3>如何了解材料与工艺？</h3><p>场地类型按五类整理，点击后阅读材料选择、系统构造与施工工艺百科。</p><h3>如何选择服务？</h3><p>统一从首页“建设与维护服务”进入新建、翻新或维护。选择场地项目与服务后加入需求清单，匹克球与网球可分别选择。</p><h3>如何选购设施装备？</h3><p>进入设施装备，选择产品类别、需求配置与数量，加入询价清单。具体型号、价格、运送与安装范围需沟通确认。</p><h3>如何整理需求？</h3><p>场地服务和装备可以加入同一清单。补充备注后可导出文本，也可到联系我们页面填写联系方式并下载询价单。当前页面不会在线发送或收取付款。</p><h3>如何确认实施范围？</h3><p>场地照片与装备示意图用于类别说明。材料、施工范围、工期和费用需结合现场情况与实际需求确定。</p></div>');break;
  }
}
function updateQuery(input){
  if(input.id==="site-search"){searchQuery=input.value;renderHits();}
  if(input.id==="catalog-search"){equipmentQuery=input.value;renderEquipmentResults();}
}
document.addEventListener("input",e=>{
  if(!e.isComposing)updateQuery(e.target);
  if(e.target.id==="project-notes"){
    notes=e.target.value;
    save("uveo.venues.notes",notes);
    if(notes.trim())document.getElementById("inquiry-form")?.elements.message.setCustomValidity("");
  }
  const form=e.target.closest("#inquiry-form");
  if(form && e.target.name && e.target.name!=="delivery"){
    inquiryDraft[e.target.name]=e.target.value;
    form.elements.message.setCustomValidity("");
    document.getElementById("inquiry-status").textContent="";
    document.getElementById("inquiry-copy-fallback").hidden=true;
  }
  if(e.target.id==="equipment-option" || e.target.id==="equipment-quantity"){
    document.getElementById("equipment-quantity").setCustomValidity("");
    document.getElementById("item-added").textContent="";
  }
});
document.addEventListener("compositionend",e=>updateQuery(e.target));
document.addEventListener("click",e=>{
  if(e.target.closest('.skip')){e.preventDefault();main.focus();return;}
  if(!e.target.closest(".nav-dropdown"))closeVenueMenu();
  const anchor=e.target.closest("a[href^='#']");if(anchor && panel.open)panel.close();
  if(anchor)closeVenueMenu();
  if(anchor?.hash===location.hash && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey){
    e.preventDefault();
    requestAnimationFrame(()=>positionRoute(location.hash.slice(1)));
  }
  const b=e.target.closest("button");if(!b)return;
  const d=b.dataset;
  if(d.action)openAction(d.action);
  if(d.venue)detail(d.venue,d.mode);
  if(d.serviceVenue){detail(d.serviceVenue,selectedService);content.querySelector(`[data-service-venue="${d.serviceVenue}"]`).focus({preventScroll:true});}
  if(d.equipment)equipmentDetail(d.equipment,Object.hasOwn(d,"fromSearch"));
  if(d.equipmentFilter){equipmentGroup=d.equipmentFilter;renderEquipmentResults();}
  if(d.searchScope){searchScope=d.searchScope;renderHits();}
  if(d.searchExample){
    const input=document.getElementById("site-search");
    searchScope="all";
    input.value=d.searchExample;
    updateQuery(input);
    input.focus();
  }
  if(d.quantity){
    const input=document.getElementById("equipment-quantity");
    input.value=Math.max(1,Math.min(maxOrderQuantity,Math.trunc(Number(input.value)||1)+Number(d.quantity)));
    input.dispatchEvent(new Event("input",{bubbles:true}));
  }
  if(d.removeEquipment!==undefined){equipmentBrief.splice(Number(d.removeEquipment),1);save("uveo.equipment.brief",equipmentBrief);badge();briefPanel();}
  if(d.service){detail(selectedVenue,d.service);content.querySelector('[data-service="'+d.service+'"]').focus({preventScroll:true});}
  if(d.slide){slide=(slide+Number(d.slide)+campaigns.length)%campaigns.length;const el=document.querySelector(".hero");el.innerHTML=hero();el.querySelector('[data-slide="'+d.slide+'"]').focus({preventScroll:true});}
  if(d.filter){group=d.filter;collection(routeKey());document.querySelector(`[data-filter="${group}"]`).focus({preventScroll:true});}
  if(d.remove!==undefined){brief.splice(Number(d.remove),1);save("uveo.venues.brief",brief);badge();briefPanel();}
  if(d.save){
    const id=d.save;if(saved.has(id))saved.delete(id);else saved.add(id);save("uveo.venues.saved",[...saved]);
    document.querySelectorAll('[data-save="'+id+'"]').forEach(el=>{el.classList.toggle("is-saved",saved.has(id));el.setAttribute("aria-pressed",String(saved.has(id)));el.setAttribute("aria-label",(saved.has(id)?"取消收藏":"收藏")+guideById.get(id).name+"百科");});
    if(!panel.open)notify(saved.has(id)?"已收藏场地百科":"已取消收藏");
  }
});
document.addEventListener("keydown",e=>{if(e.key==="Escape" && document.querySelector('.nav-trigger').getAttribute('aria-expanded')==="true"){closeVenueMenu();document.querySelector('.nav-trigger').focus();}if(e.key==="ArrowDown" && e.target.matches('.nav-trigger')){e.preventDefault();e.target.setAttribute('aria-expanded','true');document.getElementById('venue-menu').hidden=false;document.querySelector('#venue-menu a').focus();}});
document.querySelector('.nav-dropdown').addEventListener('focusout',e=>{if(!e.currentTarget.contains(e.relatedTarget))closeVenueMenu();});
document.addEventListener("submit",e=>{
  const form=e.target;
  if(form.id==="inquiry-form"){
    e.preventDefault();
    deliverInquiry(form,e.submitter?.value || "copy");
  }
  if(form.matches(".cart-edit")){
    e.preventDefault();
    const index=Number(form.dataset.cartIndex);
    const row=equipmentBrief[index];
    if(!row)return;
    row.quantity=form.elements.quantity.valueAsNumber;
    save("uveo.equipment.brief",equipmentBrief);
    const product=equipmentById.get(row.id);
    document.getElementById(`line-quantity-${index}`).textContent=`${row.quantity} ${product.unit}`;
    document.getElementById("brief-status").textContent=`已更新 ${product.name} 的采购数量。`;
    const details=form.closest("details");
    details.open=false;
    details.querySelector("summary").focus();
  }
});
window.addEventListener("hashchange",route);

badge();
route();
