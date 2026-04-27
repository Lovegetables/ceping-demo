const steps = [
  { id: "intro", name: "测评说明" },
  { id: "background", name: "背景信息" },
  { id: "capability", name: "能力测评" },
  { id: "personality", name: "性格测评" },
  { id: "result", name: "规划报告" }
];

const dimensions = {
  analytical: "分析能力",
  communication: "表达与沟通",
  execution: "执行力与抗压",
  creativity: "创造力与探索",
  stability: "稳定性与规则性",
  business: "商业敏感度"
};

const ASSESSMENT_API_BASE = typeof window !== "undefined"
  ? (window.ASSESSMENT_API_BASE || (window.location?.protocol === "file:" ? "http://127.0.0.1:8787" : window.location.origin))
  : "http://127.0.0.1:8787";

let latestAssessmentResult = null;
let latestAssessmentSignature = null;
let latestAutoRecordId = null;
let schoolAutocompleteActiveIndex = -1;
const questionOptionOrders = new Map();

const majorTypeDefinitions = {
  management: "管理/工商管理/组织管理",
  marketing: "市场营销/品牌/消费研究",
  finance: "金融/投资/经济学",
  accounting: "会计/审计/税务/财务",
  data: "数据科学/统计/数学/商业分析",
  cs: "计算机/软件/AI/信息系统",
  engineering: "工程/电子/机械/自动化",
  supplychain: "供应链/物流/工业工程/运营管理",
  lawpolicy: "法律/法学/公共政策/公共管理",
  socialscience: "国际关系/政治学/社会学/社会科学",
  media: "传媒/传播/新闻/广告/语言",
  humanities: "文学/历史/哲学/人文",
  arts: "艺术/设计/影视/创意",
  science: "生物/化学/医学/药学/自然科学",
  education: "教育/心理",
  other: "其他或暂不确定",
  none: "无该阶段学历"
};

const schoolDirectory = [
  { name: "University College London", aliases: ["ucl", "伦敦大学学院"] },
  { name: "London School of Economics and Political Science", aliases: ["lse", "伦敦政治经济学院", "伦敦政经"] },
  { name: "University of Oxford", aliases: ["oxford", "牛津", "牛津大学"] },
  { name: "University of Cambridge", aliases: ["cambridge", "剑桥", "剑桥大学"] },
  { name: "Imperial College London", aliases: ["imperial", "icl", "帝国理工"] },
  { name: "King's College London", aliases: ["kcl", "king's", "伦敦国王学院"] },
  { name: "University of Edinburgh", aliases: ["edinburgh", "爱丁堡", "爱丁堡大学"] },
  { name: "University of Manchester", aliases: ["manchester", "曼大", "曼彻斯特大学"] },
  { name: "University of Warwick", aliases: ["warwick", "华威", "华威大学"] },
  { name: "University of Bristol", aliases: ["bristol", "布里斯托大学"] },
  { name: "University of Melbourne", aliases: ["melbourne", "墨尔本大学"] },
  { name: "University of Sydney", aliases: ["sydney", "悉尼大学"] },
  { name: "University of New South Wales", aliases: ["unsw", "新南威尔士大学"] },
  { name: "Monash University", aliases: ["monash", "莫纳什大学"] },
  { name: "University of Toronto", aliases: ["toronto", "多伦多大学"] },
  { name: "University of British Columbia", aliases: ["ubc", "英属哥伦比亚大学"] },
  { name: "McGill University", aliases: ["mcgill", "麦吉尔大学"] },
  { name: "Harvard University", aliases: ["harvard", "哈佛", "哈佛大学"] },
  { name: "Stanford University", aliases: ["stanford", "斯坦福", "斯坦福大学"] },
  { name: "Massachusetts Institute of Technology", aliases: ["mit", "麻省理工"] },
  { name: "Princeton University", aliases: ["princeton", "普林斯顿", "普林斯顿大学"] },
  { name: "Yale University", aliases: ["yale", "耶鲁", "耶鲁大学"] },
  { name: "Columbia University", aliases: ["columbia", "哥伦比亚大学"] },
  { name: "University of Pennsylvania", aliases: ["upenn", "penn", "宾大", "宾夕法尼亚大学"] },
  { name: "University of Chicago", aliases: ["uchicago", "芝加哥大学"] },
  { name: "California Institute of Technology", aliases: ["caltech", "加州理工"] },
  { name: "University of California, Berkeley", aliases: ["uc berkeley", "berkeley", "加州伯克利", "加州大学伯克利分校"] },
  { name: "Cornell University", aliases: ["cornell", "康奈尔", "康奈尔大学"] },
  { name: "Brown University", aliases: ["brown", "布朗大学"] },
  { name: "Dartmouth College", aliases: ["dartmouth", "达特茅斯"] },
  { name: "Duke University", aliases: ["duke", "杜克", "杜克大学"] },
  { name: "Northwestern University", aliases: ["northwestern", "西北大学"] },
  { name: "Johns Hopkins University", aliases: ["johns hopkins", "jhu", "约翰霍普金斯"] },
  { name: "Carnegie Mellon University", aliases: ["cmu", "carnegie mellon", "卡内基梅隆"] },
  { name: "University of Michigan, Ann Arbor", aliases: ["umich", "michigan", "密歇根大学安娜堡", "密歇根大学"] },
  { name: "New York University", aliases: ["nyu", "纽约大学"] },
  { name: "University of California, Los Angeles", aliases: ["ucla", "加州大学洛杉矶分校"] },
  { name: "University of Southern California", aliases: ["usc", "南加大", "南加州大学"] },
  { name: "University of Virginia", aliases: ["uva", "弗吉尼亚大学"] },
  { name: "University of North Carolina at Chapel Hill", aliases: ["unc", "unc chapel hill", "北卡教堂山"] },
  { name: "University of California, San Diego", aliases: ["ucsd", "加州大学圣地亚哥分校"] },
  { name: "University of California, Davis", aliases: ["uc davis", "ucd", "加州大学戴维斯分校"] },
  { name: "University of California, Irvine", aliases: ["uci", "加州大学欧文分校"] },
  { name: "University of California, Santa Barbara", aliases: ["ucsb", "加州大学圣塔芭芭拉分校"] },
  { name: "University of Washington", aliases: ["uw", "uw seattle", "华盛顿大学"] },
  { name: "University of Illinois Urbana-Champaign", aliases: ["uiuc", "illinois urbana champaign", "伊利诺伊大学香槟分校"] },
  { name: "University of Texas at Austin", aliases: ["ut austin", "utaustin", "德州大学奥斯汀分校"] },
  { name: "Georgia Institute of Technology", aliases: ["gatech", "georgia tech", "佐治亚理工"] },
  { name: "University of Wisconsin-Madison", aliases: ["uw madison", "wisconsin madison", "威斯康星大学麦迪逊分校"] },
  { name: "Boston University", aliases: ["bu", "波士顿大学"] },
  { name: "Boston College", aliases: ["bc", "波士顿学院"] },
  { name: "Northeastern University", aliases: ["neu", "northeastern", "东北大学"] },
  { name: "Emory University", aliases: ["emory", "埃默里大学"] },
  { name: "Rice University", aliases: ["rice", "莱斯大学"] },
  { name: "Vanderbilt University", aliases: ["vanderbilt", "范德堡大学"] },
  { name: "Washington University in St. Louis", aliases: ["wustl", "washu", "圣路易斯华盛顿大学"] },
  { name: "Georgetown University", aliases: ["georgetown", "乔治城大学"] },
  { name: "University of Notre Dame", aliases: ["notre dame", "圣母大学"] },
  { name: "Tufts University", aliases: ["tufts", "塔夫茨大学"] },
  { name: "University of Rochester", aliases: ["rochester", "罗切斯特大学"] },
  { name: "Case Western Reserve University", aliases: ["case western", "cwru", "凯斯西储大学"] },
  { name: "Purdue University", aliases: ["purdue", "普渡大学"] },
  { name: "Pennsylvania State University", aliases: ["penn state", "宾州州立"] },
  { name: "Ohio State University", aliases: ["osu", "ohio state", "俄亥俄州立大学"] },
  { name: "University of Minnesota Twin Cities", aliases: ["umn", "minnesota twin cities", "明尼苏达大学双城分校"] },
  { name: "Indiana University Bloomington", aliases: ["iu bloomington", "indiana university", "印第安纳大学伯明顿"] },
  { name: "Michigan State University", aliases: ["michigan state", "msu", "密歇根州立大学"] },
  { name: "University of Maryland, College Park", aliases: ["umd", "maryland college park", "马里兰大学帕克分校"] },
  { name: "Texas A&M University", aliases: ["tamu", "texas a&m", "德州农工"] },
  { name: "Arizona State University", aliases: ["asu", "亚利桑那州立大学"] },
  { name: "University of Florida", aliases: ["uf", "佛罗里达大学"] },
  { name: "Rutgers University", aliases: ["rutgers", "罗格斯大学"] },
  { name: "Syracuse University", aliases: ["syracuse", "雪城大学"] },
  { name: "Fordham University", aliases: ["fordham", "福特汉姆大学"] },
  { name: "Baruch College", aliases: ["baruch", "巴鲁克学院"] },
  { name: "University of Connecticut", aliases: ["uconn", "康涅狄格大学"] },
  { name: "George Washington University", aliases: ["gwu", "乔治华盛顿大学"] },
  { name: "American University", aliases: ["american university", "美利坚大学"] },
  { name: "Brandeis University", aliases: ["brandeis", "布兰迪斯大学"] },
  { name: "National University of Singapore", aliases: ["nus", "新加坡国立", "新加坡国立大学"] },
  { name: "Nanyang Technological University", aliases: ["ntu", "南洋理工", "南洋理工大学"] },
  { name: "The University of Hong Kong", aliases: ["hku", "港大", "香港大学"] },
  { name: "The Hong Kong University of Science and Technology", aliases: ["hkust", "港科", "港科大", "香港科技大学"] },
  { name: "The Chinese University of Hong Kong", aliases: ["cuhk", "港中文", "香港中文大学"] },
  { name: "Tsinghua University", aliases: ["清华", "清华大学", "tsinghua"] },
  { name: "Peking University", aliases: ["北大", "北京大学", "peking university", "pku"] },
  { name: "Fudan University", aliases: ["复旦", "复旦大学", "fudan"] },
  { name: "Shanghai Jiao Tong University", aliases: ["上海交通", "上海交通大学", "上交", "sjtu"] },
  { name: "Zhejiang University", aliases: ["浙大", "浙江大学"] },
  { name: "Renmin University of China", aliases: ["人大", "中国人民大学"] },
  { name: "Nanjing University", aliases: ["南大", "南京大学"] },
  { name: "University of Science and Technology of China", aliases: ["中科大", "中国科学技术大学"] },
  { name: "Tongji University", aliases: ["同济", "同济大学"] },
  { name: "Beihang University", aliases: ["北航", "北京航空航天大学"] },
  { name: "Nankai University", aliases: ["南开", "南开大学"] },
  { name: "Xiamen University", aliases: ["厦大", "厦门大学"] },
  { name: "Wuhan University", aliases: ["武大", "武汉大学"] },
  { name: "Sun Yat-sen University", aliases: ["中山大学", "sysu"] }
];

let allSchoolDirectory = mergeSchoolDirectories(
  schoolDirectory,
  typeof window !== "undefined" ? window.externalSchoolDirectory || [] : []
);
let schoolDirectoryLoadPromise = null;
let schoolRankingLoadPromise = null;

const capabilityQuestions = [
  ["analytical", "业务数据下滑分析", "你在实习中发现某产品本月用户转化率下降了15%，负责人让你初步分析原因。", [["先拆漏斗和渠道数据，再看变化来源", 3], ["先询问业务同事，确认近期异常情况", 2], ["先查看竞品活动和价格是否变化", 2], ["先按活动力度不足这个方向排查", 1]]],
  ["analytical", "复杂商业问题", "你被要求分析“某品牌为什么在年轻人中增长放缓”。你会如何展开？", [["拆成用户、渠道、产品、价格几类验证", 3], ["先做用户访谈，了解真实评价", 2], ["先研究行业报告，判断整体趋势", 2], ["先看社媒讨论，找出常见反馈", 1]]],
  ["analytical", "案例面试准备", "你准备咨询或商业分析类岗位的案例面试，最可能采用哪种方法？", [["按题型系统练习，并复盘拆题结构", 3], ["多看优秀案例，熟悉表达方式", 2], ["找同学模拟，提高临场反应", 2], ["主要靠现场发挥和日常积累", 1]]],
  ["analytical", "信息不完整时决策", "老板让你在2小时内判断一个新市场是否值得进入，但信息不完整。你会怎么做？", [["先定关键假设，再快速验证核心变量", 3], ["先搜索更多信息，尽量减少遗漏", 2], ["用类似市场经验做初步类比", 2], ["先说明信息不足，暂不做判断", 1]]],

  ["communication", "汇报项目进展", "你需要向经理汇报一个项目延期问题。你会怎么说？", [["先说影响和原因，再给补救安排", 3], ["详细说明困难，让经理理解延期", 2], ["先承认延期，表示会尽快赶上", 1], ["等经理追问时再逐项解释", 1]]],
  ["communication", "强势同事协作", "你和一位强势同事负责同一项目，对方经常直接否定你的想法。你会如何处理？", [["私下对齐分歧，用事实推动方案", 3], ["会议中说明理由，争取团队支持", 2], ["减少正面冲突，按对方方式推进", 1], ["向上级反馈，请对方协助协调", 2]]],
  ["communication", "面试表达", "面试官问你“为什么适合这个岗位”，你会如何回答？", [["对照岗位要求，用经历证明能力", 3], ["说明自己有兴趣，也愿意学习", 1], ["重点介绍学校、专业和成绩", 2], ["讲一段最有成就感的经历", 2]]],
  ["communication", "跨部门沟通", "你需要推动设计、技术、运营三个团队配合上线一个功能。你会优先做什么？", [["先对齐目标、分工、节点和风险", 3], ["先找关键负责人沟通争取支持", 2], ["建群发需求文档，让大家先看", 1], ["先推动熟悉团队，再拉其他人", 2]]],

  ["execution", "多任务并行", "你同时面对课程论文、实习任务、社团活动三个截止日期。你会怎么处理？", [["按重要性和时间拆分每日节点", 3], ["先做最紧急的任务，再处理其他", 2], ["先做最有把握的任务，降低压力", 1], ["和相关方沟通调整部分预期", 2]]],
  ["execution", "高压交付", "实习期间，领导临时要求你第二天上午前完成一份分析材料。你会怎么做？", [["先确认标准，再搭框架做核心部分", 3], ["直接开始查资料，尽量做完整", 2], ["先问能否延时，避免质量不够", 1], ["找同学或同事协助完成部分内容", 2]]],
  ["execution", "任务被反复修改", "你完成的方案被领导连续修改三次，你会怎么反应？", [["总结修改标准，确认方向后推进", 3], ["继续按领导意见改到满意为止", 2], ["会有挫败感，但仍尽量完成", 1], ["询问是否最初需求不够清楚", 2]]],
  ["execution", "长周期目标", "你计划半年后求职，但现在课程和生活都很忙。你会怎么安排？", [["每周固定做简历、面试和投递复盘", 3], ["等招聘季开始后再集中准备", 1], ["偶尔参加宣讲会，保持了解", 2], ["先专注GPA，求职之后再补", 1]], ["all"], true],

  ["creativity", "新活动策划", "你负责为一个校园品牌活动设计传播方案。你会怎么开始？", [["先看人群和渠道，再设计互动形式", 3], ["参考同类活动玩法，再做调整", 2], ["先设计视觉海报和主题口号", 2], ["沿用往年模板，降低执行风险", 1]]],
  ["creativity", "开放任务", "老师或领导给你一个很开放的任务：“研究一下AI对消费行业的影响”。你会怎么做？", [["先列几个方向，再选择切入点", 3], ["先读报告和文章，寻找灵感", 2], ["先问清楚希望交付什么形式", 2], ["会觉得范围太大，难以下手", 1]]],
  ["creativity", "产品体验优化", "你发现一个App的注册流程很复杂。你会如何提出优化建议？", [["从用户路径和流失点提出改进", 3], ["参考竞品流程，提出类似优化", 2], ["直接建议减少步骤，提高完成率", 2], ["认为这更像技术或合规问题", 1]]],
  ["creativity", "探索新机会", "你发现一个新兴行业很火，但自己了解不多。你会怎么做？", [["先拆行业链条、岗位和能力要求", 3], ["找从业者聊聊真实工作内容", 2], ["先报名课程或活动边学边看", 2], ["等行业更成熟后再考虑投入", 1]]],

  ["stability", "流程合规", "你在实习中发现一个流程可以更快完成，但可能不完全符合公司规定。你会怎么做？", [["先确认规则边界，再提优化方案", 3], ["如果风险不大，先按快方式完成", 1], ["完全沿用现有流程，不主动改", 2], ["向负责人说明利弊，请其决定", 3]]],
  ["stability", "细节检查", "你需要提交一份重要材料，时间比较紧。你会怎么处理最后检查？", [["按清单检查数据、格式和逻辑", 3], ["快速浏览，确保没有明显错误", 2], ["主要检查自己最担心的部分", 2], ["时间紧先提交，有问题再修改", 1]]],
  ["stability", "长期稳定工作", "如果一份工作内容较稳定、流程清晰、晋升较慢但确定性强，你的看法是？", [["可以接受，适合作为长期选择", 3], ["短期能接受，但希望有成长空间", 2], ["会觉得挑战不足，不想长期做", 1], ["取决于薪资、城市和平台情况", 2]]],
  ["stability", "规则与创新冲突", "你提出的新方案被告知“不符合既有流程”。你会怎么做？", [["先理解流程原因，再判断空间", 3], ["如果方案更好，会继续争取", 2], ["尊重规则，暂时不继续推动", 2], ["会觉得组织保守，投入感下降", 1]]],

  ["business", "判断商业价值", "你想到一个校园二手交易平台的点子。你会优先验证什么？", [["需求频率、供需效率和变现方式", 3], ["同学们是否觉得这个想法有趣", 1], ["市面上有没有类似竞品存在", 2], ["技术上能不能快速做出版本", 2]]],
  ["business", "市场活动复盘", "一个品牌活动曝光量很高，但转化很低。你会如何判断问题？", [["看人群、利益点和转化路径", 3], ["认为活动创意可能不够吸引人", 2], ["认为预算可能投错了渠道", 2], ["认为曝光不错，转化低也正常", 1]]],
  ["business", "实习中发现机会", "你在实习中发现用户经常反馈同一个问题，但团队还没重视。你会怎么做？", [["整理反馈频次和影响，形成建议", 3], ["会议中提醒大家这个问题较多", 2], ["先和运营同学确认是否重要", 2], ["觉得自己是实习生，不主动提", 1]]],
  ["business", "看待公司增长", "你判断一家公司是否有发展潜力，会优先关注什么？", [["看市场空间、壁垒和增长效率", 3], ["看公司知名度和融资情况", 2], ["看产品是否受身边人喜欢", 1], ["看薪资、环境和员工评价", 2]]],
  ["analytical", "咨询项目利润诊断", "客户是一家连锁餐饮品牌，利润率连续两个季度下降。项目组让你先做问题拆解。", [["拆收入、成本和门店结构验证", 3], ["先访谈门店，了解一线反馈", 2], ["先看同行是否也在降价增本", 2], ["直接建议提价或减少折扣", 1]], ["consulting", "ba"]],
  ["communication", "客户会议表达", "你需要在客户会议上说明一个不太受欢迎的结论。", [["先说影响和证据，再给替代方案", 3], ["先铺垫研究过程，降低接受难度", 2], ["尽量弱化结论，避免现场冲突", 1], ["把问题交给项目经理主讲", 1]], ["consulting", "policy"]],
  ["business", "投资标的判断", "你需要快速判断一家消费公司的投资价值。", [["看空间、增长、利润、壁垒和估值", 3], ["重点看融资新闻和创始人背景", 2], ["先判断自己是否喜欢产品", 1], ["先找几篇研报整理观点", 2]], ["finance", "ba"]],
  ["stability", "金融材料校验", "你负责投行或行研材料中的关键数据表，提交前发现口径可能不一致。", [["先核对来源、口径和引用页码", 3], ["先提交版本，再提醒后续更新", 1], ["只检查关键数据，其余保持原样", 2], ["请同事一起复核关键表格", 3]], ["finance"]],
  ["creativity", "品牌Campaign设计", "你要为一个新品设计校园传播活动。", [["基于人群洞察设计主题和触点", 3], ["参考爆款活动，改成本品牌版本", 2], ["先做视觉和口号提升记忆点", 2], ["沿用去年模板，确保执行稳定", 1]], ["fmcg", "creative"]],
  ["communication", "品牌跨团队推进", "市场部、销售和代理商对活动目标理解不一致。", [["重新对齐目标、人群、预算和分工", 3], ["分别沟通诉求，再折中推进", 2], ["先推进自己能控制的部分", 1], ["把分歧升级给负责人决定", 2]], ["fmcg"]],
  ["business", "产品需求优先级", "产品团队有三个需求都想排期：提升留存、增加收入、优化体验。", [["按用户影响、业务价值和成本排序", 3], ["优先做用户呼声最高的需求", 2], ["优先做领导最关注的需求", 1], ["先做开发成本最低的需求", 2]], ["internet"]],
  ["analytical", "数据异常判断", "运营看板显示某渠道新增用户暴涨，但付费没有变化。", [["检查埋点、渠道质量和转化漏斗", 3], ["先判断这是一次成功拉新", 1], ["问渠道同事最近是否加了预算", 2], ["先等几天观察整体趋势", 1]], ["internet", "ba"]],
  ["stability", "国央企流程推进", "你在大型组织实习，需要推动一个跨部门流程，但审批链条较长。", [["先理清节点、材料和关键联系人", 3], ["找熟悉同事帮忙加快流程", 2], ["直接催所有相关方尽快处理", 1], ["等待流程推进，尽量避免出错", 2]], ["soe"]],
  ["communication", "公共事务沟通", "你要向不同立场的利益相关方说明一个政策或项目方案。", [["识别关注点，再讲事实和边界", 3], ["强调方案正面意义，争取认同", 2], ["尽量避开敏感分歧和争议", 1], ["把正式材料发给对方理解", 1]], ["policy", "soe"]],
  ["creativity", "策展内容选择", "你负责一个青年文化展览，需要确定内容线索。", [["先定受众、主题和作品关系", 3], ["先选自己最喜欢的内容", 2], ["参考成熟展览结构做改编", 2], ["优先选择执行最简单内容", 1]], ["creative"]],
  ["execution", "作品集推进", "你想申请内容/策展/品牌岗位，但作品集一直没有完成。", [["拆成模块，每周固定交付", 3], ["等有灵感时再集中完成", 1], ["先做最容易展示的部分", 2], ["找朋友一起督促推进", 2]], ["creative", "fmcg"], true],
  ["stability", "审计底稿复核", "你在审计/风险咨询项目中负责复核底稿，发现凭证和表格口径不一致。", [["核对凭证、口径和公式后同步", 3], ["先修明显错误，其余等经理复核", 2], ["总数能对上就先提交版本", 1], ["请同组同事一起交叉检查", 3]], ["big4", "financial_services", "legal_compliance"]],
  ["analytical", "银行风险判断", "你需要初步判断一个企业客户是否存在信用风险。", [["看现金流、负债、行业和履约", 3], ["重点看企业规模和品牌知名度", 1], ["先查公开新闻和工商信息", 2], ["主要参考客户经理的判断", 1]], ["financial_services", "legal_compliance"]],
  ["communication", "HR候选人沟通", "你负责推进一个校招候选人的面试流程，但业务部门和候选人时间反复冲突。", [["管理双方预期，给出可选节点", 3], ["先满足业务时间，再协调候选人", 2], ["让候选人自己多提供时间", 1], ["把问题升级给主管处理", 2]], ["hr"]],
  ["execution", "供应链交付异常", "供应商延期导致新品上线可能受影响，你需要协调解决。", [["确认影响、替代方案和新时间表", 3], ["先催供应商尽快完成交付", 1], ["优先通知销售和市场延期", 2], ["等待采购负责人统一处理", 1]], ["supply_chain"]],
  ["analytical", "合规政策解读", "公司准备上线一个新业务，你需要判断其中的数据或合同风险。", [["拆流程、规则、风险和调整方案", 3], ["先查类似公司的公开案例", 2], ["直接建议暂缓上线避免风险", 1], ["把问题交给外部律师判断", 1]], ["legal_compliance"]],
  ["creativity", "科研选题推进", "你准备申请博士或研究助理，需要确定一个研究选题。", [["看文献缺口、方法和数据来源", 3], ["选择自己最感兴趣的话题", 2], ["沿用导师课题，降低风险", 2], ["先大量阅读，不急着定题", 1]], ["academic"], true],
  ["business", "海外市场进入", "你要判断一个中国品牌是否适合进入某个海外市场。", [["看需求、渠道、竞品和获客成本", 3], ["先看当地社媒是否讨论该品类", 2], ["先找海外达人做小规模投放", 2], ["国内卖得好，海外也有机会", 1]], ["crossborder", "fmcg"]]
].map((q, index) => ({ id: `C${index + 1}`, dimension: q[0], title: q[1], scene: q[2], options: q[3], tags: q[4] || ["all"], lead: Boolean(q[5]) }));

let activeCapabilityQuestions = capabilityQuestions.slice(0, 24);

const personalityQuestions = [
  ["decision", "选择实习机会", "你同时拿到两个实习机会：A岗位工作内容更贴近目标方向，但团队节奏较快；B岗位氛围更轻松，但和未来求职的相关度一般。", [["先比较内容、成长和求职价值", "rational"], ["更看重团队氛围和做起来是否舒服", "emotional"], ["会综合前辈建议和自身感受", "neutral"], ["优先选当下压力更小的机会", "emotional"]]],
  ["decision", "汇报方案取舍", "你在实习中准备周汇报，手里有两个版本：一个逻辑清晰、数据完整；另一个表达更有感染力，但论据还不够扎实。", [["优先用逻辑和证据更完整的版本", "rational"], ["优先用更容易打动人的表达", "emotional"], ["保留核心数据，再优化表达", "neutral"], ["看汇报对象偏好再决定风格", "neutral"]]],
  ["decision", "面试失利复盘", "一场你很重视的面试没有通过，接下来你通常会怎么做？", [["先拆岗位要求和回答差距", "rational"], ["先消化情绪，再考虑下一步", "emotional"], ["找前辈或朋友聊聊外部反馈", "neutral"], ["快速重做简历和面试案例", "rational"]]],
  ["decision", "接受修改意见", "带教同事看完你的材料后说“方向不太对，需要重来”。你第一反应更接近哪种？", [["先确认判断标准和目标，再重做", "rational"], ["会先有些受挫，需要缓一下再继续", "emotional"], ["会先理解对方担心的点，再判断怎么调整", "neutral"], ["直接按目标重新搭结构，尽快交新版", "rational"]]],
  ["decision", "职业方向判断", "当你决定未来重点投递哪个方向时，你通常最看重什么？", [["行业前景、成长路径和履历价值", "rational"], ["是否符合兴趣、价值感和喜欢程度", "emotional"], ["综合市场情况、建议和个人偏好", "neutral"], ["优先看自己是否有动力坚持", "emotional"]]],

  ["social", "高频协作场景", "如果一份工作每天都需要开会、推进项目、和不同团队反复沟通，你通常会怎么感受？", [["节奏快但有参与感，会更有状态", "extrovert"], ["可以完成，但高频沟通较消耗", "introvert"], ["取决于沟通效率和议题价值", "neutral"], ["更希望保留完整独立工作时间", "introvert"]]],
  ["social", "行业交流活动", "参加招聘宣讲会或行业交流活动时，你通常更像哪种状态？", [["会主动认识人、提问和交换信息", "extrovert"], ["更倾向先观察，少主动交流", "introvert"], ["只和少数关键对象目标交流", "neutral"], ["更喜欢会后再单独联系对方", "introvert"]]],
  ["social", "项目合作方式", "做团队项目时，你更容易进入状态的方式是？", [["边讨论边推进，互动会激发想法", "extrovert"], ["先自己想清楚，再参加讨论", "introvert"], ["按任务性质选择独立或协作", "neutral"], ["团队节奏快、反馈多会更投入", "extrovert"]]],
  ["social", "正式汇报场景", "如果需要你代表小组向老师、客户或面试官做正式汇报，你通常会？", [["愿意承担主讲角色，表达本身也是影响力", "extrovert"], ["可以讲，但会更依赖充分准备", "neutral"], ["如果能不主讲，通常会更愿意负责内容支持", "introvert"], ["如果内容是自己主导完成的，可以接受出面汇报", "neutral"]]],
  ["social", "一周后的恢复方式", "一周高密度实习或求职准备结束后，你通常用什么方式恢复状态？", [["见朋友聊天，换环境更快恢复", "extrovert"], ["一个人安静休息，整理节奏", "introvert"], ["找少数熟人见面，不安排太满", "neutral"], ["做些不需要太多互动的事情", "introvert"]]],

  ["risk", "新团队机会", "你拿到一个成长很快但流程还不完善的团队机会，岗位空间不错，但不确定性也更高。", [["方向和人靠谱，就愿意试一试", "adventurous"], ["更倾向制度成熟、路径稳定的平台", "conservative"], ["可以尝试，但会先设阶段目标", "neutral"], ["除非没有稳选择，否则不优先", "conservative"]]],
  ["risk", "跨专业转向", "你想申请一个和现有专业不完全一致的方向，需要补项目、补认知、重新包装经历。", [["方向值得，就愿意重新搭证据", "adventurous"], ["更倾向先走原专业相近路径", "conservative"], ["先用项目或实习试一试", "neutral"], ["担心试错成本，不轻易转向", "conservative"]]],
  ["risk", "高压高回报岗位", "有个岗位能明显拉高履历和成长速度，但强度大、节奏快、淘汰也快。", [["如果能带来明显跃迁，愿意在前几年冲一冲", "adventurous"], ["会优先考虑自己的身体状态和可持续性", "conservative"], ["要看这份高压是否真的能换来后续机会", "neutral"], ["不太愿意把自己长期放在高压环境里", "conservative"]]],
  ["risk", "从0到1任务", "带教让你接一个没有成熟模板的新任务，只给了目标，没有具体做法。", [["会觉得有挑战，愿意自己摸索推进", "adventurous"], ["希望先明确边界、资源和标准再开始", "conservative"], ["可以做，但会先把风险和关键假设列清楚", "neutral"], ["更希望接已经有成熟流程的任务", "conservative"]]],
  ["risk", "城市与机会选择", "如果一个城市岗位更多、上升更快，但生活成本高、竞争也更激烈，你会怎么选？", [["优先看机会密度，值得就去", "adventurous"], ["更看重稳定和长期可承受性", "conservative"], ["先算收入、成本和成长收益", "neutral"], ["更倾向熟悉且支持强的城市", "conservative"]]],

  ["structure", "接到新任务", "刚到一段新实习时，主管给你安排了一个新任务。你更希望得到哪种支持？", [["目标、流程、标准和时间都明确", "rule"], ["只给目标，具体方法自己设计", "free"], ["讲清关键节点，方法保持灵活", "neutral"], ["先知道边界和常见坑更安心", "rule"]]],
  ["structure", "绩效判断方式", "如果要评价你的工作表现，你更希望依据什么？", [["有明确指标、标准和质量要求", "rule"], ["更看实际影响、创新和结果", "free"], ["既看结果，也看过程是否合理", "neutral"], ["不被细流程绑住，结果好就行", "free"]]],
  ["structure", "入职适应方式", "刚进入一家公司或团队时，你更适合哪种上手方式？", [["先看材料、流程和示例再做", "rule"], ["尽快进入真实任务中熟悉规则", "free"], ["先了解核心规则，再边做边调", "neutral"], ["先知道清晰边界才更安心", "rule"]]],
  ["structure", "任务管理习惯", "面对多项任务并行时，你通常怎么安排？", [["会列清单、排优先级、按计划推进", "rule"], ["会根据状态和临场变化灵活切换", "free"], ["重要事项会做计划，其余保持机动", "neutral"], ["不喜欢太死的节奏，但会盯住最终结果", "free"]]],
  ["structure", "组织规则感受", "如果一家公司审批较多、流程较细，但资源稳定、分工明确，你更可能怎么想？", [["可以接受，规则清楚更好推进", "rule"], ["会觉得限制多，影响效率发挥", "free"], ["看规则是否合理、能否提质", "neutral"], ["如果平台价值高，可以适应", "rule"]]]
].map((q, index) => ({ id: `P${index + 1}`, dimension: q[0], title: q[1], scene: q[2], options: q[3] }));

const jobProfiles = {
  consulting: {
    name: "战略/管理咨询",
    weights: { analytical: 5, communication: 5, execution: 5, creativity: 3, stability: 2, business: 4 },
    traits: { decision: "rational", social: "extrovert", risk: "adventurous", structure: "free" },
    gate: "高",
    jobs: "咨询顾问、PTA、战略实习、商业分析实习",
    majors: ["management", "marketing", "finance", "accounting", "data", "cs", "engineering", "supplychain", "lawpolicy", "socialscience"]
  },
  finance: {
    name: "金融投行/行研/投资",
    weights: { analytical: 5, communication: 4, execution: 5, creativity: 2, stability: 4, business: 5 },
    traits: { decision: "rational", social: "neutral", risk: "adventurous", structure: "rule" },
    gate: "高",
    jobs: "投行分析师、行研助理、投资实习、交易咨询",
    majors: ["finance", "accounting", "data", "cs", "management", "science"]
  },
  internet: {
    name: "互联网产品/用户增长",
    weights: { analytical: 4, communication: 4, execution: 4, creativity: 4, stability: 2, business: 5 },
    traits: { decision: "rational", social: "neutral", risk: "adventurous", structure: "free" },
    gate: "中高",
    jobs: "产品运营、用户增长、商业运营、数据分析",
    majors: ["data", "cs", "management", "marketing", "engineering", "media"]
  },
  fmcg: {
    name: "快消/消费品品牌市场",
    weights: { analytical: 3, communication: 5, execution: 4, creativity: 5, stability: 2, business: 4 },
    traits: { decision: "neutral", social: "extrovert", risk: "neutral", structure: "free" },
    gate: "中高",
    jobs: "品牌市场、消费者洞察、Trade Marketing、管培生",
    majors: ["management", "marketing", "media", "socialscience", "arts", "humanities"]
  },
  soe: {
    name: "国央企/事业单位",
    weights: { analytical: 3, communication: 3, execution: 3, creativity: 1, stability: 5, business: 2 },
    traits: { decision: "rational", social: "neutral", risk: "conservative", structure: "rule" },
    gate: "中高",
    jobs: "管培、综合管理、财务法务、项目管理",
    majors: ["lawpolicy", "socialscience", "management", "finance", "accounting", "engineering"]
  },
  creative: {
    name: "文娱/策展/内容创意",
    weights: { analytical: 2, communication: 4, execution: 3, creativity: 5, stability: 2, business: 3 },
    traits: { decision: "emotional", social: "neutral", risk: "adventurous", structure: "free" },
    gate: "中",
    jobs: "内容策划、策展助理、品牌内容、项目统筹",
    majors: ["arts", "media", "humanities", "socialscience", "marketing", "management"]
  },
  ba: {
    name: "数据分析/商业分析",
    weights: { analytical: 5, communication: 3, execution: 3, creativity: 2, stability: 4, business: 4 },
    traits: { decision: "rational", social: "introvert", risk: "neutral", structure: "rule" },
    gate: "中高",
    jobs: "商业分析、数据分析、经营分析、策略分析",
    majors: ["data", "cs", "finance", "accounting", "management", "engineering", "supplychain"]
  },
  policy: {
    name: "政策/公共事务",
    weights: { analytical: 4, communication: 5, execution: 3, creativity: 2, stability: 4, business: 3 },
    traits: { decision: "rational", social: "extrovert", risk: "conservative", structure: "rule" },
    gate: "中高",
    jobs: "公共事务、政策研究、国际组织项目、政府关系",
    majors: ["lawpolicy", "socialscience", "media", "management", "education", "humanities"]
  },
  financial_services: {
    name: "银行/资管/保险/金融中后台",
    weights: { analytical: 4, communication: 3, execution: 4, creativity: 1, stability: 5, business: 4 },
    traits: { decision: "rational", social: "neutral", risk: "conservative", structure: "rule" },
    gate: "中高",
    jobs: "银行管培、资管产品、风险管理、金融科技、运营管理",
    majors: ["finance", "accounting", "management", "data", "cs", "lawpolicy"]
  },
  big4: {
    name: "四大/审计/税务/风险咨询",
    weights: { analytical: 4, communication: 4, execution: 5, creativity: 2, stability: 5, business: 3 },
    traits: { decision: "rational", social: "neutral", risk: "neutral", structure: "rule" },
    gate: "中高",
    jobs: "审计、税务、风险咨询、交易咨询、管理咨询助理",
    majors: ["finance", "accounting", "management", "data", "cs", "lawpolicy"]
  },
  hr: {
    name: "人力资源/组织发展",
    weights: { analytical: 3, communication: 5, execution: 3, creativity: 2, stability: 4, business: 3 },
    traits: { decision: "neutral", social: "extrovert", risk: "conservative", structure: "rule" },
    gate: "中",
    jobs: "HRBP助理、招聘、组织发展、培训发展、雇主品牌",
    majors: ["management", "marketing", "socialscience", "media", "education", "humanities"]
  },
  supply_chain: {
    name: "供应链/采购/物流",
    weights: { analytical: 4, communication: 3, execution: 5, creativity: 2, stability: 5, business: 4 },
    traits: { decision: "rational", social: "neutral", risk: "conservative", structure: "rule" },
    gate: "中",
    jobs: "供应链管培、采购、物流计划、需求预测、运营管理",
    majors: ["engineering", "supplychain", "management", "data", "science", "cs"]
  },
  legal_compliance: {
    name: "法务/合规/风控",
    weights: { analytical: 4, communication: 3, execution: 4, creativity: 1, stability: 5, business: 3 },
    traits: { decision: "rational", social: "introvert", risk: "conservative", structure: "rule" },
    gate: "中高",
    jobs: "法务助理、合规、内控、风控、数据合规",
    majors: ["lawpolicy", "socialscience", "finance", "accounting", "management", "data", "cs"]
  },
  academic: {
    name: "科研/学术/博士发展",
    weights: { analytical: 5, communication: 3, execution: 4, creativity: 5, stability: 4, business: 1 },
    traits: { decision: "rational", social: "introvert", risk: "neutral", structure: "free" },
    gate: "高",
    jobs: "研究助理、博士申请、科研项目、实验室/课题组、智库研究",
    majors: ["science", "data", "cs", "engineering", "lawpolicy", "socialscience", "media", "education", "humanities"]
  },
  crossborder: {
    name: "跨境电商/海外市场/国际商务",
    weights: { analytical: 3, communication: 5, execution: 4, creativity: 4, stability: 2, business: 5 },
    traits: { decision: "neutral", social: "extrovert", risk: "adventurous", structure: "free" },
    gate: "中",
    jobs: "海外市场、跨境运营、国际商务、渠道拓展、品牌出海",
    majors: ["management", "marketing", "media", "socialscience", "finance", "data", "cs", "humanities"]
  },
  undecided: {
    name: "暂不确定",
    weights: { analytical: 3, communication: 3, execution: 3, creativity: 3, stability: 3, business: 3 },
    traits: { decision: "neutral", social: "neutral", risk: "neutral", structure: "neutral" },
    gate: "中",
    jobs: "方向探索、岗位认知、通用实习、校园项目",
    majors: ["management", "marketing", "finance", "accounting", "data", "cs", "engineering", "supplychain", "lawpolicy", "socialscience", "media", "humanities", "arts", "science", "education", "other"]
  }
};

let currentStep = 0;

function renderQuestions(targetId, questions, kind) {
  const root = document.getElementById(targetId);
  root.innerHTML = questions
    .map((q, idx) => {
      const optionOrder = getQuestionOptionOrder(q);
      return `
        <article class="question-card">
          <div class="q-meta"><span>${kind === "capability" ? dimensions[q.dimension] : traitDimensionName(q.dimension)}</span><span>第 ${idx + 1} / ${questions.length} 题</span></div>
          <div class="q-title">${q.title}：${q.scene}</div>
          <div class="option-grid">
            ${optionOrder.map((optionIndex, displayIndex) => {
              const option = q.options[optionIndex];
              return `
                <label class="option-item">
                  <input type="radio" name="${q.id}" value="${optionIndex}" />
                  ${String.fromCharCode(65 + displayIndex)}. ${option[0]}
                </label>
              `;
            }).join("")}
          </div>
        </article>
      `;
    })
    .join("");
}

function getQuestionOptionOrder(question) {
  if (!questionOptionOrders.has(question.id)) {
    const order = question.options.map((_, index) => index);
    for (let i = order.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    questionOptionOrders.set(question.id, order);
  }
  return questionOptionOrders.get(question.id);
}

function traitDimensionName(key) {
  return {
    decision: "决策风格",
    social: "社交能量",
    risk: "风险偏好",
    structure: "工作方式偏好"
  }[key];
}

function initTabs() {
  document.getElementById("stepTabs").innerHTML = steps
    .map((step, idx) => `<button class="step-tab" data-step="${idx}" type="button">${idx + 1}. ${step.name}</button>`)
    .join("");
  document.querySelectorAll(".step-tab").forEach((tab) => {
    tab.addEventListener("click", async () => {
      currentStep = Number(tab.dataset.step);
      if (currentStep === 2) refreshCapabilityQuestions();
      updateStep();
    });
  });
  const tabs = document.getElementById("stepTabs");
  tabs?.addEventListener("scroll", updateStepTabsScrollThumb, { passive: true });
  window.addEventListener("resize", updateStepTabsScrollThumb);
  updateStepTabsScrollThumb();
}

function updateStepTabsScrollThumb() {
  const tabs = document.getElementById("stepTabs");
  const thumb = document.getElementById("stepTabsScrollThumb");
  if (!tabs || !thumb) return;
  const maxScroll = Math.max(tabs.scrollWidth - tabs.clientWidth, 0);
  const trackWidth = tabs.clientWidth;
  if (trackWidth <= 0) return;
  const thumbWidth = Math.max(trackWidth * 0.32, 36);
  thumb.style.width = `${thumbWidth}px`;
  if (maxScroll <= 0) {
    thumb.style.transform = "translateX(0)";
    return;
  }
  const travel = Math.max(trackWidth - thumbWidth, 0);
  const ratio = tabs.scrollLeft / maxScroll;
  thumb.style.transform = `translateX(${travel * ratio}px)`;
}

function updateStep() {
  steps.forEach((step, idx) => {
    document.getElementById(`panel-${step.id}`).classList.toggle("active", idx === currentStep);
  });
  if (currentStep === 1) {
    ensureSchoolDirectoryLoaded();
  }
  if (currentStep >= 1) {
    runWhenIdle(() => ensureRankingDataLoaded(), 1800);
  }
  document.querySelectorAll(".step-tab").forEach((tab, idx) => {
    tab.classList.toggle("active", idx === currentStep);
  });
  document.getElementById("progressBar").style.width = `${((currentStep + 1) / steps.length) * 100}%`;
  document.getElementById("stepBadge").textContent = `${currentStep + 1} / ${steps.length}`;
  updateStepTabsScrollThumb();
  document.getElementById("prevBtn").disabled = currentStep === 0;
  document.getElementById("nextBtn").textContent = currentStep === steps.length - 1 ? "生成报告" : "下一步";
  document.getElementById("exportBtn").classList.toggle("visible", currentStep === steps.length - 1);
  window.scrollTo({ top: 0, behavior: "smooth" });
  updateQuickScrollState();
}

function getFormData() {
  const profileForm = document.getElementById("profileForm");
  const registrantForm = document.getElementById("registrantForm");
  const data = {
    ...Object.fromEntries(new FormData(profileForm).entries()),
    ...Object.fromEntries(new FormData(registrantForm).entries())
  };
  data.interests = Array.from(profileForm.querySelectorAll('input[name="interest"]:checked')).map((item) => item.value);
  if (!data.interests.length) data.interests = ["undecided"];
  if (data.interests.includes("undecided") && data.interests.length > 1) data.interests = data.interests.filter((item) => item !== "undecided");
  if (!data.primaryInterest || !data.interests.includes(data.primaryInterest)) data.primaryInterest = data.interests[0];
  data.projects = Array.from(profileForm.querySelectorAll('input[name="projects"]:checked')).map((item) => item.value);
  if (data.projects.includes("none") && data.projects.length > 1) data.projects = data.projects.filter((item) => item !== "none");
  return data;
}

function validateRequiredRegistrantFields() {
  const requiredFields = [
    { name: "studentName", label: "姓名 / 称呼", formId: "registrantForm", step: 4 },
    { name: "role", label: "身份", formId: "profileForm", step: 1 }
  ];
  for (const field of requiredFields) {
    const form = document.getElementById(field.formId);
    const input = form.querySelector(`[name="${field.name}"]`);
    const value = String(input?.value || "").trim();
    if (!value) {
      currentStep = field.step;
      updateStep();
      requestAnimationFrame(() => {
        input?.focus();
        input?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      window.alert(`请先填写${field.label}，再生成报告。`);
      return false;
    }
  }
  return true;
}

function mergeSchoolDirectories(primary, external) {
  const merged = new Map();
  [...external, ...primary].forEach((school) => {
    const name = (school.name || "").trim();
    if (!name) return;
    const key = name.toLowerCase();
    const existing = merged.get(key) || { name, aliases: [], country: school.country, region: school.region };
    const aliases = [...(existing.aliases || []), ...(school.aliases || [])]
      .map((alias) => String(alias).trim())
      .filter(Boolean);
    merged.set(key, {
      ...existing,
      ...school,
      name,
      aliases: Array.from(new Set(aliases))
    });
  });
  return Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function loadScriptOnce(src) {
  if (document.querySelector(`script[src="${src}"]`)) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

function waitForNextPaint() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
}

function runWhenIdle(callback, timeout = 1200) {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(callback, { timeout });
    return;
  }
  window.setTimeout(callback, 0);
}

function renderSchoolOptions() {
  const dataList = document.getElementById("schoolOptions");
  if (!dataList) return;
  dataList.innerHTML = allSchoolDirectory
    .map((school) => `<option value="${school.name}">${[school.region || school.country, ...(school.aliases || []).slice(0, 2)].filter(Boolean).join(" / ")}</option>`)
    .join("");
}

function schoolMatchLabel(school) {
  return [school.region || school.country, ...(school.aliases || []).slice(0, 2)].filter(Boolean).join(" / ");
}

function searchSchools(query, limit = 8) {
  const raw = String(query || "").trim().toLowerCase();
  if (!raw) return [];
  return allSchoolDirectory
    .map((school) => {
      const haystacks = [school.name, ...(school.aliases || [])].map((item) => String(item).toLowerCase());
      let score = -1;
      haystacks.forEach((item) => {
        if (item === raw) score = Math.max(score, 100);
        else if (item.startsWith(raw)) score = Math.max(score, 80);
        else if (item.includes(raw)) score = Math.max(score, 60);
        else if (raw.includes(item)) score = Math.max(score, 40);
      });
      return score > -1 ? { school, score } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.school.name.localeCompare(b.school.name))
    .slice(0, limit)
    .map((item) => item.school);
}

async function ensureSchoolDirectoryLoaded() {
  if (typeof window !== "undefined" && Array.isArray(window.externalSchoolDirectory) && window.externalSchoolDirectory.length) {
    allSchoolDirectory = mergeSchoolDirectories(schoolDirectory, window.externalSchoolDirectory);
    return allSchoolDirectory;
  }
  if (!schoolDirectoryLoadPromise) {
    schoolDirectoryLoadPromise = loadScriptOnce("./schools-data.js")
      .then(() => {
        allSchoolDirectory = mergeSchoolDirectories(schoolDirectory, window.externalSchoolDirectory || []);
        renderSchoolOptions();
        return allSchoolDirectory;
      })
      .catch((error) => {
        console.warn("School directory load failed:", error);
        return allSchoolDirectory;
      });
  }
  return schoolDirectoryLoadPromise;
}

async function ensureRankingDataLoaded() {
  if (typeof window !== "undefined" && window.schoolRankingData?.schools?.length) return window.schoolRankingData;
  if (!schoolRankingLoadPromise) {
    schoolRankingLoadPromise = loadScriptOnce("./school-ranking-data.js")
      .then(() => window.schoolRankingData)
      .catch((error) => {
        console.warn("Ranking data load failed:", error);
        return null;
      });
  }
  return schoolRankingLoadPromise;
}

async function ensureReportDataLoaded(options = {}) {
  const { waitForRanking = false } = options;
  const schoolPromise = ensureSchoolDirectoryLoaded();
  const rankingPromise = ensureRankingDataLoaded();
  if (waitForRanking) {
    await Promise.all([schoolPromise, rankingPromise]);
    return;
  }
  await Promise.race([
    schoolPromise.catch(() => null),
    new Promise((resolve) => window.setTimeout(resolve, 250))
  ]);
}

function setupSchoolAutocomplete() {
  renderSchoolOptions();
  document.querySelectorAll('input[name="undergradSchool"], input[name="gradSchool"], input[name="phdSchool"]').forEach((input) => {
    const preload = () => ensureSchoolDirectoryLoaded();
    input.addEventListener("focus", preload, { once: true });

    const panel = document.createElement("div");
    panel.className = "school-suggestion-panel";
    panel.setAttribute("role", "listbox");
    input.parentElement?.appendChild(panel);

    const hidePanel = () => {
      panel.classList.remove("visible");
      panel.innerHTML = "";
      schoolAutocompleteActiveIndex = -1;
    };

    const chooseSchool = (schoolName) => {
      input.value = schoolName;
      hidePanel();
      input.dispatchEvent(new Event("change", { bubbles: true }));
    };

    const renderPanel = async () => {
      await ensureSchoolDirectoryLoaded();
      const matches = searchSchools(input.value);
      if (!matches.length) {
        hidePanel();
        return;
      }
      schoolAutocompleteActiveIndex = -1;
      panel.innerHTML = matches.map((school, index) => `
        <button type="button" class="school-suggestion-item" data-index="${index}" data-name="${school.name}">
          <strong>${school.name}</strong>
          <span>${schoolMatchLabel(school)}</span>
        </button>
      `).join("");
      panel.classList.add("visible");
      panel.querySelectorAll(".school-suggestion-item").forEach((button) => {
        button.addEventListener("mousedown", (event) => {
          event.preventDefault();
          chooseSchool(button.dataset.name || "");
        });
      });
    };

    input.addEventListener("input", renderPanel);
    input.addEventListener("focus", renderPanel);
    input.addEventListener("blur", () => {
      window.setTimeout(() => {
        input.value = normalizeSchoolName(input.value);
        hidePanel();
      }, 120);
    });
    input.addEventListener("keydown", async (event) => {
      if (!panel.classList.contains("visible") && ["ArrowDown", "Enter"].includes(event.key)) {
        await renderPanel();
      }
      const items = Array.from(panel.querySelectorAll(".school-suggestion-item"));
      if (!items.length) return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        schoolAutocompleteActiveIndex = (schoolAutocompleteActiveIndex + 1) % items.length;
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        schoolAutocompleteActiveIndex = (schoolAutocompleteActiveIndex - 1 + items.length) % items.length;
      } else if (event.key === "Enter" && schoolAutocompleteActiveIndex >= 0) {
        event.preventDefault();
        chooseSchool(items[schoolAutocompleteActiveIndex].dataset.name || "");
        return;
      } else if (event.key === "Escape") {
        hidePanel();
        return;
      } else {
        return;
      }
      items.forEach((item, index) => item.classList.toggle("active", index === schoolAutocompleteActiveIndex));
    });
  });
}

function setupPrimaryInterestSelector() {
  const select = document.getElementById("primaryInterestSelect");
  const checkboxes = Array.from(document.querySelectorAll('input[name="interest"]'));
  if (!select || !checkboxes.length) return;
  checkboxes.forEach((checkbox) => checkbox.addEventListener("change", syncPrimaryInterestOptions));
  syncPrimaryInterestOptions();
}

function syncPrimaryInterestOptions() {
  const select = document.getElementById("primaryInterestSelect");
  const checkboxes = Array.from(document.querySelectorAll('input[name="interest"]'));
  if (!select || !checkboxes.length) return;
  const selected = checkboxes.filter((item) => item.checked).map((item) => item.value);
  const values = selected.length ? selected.filter((item) => item !== "undecided") : ["undecided"];
  if (!values.length) values.push("undecided");
  const current = values.includes(select.value) ? select.value : values[0];
  select.innerHTML = values.map((value) => `<option value="${value}">${jobProfiles[value].name}</option>`).join("");
  select.value = current;
}

function setupSelectableStates() {
  const enforceExclusiveOption = (input) => {
    if (!input.checked || !["interest", "projects"].includes(input.name)) return;
    const exclusiveValue = input.name === "interest" ? "undecided" : "none";
    const group = Array.from(document.querySelectorAll(`input[name="${input.name}"]`));
    if (input.value === exclusiveValue) {
      group.forEach((node) => {
        if (node !== input) node.checked = false;
      });
      return;
    }
    const exclusive = group.find((node) => node.value === exclusiveValue);
    if (exclusive) exclusive.checked = false;
  };

  const refresh = (input) => {
    const optionItem = input.closest(".option-item");
    if (optionItem) {
      const group = document.querySelectorAll(`input[name="${input.name}"]`);
      group.forEach((node) => node.closest(".option-item")?.classList.toggle("is-checked", node.checked));
    }
    const interestLabel = input.closest(".interest-field label");
    if (interestLabel) {
      interestLabel.classList.toggle("is-checked", input.checked);
    }
  };

  document.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    enforceExclusiveOption(target);
    refresh(target);
    if (["interest", "projects"].includes(target.name)) {
      document.querySelectorAll(`input[name="${target.name}"]`).forEach((input) => refresh(input));
    }
    if (target.name === "interest") syncPrimaryInterestOptions();
  });

  document.querySelectorAll('.option-item input, .interest-field input').forEach((input) => {
    refresh(input);
  });
}

const majorTypeRules = [
  ["accounting", ["accounting", "audit", "tax", "taxation", "assurance", "会计", "审计", "税务", "财务管理"]],
  ["finance", ["finance", "financial", "fintech", "economics", "economy", "banking", "investment", "asset", "保险", "金融", "经济", "财政", "投资", "银行", "保险"]],
  ["data", ["data science", "statistics", "statistical", "math", "mathematics", "analytics", "business analytics", "operations research", "quant", "biostatistics", "数据", "统计", "数学", "商业分析", "精算", "量化"]],
  ["cs", ["computer", "computing", "software", "ai", "artificial intelligence", "machine learning", "information system", "mis", "cs", "计算机", "软件", "人工智能", "信息系统", "算法", "网络安全"]],
  ["supplychain", ["supply chain", "logistics", "operations", "operation management", "industrial engineering", "procurement", "供应链", "物流", "运营管理", "采购", "工业工程"]],
  ["engineering", ["engineering", "mechanical", "electrical", "electronic", "automation", "manufacturing", "civil", "material", "建筑", "工程", "制造", "机械", "电子", "自动化", "土木", "材料"]],
  ["lawpolicy", ["law", "legal", "public policy", "public administration", "public management", "法学", "法律", "公共政策", "公共管理", "行政管理"]],
  ["socialscience", ["politics", "political", "international relations", "sociology", "social policy", "governance", "anthropology", "political science", "国际关系", "政治学", "社会学", "社会政策", "人类学"]],
  ["media", ["media", "communication", "journalism", "advertising", "language", "linguistics", "translation", "传播", "传媒", "新闻", "广告", "语言", "翻译", "口译"]],
  ["humanities", ["literature", "history", "philosophy", "culture", "classics", "文学", "历史", "哲学", "文化", "人文"]],
  ["arts", ["design", "art", "arts", "creative", "film", "visual", "fashion", "interaction", "architecture design", "设计", "艺术", "创意", "影视", "视觉", "服装", "交互"]],
  ["science", ["biology", "biological", "chemistry", "chemical", "physics", "biomedical", "medicine", "medical", "pharmacy", "pharmaceutical", "public health", "environmental science", "nursing", "生物", "化学", "物理", "医学", "药学", "公共卫生", "自然科学", "环境科学", "护理"]],
  ["education", ["education", "teaching", "psychology", "counselling", "learning", "教育", "心理", "心理学", "教学", "辅导"]],
  ["marketing", ["marketing", "brand", "consumer", "digital marketing", "commerce", "market research", "市场营销", "品牌", "消费者", "电商", "市场研究"]],
  ["management", ["business", "management", "mba", "human resource", "hr", "entrepreneurship", "strategy", "工商管理", "管理", "人力资源", "创业", "战略", "组织行为"]]
];

const majorTypeOptionsByDegree = {
  undergrad: ["management", "marketing", "finance", "accounting", "data", "cs", "engineering", "supplychain", "lawpolicy", "socialscience", "media", "humanities", "arts", "science", "education", "other"],
  grad: ["none", "management", "marketing", "finance", "accounting", "data", "cs", "engineering", "supplychain", "lawpolicy", "socialscience", "media", "humanities", "arts", "science", "education", "other"],
  phd: ["none", "management", "marketing", "finance", "accounting", "data", "cs", "engineering", "supplychain", "lawpolicy", "socialscience", "media", "humanities", "arts", "science", "education", "other"]
};

function populateMajorTypeSelects() {
  const config = [
    ["undergradMajorType", "undergrad"],
    ["gradMajorType", "grad"],
    ["phdMajorType", "phd"]
  ];
  config.forEach(([name, group]) => {
    const select = document.querySelector(`[name="${name}"]`);
    if (!select) return;
    select.innerHTML = majorTypeOptionsByDegree[group]
      .map((value) => `<option value="${value}">${majorTypeDefinitions[value]}</option>`)
      .join("");
  });
}

function inferMajorTypeFromName(name, emptyValue = "other") {
  const raw = String(name || "").trim().toLowerCase();
  if (!raw || ["无", "none", "n/a", "na"].includes(raw)) return emptyValue;
  for (const [type, keywords] of majorTypeRules) {
    if (keywords.some((keyword) => raw.includes(String(keyword).toLowerCase()))) return type;
  }
  return "other";
}

function setupMajorTypeAutofill() {
  populateMajorTypeSelects();
  [
    ["undergradMajor", "undergradMajorType", "other"],
    ["gradMajor", "gradMajorType", "none"],
    ["phdMajor", "phdMajorType", "none"]
  ].forEach(([majorName, typeName, emptyValue]) => {
    const majorInput = document.querySelector(`[name="${majorName}"]`);
    const typeSelect = document.querySelector(`[name="${typeName}"]`);
    if (!majorInput || !typeSelect) return;
    const syncType = () => {
      const inferred = inferMajorTypeFromName(majorInput.value, emptyValue);
      typeSelect.value = inferred;
    };
    majorInput.addEventListener("blur", syncType);
    majorInput.addEventListener("change", syncType);
    syncType();
  });
}

function normalizeSchoolName(value) {
  const raw = value.trim();
  if (!raw || ["无", "none", "n/a", "na"].includes(raw.toLowerCase())) return raw;
  const query = raw.toLowerCase();
  const exact = allSchoolDirectory.find((school) =>
    school.name.toLowerCase() === query || school.aliases.some((alias) => alias.toLowerCase() === query)
  );
  if (exact) return exact.name;
  const matches = allSchoolDirectory.filter((school) =>
    school.name.toLowerCase().includes(query) || school.aliases.some((alias) => alias.toLowerCase().includes(query) || query.includes(alias.toLowerCase()))
  );
  return matches.length === 1 ? matches[0].name : raw;
}

function getDirectionQuestionTarget(interestCount) {
  return Math.min(6 + Math.max(interestCount - 1, 0) * 3, 15);
}

function pickCommonCapabilityQuestions(commonQuestions, limit = 16) {
  const grouped = Object.fromEntries(Object.keys(dimensions).map((dimension) => [dimension, commonQuestions.filter((q) => q.dimension === dimension)]));
  const selected = [];
  Object.keys(dimensions).forEach((dimension) => {
    grouped[dimension].slice(0, 2).forEach((question) => {
      if (!selected.includes(question)) selected.push(question);
    });
  });
  let cursor = 2;
  while (selected.length < limit) {
    let added = false;
    Object.keys(dimensions).forEach((dimension) => {
      const question = grouped[dimension][cursor];
      if (question && !selected.includes(question) && selected.length < limit) {
        selected.push(question);
        added = true;
      }
    });
    if (!added) break;
    cursor += 1;
  }
  return selected.slice(0, limit);
}

function buildDirectionAllocation(interests, target) {
  if (!interests.length) return [];
  const desired = interests.map((_, index) => {
    if (index === 0) return 5;
    if (index === 1) return 4;
    if (index <= 3) return 3;
    return 2;
  });
  const counts = [];
  let used = 0;
  interests.forEach((_, index) => {
    const remainingSlots = interests.length - index - 1;
    const maxForThis = Math.max(target - used - remainingSlots, 1);
    const count = Math.min(desired[index], maxForThis);
    counts.push(count);
    used += count;
  });
  return counts;
}

function pickDirectionSpecificQuestions(profile, directionQuestions, limit) {
  const orderedInterests = [
    profile.primaryInterest,
    ...profile.interests.filter((interest) => interest !== profile.primaryInterest)
  ];
  const allocation = buildDirectionAllocation(orderedInterests, limit);
  const selected = [];

  orderedInterests.forEach((interest, index) => {
    const pool = directionQuestions.filter((question) => question.tags.includes(interest) && !selected.includes(question));
    pool.slice(0, allocation[index]).forEach((question) => {
      if (!selected.includes(question) && selected.length < limit) selected.push(question);
    });
  });

  if (selected.length < limit) {
    orderedInterests.forEach((interest) => {
      directionQuestions
        .filter((question) => question.tags.includes(interest) && !selected.includes(question))
        .forEach((question) => {
          if (selected.length < limit && !selected.includes(question)) selected.push(question);
        });
    });
  }

  return selected.slice(0, limit);
}

function refreshCapabilityQuestions() {
  const profile = getFormData();
  const common = capabilityQuestions.filter((q) => q.tags.includes("all"));
  const selectedInterests = profile.interests.filter((interest) => interest !== "undecided");
  const directionSpecific = capabilityQuestions.filter((q) => !q.tags.includes("all") && q.tags.some((tag) => selectedInterests.includes(tag)));
  const commonSelected = pickCommonCapabilityQuestions(common, 16);
  const directionTarget = selectedInterests.length ? getDirectionQuestionTarget(selectedInterests.length) : 0;
  const directionSelected = selectedInterests.length ? pickDirectionSpecificQuestions({ ...profile, interests: selectedInterests, primaryInterest: selectedInterests.includes(profile.primaryInterest) ? profile.primaryInterest : selectedInterests[0] }, directionSpecific, directionTarget) : [];
  activeCapabilityQuestions = [...commonSelected, ...directionSelected];
  document.getElementById("capabilityHint").innerHTML = selectedInterests.length
    ? `<h3>本轮测评将结合你的目标方向出题</h3><p>你当前选择的方向为：${selectedInterests.map((key) => jobProfiles[key].name).join("、")}，优先方向为${jobProfiles[profile.primaryInterest].name}。本轮题目会同时考察通用能力和目标方向相关场景；如果你选择了多个方向，专项题数量会相应增加，最多不超过 15 题，从而让结果更贴近你的实际求职选择。</p>`
    : `<h3>本轮测评将先看通用能力</h3><p>你当前选择了“暂不确定”。本轮题目会优先考察分析、沟通、执行、创造力、稳定性和商业敏感度，报告会先帮助你判断更适合探索哪些方向。</p>`;
  renderQuestions("capabilityQuestions", activeCapabilityQuestions, "capability");
}

function selectedValue(questionId) {
  const selected = document.querySelector(`input[name="${questionId}"]:checked`);
  return selected ? Number(selected.value) : null;
}

function scoreCapabilities() {
  const raw = Object.fromEntries(Object.keys(dimensions).map((key) => [key, 0]));
  const counts = Object.fromEntries(Object.keys(dimensions).map((key) => [key, 0]));
  activeCapabilityQuestions.forEach((q) => {
    const value = selectedValue(q.id);
    const score = value === null ? 2 : q.options[value][1];
    raw[q.dimension] += score;
    counts[q.dimension] += 1;
  });
  return Object.fromEntries(Object.keys(raw).map((key) => [key, Math.round((raw[key] / (counts[key] * 3)) * 100)]));
}

function scorePersonality() {
  const setup = {
    decision: ["rational", "emotional", "理性", "感性"],
    social: ["extrovert", "introvert", "外向", "内向"],
    risk: ["adventurous", "conservative", "冒险", "保守"],
    structure: ["rule", "free", "规则导向", "自由导向"]
  };
  const results = {};
  Object.keys(setup).forEach((key) => {
    const [left, right, leftCn, rightCn] = setup[key];
    let leftScore = 0;
    let rightScore = 0;
    personalityQuestions.filter((q) => q.dimension === key).forEach((q) => {
      const value = selectedValue(q.id);
      const trait = value === null ? "neutral" : q.options[value][1];
      if (trait === left) leftScore += 1;
      if (trait === right) rightScore += 1;
      if (trait === "neutral") {
        leftScore += 0.5;
        rightScore += 0.5;
      }
    });
    const leftRatio = leftScore / 5;
    let label = "平衡型";
    let dominant = "neutral";
    if (leftRatio >= 0.75) {
      label = `高${leftCn}`;
      dominant = left;
    } else if (leftRatio >= 0.6) {
      label = `偏${leftCn}`;
      dominant = left;
    } else if (leftRatio <= 0.25) {
      label = `高${rightCn}`;
      dominant = right;
    } else if (leftRatio <= 0.4) {
      label = `偏${rightCn}`;
      dominant = right;
    }
    results[key] = { label, dominant, leftRatio };
  });
  return results;
}

function scoreBackground(profile) {
  const schoolResult = inferSchoolScore([
    normalizeSchoolName(profile.phdSchool || ""),
    normalizeSchoolName(profile.gradSchool || ""),
    normalizeSchoolName(profile.undergradSchool || "")
  ]);
  const school = schoolResult.score;
  const gpas = [profile.undergradGpa, profile.gradGpa, profile.phdGpa].map(Number).filter(Boolean);
  const gpa = gpas.length ? Math.max(...gpas) : 65;
  const internship = Number(profile.internship || 50);
  const effectiveProjects = (profile.projects || []).filter((project) => project !== "none");
  const projectBoost = Math.min(effectiveProjects.length * 3, 12);
  const score = Math.min(100, Math.round(school * 0.42 + gpa * 0.23 + internship * 0.28 + projectBoost));
  const level = score >= 85 ? "T1" : score >= 70 ? "T2" : score >= 55 ? "T3" : score >= 40 ? "T4" : "T5";
  return {
    score,
    level,
    schoolScore: school,
    schoolTier: schoolResult.tier,
    schoolTierLabel: schoolResult.label,
    rankingScore: schoolResult.rankingScore,
    rankingConfidence: schoolResult.rankingConfidence,
    rankingRefs: schoolResult.rankingRefs,
    projectBoost
  };
}

function inferSchoolScore(schools) {
  const results = schools.filter(Boolean).map(scoreSingleSchool).filter(Boolean);
  if (results.length) return results.sort((a, b) => b.score - a.score)[0];
  const text = schools.filter(Boolean).join(" ").toLowerCase();
  if (!text.trim()) return { score: 65, tier: "T4", label: "未填写学校" };
  const tier1 = [
    "harvard", "stanford", "mit", "massachusetts institute", "oxford", "cambridge",
    "princeton", "yale", "columbia", "upenn", "pennsylvania", "chicago", "berkeley",
    "caltech", "california institute", "brown", "dartmouth", "cornell", "duke",
    "northwestern", "johns hopkins", "carnegie mellon", "cmu", "imperial", "lse", "ucl", "清华", "北大", "北京大学", "清华大学",
    "复旦", "上海交通", "交大", "浙江大学", "港大", "香港大学", "港科", "香港科技",
    "港中文", "新加坡国立", "nus", "南洋理工", "ntu"
  ];
  const tier2 = [
    "michigan", "ann arbor", "nyu", "new york university", "ucla", "southern california",
    "usc", "virginia", "chapel hill", "ucsd", "washington", "uiuc", "urbana-champaign",
    "texas at austin", "ut austin", "georgia tech", "wisconsin-madison", "emory",
    "rice", "vanderbilt", "washington university in st. louis", "wustl", "georgetown",
    "notre dame", "tufts", "rochester", "case western", "edinburgh", "manchester", "warwick", "kcl", "king's",
    "bristol", "melbourne", "sydney", "unsw", "多伦多", "toronto", "ubc",
    "麦吉尔", "mcgill", "人大", "中国人民大学", "南京大学", "中科大", "中国科学技术",
    "同济", "北航", "南开", "厦门大学", "武汉大学", "中山大学", "985"
  ];
  const tier3 = [
    "211", "qs100", "qs 100", "qs前100", "qs200", "qs 200", "qs前200",
    "一本", "双一流", "uc davis", "uc irvine", "uc santa barbara", "boston university",
    "boston college", "northeastern", "purdue", "penn state", "ohio state",
    "minnesota", "indiana university", "michigan state", "maryland", "texas a&m",
    "arizona state", "florida", "rutgers", "syracuse", "fordham", "baruch",
    "uconn", "george washington", "american university", "brandeis",
    "queen mary", "glasgow", "leeds", "birmingham",
    "southampton", "sheffield", "nottingham", "monash", "queensland"
  ];
  if (tier1.some((item) => text.includes(item))) return { score: 90, tier: "T2", label: "关键词识别强目标校" };
  if (tier2.some((item) => text.includes(item))) return { score: 80, tier: "T3", label: "关键词识别目标校" };
  if (tier3.some((item) => text.includes(item))) return { score: 65, tier: "T4", label: "关键词识别强认可院校" };
  if (text.includes("普通") || text.includes("双非") || text.includes("college")) return { score: 50, tier: "T5", label: "普通院校/区域院校" };
  return { score: 62, tier: "T4", label: "未进入层级库，按中性分处理" };
}

function scoreSingleSchool(rawName) {
  const name = normalizeSchoolName(rawName);
  if (!name || ["无", "none", "n/a", "na"].includes(name.toLowerCase())) return null;
  const rankingResult = scoreSchoolByRanking(name);
  if (rankingResult) return rankingResult;
  const tierData = typeof window !== "undefined" ? window.schoolTierData : null;
  const canonical = tierData?.aliases?.[name] || name;
  if (tierData?.tiers) {
    for (const tier of tierData.tiers) {
      if (tier.schools.includes(canonical) || tier.schools.includes(name)) {
        return { score: tier.score, tier: tier.tier, label: tier.label, matchedSchool: canonical };
      }
    }
  }
  const school = allSchoolDirectory.find((item) => item.name === canonical || item.name === name || (item.aliases || []).includes(name));
  if (school?.region === "中国") {
    if ((school.level || "").includes("成人")) return { score: 38, tier: "T6", label: "成人高等学校", matchedSchool: school.name };
    if ((school.level || "").includes("专科")) return { score: 45, tier: "T6", label: "高职/专科院校", matchedSchool: school.name };
    if ((school.level || "").includes("本科")) return { score: 58, tier: "T5", label: "普通本科院校", matchedSchool: school.name };
    return { score: 55, tier: "T5", label: "中国大陆院校", matchedSchool: school.name };
  }
  if (school) return { score: 62, tier: "T4", label: `${school.region || school.country}院校，未进入层级库`, matchedSchool: school.name };
  return null;
}

function scoreSchoolByRanking(rawName) {
  const rankingData = typeof window !== "undefined" ? window.schoolRankingData : null;
  if (!rankingData?.schools) return null;
  const canonical = rankingData.aliases?.[rawName] || rawName;
  const school = rankingData.schools.find((item) => item.name === canonical || item.name === rawName);
  if (!school) return null;
  const rankingParts = [
    ["qs", 0.3],
    ["the", 0.25],
    ["usnews", 0.25],
    ["arwu", 0.2]
  ].filter(([key]) => Number(school[key]));
  if (!rankingParts.length) return null;
  const weightSum = rankingParts.reduce((sum, [, weight]) => sum + weight, 0);
  const rankingScore = Math.round(
    rankingParts.reduce((sum, [key, weight]) => sum + rankToScore(Number(school[key])) * weight, 0) / weightSum
  );
  const confidence = rankingParts.length >= 3 ? "高" : rankingParts.length === 2 ? "中" : "低";
  const employer = Number(school.employer || rankingScore);
  const labelBoost = school.labels?.some((label) => ["C9", "985", "211", "双一流", "G5", "Ivy", "港前三"].includes(label)) ? 3 : 0;
  const finalScore = Math.min(100, Math.round(rankingScore * 0.45 + employer * 0.35 + tierLabelScore(school.labels || []) * 0.2 + labelBoost));
  return {
    score: finalScore,
    tier: scoreToTier(finalScore),
    label: `四榜综合评估，置信度${confidence}`,
    matchedSchool: school.name,
    rankingScore,
    rankingConfidence: confidence,
    rankingRefs: {
      qs: school.qs,
      the: school.the,
      usnews: school.usnews,
      arwu: school.arwu
    }
  };
}

function rankToScore(rank) {
  if (rank <= 20) return 98;
  if (rank <= 50) return 92;
  if (rank <= 100) return 85;
  if (rank <= 200) return 76;
  if (rank <= 300) return 68;
  if (rank <= 500) return 60;
  if (rank <= 800) return 52;
  if (rank <= 1000) return 45;
  return 40;
}

function tierLabelScore(labels) {
  if (labels.some((label) => ["C9", "全球顶尖"].includes(label))) return 98;
  if (labels.some((label) => ["985", "G5", "Ivy", "港前三", "新加坡顶尖"].includes(label))) return 92;
  if (labels.some((label) => ["211", "双一流", "澳洲八大", "加拿大强校", "公立强校"].includes(label))) return 82;
  return 65;
}

function scoreToTier(score) {
  if (score >= 95) return "T1";
  if (score >= 88) return "T2";
  if (score >= 78) return "T3";
  if (score >= 68) return "T4";
  if (score >= 50) return "T5";
  return "T6";
}

function majorFit(profile, job) {
  const phdType = profile.phdMajorType && profile.phdMajorType !== "none" ? profile.phdMajorType : null;
  const gradType = profile.gradMajorType && profile.gradMajorType !== "none" ? profile.gradMajorType : null;
  const undergradType = profile.undergradMajorType || "other";
  const typeScore = (type, scores, mismatchScore) => {
    if (!type || type === "none") return null;
    const majorIndex = job.majors.indexOf(type);
    if (majorIndex >= 0) {
      if (majorIndex <= 1) return scores.strong;
      if (majorIndex <= 4) return scores.related;
      return scores.adjacent;
    }
    if (type === "other") return 60;
    return mismatchScore;
  };
  const phdScore = typeScore(phdType, { strong: 98, related: 84, adjacent: 72 }, 45);
  const gradScore = typeScore(gradType, { strong: 94, related: 80, adjacent: 68 }, 48);
  const undergradScore = typeScore(undergradType, { strong: 86, related: 74, adjacent: 62 }, 50) || 60;
  if (phdScore && gradScore) return Math.round(phdScore * 0.5 + gradScore * 0.3 + undergradScore * 0.2);
  if (phdScore) return Math.round(phdScore * 0.7 + undergradScore * 0.3);
  return gradScore ? Math.round(gradScore * 0.65 + undergradScore * 0.35) : undergradScore;
}

function coreAbilityGaps(job, capabilities, threshold = 62) {
  return Object.entries(job.weights)
    .filter(([key, weight]) => weight >= 4 && capabilities[key] < threshold)
    .map(([key]) => key);
}

function scoreJob(job, capabilities, personality, background, profile) {
  const weightSum = Object.values(job.weights).reduce((sum, val) => sum + val, 0);
  const capabilityScore = Object.entries(job.weights).reduce((sum, [key, weight]) => sum + capabilities[key] * weight, 0) / weightSum;
  const majorScore = majorFit(profile, job);
  const coreGapKeys = coreAbilityGaps(job, capabilities);
  const corePenalty = Math.min(coreGapKeys.length * 5, 15);
  const majorPenalty = majorScore < 55 ? 7 : majorScore < 65 ? 4 : 0;
  const traitScores = Object.entries(job.traits).map(([key, expected]) => {
    const actual = personality[key].dominant;
    if (expected === "neutral" || actual === "neutral") return 70;
    if (actual === expected) return 95;
    return 42;
  });
  const personalityScore = traitScores.reduce((sum, val) => sum + val, 0) / traitScores.length;
  const highGate = job.gate === "高";
  const baseMatch = capabilityScore * (highGate ? 0.36 : 0.45) + personalityScore * (highGate ? 0.18 : 0.22) + background.score * (highGate ? 0.34 : 0.23) + majorScore * 0.12;
  const match = Math.max(35, Math.min(98, Math.round(baseMatch - corePenalty - majorPenalty)));
  return { capabilityScore: Math.round(capabilityScore), personalityScore: Math.round(personalityScore), backgroundScore: background.score, majorScore, match, corePenalty, coreGapKeys };
}

function difficulty(job, backgroundLevel) {
  const table = {
    T1: { "高": "中", "中高": "低", "中": "低" },
    T2: { "高": "中高", "中高": "中", "中": "低" },
    T3: { "高": "高", "中高": "中高", "中": "中" },
    T4: { "高": "极高", "中高": "高", "中": "中高" },
    T5: { "高": "极高", "中高": "极高", "中": "高" }
  };
  return table[backgroundLevel][job.gate];
}

function buildStrategicRecommendations(ranked, capabilities, background, profile) {
  const enriched = ranked.map((job) => enrichJobForStrategy(job, capabilities, background, profile));
  const mainPool = enriched
    .filter((job) => job.canMain)
    .sort((a, b) => b.strategyScore - a.strategyScore);
  const mainJob = mainPool[0] || enriched.slice().sort((a, b) => b.lowRiskScore - a.lowRiskScore)[0];

  const stretchPool = enriched
    .filter((job) => job.key !== mainJob.key && job.canStretch)
    .sort((a, b) => b.stretchScore - a.stretchScore);
  const stretchJob = stretchPool[0] || enriched.filter((job) => job.key !== mainJob.key).sort((a, b) => b.match - a.match)[0];

  const backupPool = enriched
    .filter((job) => job.key !== mainJob.key && job.key !== stretchJob.key && job.canBackup)
    .sort((a, b) => b.backupScore - a.backupScore);
  const backupJob = backupPool[0] || enriched.filter((job) => job.key !== mainJob.key && job.key !== stretchJob.key).sort((a, b) => b.backupScore - a.backupScore)[0];

  return {
    main: {
      title: "主推荐路径",
      job: mainJob,
      summary: "推荐性质：优先投入方向。它不是简单分数最高，而是综合考虑了岗位综合匹配度、进入难度、专业匹配度和核心短板风险。",
      reason: pathStrategyReason("main", mainJob),
      nextStep: mainJob.nextSteps.main
    },
    stretch: {
      title: "冲刺路径",
      job: stretchJob,
      summary: "推荐性质：高上限或兴趣驱动方向。可以冲，但不建议作为唯一选择，需要明确补强条件。",
      reason: pathStrategyReason("stretch", stretchJob),
      nextStep: stretchJob.nextSteps.stretch
    },
    backup: {
      title: "保底路径",
      job: backupJob,
      summary: "推荐性质：现实落点与跳板方向。它的价值不是降低目标，而是帮助你先进入相关赛道。",
      reason: pathStrategyReason("backup", backupJob),
      nextStep: backupJob.nextSteps.backup
    }
  };
}

function primaryDirectionDiagnosis(profile, ranked, recommendations, capabilities, background) {
  const isUndecided = !profile.primaryInterest || profile.primaryInterest === "undecided";
  if (isUndecided) {
    return {
      isUndecided: true,
      title: "暂未锁定方向",
      lead: "你目前还没有锁定想优先尝试的方向，系统会先根据能力、背景、专业和工作方式，给出更适合先探索的方向组合。",
      meta: [
        ["当前状态", "方向探索中"],
        ["下一步", "先做方向验证"],
        ["重点参考", "能力 + 背景 + 专业"]
      ],
      notes: [
        ["这代表什么", "没有明确意向方向时，系统不会强行把某个兴趣方向前置，而是先看你当前更容易形成竞争力的岗位类型。"],
        ["下一步怎么做", "建议从主推荐和冲刺路径中各选1个方向，拆解3-5个真实JD，再用项目或实习反馈验证是否适合。"]
      ]
    };
  }
  const baseJob = ranked.find((item) => item.key === profile.primaryInterest);
  if (!baseJob) return primaryDirectionDiagnosis({ ...profile, primaryInterest: "undecided" }, ranked, recommendations, capabilities, background);
  const recommendationEntry = Object.values(recommendations).find((item) => item.job.key === baseJob.key);
  const job = recommendationEntry ? recommendationEntry.job : enrichJobForStrategy(baseJob, capabilities, background, profile);
  const recommendationLabel = recommendationEntry ? recommendationEntry.title : "未进入三条推荐路径";
  const risks = [];
  if (["高", "极高"].includes(job.entryDifficulty)) risks.push(`进入难度为${job.entryDifficulty}`);
  if (job.majorScore < 65) risks.push("专业匹配度偏弱");
  if (job.coreWeaknesses?.length) risks.push(`${job.coreWeaknesses.join("、")}需要补强`);
  if (!risks.length) risks.push("当前没有特别突出的硬伤");
  return {
    isUndecided: false,
    title: job.name,
    lead: `这是你主动选择想优先了解或尝试的方向，不等同于系统判定的最适合方向。系统会从岗位能力、专业背景和进入难度三个角度，判断它现在更适合作为主线、冲刺还是探索方向。当前岗位综合匹配度为 ${job.match}/100，${recommendationLabel === "未进入三条推荐路径" ? "暂时没有进入主推荐/冲刺/保底路径" : `已进入“${recommendationLabel}”`}。`,
    meta: [
      ["岗位综合匹配度", `${job.match}/100`],
      ["专业匹配度", `${job.majorScore}/100`],
      ["进入难度", job.entryDifficulty]
    ],
    notes: [
      ["意向方向体检", `这个方向的主要判断依据是能力匹配 ${job.capabilityScore}/100、背景竞争力 ${job.backgroundScore || "已计入"}、专业匹配度 ${job.majorScore}/100。${risks.join("；")}。`],
      ["如果想坚持", primaryDirectionNextStep(job)]
    ]
  };
}

function primaryDirectionNextStep(job) {
  if (job.majorScore < 65) {
    return `先补一份能解释“为什么适合${job.name}”的项目或作品，例如岗位分析、行业研究、数据/业务复盘。`;
  }
  if (job.coreWeaknesses?.length) {
    return `优先补${job.coreWeaknesses.join("、")}，并把补强结果写进简历项目和面试案例。`;
  }
  if (["高", "极高"].includes(job.entryDifficulty)) {
    return `该方向门槛较高，建议用强相关实习、项目作品或内推机会降低筛选风险。`;
  }
  return `可以继续作为重点方向推进，下一步把简历、项目和投递岗位都向${job.name}集中。`;
}

function enrichJobForStrategy(job, capabilities, background, profile) {
  const entryDifficulty = difficulty(job, background.level);
  const coreWeaknessKeys = job.coreGapKeys || coreAbilityGaps(job, capabilities);
  const coreWeaknesses = coreWeaknessKeys.map((key) => dimensions[key]);
  const interested = profile.interests.includes(job.key);
  const hardDifficulty = ["高", "极高"].includes(entryDifficulty);
  const mediumDifficulty = ["中", "中高"].includes(entryDifficulty);
  const majorMismatch = job.majorScore < 65;
  const interestBoost = interested ? 8 : 0;
  const difficultyPenalty = entryDifficulty === "极高" ? 18 : entryDifficulty === "高" ? 12 : entryDifficulty === "中高" ? 6 : 0;
  const weaknessPenalty = coreWeaknesses.length * 10;
  const majorPenalty = job.majorScore < 55 ? 16 : majorMismatch ? 10 : 0;
  const strategyScore = job.match + interestBoost - difficultyPenalty - weaknessPenalty - majorPenalty;
  const lowRiskScore = job.match - difficultyPenalty * 1.3 - weaknessPenalty * 1.2 - majorPenalty;
  const stretchScore = job.match + (interested ? 14 : 4) + (job.gate === "高" ? 7 : 0) - weaknessPenalty * 0.6 - majorPenalty * 0.5;
  const backupScore = job.match + backupValue(job.key) - difficultyPenalty * 1.6 - weaknessPenalty - (majorMismatch ? 6 : 0);
  const canMain = job.match >= 68 && !hardDifficulty && coreWeaknesses.length === 0 && !majorMismatch;
  const canStretch = interested || job.gate === "高" || job.match >= 70;
  const canBackup = !hardDifficulty && job.match >= 55 && coreWeaknesses.length <= 1;
  return {
    ...job,
    entryDifficulty,
    coreWeaknesses,
    interested,
    hardDifficulty,
    majorMismatch,
    mediumDifficulty,
    strategyScore,
    lowRiskScore,
    stretchScore,
    backupScore,
    canMain,
    canStretch,
    canBackup,
    nextSteps: nextStepsByJob(job.key)
  };
}

function backupValue(key) {
  return {
    internet: 10,
    ba: 9,
    fmcg: 7,
    financial_services: 8,
    big4: 8,
    soe: 8,
    hr: 8,
    supply_chain: 8,
    legal_compliance: 7,
    crossborder: 7,
    policy: 6,
    creative: 5,
    academic: 4,
    finance: 3,
    consulting: 3
  }[key] || 5;
}

function pathStrategyReason(type, job) {
  const weaknessText = job.coreWeaknesses.length ? `当前风险是${job.coreWeaknesses.join("、")}还需要补强` : "核心能力短板不明显";
  const interestText = job.interested ? "且属于你主动选择的目标方向" : "虽然不是你主动选择的方向，但与当前能力结构有连接";
  if (type === "main") {
    return `为什么推荐：${job.name}的进入难度为${job.entryDifficulty}，专业匹配度为${job.majorScore}/100，${weaknessText}，${interestText}，适合作为当前优先投入方向。`;
  }
  if (type === "stretch") {
    const risk = job.hardDifficulty ? "背景或招聘门槛较高" : job.majorMismatch ? "专业匹配度需要加强" : weaknessText;
    return `为什么可以冲：该方向有较高成长价值或与你的兴趣有关；为什么有风险：${risk}。建议把它作为冲刺目标，并设置明确补强条件。`;
  }
  return `为什么保底：该方向进入难度为${job.entryDifficulty}，能力迁移空间较好，可以帮助你先获得相关实习或第一份工作经验；为什么不浪费：后续仍可向主线方向转移。`;
}

function nextStepsByJob(key) {
  const map = {
    consulting: {
      main: "完成10个商业case训练，申请咨询PTA或战略实习。",
      stretch: "完成20个case训练，加做1份行业进入策略报告。",
      backup: "先申请商业分析、战略运营或咨询PTA作为跳板。"
    },
    finance: {
      main: "补齐财务建模、估值和1份行研报告。",
      stretch: "先从券商研究、四大交易咨询或精品投行实习切入。",
      backup: "选择财务分析、商业分析或金融数据分析积累相关经历。"
    },
    internet: {
      main: "完成1份产品分析或用户增长复盘，申请产品/运营实习。",
      stretch: "补SQL、漏斗分析和产品面试案例，冲刺头部互联网。",
      backup: "先从产品运营、内容运营、商业运营拿到相关履历。"
    },
    fmcg: {
      main: "准备1份品牌campaign复盘，申请品牌/市场实习。",
      stretch: "强化英文表达、群面和消费者洞察，冲刺外企管培。",
      backup: "先从企业市场、活动运营或新媒体市场岗位切入。"
    },
    soe: {
      main: "筛选专业对口岗位，准备笔试、材料写作和稳定性表达。",
      stretch: "关注银行总行、核心央企和高门槛管培批次。",
      backup: "选择地方国企、事业单位项目岗或综合管理岗位积累稳定履历。"
    },
    creative: {
      main: "整理作品集，完成1个策展或内容项目复盘。",
      stretch: "冲刺头部文娱、艺术机构或品牌内容岗位。",
      backup: "先从内容运营、品牌内容、活动策划获得项目经验。"
    },
    ba: {
      main: "补SQL/Excel/BI，完成1个经营分析或数据分析作品。",
      stretch: "用商业分析作品冲刺咨询、互联网策略或金融分析方向。",
      backup: "先从数据运营、经营分析助理或商业运营切入。"
    },
    policy: {
      main: "完成1份政策简报或公共议题研究样本。",
      stretch: "冲刺国际组织、公共事务或企业GR实习。",
      backup: "先从研究助理、项目执行或机构运营岗位积累经历。"
    },
    financial_services: {
      main: "准备银行/资管/保险方向简历，补风险、产品或运营案例。",
      stretch: "冲刺银行总行、资管产品或金融科技管培项目。",
      backup: "先从分行管培、运营管理、风控助理或保险管培切入。"
    },
    big4: {
      main: "准备审计/税务/风险咨询简历，补会计、Excel和项目细节表达。",
      stretch: "冲刺四大咨询线、交易咨询或风险咨询项目。",
      backup: "先从审计、税务或内控实习获取可验证履历。"
    },
    hr: {
      main: "准备招聘、组织发展或HRBP相关项目案例，突出沟通和流程推进。",
      stretch: "冲刺外企HR管培、组织发展或雇主品牌方向。",
      backup: "先从招聘实习、培训运营或HR共享服务岗位切入。"
    },
    supply_chain: {
      main: "补供应链基础、Excel建模和交付异常复盘案例。",
      stretch: "冲刺外企供应链管培、采购或需求计划岗位。",
      backup: "先从运营管理、物流计划或采购助理获得履历。"
    },
    legal_compliance: {
      main: "整理合同、合规、风控或数据合规相关项目经历。",
      stretch: "冲刺金融合规、互联网数据合规或头部企业法务岗。",
      backup: "先从合规助理、内控、风控运营或法务实习切入。"
    },
    academic: {
      main: "明确研究方向，准备文献综述、研究计划和导师匹配清单。",
      stretch: "冲刺博士项目、顶尖实验室或智库研究助理。",
      backup: "先从研究助理、课题助理或数据整理岗位积累研究经历。"
    },
    crossborder: {
      main: "完成1份海外市场进入分析或跨境店铺运营复盘。",
      stretch: "冲刺品牌出海、国际商务或海外增长岗位。",
      backup: "先从跨境运营、海外社媒、渠道助理或商务支持切入。"
    }
  };
  return map[key];
}

function reportStage(topJob, background) {
  if (topJob.match >= 82 && background.score >= 75) {
    return {
      key: "sprint",
      title: "重点冲刺",
      text: `你的主线方向已经比较清楚，${topJob.name}可以进入重点投递和冲刺机会的准备阶段。`
    };
  }
  if (topJob.match >= 74) {
    return {
      key: "prepare",
      title: "集中准备",
      text: `你已经具备比较明确的主申请方向，下一步重点是围绕${topJob.name}集中准备简历、面试和投递节奏。`
    };
  }
  if (topJob.match >= 66) {
    return {
      key: "strengthen",
      title: "重点补强",
      text: `你的主方向基本明确，但相关经历和能力证据还需要继续补强，当前最适合先围绕${topJob.name}补项目、补实习、补表达。`
    };
  }
  if (topJob.match >= 58) {
    return {
      key: "clarify",
      title: "方向明确",
      text: `你已经出现了相对清晰的兴趣方向，但还需要继续验证${topJob.name}是否适合作为真正的主线申请方向。`
    };
  }
  return {
    key: "explore",
    title: "起步探索",
    text: `你目前更适合先做方向筛选和岗位认知，再决定是否把${topJob.name}作为后续重点投入方向。`
  };
}

function allReportStages() {
  return [
    { key: "explore", title: "起步探索", hint: "先看方向和岗位认知" },
    { key: "clarify", title: "方向明确", hint: "开始验证适合的主线" },
    { key: "strengthen", title: "重点补强", hint: "优先补项目、实习和证据" },
    { key: "prepare", title: "集中准备", hint: "集中准备简历、面试和投递" },
    { key: "sprint", title: "重点冲刺", hint: "重点冲目标机会，提高命中率" }
  ];
}

function stageDetail(stageKey) {
  const map = {
    explore: {
      current: "你现在更适合先缩小方向范围，补足对岗位的真实理解，再决定后续主线。",
      next: "先完成目标方向筛选、JD拆解和岗位认知，再进入方向验证。"
    },
    clarify: {
      current: "你已经出现了相对清晰的兴趣方向，但还需要验证这条主线是否真的适合长期投入。",
      next: "下一步重点是通过项目、实习和真实投递反馈，确认主线方向。"
    },
    strengthen: {
      current: "你的方向基本明确，但履历里的项目、实习和能力证据还不够支撑更高匹配度岗位。",
      next: "优先补相关项目、实习经历和表达素材，尽快形成可展示证据。"
    },
    prepare: {
      current: "你已经具备相对明确的主线方向，可以把精力集中放在简历、面试和投递节奏上。",
      next: "下一步是提升投递效率和面试命中率，建立稳定的申请闭环。"
    },
    sprint: {
      current: "你的主线方向和背景基础都比较清楚，可以进入重点投递和冲刺机会阶段。",
      next: "继续集中火力冲核心目标岗位，同时保留相邻机会作为策略补位。"
    }
  };
  return map[stageKey] || map.explore;
}

function reportPriorityAction(topJob, weak, leadSignals) {
  if (leadSignals.length) {
    return "先把求职方向和投递节奏收拢，再进入项目补强和简历重构。";
  }
  return `优先补${weak[0][0] ? dimensions[weak[0][0]] : "岗位相关证据"}，并尽快产出1份与${topJob.name}相关的可展示作品。`;
}

function profileSnapshot(profile, background, topJob, strong, weak, personality) {
  const backgroundText = `当前背景等级为${background.level}，对${topJob.name}的进入帮助是${background.score >= 75 ? "较稳定的" : background.score >= 60 ? "有基础但还需要补证据的" : "偏弱、需要更强经历支持的"}。`;
  const abilityText = `你更突出的能力是${strong.map(([key]) => dimensions[key]).join("、")}；相对容易被追问的部分是${weak.map(([key]) => dimensions[key]).join("、")}。`;
  const workStyleText = personalitySummary(personality).replace("你的工作偏好可以概括为：", "").replace("。这不是限制你选择行业，而是帮助你判断哪类岗位节奏更容易坚持。", "");
  return { backgroundText, abilityText, workStyleText };
}

function pathRiskText(job) {
  if (job.majorMismatch) return "专业和目标方向不是天然对口，申请时需要额外证明匹配理由。";
  if (job.coreWeaknesses.length) return `当前最容易卡住的是${job.coreWeaknesses.join("、")}，面试里需要准备更具体的例子。`;
  if (job.hardDifficulty) return "岗位门槛偏高，建议把它作为冲刺方向，而不是唯一目标。";
  return "当前没有明显硬冲突，重点在于把已有优势转成简历和面试证据。";
}

function pathAdvantageText(job, strong) {
  return `你的${strong.map(([key]) => dimensions[key]).join("、")}，和${job.name}看重的核心要求有比较直接的连接。`;
}

function abilityLevelText(score) {
  if (score >= 80) return "优势项";
  if (score >= 65) return "具备基础";
  return "待补强";
}

function abilityTone(score) {
  if (score >= 80) return "high";
  if (score >= 65) return "mid";
  return "low";
}

function personalityVisualConfig() {
  return {
    decision: {
      title: "决策风格",
      left: "理性判断",
      right: "感受驱动",
      neutral: "兼顾逻辑与感受"
    },
    social: {
      title: "社交能量",
      left: "外向协作",
      right: "独立思考",
      neutral: "协作与独立都可适应"
    },
    risk: {
      title: "风险偏好",
      left: "愿意尝试",
      right: "偏稳妥",
      neutral: "接受变化但会看边界"
    },
    structure: {
      title: "工作方式偏好",
      left: "规则清晰",
      right: "灵活自主",
      neutral: "目标清楚、方法可灵活"
    }
  };
}

function personalityVisualLabel(key, result) {
  const config = personalityVisualConfig()[key];
  if (result.dominant === "neutral") return config.neutral;
  return result.dominant === (key === "decision" ? "rational" : key === "social" ? "extrovert" : key === "risk" ? "adventurous" : "rule")
    ? config.left
    : config.right;
}

function compactProfileForRegistration(profile) {
  return {
    undergradSchool: profile.undergradSchool || "",
    undergradMajor: profile.undergradMajor || "",
    undergradMajorType: majorTypeName(profile.undergradMajorType),
    gradSchool: profile.gradSchool || "",
    gradMajor: profile.gradMajor || "",
    gradMajorType: majorTypeName(profile.gradMajorType),
    phdSchool: profile.phdSchool || "",
    phdMajor: profile.phdMajor || "",
    phdMajorType: majorTypeName(profile.phdMajorType),
    internship: profile.internship || "",
    projects: profile.projects || [],
    interests: (profile.interests || []).map((key) => jobProfiles[key]?.name || key),
    primaryInterest: jobProfiles[profile.primaryInterest]?.name || profile.primaryInterest
  };
}

function compactPersonalityForRegistration(personality) {
  return Object.fromEntries(
    Object.entries(personalityVisualConfig()).map(([key, config]) => [config.title, {
      label: personalityVisualLabel(key, personality[key]),
      leftRatio: Math.round((personality[key].leftRatio || 0) * 100),
      dominant: personality[key].dominant
    }])
  );
}

function buildAssessmentRegistrationPayload(profile, capabilities, personality, background, recommendations, stage, identityTag = null) {
  return {
    createdAt: new Date().toISOString(),
    registrant: {
      studentName: profile.studentName || "",
      contact: profile.contact || "",
      role: profile.role || "学生本人",
      note: ""
    },
    currentStage: stage.title,
    background: {
      level: background.level,
      score: background.score,
      schoolTier: background.schoolTier,
      schoolTierLabel: background.schoolTierLabel,
      schoolScore: background.schoolScore,
      rankingScore: background.rankingScore || null,
      rankingConfidence: background.rankingConfidence || null
    },
    profile: compactProfileForRegistration(profile),
    futureIdentity: identityTag ? {
      title: identityTag.title,
      description: identityTag.description,
      keywords: identityTag.keywords
    } : null,
    capabilities,
    personality: compactPersonalityForRegistration(personality),
    recommendations: Object.fromEntries(
      Object.entries(recommendations).map(([key, item]) => [key, {
        title: item.title,
        direction: item.job.name,
        match: item.job.match,
        entryDifficulty: item.job.entryDifficulty,
        majorScore: item.job.majorScore,
        jobs: item.job.jobs
      }])
    )
  };
}

function assessmentSignature(payload) {
  const clone = { ...payload };
  delete clone.createdAt;
  return JSON.stringify(clone);
}

async function autoRegisterLatestAssessmentResult() {
  const status = document.getElementById("registrationStatus");
  if (!latestAssessmentResult) return;

  const signature = assessmentSignature(latestAssessmentResult);
  if (signature === latestAssessmentSignature) {
    if (status) status.textContent = latestAutoRecordId
      ? `系统已自动登记本次报告，记录编号 ${latestAutoRecordId}。后台现在可以直接查看本次测评结果。`
      : "系统已自动登记本次报告，后台现在可以直接查看本次测评结果。";
    return;
  }

  if (status) status.textContent = "正在自动登记本次测评结果...";
  try {
    const response = await fetch(`${ASSESSMENT_API_BASE}/api/assessment-records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "auto_report_generation",
        registrant: latestAssessmentResult.registrant,
        assessment: latestAssessmentResult
      })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    latestAssessmentSignature = signature;
    latestAutoRecordId = result.recordId;
    if (status) {
      if (result.feishuSync?.ok) {
        status.textContent = `系统已自动登记本次报告，并已同步到飞书多维表格。记录编号 ${result.recordId}。`;
      } else if (result.feishuSync?.skipped) {
        status.textContent = `系统已自动登记本次报告，记录编号 ${result.recordId}。当前尚未配置飞书同步。`;
      } else if (result.feishuSync?.error) {
        status.textContent = `系统已自动登记本次报告，记录编号 ${result.recordId}。飞书同步暂未成功：${result.feishuSync.error}`;
      } else {
        status.textContent = `系统已自动登记本次报告，记录编号 ${result.recordId}。后台现在可以直接查看本次测评结果。`;
      }
    }
  } catch (error) {
    console.error(error);
    if (status) status.textContent = `自动登记失败：当前未连接后台服务，请先启动本地登记服务（${ASSESSMENT_API_BASE}）。`;
  }
}

function reportHasRendered() {
  return Boolean(latestAssessmentResult && document.querySelector("#reportRoot .report-block"));
}

function scheduleAutoRegisterLatestAssessmentResult() {
  runWhenIdle(() => autoRegisterLatestAssessmentResult(), 1800);
}

function generateReport(options = {}) {
  const { autoRegister = true } = options;
  const profile = getFormData();
  const capabilities = scoreCapabilities();
  const personality = scorePersonality();
  const background = scoreBackground(profile);
  const ranked = Object.entries(jobProfiles)
    .filter(([key]) => key !== "undecided")
    .map(([key, job]) => ({ key, ...job, ...scoreJob(job, capabilities, personality, background, profile) }))
    .sort((a, b) => b.match - a.match);
  const interestJobs = ranked.filter((job) => profile.interests.includes(job.key));
  const recommendations = buildStrategicRecommendations(ranked, capabilities, background, profile);
  const primaryDiagnosis = primaryDirectionDiagnosis(profile, ranked, recommendations, capabilities, background);
  const top = [recommendations.main.job, recommendations.stretch.job, recommendations.backup.job];
  const strong = Object.entries(capabilities).sort((a, b) => b[1] - a[1]).slice(0, 2);
  const weak = Object.entries(capabilities).sort((a, b) => a[1] - b[1]).slice(0, 2);
  const stage = reportStage(top[0], background);
  const snapshot = profileSnapshot(profile, background, top[0], strong, weak, personality);
  const leadSignals = activeCapabilityQuestions
    .filter((q) => q.lead && selectedValue(q.id) !== null && q.options[selectedValue(q.id)][1] <= 2)
    .map((q) => q.title);
  const stages = allReportStages();
  const currentStageIndex = Math.max(stages.findIndex((item) => item.key === stage.key), 0);
  const currentStageMeta = stages[currentStageIndex];
  const nextStageMeta = stages[Math.min(currentStageIndex + 1, stages.length - 1)];
  const stageInfo = stageDetail(stage.key);
  const interestLabelText = profile.interests.includes("undecided")
    ? "暂不确定"
    : profile.interests.map((key) => jobProfiles[key].name).join("、");
  const identityTag = futureIdentityTag(profile, recommendations, primaryDiagnosis);
  latestAssessmentResult = buildAssessmentRegistrationPayload(profile, capabilities, personality, background, recommendations, stage, identityTag);
  document.getElementById("reportRoot").className = "report-grid report-v2";
  document.getElementById("reportRoot").innerHTML = `
    <section class="report-hero report-block wide">
      <div class="report-hero-main">
        <p class="report-kicker">Report Summary</p>
        <h3>你的职业规划结论</h3>
        <p class="report-lead">${stage.text}</p>
        <div class="tag-row">
          <span class="tag">主推荐方向：${top[0].name}</span>
          <span class="tag">当前阶段：${stage.title}</span>
          <span class="tag">背景等级：${background.level}</span>
          <span class="tag">目标方向：${interestLabelText}</span>
        </div>
      </div>
      <div class="identity-card">
        <div class="identity-copy">
          <span class="summary-label">未来身份标签</span>
          <h4>${identityTag.title}</h4>
          <p>${identityTag.description}</p>
        </div>
        <div class="identity-keywords" aria-label="身份关键词">
          ${identityTag.keywords.map((keyword) => `<span>${keyword}</span>`).join("")}
        </div>
      </div>
      <div class="stage-progress" aria-label="求职阶段进度">
        <div class="stage-progress-head">
          <span class="summary-label">阶段进度</span>
          <span class="stage-progress-hint">你当前在第 ${currentStageIndex + 1} / ${stages.length} 阶段</span>
        </div>
        <div class="stage-progress-line" aria-hidden="true">
          <span style="width:${((currentStageIndex + 1) / stages.length) * 100}%"></span>
        </div>
        <div class="stage-track">
          ${stages.map((item, index) => `
            <article class="stage-node ${item.key === stage.key ? "active" : ""} ${index < currentStageIndex ? "done" : ""}">
              <span class="stage-index">${index + 1}</span>
              <strong>${item.title}</strong>
              <p>${item.hint}</p>
            </article>
          `).join("")}
        </div>
      </div>
      <div class="stage-detail-card">
        <div class="stage-detail-head">
          <div>
            <span class="summary-label">当前阶段说明</span>
            <h4>${currentStageMeta.title}</h4>
          </div>
          <span class="stage-detail-badge">你当前在这里</span>
        </div>
        <div class="stage-detail-grid">
          <article class="stage-detail-item">
            <span class="summary-label">阶段解读</span>
            <p>${stageInfo.current}</p>
          </article>
          <article class="stage-detail-item emphasis">
            <span class="summary-label">下一步重点</span>
            <p>${nextStageMeta.key === stage.key ? stageInfo.next : `下一阶段是“${nextStageMeta.title}”。${stageInfo.next}`}</p>
          </article>
        </div>
      </div>
      <div class="summary-grid summary-grid-single">
        <article class="summary-card">
          <span class="summary-label">背景竞争力</span>
          <strong>${background.score}/100</strong>
          <p>学校、成绩、项目和经历共同决定当前可进入性。</p>
        </article>
      </div>
    </section>
    <section class="report-block wide">
      <h3>${primaryDiagnosis.isUndecided ? "方向探索建议" : "你想优先尝试的方向"}</h3>
      <div class="priority-diagnosis-card ${primaryDiagnosis.isUndecided ? "explore" : ""}">
        <div class="priority-diagnosis-main">
          <span class="summary-label">${primaryDiagnosis.isUndecided ? "当前状态" : "用户意向方向"}</span>
          <strong>${primaryDiagnosis.title}</strong>
          <p>${primaryDiagnosis.lead}</p>
        </div>
        <div class="priority-metrics">
          ${primaryDiagnosis.meta.map(([label, value]) => `
            <div class="priority-metric">
              <span>${label}</span>
              <strong>${value}</strong>
            </div>
          `).join("")}
        </div>
        <div class="priority-notes">
          ${primaryDiagnosis.notes.map(([label, text]) => `
            <div class="path-note-item">
              <span class="path-note-label">${label}</span>
              <p>${text}</p>
            </div>
          `).join("")}
        </div>
      </div>
    </section>
    <section class="report-block wide">
      <h3>职业路径推荐</h3>
      <div class="path-list">
        ${Object.entries(recommendations).map(([kind, item]) => `
          <article class="path-card ${kind}">
            <div class="path-head">
              <div>
                <span class="path-type">${item.title}</span>
                <span class="path-job">${item.job.name}</span>
              </div>
              <div class="score-orb" style="--score:${item.job.match}">
                <span>${item.job.match}</span>
              </div>
            </div>
            <div class="path-metrics">
              <div class="path-metric">
                <span>岗位综合匹配度</span>
                <strong>${item.job.match}/100</strong>
              </div>
              <div class="path-metric">
                <span>进入难度</span>
                <strong>${item.job.entryDifficulty}</strong>
              </div>
              <div class="path-metric">
                <span>专业匹配度</span>
                <strong>${item.job.majorScore}/100</strong>
              </div>
              <div class="path-metric">
                <span>成功概率</span>
                <strong>${probability(item.job.match)}</strong>
              </div>
            </div>
            <div class="path-notes">
              <div class="path-note-item">
                <span class="path-note-label">为什么推荐</span>
                <p>${item.summary}</p>
              </div>
              <div class="path-note-item">
                <span class="path-note-label">当前优势</span>
                <p>${pathAdvantageText(item.job, strong)}</p>
              </div>
              <div class="path-note-item">
                <span class="path-note-label">主要风险</span>
                <p>${pathRiskText(item.job)}</p>
              </div>
              <div class="path-note-item emphasis">
                <span class="path-note-label">下一步动作</span>
                <p>${item.nextStep}</p>
              </div>
            </div>
            <p class="small-note">适合岗位：${item.job.jobs}</p>
          </article>
        `).join("")}
      </div>
    </section>
    <section class="report-block wide">
      <h3>能力画像</h3>
      <p class="section-tip">这部分帮助你理解，企业为什么会在简历筛选和面试里重点看这些能力。</p>
      <div class="ability-visual-grid">
        ${Object.entries(capabilities).map(([key, val]) => `
          <article class="ability-visual-card ${abilityTone(val)}">
            <div class="ability-donut" style="--score:${val}">
              <span>${val}</span>
            </div>
            <div class="ability-card-copy">
              <strong>${dimensions[key]}</strong>
              <p>${abilityLevelText(val)}</p>
            </div>
          </article>
        `).join("")}
      </div>
      <div class="insight-list">
        ${Object.entries(capabilities).map(([key, val]) => `
          <div class="insight-item">
            <span class="insight-kicker">企业视角</span>
            <strong>${dimensions[key]}</strong>
            <p>${abilityExplain(key, val)}</p>
          </div>
        `).join("")}
      </div>
    </section>
    <section class="report-block wide">
      <h3>性格画像</h3>
      <p class="section-tip">这部分展示的是你的工作方式倾向，不是限制行业选择，而是帮助你判断更适合怎样的团队节奏和工作环境。</p>
      <div class="personality-grid">
        ${Object.entries(personalityVisualConfig()).map(([key, config]) => `
          <article class="personality-card">
            <div class="personality-head">
              <span class="summary-label">${config.title}</span>
              <strong>${personalityVisualLabel(key, personality[key])}</strong>
            </div>
            <div class="personality-scale">
              <span>${config.left}</span>
              <div class="scale-track"><span style="left:${personality[key].leftRatio * 100}%"></span></div>
              <span>${config.right}</span>
            </div>
            <p class="small-note">${key === "decision" ? "你在做判断时，更偏向先看事实、逻辑还是更重视感受和认同感。" : key === "social" ? "你在高频协作和独立推进之间，更容易在哪种节奏里保持状态。" : key === "risk" ? "你面对不确定机会时，更倾向主动尝试还是优先控制风险。" : "你更适合规则清晰的环境，还是更有自主空间的工作方式。"}</p>
          </article>
        `).join("")}
      </div>
    </section>
    <section class="report-block wide">
      <h3>测评结果解读</h3>
      <div class="profile-grid">
        <article class="profile-card">
          <span class="summary-label">背景定位</span>
          <p class="profile-lead">${snapshot.backgroundText}</p>
          <div class="profile-meta">
            <p class="small-note">学校层级：${background.schoolTier} · ${background.schoolTierLabel}；学校分 ${background.schoolScore}/100；校园项目加成 ${background.projectBoost} 分。</p>
            ${background.rankingScore ? `<p class="small-note">四榜综合分 ${background.rankingScore}/100，数据置信度 ${background.rankingConfidence}。QS ${background.rankingRefs.qs || "-"} / THE ${background.rankingRefs.the || "-"} / U.S. News ${background.rankingRefs.usnews || "-"} / ARWU ${background.rankingRefs.arwu || "-"}。</p>` : ""}
          </div>
        </article>
        <article class="profile-card">
          <span class="summary-label">能力特点</span>
          <p class="profile-lead">${snapshot.abilityText}</p>
          <div class="profile-meta">
            <p class="small-note">${industryAbilityNote(top[0], strong, weak)}</p>
          </div>
        </article>
        <article class="profile-card">
          <span class="summary-label">工作方式</span>
          <p class="profile-lead">${snapshot.workStyleText}。</p>
          <div class="profile-meta">
            <p class="small-note">${profileNarrative(profile, background, top[0])}</p>
          </div>
        </article>
      </div>
    </section>
    <section class="report-block wide">
      <h3>未来行动建议</h3>
      <div class="timeline-grid">
        <article class="timeline-card">
          <span class="summary-label">未来3个月</span>
          <h4>明确方向并补证据</h4>
          <ul>
            <li>确定1个主申请方向、1个冲刺方向、1个保底方向。</li>
            <li>完成一版定向简历，突出${strong.map(([key]) => dimensions[key]).join("、")}。</li>
            <li>每周拆解2个真实JD，记录岗位关键词。</li>
            <li>完成1份与${top[0].name}相关的项目作品或行业分析。</li>
          </ul>
        </article>
        <article class="timeline-card">
          <span class="summary-label">未来6个月</span>
          <h4>形成实习和面试竞争力</h4>
          <ul>
            <li>集中申请${top[0].jobs.split("、").slice(0, 2).join("、")}相关实习。</li>
            <li>建立投递表，持续跟踪岗位、反馈、面试问题和改进点。</li>
            <li>每周做2次模拟面试，重点训练STAR、岗位理解和项目复盘。</li>
            <li>补齐目标岗位要求的工具或技能，如Excel、SQL、行业研究、英文表达。</li>
          </ul>
        </article>
        <article class="timeline-card">
          <span class="summary-label">未来1年</span>
          <h4>完成路径验证和求职闭环</h4>
          <ul>
            <li>至少积累1段强相关实习或2个可展示项目。</li>
            <li>根据实习反馈判断是否坚持主线方向，或转向相邻岗位。</li>
            <li>提前准备秋招/春招批次，区分冲刺、主投、保底岗位。</li>
            <li>形成稳定的简历版本、面试故事库和作品集材料。</li>
          </ul>
        </article>
      </div>
    </section>
    <section class="report-block wide">
      <div class="split-card action-card">
        <h3>下一步行动建议</h3>
        <p>建议先领取与你目标方向相关的行业/专业解析资料，例如岗位JD拆解、目标专业就业路径、校招时间线、简历项目模板。</p>
        <p>如果你目前存在方向过多、经历包装不足、投递节奏不清晰等情况，建议尽快把重点放在方向收敛、简历重构、项目补强和面试训练上。</p>
        <p class="small-note">${leadSignals.length ? `本次测评识别到的重点提醒：${leadSignals.join("、")}。` : "本次没有明显的高风险提醒，建议先按主线方向推进，并定期复盘投递反馈。"}</p>
      </div>
    </section>
    <p class="small-note hidden-status" id="registrationStatus" aria-live="polite"></p>
  `;
  if (autoRegister) scheduleAutoRegisterLatestAssessmentResult();
}

function conflictText(job, capabilities, background, profile) {
  if (!job) return "<p>暂未识别目标兴趣，请回到背景信息选择目标方向。</p>";
  const weakRequired = Object.entries(job.weights).filter(([key, weight]) => weight >= 4 && capabilities[key] < 60).map(([key]) => dimensions[key]);
  const directionAdvice = conflictAdviceByJob(job.key);
  if (job.match >= 75) {
    return `<p><strong>${job.name}</strong>：当前岗位综合匹配度较好，可作为主线或重点冲刺方向。${directionAdvice.good}</p>`;
  }
  if (background.score < 60 && job.gate !== "中") {
    return `<p><strong>${job.name}</strong>：该方向背景门槛为${job.gate}，你的当前背景竞争力为${background.level}。${directionAdvice.background}</p>`;
  }
  if (job.majorScore < 62) {
    return `<p><strong>${job.name}</strong>：兴趣方向与专业背景关联度偏弱。${directionAdvice.major}</p>`;
  }
  if (weakRequired.length) {
    return `<p><strong>${job.name}</strong>：该方向高度依赖${weakRequired.join("、")}，而这些是你当前相对薄弱的部分。${directionAdvice.ability}</p>`;
  }
  return `<p><strong>${job.name}</strong>：当前岗位综合匹配度中等。${directionAdvice.neutral}</p>`;
}

function profileNarrative(profile, background, topJob) {
  const phd = profile.phdMajorType && profile.phdMajorType !== "none";
  const grad = profile.gradMajorType && profile.gradMajorType !== "none";
  const degreeText = phd ? "博士专业" : grad ? "研究生专业" : "本科专业";
  const projectText = profile.projects && profile.projects.length ? "已有校园项目可以被包装成岗位证据" : "目前项目证据偏少，需要补一段可展示作品";
  const backgroundText = background.level === "T1" || background.level === "T2"
    ? "在多数主流校招岗位中具备进入候选池的基础"
    : "申请高门槛岗位时需要更依赖实习、项目和技能证明";
  return `从招聘视角看，你的${degreeText}与${topJob.name}的专业匹配度为${topJob.majorScore}/100，${backgroundText}。${projectText}，否则简历容易停留在“背景描述”，而不是“岗位能力证明”。`;
}

function futureIdentityTag(profile, recommendations, primaryDiagnosis) {
  const mainJob = recommendations.main.job;
  const priorityKey = profile.primaryInterest && profile.primaryInterest !== "undecided"
    ? profile.primaryInterest
    : mainJob.key;
  const priorityJob = jobProfiles[priorityKey] ? { key: priorityKey, ...jobProfiles[priorityKey] } : mainJob;
  const majorContext = preferredMajorType(profile);
  const context = identityContextByJob(priorityJob.key, majorContext);
  const majorLabel = majorContext ? majorTypeName(majorContext) : "多元背景";
  const bridge = majorContext && priorityJob.majors.includes(majorContext)
    ? `你的${majorLabel}背景与${priorityJob.name}有一定衔接，可以把专业积累转化为岗位证据。`
    : `你的${majorLabel}背景可以作为切入点，但需要用项目、实习或作品补足与${priorityJob.name}的连接。`;
  const pathText = primaryDiagnosis.isUndecided
    ? `当前目标方向还在探索中，系统先基于主推荐路径“${mainJob.name}”给你生成一个可验证的职业身份。`
    : `你当前想优先尝试“${priorityJob.name}”，主推荐路径为“${mainJob.name}”。这个身份标签用于帮助你建立目标代入感，不代表最终只能选择这一个方向。`;
  return {
    title: `未来${context.title}`,
    description: `${pathText}${bridge}`,
    keywords: [...new Set([priorityJob.name, mainJob.name, majorLabel, ...context.keywords])].slice(0, 6)
  };
}

function preferredMajorType(profile) {
  const candidates = [profile.phdMajorType, profile.gradMajorType, profile.undergradMajorType];
  return candidates.find((type) => type && type !== "none" && type !== "other") || "";
}

function identityContextByJob(key, majorType = "") {
  const map = {
    consulting: {
      titles: ["战略操盘手", "商业问题解决专家", "企业转型顾问", "增长战略设计师"],
      keywords: ["战略", "问题拆解", "顶层设计"],
      titleByMajor: { marketing: 3, management: 0, finance: 1, accounting: 1, data: 1, cs: 1, engineering: 2, supplychain: 2, lawpolicy: 2, socialscience: 2 }
    },
    finance: {
      titles: ["资本运作专家", "投资决策者", "行业洞察分析师", "并购交易操盘手"],
      keywords: ["资本", "交易", "判断力"],
      titleByMajor: { finance: 0, accounting: 3, data: 2, cs: 2, management: 1, science: 2 }
    },
    financial_services: {
      titles: ["风险管理专家", "资产配置顾问", "金融运营管理者", "资金安全守护者"],
      keywords: ["稳健", "体系", "风控"],
      titleByMajor: { finance: 1, accounting: 0, management: 2, data: 0, cs: 2, lawpolicy: 3 }
    },
    internet: {
      titles: ["产品增长负责人", "用户增长黑客", "数据驱动产品经理", "平台运营操盘手"],
      keywords: ["增长", "转化", "用户"],
      titleByMajor: { data: 2, cs: 2, management: 3, marketing: 1, engineering: 2, media: 0 }
    },
    ba: {
      titles: ["数据决策官", "商业洞察分析师", "增长分析专家", "数据产品专家"],
      keywords: ["分析", "模型", "决策支持"],
      titleByMajor: { data: 0, cs: 3, finance: 1, accounting: 1, management: 1, engineering: 3, supplychain: 2 }
    },
    fmcg: {
      titles: ["品牌增长经理", "市场策略操盘手", "消费者洞察专家", "品牌营销主理人"],
      keywords: ["品牌", "用户", "营销"],
      titleByMajor: { marketing: 0, management: 1, media: 3, socialscience: 2, arts: 3, humanities: 3 }
    },
    big4: {
      titles: ["企业合规守护者", "财务审计专家", "风险控制顾问", "税务筹划专家"],
      keywords: ["规范", "专业", "审慎"],
      titleByMajor: { accounting: 1, finance: 2, management: 2, data: 2, cs: 2, lawpolicy: 0 }
    },
    soe: {
      titles: ["产业发展推动者", "国家战略执行者", "资源配置管理者", "公共价值创造者"],
      keywords: ["稳定", "责任", "体系"],
      titleByMajor: { engineering: 0, lawpolicy: 1, socialscience: 3, management: 2, finance: 2, accounting: 2 }
    },
    policy: {
      titles: ["公共政策分析师", "国际事务协调官", "社会治理专家", "政策研究员"],
      keywords: ["政策", "国际", "影响力"],
      titleByMajor: { lawpolicy: 0, socialscience: 2, media: 1, management: 0, education: 2, humanities: 3 }
    },
    creative: {
      titles: ["内容创意主理人", "文化策展人", "IP打造专家", "内容策略设计师"],
      keywords: ["创意", "表达", "内容"],
      titleByMajor: { arts: 1, media: 0, humanities: 1, socialscience: 3, marketing: 2, management: 3 }
    },
    hr: {
      titles: ["组织发展专家", "人才战略顾问", "HR业务伙伴（HRBP）", "组织效能提升官"],
      keywords: ["组织", "人", "效率"],
      titleByMajor: { management: 0, marketing: 2, socialscience: 1, media: 2, education: 0, humanities: 1 }
    },
    supply_chain: {
      titles: ["供应链优化专家", "采购策略负责人", "运营效率提升官", "全球物流管理者"],
      keywords: ["效率", "成本", "系统"],
      titleByMajor: { engineering: 2, supplychain: 0, management: 1, data: 2, science: 0, cs: 2 }
    },
    legal_compliance: {
      titles: ["企业法律顾问", "合规管理专家", "风控体系设计师", "商业风险守门人"],
      keywords: ["规则", "风险", "底线"],
      titleByMajor: { lawpolicy: 0, socialscience: 1, finance: 2, accounting: 2, management: 1, data: 2, cs: 2 }
    },
    academic: {
      titles: ["学术研究者", "前沿技术探索者", "科研项目负责人", "学科带头人"],
      keywords: ["深度", "创新", "研究"],
      titleByMajor: { science: 1, data: 1, cs: 1, engineering: 1, lawpolicy: 0, socialscience: 0, media: 0, education: 0, humanities: 0 }
    },
    crossborder: {
      titles: ["全球市场拓展经理", "跨境增长操盘手", "国际商务负责人", "出海品牌战略官"],
      keywords: ["全球化", "增长", "商业化"],
      titleByMajor: { management: 2, marketing: 3, media: 1, socialscience: 0, finance: 2, data: 1, cs: 1, humanities: 0 }
    }
  };
  const context = map[key] || {
    titles: ["职业方向探索者", "能力迁移实践者", "求职路径规划者", "职业目标验证者"],
    keywords: ["方向验证", "能力迁移", "行动计划"],
    titleByMajor: {}
  };
  const titleIndex = context.titleByMajor[majorType] ?? 0;
  return {
    title: context.titles[titleIndex] || context.titles[0],
    keywords: context.keywords
  };
}

function industryAbilityNote(job, strong, weak) {
  const strongNames = strong.map(([key]) => dimensions[key]).join("、");
  const weakNames = weak.map(([key]) => dimensions[key]).join("、");
  return `${job.name}常见筛选逻辑是先看背景和经历是否相关，再看候选人能否证明${Object.entries(job.weights).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([key]) => dimensions[key]).join("、")}。你当前可以主打${strongNames}，但需要避免在${weakNames}上被面试追问时缺少例子。`;
}

function abilityExplain(key, value) {
  const level = value >= 75 ? "表现较强" : value >= 60 ? "具备基础" : "需要补强";
  const map = {
    analytical: `企业用它判断你能否拆问题、看数据、做判断。当前${level}，适合用案例拆解、行业研究或数据项目继续证明。`,
    communication: `企业用它判断你能否汇报、协作、影响他人。当前${level}，面试中应准备跨团队沟通和向上汇报案例。`,
    execution: `企业用它判断你能否在截止日期和压力下交付结果。当前${level}，建议用实习、商赛或项目里程碑体现。`,
    creativity: `企业用它判断你能否提出新方案、理解用户和内容趋势。当前${level}，适合用策划、产品优化或内容作品展示。`,
    stability: `企业用它判断你是否细致、守流程、能适应规范组织。当前${level}，国央企、银行、合规类岗位尤其看重。`,
    business: `企业用它判断你是否理解用户、收入、成本、增长和竞争。当前${level}，商业岗位应重点展示业务结果和量化复盘。`
  };
  return map[key];
}

function personalitySummary(personality) {
  const decision = personality.decision.dominant === "rational" ? "更习惯先看信息、数据和结果再做决定" : personality.decision.dominant === "emotional" ? "做选择时会比较重视兴趣、感受和价值认同" : "做决定时能在理性分析和个人感受之间保持平衡";
  const social = personality.social.dominant === "extrovert" ? "适合较多沟通、协作和对外表达的环境" : personality.social.dominant === "introvert" ? "更适合有独立思考时间、沟通节奏不过度密集的环境" : "既能参与团队协作，也需要保留一定独立产出时间";
  const risk = personality.risk.dominant === "adventurous" ? "愿意尝试新机会和不确定性较高的岗位" : personality.risk.dominant === "conservative" ? "更看重平台稳定、路径清晰和风险可控" : "可以接受一定变化，但需要看到清晰收益和边界";
  const structure = personality.structure.dominant === "rule" ? "更适应目标、流程和评价标准清楚的组织" : personality.structure.dominant === "free" ? "更喜欢有自主空间、能快速试错的工作方式" : "适合关键目标清晰、执行方式相对灵活的环境";
  return `你的工作偏好可以概括为：${decision}；${social}；${risk}；${structure}。这不是限制你选择行业，而是帮助你判断哪类岗位节奏更容易坚持。`;
}

function majorTypeName(type) {
  return majorTypeDefinitions[type] || "未填写";
}

function conflictAdviceByJob(key) {
  const map = {
    consulting: {
      good: "下一步应重点补case面试、咨询PTA或行业研究作品。",
      background: "建议先走精品咨询、企业战略、商业分析或咨询PTA作为跳板。",
      major: "可通过行业研究、商业case和结构化表达训练补足专业关联。",
      ability: "建议每周练2-3个case，并沉淀一份行业进入策略报告。",
      neutral: "建议作为冲刺方向，同时保留商业分析或互联网策略运营作为现实落点。"
    },
    finance: {
      good: "下一步应补财务建模、估值、行研报告或券商/投行相关实习。",
      background: "建议先考虑券商研究所、四大交易咨询、精品投行或企业投资部。",
      major: "金融方向对专业和实习证据敏感，需用估值模型、研报或证书补强。",
      ability: "建议优先补分析、细节校验和高压交付案例。",
      neutral: "可把行研、金融数据分析作为更稳的金融切入点。"
    },
    internet: {
      good: "下一步应输出产品分析、增长复盘或数据看板作品。",
      background: "互联网可用项目和实习弥补学校短板，建议先争取运营/产品实习。",
      major: "可通过竞品分析、用户调研和SQL/Excel项目证明迁移能力。",
      ability: "建议补用户路径、漏斗分析和需求优先级判断。",
      neutral: "可先从产品运营、商业运营、用户增长中选择一个主线。"
    },
    fmcg: {
      good: "下一步应准备品牌案例、消费者洞察和英文群面表达。",
      background: "外企管培和头部快消竞争激烈，建议先积累品牌/市场实习。",
      major: "可用campaign复盘、消费者访谈和社媒内容作品补足关联。",
      ability: "建议补消费者洞察、创意表达和活动复盘。",
      neutral: "适合作为冲刺方向，同时保留企业市场或运营岗位。"
    },
    soe: {
      good: "下一步应关注校招批次、专业对口岗位和稳定性表达。",
      background: "国央企常看第一学历、党员/学生干部、专业对口和笔试表现，需提前筛岗位。",
      major: "建议选择专业对口岗位，不要泛泛申请综合管理。",
      ability: "建议补流程意识、材料写作和结构化汇报。",
      neutral: "适合作为稳定路径，但需注意岗位城市、编制属性和发展节奏。"
    },
    creative: {
      good: "下一步应整理作品集、策展逻辑和项目复盘。",
      background: "文娱策展更看作品与资源，建议先从项目制实习或内容岗位切入。",
      major: "可用作品集、内容策划和展览/品牌项目补足专业关联。",
      ability: "建议补作品完成度、项目执行和商业化意识。",
      neutral: "适合作为兴趣方向，但要设置商业化或品牌内容的现实落点。"
    },
    ba: {
      good: "下一步应补SQL、Excel、BI和商业问题拆解作品。",
      background: "商业分析可通过工具和项目弥补部分背景短板，但数据作品很关键。",
      major: "建议用数据项目、经营分析案例和业务解释能力补足关联。",
      ability: "建议补分析能力、数据工具和业务表达。",
      neutral: "可作为稳健主线，也可连接咨询、互联网和金融分析岗位。"
    },
    policy: {
      good: "下一步应补政策简报、公共议题研究和中英文写作样本。",
      background: "公共事务看学校、语言、政策理解和沟通资源，建议从研究助理或项目实习切入。",
      major: "建议用政策研究、法律/公共议题项目补足关联。",
      ability: "建议补文字表达、利益相关方分析和材料严谨度。",
      neutral: "适合作为专业相关方向，但需要明确公共部门、企业GR或国际组织路径。"
    },
    financial_services: {
      good: "下一步应补金融产品、风险管理或银行业务案例。",
      background: "银行总行和头部资管较看重学校与专业，建议同时配置分行、保险、风控或运营管理岗位。",
      major: "可通过金融产品分析、风险案例或数据项目补足专业关联。",
      ability: "建议补稳定性、数据分析和材料严谨度。",
      neutral: "适合作为金融方向中更稳健的落点。"
    },
    big4: {
      good: "下一步应准备审计/税务/风险咨询相关简历和群面案例。",
      background: "四大相对更看重英语、细致度、实习和面试表现，可作为商科学生常见跳板。",
      major: "建议补会计、审计、税务或内控相关项目证明。",
      ability: "建议补细节检查、执行抗压和客户沟通案例。",
      neutral: "可作为通往财务、内控、咨询或企业战略的跳板。"
    },
    hr: {
      good: "下一步应补招聘、组织发展或雇主品牌项目案例。",
      background: "HR方向对学校门槛相对温和，但看重沟通、流程意识和对人的判断。",
      major: "心理学、管理、社科、传媒都可迁移，但需要具体项目证明。",
      ability: "建议补结构化沟通、项目执行和数据化招聘意识。",
      neutral: "适合关注人和组织问题的学生，但要避免只停留在“喜欢和人打交道”。"
    },
    supply_chain: {
      good: "下一步应补供应链基础、Excel分析和交付异常复盘案例。",
      background: "供应链岗位更看重专业/行业理解和执行稳定性，外企管培竞争会更高。",
      major: "理工、商科和运营管理背景更容易解释，其他专业需补流程和数据项目。",
      ability: "建议补执行、稳定性、数据分析和跨部门协调。",
      neutral: "适合作为实用型、稳定型商业岗位方向。"
    },
    legal_compliance: {
      good: "下一步应补合同、合规、风控或数据合规相关经历。",
      background: "法务合规对专业相关性较敏感，金融和互联网合规也看重规则意识。",
      major: "法律、公共政策、金融、数据背景更好解释，其他专业需要项目或证书补充。",
      ability: "建议补规则理解、材料严谨度和风险判断。",
      neutral: "适合偏理性、稳健、重视规则边界的学生。"
    },
    academic: {
      good: "下一步应明确研究方向、导师匹配和研究计划。",
      background: "科研路径更看重学术训练、研究成果、推荐信和长期投入。",
      major: "需要和研究方向形成连续性，跨方向申请要提前补研究经历。",
      ability: "建议补文献综述、研究方法、数据或实验能力。",
      neutral: "适合作为长期深耕路径，但要同时评估学术机会成本。"
    },
    crossborder: {
      good: "下一步应补海外市场分析、跨境运营或品牌出海项目。",
      background: "跨境方向更看重语言、市场敏感度、执行和商业结果，学校门槛相对灵活。",
      major: "商科、传媒、语言、国际关系都可迁移，但需要运营或市场作品。",
      ability: "建议补海外用户洞察、渠道分析和数据复盘。",
      neutral: "适合想连接语言/海外经历和商业岗位的学生。"
    }
  };
  return map[key];
}

function probability(score) {
  if (score >= 85) return "高，建议重点投入";
  if (score >= 72) return "中高，补强后成功率较高";
  if (score >= 60) return "中，有机会但需要项目/实习增强";
  if (score >= 45) return "中低，不建议作为唯一方向";
  return "低，需要调整路径或明显补强";
}

document.getElementById("prevBtn").addEventListener("click", () => {
  currentStep = Math.max(0, currentStep - 1);
  updateStep();
});

document.getElementById("nextBtn").addEventListener("click", async () => {
  const nextBtn = document.getElementById("nextBtn");
  if (currentStep === 1) refreshCapabilityQuestions();
  if (currentStep === steps.length - 1) {
    if (!validateRequiredRegistrantFields()) return;
    const originalText = nextBtn.textContent;
    nextBtn.disabled = true;
    nextBtn.textContent = "生成中...";
    ensureReportDataLoaded();
    await waitForNextPaint();
    generateReport({ autoRegister: false });
    currentStep = Math.min(steps.length - 1, currentStep + 1);
    updateStep();
    scheduleAutoRegisterLatestAssessmentResult();
    nextBtn.textContent = originalText;
    nextBtn.disabled = false;
    return;
  }
  currentStep = Math.min(steps.length - 1, currentStep + 1);
  updateStep();
});

document.getElementById("exportBtn").addEventListener("click", async () => {
  const exportBtn = document.getElementById("exportBtn");
  const originalText = exportBtn.textContent;
  exportBtn.disabled = true;
  exportBtn.textContent = "准备导出...";
  try {
    ensureReportDataLoaded();
    if (!reportHasRendered()) generateReport({ autoRegister: false });
    await waitForNextPaint();
    document.body.classList.add("is-printing-report");
    exportBtn.textContent = "正在打开...";
    window.setTimeout(() => {
      window.print();
      window.setTimeout(() => {
        document.body.classList.remove("is-printing-report");
        exportBtn.textContent = originalText;
        exportBtn.disabled = false;
      }, 600);
    }, 120);
  } catch (error) {
    console.error(error);
    document.body.classList.remove("is-printing-report");
    exportBtn.textContent = originalText;
    exportBtn.disabled = false;
    alert("导出暂时没有成功，请稍后重试或使用浏览器菜单里的分享/打印功能保存为PDF。");
  }
});

window.addEventListener("afterprint", () => {
  const exportBtn = document.getElementById("exportBtn");
  document.body.classList.remove("is-printing-report");
  if (exportBtn) {
    exportBtn.disabled = false;
    exportBtn.textContent = "导出PDF";
  }
});

function activePanel() {
  return document.querySelector(".panel.active");
}

function activePanelBounds() {
  const panel = activePanel();
  const actions = document.querySelector(".actions");
  if (!panel) return { top: 0, bottom: document.documentElement.scrollHeight };
  const panelRect = panel.getBoundingClientRect();
  const actionsRect = actions?.getBoundingClientRect();
  const top = panelRect.top + window.scrollY;
  const bottomFromPanel = panelRect.bottom + window.scrollY;
  const bottomFromActions = actionsRect ? actionsRect.bottom + window.scrollY : bottomFromPanel;
  return {
    top: Math.max(top - 12, 0),
    bottom: Math.max(bottomFromPanel, bottomFromActions) - window.innerHeight + 18
  };
}

function updateQuickScrollState() {
  const quickScroll = document.getElementById("quickScroll");
  const topBtn = document.getElementById("scrollTopBtn");
  const bottomBtn = document.getElementById("scrollBottomBtn");
  if (!quickScroll || !topBtn || !bottomBtn) return;
  const { top, bottom } = activePanelBounds();
  const currentY = window.scrollY;
  const canScroll = document.documentElement.scrollHeight > window.innerHeight + 260;
  const pastTop = currentY > top + 180;
  const nearBottom = currentY >= bottom - 80;
  quickScroll.classList.toggle("visible", canScroll && (pastTop || !nearBottom));
  topBtn.disabled = !pastTop;
  bottomBtn.disabled = nearBottom;
}

function setupQuickScroll() {
  const topBtn = document.getElementById("scrollTopBtn");
  const bottomBtn = document.getElementById("scrollBottomBtn");
  if (!topBtn || !bottomBtn) return;
  topBtn.addEventListener("click", () => {
    const { top } = activePanelBounds();
    window.scrollTo({ top, behavior: "smooth" });
  });
  bottomBtn.addEventListener("click", () => {
    const { bottom } = activePanelBounds();
    window.scrollTo({ top: Math.max(bottom, 0), behavior: "smooth" });
  });
  window.addEventListener("scroll", updateQuickScrollState, { passive: true });
  window.addEventListener("resize", updateQuickScrollState);
  updateQuickScrollState();
}

setupSchoolAutocomplete();
setupPrimaryInterestSelector();
setupMajorTypeAutofill();
refreshCapabilityQuestions();
renderQuestions("personalityQuestions", personalityQuestions, "personality");
setupSelectableStates();
setupQuickScroll();
initTabs();
updateStep();
