"use strict";

// 概念层次用于材料与工艺阅读；不同产品体系不能直接套用同一配方或施工参数。
const venueGuides = [
  {
    id: "basketball", name: "篮球场", english: "Basketball courts",
    venueIds: ["basketball"], photo: "basketball", tag: "硅PU · 丙烯酸 · 拼装地板",
    summary: "认识常见面层，读懂基层、弹性层与表面纹理。",
    intro: "篮球场的使用感受来自整个地面系统。比较材料时，既要看面层，也要一起看基层稳定性、排水、球反弹与脚下摩擦；室内外环境不同，选材逻辑也不同。",
    materials: [
      { name: "硅PU弹性面层", description: "常见做法以适配底涂、弹性层、加强层及耐磨面层组合，具体结构随产品系统变化。", suitable: "希望采用连续涂装面层的校园、社区及训练球场。", attention: "关注基层含水、层间粘结和成品性能，不能仅凭颜色或总厚度判断质量。" },
      { name: "丙烯酸面层", description: "在合适的混凝土或沥青基础上，通过多道涂层形成运动表面；可选硬地或带缓冲层的系统。", suitable: "采用硬地涂层、重视表面质感与球反弹表现的球场。", attention: "面层不能替代结构修复；基础裂缝、积水和污染应先查明原因。" },
      { name: "模块式拼装地板", description: "将成型运动地板单元拼接在合格基础上，部分系统配合专用下垫层使用。", suitable: "采用模块铺装方式的室外球场及可拆装运动空间。", attention: "核对面板、下垫、边缘收口和热胀空间；透水面板也需要完整排水路径。" }
    ],
    layers: [
      { name: "承载基础与排水", description: "提供稳定支撑，并通过设计好的坡向、排水沟或透排结构把水导走。" },
      { name: "基层处理与底涂", description: "涂装体系先处理松散、油污、裂缝与局部低点，再使用相容底涂。" },
      { name: "弹性或缓冲层（按体系）", description: "硅PU、缓冲丙烯酸和拼装系统的做法不同，并非每种面层都有相同弹性层。" },
      { name: "运动面层", description: "涂装面层控制色彩与表面纹理；拼装体系在此位置采用面板，不能与涂层做法直接叠加。" },
      { name: "标线与边缘收口", description: "复核球场线、篮架周边和出入口过渡，避免边缘松动与突起。" }
    ],
    steps: [
      { name: "明确用途", description: "确定室内外、训练或休闲用途、使用人群与球场布局，再比较系统。" },
      { name: "复核基础", description: "检查承载、平整、裂缝与排水，记录潮湿和积水位置。" },
      { name: "处理基面", description: "清理污染与松散部位，按选定体系完成修补、找平和底涂。" },
      { name: "完成面层系统", description: "涂装按产品工序分层施工；拼装按面板排版、连接及边缘方案铺装。" },
      { name: "放样划线", description: "按篮球项目布置复核线位、篮架和活动净区，使用相容标线材料。" },
      { name: "检查后开放", description: "检查外观、连接或粘结、排水及运动性能，并按材料要求安排开放时间。" }
    ],
    checks: ["先确认基础与排水，再比较面层材料。", "查看完整系统的适用环境和检测资料，不把单一材料数据当成整场表现。", "涂层配比、层间等待和养护条件按具体产品技术文件执行。"],
    faqs: [
      { question: "面层越厚，球场就越好吗？", answer: "不能只看厚度。不同结构的变形、反弹、摩擦及耐用表现不同，应比较整套系统及适用用途。" },
      { question: "拼装地板透水，基础还需要排水吗？", answer: "需要。水穿过面板后仍要通过下部结构和排水出口离开场地，基础低洼或出口堵塞仍可能积水。" }
    ],
    sources: [
      { title: "FIBA：室外球场、运动地板与基础", url: "https://www.venueguide.fiba.basketball/outdoor-courts-and-facilities" },
      { title: "ITF：球场基础与丙烯酸系统构造", url: "https://www.itftennis.com/media/2234/courts-court-construction.pdf" },
      { title: "文明体育：硅PU体系施工工序参考", url: "https://www.wenmin.com.cn/shigonggongyi/r-236.html" }
    ]
  },
  {
    id: "racket", name: "匹克球场/网球场", english: "Pickleball & tennis courts",
    venueIds: ["pickleball", "tennis"], photo: "tennis", tag: "硬地涂层 · 缓冲系统 · 项目标线",
    summary: "了解硬地与缓冲面层，以及两种运动不同的布局。",
    intro: "匹克球和网球都可采用硬地运动面层，但共享材料不代表共享场地规格。网柱、网高、标线和活动空间应按各自项目核对；匹克球还需明确非截击区。",
    materials: [
      { name: "硬地丙烯酸系统", description: "在稳定的混凝土或沥青基础上形成多道丙烯酸涂层，表面颗粒与施工质感影响使用表现。", suitable: "采用硬地表面的网球场与匹克球场。", attention: "表面涂装不能掩盖基础沉降；需同时控制平整、坡向与积水。" },
      { name: "缓冲型丙烯酸系统", description: "在表面涂层下加入配套缓冲结构，与普通硬地丙烯酸的层次组成不同。", suitable: "需要比较硬地与缓冲脚感的训练和休闲场地。", attention: "缓冲效果由整套系统决定，不能任意添加软垫或增加不相容材料。" },
      { name: "相容的标线与修补材料", description: "基层修补、表面找平和标线材料需要与所用面层相容，形成连续的施工体系。", suitable: "专用场布置，以及经过面积和安全空间核对的共享场。", attention: "多项目标线应易于识别；网球场转换匹克球场前，要重新核对完整布局。" }
    ],
    layers: [
      { name: "地基与排水层", description: "根据场地条件处理承载、排水出口及周边水流。" },
      { name: "混凝土或沥青承载基础", description: "形成稳定平台，平整与坡向应在基础阶段完成控制。" },
      { name: "修补与表面找平层", description: "处理适宜修补的孔隙、低点及缺陷，结构裂缝需先评估。" },
      { name: "缓冲层（选配）", description: "仅在选定的缓冲系统中采用，硬地系统不一定包含这一层。" },
      { name: "丙烯酸运动涂层", description: "按产品体系形成连续表面，控制色区、纹理与均匀性。" },
      { name: "项目标线", description: "网球与匹克球分别放样，复核网柱、网位及边界关系。" }
    ],
    steps: [
      { name: "确定运动布局", description: "先区分网球、匹克球或共享场，确认线位、球网和周边活动空间。" },
      { name: "检查基础排水", description: "复核基础稳定、平整和坡向，标记裂缝、积水与排水出口。" },
      { name: "修补与找平", description: "按材料体系清理、修补和调平，避免直接以色漆覆盖基层问题。" },
      { name: "铺设所选系统", description: "硬地与缓冲体系分别依照技术文件施工，控制环境和层间条件。" },
      { name: "色区及标线", description: "完成表面色区后分别测量放线，共享场注意线色辨识与网位切换。" },
      { name: "复核使用表现", description: "检查涂层均匀、球反弹、表面摩擦、排水与场地布局，完成养护后开放。" }
    ],
    checks: ["匹克球与网球分别确认项目尺寸、网位和活动净区。", "硬地与缓冲系统分开比较，不用一项材料名称推断整场性能。", "共享场先解决标线辨识、球网切换和相邻场地通行问题。"],
    faqs: [
      { question: "旧网球场能直接画线变成匹克球场吗？", answer: "先检查基础状况、可用面积和相邻场地间距，再安排线位与球网；仅有划线空间并不等于完整布局合适。" },
      { question: "面层颜色能决定球速吗？", answer: "不能。球速与表面体系、纹理和球的相互作用有关；需要比较具体产品或测试结果，不能仅凭颜色判断。" }
    ],
    sources: [
      { title: "ITF：球场构造与缓冲层示意", url: "https://www.itftennis.com/media/2234/courts-court-construction.pdf" },
      { title: "USA Pickleball：球场布局与建设资料", url: "https://usapickleball.org/construction/" },
      { title: "Tennis Australia：网球设施规划与面层比较", url: "https://www.tennis.com.au/content/dam/tennisaustralia/documents/guidelines/facility-requirements/tennis-infrastructure-planning.pdf.coredownload.pdf" }
    ]
  },
  {
    id: "track", name: "田径跑道", english: "Athletics tracks",
    venueIds: ["track"], photo: "track", tag: "透气型 · 复合型 · 全塑型",
    summary: "从颗粒与聚氨酯体系，理解跑道结构及施工。",
    intro: "跑道通常由承载基础与合成运动面层共同组成。透气喷涂、复合封闭和全塑聚氨酯是不同结构思路，不能只用颜色、厚度或“塑胶”二字判断其性能。以下以常见现浇体系说明。",
    materials: [
      { name: "透气喷涂体系", description: "颗粒与聚氨酯粘结料形成底层，再以配套喷涂材料形成表面纹理。", suitable: "采用透排结构的日常训练与综合运动场。", attention: "面层与基础排水应一起设计，不能把表面可透水当作无需排水。" },
      { name: "复合封闭体系", description: "在颗粒弹性底层上设置封闭层，再形成聚氨酯耐磨表面，也常称夹层体系。", suitable: "采用分层组合结构的训练及田径设施。", attention: "层间粘结、封闭完整性与面层均匀度需要共同检查。" },
      { name: "全塑聚氨酯体系", description: "以聚氨酯弹性结构配合颗粒表层构成连续运动面层，具体配方依产品而异。", suitable: "按整体运动性能要求选择的田径训练或比赛场地。", attention: "不因名称就推定等级；需核对完整系统资料与完成场地的实际检测。" }
    ],
    layers: [
      { name: "稳定基础与排水设施", description: "控制承载、沉降、基础坡向、内沿排水沟及出口关系。" },
      { name: "基础处理及粘结界面", description: "检查并处理裂缝、污染与不平，按体系完成适配底涂。" },
      { name: "弹性结构层", description: "透气、复合与全塑体系的材料组成不同，按各自系统铺设。" },
      { name: "封闭层（部分体系）", description: "复合封闭体系设置此层；不能把它当作所有跑道都有的固定层。" },
      { name: "耐磨纹理表层", description: "采用所选体系的喷涂、撒粒或其他成面方式，保持均匀。" },
      { name: "分道与项目标记", description: "在测量放样基础上完成分道、起终点及相关标记。" }
    ],
    steps: [
      { name: "确定使用目标", description: "明确校园活动、日常训练或比赛用途，以及相应的场地与检测需求。" },
      { name: "测量与基础复核", description: "核查跑道几何布局、基础高程、平整、排水和内沿衔接。" },
      { name: "处理基层并试铺", description: "清理、修补，使用配套材料进行试铺，确认现场施工条件。" },
      { name: "铺设弹性结构", description: "按选定体系分段施工，控制配料、铺装均匀性与接茬。" },
      { name: "完成表面及划线", description: "完成封闭或表层工序后测量放线，复核弯道、直道及各项目标记。" },
      { name: "检验和养护", description: "检查面层厚度分布、粘结及运动性能，依据项目要求完成测量与检测。" }
    ],
    checks: ["先确认用途和几何布局，再确定面层系统。", "关注全场均匀性、层间粘结及基础排水，不只看局部样块。", "具体厚度、配方、养护与检测项目采用项目文件和产品技术要求。"],
    faqs: [
      { question: "不同类型的跑道可以混用施工工序吗？", answer: "不能直接混用。透气、封闭夹层与全塑体系的结构和成面方式不同，应使用相容的完整材料体系。" },
      { question: "材料有检测资料，整条跑道就合格了吗？", answer: "材料资料只说明相应样品或系统条件。完成场地还涉及实际铺装、几何测量与现场性能，需分别核对。" }
    ],
    sources: [
      { title: "World Athletics：田径设施技术资料与手册", url: "https://worldathletics.org/about-iaaf/documents/technical-information" },
      { title: "Rekortan：全塑与夹层跑道结构", url: "https://www.rekortan.com/track-systems" },
      { title: "Beynon：喷涂、封闭及聚氨酯体系说明", url: "https://beynonsports.com/en/products/detail/outdoor/" }
    ]
  },
  {
    id: "turf", name: "足球场（人造草）", english: "Artificial turf football pitches",
    venueIds: ["turf"], photo: "turf", tag: "草丝背衬 · 填充料 · 排水基层",
    summary: "看懂草坪系统组成、接缝与填充铺装工艺。",
    intro: "足球人造草是一整套场地系统，而不只是一卷绿色草毯。草丝、背衬、填充材料、减震垫和基础排水共同影响使用表现；填充型与免填充型的配置不能互相套用。",
    materials: [
      { name: "草丝与背衬", description: "草丝固定在背衬上形成草毯，需要结合足球用途比较结构、固定方式与透排设计。", suitable: "按训练频次与场地条件选择的足球人造草系统。", attention: "不能仅以草高或表面颜色判断整个系统；还要看配套结构与试验资料。" },
      { name: "填充材料（填充型系统）", description: "部分系统配置稳定填砂与性能填充料；材料类别、级配和用量依具体草坪系统确定。", suitable: "技术设计明确采用填充方式的人造草足球场。", attention: "不同填充物不能随意替换，需考虑兼容性、维护以及颗粒外迁控制。" },
      { name: "减震垫与接缝材料", description: "减震垫按系统需要配置；接缝带和胶黏剂用于连接草卷及嵌入式场线。", suitable: "需要配套减震结构或采用拼卷铺装的场地。", attention: "检查与草毯背衬、基础和环境的适配性；并非所有系统都采用相同减震垫。" }
    ],
    layers: [
      { name: "地基与排水网络", description: "根据地质、降雨及排放条件安排稳定处理、排水管沟与出口。" },
      { name: "承载与找平基础", description: "形成稳定的铺装平台，保证坡向、平整和透排路径。" },
      { name: "减震垫（按系统选配）", description: "与草毯及填充配置配套使用，不能独立替代整场性能核查。" },
      { name: "人造草毯与场线", description: "按草卷排版统一方向，连接接缝，并完成对应足球布局的场线。" },
      { name: "填充层（仅填充型）", description: "按系统要求分遍铺入并梳理，使填充分布与草丝状态均匀。" }
    ],
    steps: [
      { name: "调查场地条件", description: "明确使用强度、场制、基层条件、排水出口与后续维护安排。" },
      { name: "完成基础与排水", description: "检查高程、平整、承载和排水后，再进入草坪系统铺装。" },
      { name: "排版与铺草", description: "按选定系统铺设减震垫和草卷，协调草丝方向、接缝及边缘位置。" },
      { name: "接缝与场线", description: "使用配套接缝材料连接草卷，准确定位场线，避免胶液污染草丝。" },
      { name: "填充与梳理", description: "填充型系统分遍铺料并梳理；免填充系统遵循自身结构与安装要求。" },
      { name: "全场检查", description: "复核接缝、边缘、填充分布、排水及足球使用性能，并建立维护记录。" }
    ],
    checks: ["比较完整草坪系统，而不只比较单项草丝参数。", "核对接缝、周边收口与出入口的细节，规划填充料外迁控制。", "确认日常梳理、清洁、接缝巡检及填料复查需求。"],
    faqs: [
      { question: "人造草足球场是不是不需要维护？", answer: "仍需要清除异物、梳理草丝、巡查接缝及排水。填充型系统还要检查填料分布，维护方法应与所用系统一致。" },
      { question: "草坪越高或填充越多就越好吗？", answer: "不是。草丝、填充、背衬和减震垫需要成套匹配，改变其中一项可能影响整体表现，应依据系统资料确认。" }
    ],
    sources: [
      { title: "FIFA：足球人造草安装与基础工程", url: "https://football-technology.fifa.com/innovation/standards/football-turf/installing-football-turf" },
      { title: "FIFA：球场草坪与场地设计", url: "https://inside.fifa.com/innovation/stadium-guidelines/general-process-guidelines/design/turf-and-pitch-design" },
      { title: "FIFA：人造草系统组成与技术发展", url: "https://inside.fifa.com/innovation/innovation-programme/sustainable-artificial-turf-systems" }
    ]
  },
  {
    id: "badminton", name: "羽毛球场", english: "Badminton courts",
    venueIds: ["badminton"], photo: "badminton", tag: "运动地胶 · 弹性承载 · 接缝处理",
    summary: "了解室内地胶、下承结构与铺装接缝的关系。",
    intro: "室内羽毛球场通常需要把运动地胶和下部承载结构一起考虑。表面纹理、缓冲表现、平整度与接缝只是其中一部分，基层潮气、室内环境及铺装方式同样影响地面的稳定使用。",
    materials: [
      { name: "PVC运动地胶", description: "为运动用途设计的卷材，可由表面层、增强结构和缓冲层等组成，具体构造依产品而异。", suitable: "采用运动卷材表面的室内羽毛球场。", attention: "关注整套地面表现；不能仅凭卷材厚度判断脚感、防滑或是否适合比赛。" },
      { name: "弹性下承地板系统", description: "部分场地在运动表面下采用弹性地板结构，或以适合的弹性木地板作为完整运动地面。", suitable: "需要整体弹性承载设计的室内运动空间。", attention: "下承结构与表面材料应配套核对；加一层软垫不等于形成合格弹性地板。" },
      { name: "胶黏剂与接缝材料", description: "粘贴式卷材采用相容胶黏剂，接缝可按产品要求开槽、焊接或采用指定连接方式。", suitable: "按厂家技术文件实施的固定或指定铺装方案。", attention: "胶种、焊条、基层和卷材背衬要相容，临时铺装与满粘铺装不能直接互换。" }
    ],
    layers: [
      { name: "楼板或承载基础", description: "检查稳定、潮气来源及基层条件，必要的防潮处理应与完整系统协调。" },
      { name: "找平与基层准备", description: "形成干净、坚实、平整且满足材料含水要求的铺装面。" },
      { name: "弹性下承结构（选配）", description: "采用经设计的弹性系统时设置；并非所有PVC卷材铺装都有这一层。" },
      { name: "指定固定或粘结层", description: "按所选铺装方法使用配套胶黏剂或固定构造。" },
      { name: "运动地胶及项目标线", description: "卷材铺平、排气并处理接缝，再复核羽毛球场标线与网柱位置。" }
    ],
    steps: [
      { name: "明确运动空间", description: "核对羽毛球布局、网柱、周边通行空间与地面系统选择。" },
      { name: "检测并准备基层", description: "检查平整、坚实、清洁及含水状态，先处理潮湿、裂缝和局部缺陷。" },
      { name: "展开与排版", description: "按产品要求让卷材适应现场环境，统一铺设方向并安排接缝位置。" },
      { name: "固定与排气", description: "依指定铺装方式固定卷材，粘贴式施工控制胶黏剂开放条件并滚压排气。" },
      { name: "接缝与收边", description: "按体系处理接缝、门口和网柱预留位置，检查翘边、鼓包与高差。" },
      { name: "划线与开放检查", description: "复核标线、外观和整体地面表现，按卷材及胶黏剂要求安排使用时间。" }
    ],
    checks: ["地胶与基础、胶黏剂及下承结构应作为整体核对。", "关注基层潮湿、接缝、边缘和网柱附近，不只查看场地中央。", "防滑需要合适表面与清洁管理共同维持，不能简单理解为纹理越粗越好。"],
    faqs: [
      { question: "PVC地胶可以直接铺在任何旧地面上吗？", answer: "不可以。先检查旧地面的稳定、平整、清洁及潮湿情况，并确认与所选铺装方法相容。" },
      { question: "地胶越厚，缓冲表现一定越好吗？", answer: "不一定。整体表现取决于卷材结构及下承系统，比较时应看完整组合和相应测试资料。" }
    ],
    sources: [
      { title: "Badminton England：羽毛球场馆设计指南", url: "https://www.badmintonengland.co.uk/wp-content/uploads/2022/01/Badminton-Design-Guide.pdf" },
      { title: "Gerflor：羽毛球运动地胶铺装与接缝指南", url: "https://cdn-int.gerflor.com/media/2/47665/taraflex%25C2%25AE%2520badminton%2520-%2520installation%2520guidelines.pdf" },
      { title: "Tarkett Sports：运动地板安装资料", url: "https://eu.tarkettsportsindoor.com/installation-maintenance-guide/" }
    ]
  }
];
