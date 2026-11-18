"use strict";
const paths = {
  clipboard:'<rect x="5" y="4" width="14" height="17" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1" fill="white"/><path d="M8 11h8m-8 4h6"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.8"/><path d="m16 16 5 5"/>',
  heart:'<path d="M20.3 4.9a5.1 5.1 0 0 0-7.2 0L12 6l-1.1-1.1a5.1 5.1 0 0 0-7.2 7.2L12 20.5l8.3-8.4a5.1 5.1 0 0 0 0-7.2Z"/>',
  bag:'<path d="M5 7.5h14l1.2 13H3.8L5 7.5Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
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
let equipmentBrief = acceptArray(read("uveo.equipment.brief",[])).filter(r=>r && equipmentById.has(r.id) && equipmentById.get(r.id).options.includes(r.option) && Number.isInteger(r.quantity) && r.quantity>0 && r.quantity<=999);
let equipmentGroup="全部", selectedEquipment="";
let slide=0, group="全部", selectedVenue="", selectedService="new", toastTimer;
const campaigns=[
  {tag:"VENUES & EQUIPMENT",title:["为运动，","准备好一切。"],desc:"服务广东全省，专注体育场地建设、体育设施建设与体育用品批发。",cta:"探索体育场地",url:"#venues",photo:"assets/court-hero.webp",alt:"俯瞰红色室外篮球场及白色场线"},
  {tag:"COURT RENOVATION",title:["旧场地，","新开局。"],desc:"从开裂的底线到磨损的面层，找到适合的翻新方案。",cta:"了解场地翻新",url:"#services",photo:img("tennis"),alt:"网球场硬地面层与球场标线"},
  {tag:"FACILITY CARE",title:["养好场，","再上场。"],desc:"让草坪梳理、接缝巡查与局部修复成为日常。",cta:"查看维护服务",url:"#services",photo:img("turf"),alt:"足球场草坪及边界线"}
];
function badge(){
  const el=document.querySelector(".bag-count");
  const count=brief.length+equipmentBrief.length;
  el.hidden=!count;el.textContent=count;
  document.querySelectorAll('[data-brief-count]').forEach(el=>el.textContent=count);
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
  document.querySelector(".hero").insertAdjacentHTML("afterend",`<section class="business-overview" aria-label="两大核心业务"><a class="business-entry" href="#venues"><span class="business-number">01 / SPORTS VENUES</span><div><h2>体育场地</h2>${icon("arrow")}</div><p>新建 · 翻新 · 维护，从规划到日常使用。</p></a><a class="business-entry" href="#equipment"><span class="business-number">02 / SPORTS EQUIPMENT</span><div><h2>设施装备</h2>${icon("arrow")}</div><p>九大品类 · 用品批发 · 项目配套，全部询价。</p></a></section>`);
  main.insertAdjacentHTML("beforeend",`<section class="company-intro"><div><p class="overline">UVEO · GUANGDONG</p><h2>好材料，好手艺，好服务。</h2><p>${company.name}，专注体育场地建设、体育设施建设与体育用品批发。</p></div><div class="company-intro-side"><span>服务广东全省</span><a class="text-link" href="#about">了解 UVEO ${icon("arrow")}</a></div></section>`);
  main.insertAdjacentHTML("beforeend",`<section class="section equipment-home"><div class="section-head"><div><div class="overline">SPORTS EQUIPMENT</div><h2>好场地，也要好装备。</h2></div><a class="text-link" href="#equipment">浏览全部装备 ${icon("up")}</a></div><p class="section-intro">篮球、匹克球、足球、羽毛球、排球、乒乓球、健身器材、网球与田径，九大品类全部询价。</p><div class="product-grid">${[equipment[0],equipment[2],equipment[4]].map(equipmentCard).join("")}</div><div class="equipment-note">按需求选择配置，加入清单统一询价。${icon("arrow")}</div></section><section class="home-contact"><div><p class="overline">LET’S GET STARTED</p><h2>一片场地，一套装备。<br>从你的运动需求开始。</h2></div><a class="pill" href="#contact">联系我们 ${icon("arrow")}</a></section>`);
}
function equipmentCard(p){
  return `<article class="product-card equipment-card"><button class="product-link" data-equipment="${p.id}"><span class="photo"><img src="${p.image}" alt="${p.name}产品示意图" loading="lazy"><span class="product-flag">${p.tag}</span></span><span class="product-info"><strong>${p.name}</strong>${icon("up")}</span><span class="product-type">${p.summary}</span><span class="equipment-cta">全部询价 · 选择配置 ${icon("arrow")}</span></button></article>`;
}
function equipmentCollection(){
  const matches=equipment.filter(p=>equipmentGroup==="全部" || p.sports.includes(equipmentGroup));
  if(equipmentGroup!=="全部")matches.sort((a,b)=>Number(b.sports.length===1)-Number(a.sports.length===1));
  main.innerHTML=`<section class="collection equipment-collection"><div class="crumb"><a href="#">首页</a>　/　设施装备</div><div class="catalog-heading"><div><p class="overline">SPORTS EQUIPMENT</p><h1>为每一次上场，配齐所需。</h1><p class="collection-intro">九大运动品类，覆盖体育设施与运动用品批发。支持独立采购与场地配套，全部产品按需询价。</p></div><span class="catalog-mark">全部询价<br><b>按需配套。</b></span></div><div class="catalog-tools"><div class="chips">${["全部",...company.sports].map(g=>`<button class="chip ${g===equipmentGroup?"active":""}" data-equipment-filter="${g}" aria-pressed="${g===equipmentGroup}">${g}</button>`).join("")}</div><span class="result-count">${matches.length} 类装备</span></div><div class="product-grid">${matches.map(equipmentCard).join("")}</div><div class="catalog-consult"><p><strong>批量采购或整场配套？</strong>告诉我们运动项目与数量，获取适合的配置与报价。</p><a class="pill" href="#contact">联系询价 ${icon("arrow")}</a></div><p class="catalog-disclaimer">图片为产品类别示意。全部产品询价，具体型号、规格、价格、运送及安装范围以沟通确认结果为准。服务覆盖${company.serviceArea}。</p></section>`;
}
function equipmentDetail(id){
  const p=equipmentById.get(id);if(!p)return;selectedEquipment=id;
  drawer("设施装备",`<img class="panel-product equipment-cover" src="${p.image}" alt="${p.name}产品示意图"><p class="detail-category">${p.group} / ${p.tag}</p><h3 class="detail-title">${p.name}</h3><p class="service-detail">${p.description}</p><ul class="equipment-specs">${p.specs.map(s=>`<li>${s}</li>`).join("")}</ul><label class="brief-label" for="equipment-option">需求配置</label><select id="equipment-option" class="equipment-select">${p.options.map(o=>`<option>${o}</option>`).join("")}</select><label class="brief-label" for="equipment-quantity">采购数量（${p.unit}）</label><div class="quantity-input"><button data-quantity="-1" aria-label="减少数量">−</button><input id="equipment-quantity" type="number" inputmode="numeric" min="1" max="999" step="1" value="1" required><button data-quantity="1" aria-label="增加数量">+</button></div><button class="pill wide" data-action="add-equipment">加入询价清单 ${icon("arrow")}</button><a class="pill outline wide" href="#contact">联系 UVEO 询价 ${icon("arrow")}</a><p class="panel-hint">全部产品询价。具体型号、价格与交付方式需确认，图片为类别示意。</p>`);
}
function about(){
  main.innerHTML=`<section class="collection about-page">
    <div class="crumb"><a href="#">首页</a>　/　关于我们</div>
    <div class="about-lead"><div><p class="overline">ABOUT UVEO</p><h1>好材料，<br>好手艺，好服务。</h1><p class="company-name">${company.name}</p><p class="collection-intro">${company.description}</p><span class="area-label">立足广州 · 服务${company.serviceArea}</span><a class="pill" href="#contact">聊聊你的需求 ${icon("arrow")}</a></div><img src="assets/venues/basketball.jpg" alt="篮球场地与体育设施示意" loading="lazy"></div>
    <div class="about-business"><article><span class="overline">01 / SPORTS VENUES</span><h2>体育场地与设施建设</h2><p>从新建规划、面层铺装，到旧场翻新、日常维护与设施配套，围绕场地实际使用需求安排服务，业务覆盖广东全省。</p><a class="text-link" href="#services">探索场地服务 ${icon("arrow")}</a></article><article><span class="overline">02 / SPORTS EQUIPMENT</span><h2>体育用品与装备批发</h2><p>涵盖篮球、匹克球、足球、羽毛球、排球、乒乓球、健身器材、网球及田径九大品类，支持独立采购与项目配套，全部询价。</p><a class="text-link" href="#equipment">浏览设施装备 ${icon("arrow")}</a></article></div>
    <div class="values-grid"><article><span>01 / MATERIALS</span><h3>用心选材</h3><p>结合运动项目、使用环境与预算，沟通适合的材料和设施配置。</p></article><article><span>02 / CRAFT</span><h3>扎实施工</h3><p>关注基础、面层与收口细节，以认真负责的手艺做好每一片场地。</p></article><article><span>03 / SERVICE</span><h3>周到服务</h3><p>从需求沟通到场地维护、用品配套，让每一个环节都有清晰回应。</p></article></div>
  </section>`;
}
function contact(){
  main.innerHTML=`<section class="collection contact-page">
    <div class="crumb"><a href="#">首页</a>　/　联系我们</div>
    <div class="contact-layout"><div><p class="overline">CONTACT UVEO</p><h1>场地建设与用品采购，<br>直接聊聊你的需求。</h1><p class="company-name">${company.name}</p><p class="collection-intro">立足广州，服务${company.serviceArea}。体育场地建设、体育设施建设与体育用品批发，欢迎咨询，全部询价。</p>
      <div class="contact-methods"><a class="contact-method" href="tel:${company.phone}"><span>电话咨询</span><strong>${company.phone}</strong><small>点击拨打 ${icon("arrow")}</small></a><div class="contact-method"><span>微信咨询 · 手机同号</span><strong>${company.wechat}</strong><button class="text-link" data-action="copy-wechat">复制微信号 ${icon("clipboard")}</button></div></div><p id="wechat-status" class="contact-copy-status" role="status"></p>
      <dl class="company-details"><div><dt>电子邮箱</dt><dd><a href="mailto:${company.email}">${company.email}</a></dd></div><div><dt>公司地址</dt><dd>${company.address}</dd></div><div><dt>营业时间</dt><dd>${company.hours}</dd></div><div><dt>服务范围</dt><dd>${company.serviceArea}</dd></div></dl>
      <button class="text-link" data-action="bag">查看当前需求（<span data-brief-count>${brief.length+equipmentBrief.length}</span> 项） ${icon("arrow")}</button>
    </div><form id="inquiry-form" class="inquiry-form"><h2>项目与采购询价</h2><p class="form-intro">也可以先整理一份需求，再通过微信或邮箱发给我们。</p><label>联系人<input name="name" autocomplete="name" maxlength="80" placeholder="你的称呼" required></label><label>联系方式<input name="contact" autocomplete="tel" maxlength="120" placeholder="电话、微信或电子邮箱" required></label><label>需求类型<select name="business"><option>场地服务与装备配套</option><option>体育场地服务</option><option>设施装备采购</option><option>体育用品批发</option></select></label><label>需求说明<textarea name="message" maxlength="3000" placeholder="项目地点、场地面积或用品品类、采购数量、计划时间等" required></textarea></label><button class="pill wide" type="submit">下载询价单 ${icon("arrow")}</button><p class="panel-hint">填写后在本机生成询价单，不会自动发送。请添加微信 ${company.wechat} 或发送至 <a href="mailto:${company.email}">${company.email}</a> 沟通报价。</p><p id="inquiry-status" role="status"></p></form></div>
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
}
function scrollGuideChapter(chapter){
  const section=document.getElementById("guide-"+chapter);if(!section)return;
  section.tabIndex=-1;section.focus({preventScroll:true});section.scrollIntoView({block:"start"});
}
function route(){
  if(location.hash==="#main" && main.children.length){main.focus();return;}
  if(panel.open)panel.close();group="全部";
  closeVenueMenu();equipmentGroup="全部";
  const key=routeKey();
  const section=location.hash.slice(1);
  const [pageName,guideId,chapter]=section.split("/");
  if(pageName==="guide" && chapter && main.querySelector('.venue-guide')?.dataset.guide===guideId){scrollGuideChapter(chapter);return;}
  document.querySelectorAll(".main-nav a").forEach(a=>{const current=a.dataset.nav===(section||"home");a.classList.toggle("current",current);if(current)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current");});
  document.querySelector(".nav-trigger").classList.toggle("current",section==="venues" || section==="services" || pageName==="guide" || Object.hasOwn(titles,key));
  if(pageName==="guide")guidePage(guideId);else if(section==="equipment")equipmentCollection();else if(section==="about")about();else if(section==="contact")contact();else if(Object.hasOwn(titles,key))collection(key);else home();
  document.title=(pageName==="guide"?(guideById.get(guideId)?.name||"场地")+" · 技术百科":({equipment:"设施装备",about:"关于我们",contact:"联系我们",venues:"场地类型",services:"建设与维护服务"}[section] || titles[key] || "体育场地 · 设施装备"))+"｜UVEO";
  if(pageName==="guide" && chapter)requestAnimationFrame(()=>scrollGuideChapter(chapter));
  else if(section==="venues" || section==="services")requestAnimationFrame(()=>document.getElementById(section)?.scrollIntoView());
  else if(location.hash==="#main")main.focus();else window.scrollTo(0,0);
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
function renderHits(value){
  const q=value.trim().toLowerCase();
  const matches=venueGuides.filter(g=>(JSON.stringify(g)+" 材料 工艺 技术 百科").toLowerCase().includes(q));
  const services=Object.entries(serviceTypes).filter(([,s])=>(s.name+" "+s.intro+" 施工 服务").includes(q));
  const products=equipment.filter(p=>Object.values(p).join(" ").toLowerCase().includes(q));
  const count=matches.length+services.length+products.length;
  document.querySelector("#hits").innerHTML=`<p class="panel-hint">${q?"搜索结果（"+count+"）":"场地百科、建设与维护服务、设施装备"}</p>${matches.length?'<h3 class="search-section-title">场地技术百科</h3>'+matches.map(guideMini).join(""):""}${services.length?'<h3 class="search-section-title">建设与维护服务</h3>'+services.map(([id,s])=>`<a class="mini-row" href="#shop/${id}"><span class="mini-text"><strong>${s.name}</strong><small>${s.intro}</small></span>${icon("right")}</a>`).join(""):""}${products.length?'<h3 class="search-section-title">设施装备</h3>':""}${products.map(p=>`<button class="mini-row" data-equipment="${p.id}"><img src="${p.image}" alt=""><span class="mini-text"><strong>${p.name}</strong><small>设施装备 · ${p.group}</small></span>${icon("right")}</button>`).join("")}${count?"":'<p class="empty">没有找到相关内容。可以试试“丙烯酸”“翻新”或“球拍”。</p>'}`;
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
  if(!brief.length && !equipmentBrief.length){drawer("项目与采购需求清单",'<p class="empty">选择场地服务或设施装备，加入清单统一整理和询价。</p><a class="pill wide" href="#services">选择场地服务</a><a class="pill outline wide" href="#equipment">选购设施装备</a>');return;}
  const rows=brief.map((r,i)=>{const v=venueById.get(r.id);return `<div class="mini-row"><img src="${img(v.id)}" alt=""><button class="mini-text" data-venue="${v.id}" data-mode="${r.service}"><strong>${v.name}</strong><small>${serviceTypes[r.service].name}</small></button><button class="remove-entry" data-remove="${i}" aria-label="移除${v.name}${serviceTypes[r.service].name}">移除</button></div>`;}).join("");
  const equipmentRows=equipmentBrief.map((r,i)=>{const p=equipmentById.get(r.id);return `<div class="mini-row"><img src="${p.image}" alt=""><button class="mini-text" data-equipment="${p.id}"><strong>${p.name}</strong><small>${html(r.option)}</small><small>${r.quantity} ${p.unit}</small></button><button class="remove-entry" data-remove-equipment="${i}" aria-label="移除${p.name}">移除</button></div>`;}).join("");
  drawer("项目与采购需求清单",(rows?'<h3 class="brief-section-title">体育场地服务</h3>'+rows:"")+(equipmentRows?'<h3 class="brief-section-title">设施装备采购</h3>'+equipmentRows:"")+`<label class="brief-label" for="project-notes">项目备注</label><textarea id="project-notes" maxlength="3000" placeholder="可填写项目地点、场地数量、现状或计划时间。">${html(notes)}</textarea><button class="pill wide" data-action="export">导出需求清单 ${icon("arrow")}</button><a class="pill outline wide" href="#contact">补充联系方式与咨询需求</a><p class="panel-hint">清单保存在当前浏览器，可导出文本用于沟通。装备按配置询价，当前不收取在线付款。</p>`);
}
function exportBrief(inquiry){
  const lines=brief.map((r,i)=>{const v=venueById.get(r.id),s=serviceTypes[r.service];return (i+1)+". "+v.name+" · "+s.name+"\n"+v[s.field];});
  const products=equipmentBrief.map((r,i)=>{const p=equipmentById.get(r.id);return (i+1)+". "+p.name+" · "+r.option+" · "+r.quantity+p.unit;});
  const contactLines=inquiry?["联系人："+inquiry.name,"联系方式："+inquiry.contact,"需求类型："+inquiry.business,"需求说明：\n"+inquiry.message]:[];
  const text=["UVEO 项目与采购询价清单",company.name,"电话 / 微信："+company.phone,"邮箱："+company.email,"地址："+company.address,"服务范围："+company.serviceArea+" · 营业时间："+company.hours,...contactLines,"体育场地服务",...(lines.length?lines:["未选择"]),"设施装备采购",...(products.length?products:["未选择"]),"项目备注\n"+(notes.trim()||"未填写"),"全部产品询价。具体型号、价格、施工与交付范围以沟通确认结果为准。"].join("\r\n\r\n");
  const url=URL.createObjectURL(new Blob(["\uFEFF",text],{type:"text/plain;charset=utf-8"}));
  const a=document.createElement("a");a.href=url;a.download="UVEO项目与采购询价清单.txt";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
}
function openAction(action){
  switch(action){
    case "venues-menu": {
      const b=document.querySelector(".nav-trigger"),open=b.getAttribute("aria-expanded")!=="true";
      b.setAttribute("aria-expanded",String(open));document.getElementById("venue-menu").hidden=!open;break;
    }
    case "copy-wechat":copyWechat();break;
    case "close":panel.close();break;
    case "search":
      drawer("搜索场地、服务与装备",`<label class="panel-search">${icon("search")}<input type="search" aria-label="搜索场地、服务或装备" placeholder="搜索场地、服务或运动装备"></label><div id="hits" aria-live="polite"></div>`);
      renderHits("");content.querySelector("input").focus();break;
    case "saved":savedPanel();break;
    case "bag":briefPanel();break;
    case "menu":
      drawer("浏览",'<a class="panel-link" href="#">首页</a><div class="mobile-nav-group"><h3>体育场地</h3><a href="#venues">场地类型 · 技术百科</a><a href="#services">建设与维护服务</a></div><a class="panel-link" href="#equipment">设施装备</a><a class="panel-link" href="#about">关于我们</a><a class="panel-link" href="#contact">联系我们</a><button class="panel-link" data-action="saved">收藏的场地百科</button>');break;
    case "add-equipment": {
      const input=document.getElementById("equipment-quantity");input.setCustomValidity("");if(!input.reportValidity())return;
      const quantity=Number(input.value),option=document.getElementById("equipment-option").value;
      const existing=equipmentBrief.find(r=>r.id===selectedEquipment && r.option===option);
      if(existing && existing.quantity+quantity>999){input.setCustomValidity("同一配置累计最多可填写 999，请调整数量或先从清单移除该配置。");input.reportValidity();return;}
      if(existing)existing.quantity+=quantity;else equipmentBrief.push({id:selectedEquipment,option,quantity});
      save("uveo.equipment.brief",equipmentBrief);badge();briefPanel();break;
    }
    case "add":
      if(!brief.some(r=>r.id===selectedVenue && r.service===selectedService)){brief.push({id:selectedVenue,service:selectedService});save("uveo.venues.brief",brief);badge();}
      briefPanel();break;
    case "export":exportBrief();break;
    case "help":
      drawer("服务说明",'<div class="help-body"><h3>如何了解材料与工艺？</h3><p>场地类型按五类整理，点击后阅读材料选择、系统构造与施工工艺百科。</p><h3>如何选择服务？</h3><p>统一从首页“建设与维护服务”进入新建、翻新或维护。选择场地项目与服务后加入需求清单，匹克球与网球可分别选择。</p><h3>如何选购设施装备？</h3><p>进入设施装备，选择产品类别、需求配置与数量，加入询价清单。具体型号、价格、运送与安装范围需沟通确认。</p><h3>如何整理需求？</h3><p>场地服务和装备可以加入同一清单。补充备注后可导出文本，也可到联系我们页面填写联系方式并下载询价单。当前页面不会在线发送或收取付款。</p><h3>如何确认实施范围？</h3><p>场地照片与装备示意图用于类别说明。材料、施工范围、工期和费用需结合现场情况与实际需求确定。</p></div>');break;
  }
}
document.addEventListener("input",e=>{
  if(e.target.matches(".panel-search input"))renderHits(e.target.value);
  if(e.target.id==="project-notes"){notes=e.target.value;save("uveo.venues.notes",notes);}
});
document.addEventListener("click",e=>{
  if(e.target.closest('.skip')){e.preventDefault();main.focus();return;}
  if(!e.target.closest(".nav-dropdown"))closeVenueMenu();
  const anchor=e.target.closest("a[href^='#']");if(anchor && panel.open)panel.close();
  if(anchor)closeVenueMenu();
  if(anchor?.dataset.chapter)scrollGuideChapter(anchor.dataset.chapter);
  const b=e.target.closest("button");if(!b)return;
  const d=b.dataset;
  if(d.action)openAction(d.action);
  if(d.venue)detail(d.venue,d.mode);
  if(d.serviceVenue){detail(d.serviceVenue,selectedService);content.querySelector(`[data-service-venue="${d.serviceVenue}"]`).focus({preventScroll:true});}
  if(d.equipment)equipmentDetail(d.equipment);
  if(d.equipmentFilter){equipmentGroup=d.equipmentFilter;equipmentCollection();document.querySelector(`[data-equipment-filter="${equipmentGroup}"]`).focus({preventScroll:true});}
  if(d.quantity){const input=document.getElementById("equipment-quantity");input.setCustomValidity("");input.value=Math.max(1,Math.min(999,(Number(input.value)||1)+Number(d.quantity)));}
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
document.addEventListener("submit",e=>{if(e.target.id!=="inquiry-form")return;e.preventDefault();const data=Object.fromEntries(new FormData(e.target));for(const field of ["name","contact","message"]){if(!data[field].trim()){e.target.elements[field].setCustomValidity("请填写有效内容");e.target.elements[field].reportValidity();return;}}exportBrief(data);document.getElementById("inquiry-status").textContent="询价单已生成，请查看浏览器下载，并通过微信 13710986758 或邮箱 504894325@qq.com 发送。";});
document.addEventListener("input",e=>{if(e.target.closest("#inquiry-form"))e.target.setCustomValidity("");});
window.addEventListener("hashchange",route);

badge();
route();
