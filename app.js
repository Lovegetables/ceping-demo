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

const capabilityQuestions = [
  ["analytical", "业务数据下滑分析", "你在实习中发现某产品本月用户转化率下降了15%，负责人让你初步分析原因。", [["先拆分转化漏斗，比较不同渠道、用户群、时间段的数据变化", 3], ["先询问运营和销售同事近期是否有异常情况", 2], ["先查看竞品是否有类似活动或价格变化", 2], ["先根据直觉判断可能是活动力度不够", 1]]],
  ["analytical", "复杂商业问题", "你被要求分析“某品牌为什么在年轻人中增长放缓”。你会如何展开？", [["拆成用户、渠道、产品、价格、竞品、品牌认知几个模块逐一验证", 3], ["先做用户访谈，看看年轻人真实怎么评价这个品牌", 2], ["先研究行业报告，了解整体趋势", 2], ["先看社交媒体上大家怎么讨论该品牌", 1]]],
  ["analytical", "案例面试准备", "你准备咨询或商业分析类岗位的案例面试，最可能采用哪种方法？", [["系统练习市场规模、盈利提升、增长策略等题型，并复盘结构", 3], ["多看优秀案例答案，熟悉表达方式", 2], ["找同学模拟面试，提高临场反应", 2], ["主要依靠现场发挥，因为案例题没有标准答案", 1]]],
  ["analytical", "信息不完整时决策", "老板让你在2小时内判断一个新市场是否值得进入，但信息不完整。你会怎么做？", [["明确关键假设，用有限数据快速验证最影响结论的变量", 3], ["先搜索尽可能多的信息，避免遗漏", 2], ["根据类似市场经验做类比判断", 2], ["倾向于说明信息不足，暂不下结论", 1]]],

  ["communication", "汇报项目进展", "你需要向经理汇报一个项目延期问题。你会怎么说？", [["先说明结论和影响，再解释原因，最后给出补救方案和新时间表", 3], ["详细说明过程中遇到的困难，让经理理解延期原因", 2], ["先承认延期，再表示会尽快赶上", 1], ["等经理问到具体问题时再逐一解释", 1]]],
  ["communication", "强势同事协作", "你和一位强势同事负责同一项目，对方经常直接否定你的想法。你会如何处理？", [["私下沟通分歧点，用事实和目标对齐方案", 3], ["在会议中直接说明自己的理由，争取团队支持", 2], ["尽量减少冲突，按对方方式推进", 1], ["向上级反馈协作困难，请上级协调", 2]]],
  ["communication", "面试表达", "面试官问你“为什么适合这个岗位”，你会如何回答？", [["结合岗位要求，用经历证明自己具备对应能力", 3], ["说明自己对行业有兴趣，也愿意学习", 1], ["重点介绍自己的学校、专业和成绩", 2], ["讲述自己过往经历中最有成就感的事情", 2]]],
  ["communication", "跨部门沟通", "你需要推动设计、技术、运营三个团队配合上线一个功能。你会优先做什么？", [["明确目标、分工、时间节点和风险点，并同步给所有相关方", 3], ["先分别找关键负责人沟通，争取支持", 2], ["建一个群，把需求文档发进去", 1], ["先推动最熟悉的团队开始做，再逐步拉其他人加入", 2]]],

  ["execution", "多任务并行", "你同时面对课程论文、实习任务、社团活动三个截止日期。你会怎么处理？", [["按重要性和截止时间排序，拆分任务并设定每日交付节点", 3], ["先做最紧急的任务，其他任务之后再说", 2], ["先做自己最有把握完成的任务，减少压力", 1], ["和相关方沟通延期或调整预期", 2]]],
  ["execution", "高压交付", "实习期间，领导临时要求你第二天上午前完成一份分析材料。你会怎么做？", [["先确认交付标准和用途，再快速搭框架、补数据、优先完成核心部分", 3], ["直接开始查资料，尽可能做完整", 2], ["先问能否延长时间，避免质量不够", 1], ["找同学或同事帮忙一起完成", 2]]],
  ["execution", "任务被反复修改", "你完成的方案被领导连续修改三次，你会怎么反应？", [["主动总结每次修改背后的标准，确认最终方向后继续推进", 3], ["按照领导意见继续改，直到满意为止", 2], ["感到挫败，但会尽量完成", 1], ["询问是否一开始需求没有说清楚", 2]]],
  ["execution", "长周期目标", "你计划半年后求职，但现在课程和生活都很忙。你会怎么安排？", [["制定每周固定求职任务，如改简历、练面试、投递、复盘", 3], ["等到招聘季开始后集中准备", 1], ["偶尔参加宣讲会和活动，保持了解", 2], ["先专注GPA，求职之后再补", 1]], ["all"], true],

  ["creativity", "新活动策划", "你负责为一个校园品牌活动设计传播方案。你会怎么开始？", [["先研究目标人群兴趣和传播渠道，再设计有记忆点的互动形式", 3], ["参考同类活动中效果好的玩法并做调整", 2], ["先设计视觉海报和主题口号", 2], ["按照往年模板执行，降低出错风险", 1]]],
  ["creativity", "开放任务", "老师或领导给你一个很开放的任务：“研究一下AI对消费行业的影响”。你会怎么做？", [["先提出几个可能方向，如营销、供应链、客服、产品创新，再选择切入点", 3], ["先大量阅读报告和文章，寻找灵感", 2], ["先问清楚希望交付什么形式", 2], ["容易觉得范围太大，不知道从哪里开始", 1]]],
  ["creativity", "产品体验优化", "你发现一个App的注册流程很复杂。你会如何提出优化建议？", [["从用户路径、流失节点、心理成本和替代方案角度提出改进", 3], ["参考竞品注册流程，提出相似优化", 2], ["直接建议减少步骤，让用户更快完成", 2], ["认为这是技术或合规问题，自己不太适合判断", 1]]],
  ["creativity", "探索新机会", "你发现一个新兴行业很火，但自己了解不多。你会怎么做？", [["快速拆解行业链条、岗位类型和能力要求，判断是否值得投入", 3], ["找从业者聊天，了解真实工作内容", 2], ["先报名相关课程或活动，边学边看", 2], ["等行业更成熟后再考虑", 1]]],

  ["stability", "流程合规", "你在实习中发现一个流程可以更快完成，但可能不完全符合公司规定。你会怎么做？", [["先确认规定边界，在合规前提下提出优化方案", 3], ["如果风险不大，可以先按更快方式完成", 1], ["完全按照现有流程，不主动改变", 2], ["向负责人说明利弊，请其决定", 3]]],
  ["stability", "细节检查", "你需要提交一份重要材料，时间比较紧。你会怎么处理最后检查？", [["按清单检查数据、格式、引用、逻辑和错别字", 3], ["快速浏览一遍，确保没有明显错误", 2], ["主要检查自己最担心的部分", 2], ["时间紧就先提交，后续有问题再改", 1]]],
  ["stability", "长期稳定工作", "如果一份工作内容较稳定、流程清晰、晋升较慢但确定性强，你的看法是？", [["可以接受，如果平台和福利稳定，适合作为长期选择", 3], ["短期可以接受，但希望有成长空间", 2], ["会觉得缺乏挑战，不太愿意长期做", 1], ["取决于薪资和城市等现实因素", 2]]],
  ["stability", "规则与创新冲突", "你提出的新方案被告知“不符合既有流程”。你会怎么做？", [["了解流程背后的原因，再判断是否有调整空间", 3], ["如果方案确实更好，会继续争取", 2], ["尊重规则，先不推动", 2], ["觉得组织太保守，降低投入感", 1]]],

  ["business", "判断商业价值", "你想到一个校园二手交易平台的点子。你会优先验证什么？", [["用户需求频率、供需匹配效率、获客成本和变现方式", 3], ["同学们是否觉得这个想法有趣", 1], ["市面上有没有类似产品", 2], ["技术上能不能快速做出来", 2]]],
  ["business", "市场活动复盘", "一个品牌活动曝光量很高，但转化很低。你会如何判断问题？", [["分析目标人群是否精准、利益点是否明确、转化路径是否顺畅", 3], ["认为活动创意可能不够吸引人", 2], ["认为预算可能花在了不合适的渠道", 2], ["认为曝光已经不错，转化低也正常", 1]]],
  ["business", "实习中发现机会", "你在实习中发现用户经常反馈同一个问题，但团队还没重视。你会怎么做？", [["整理反馈频次、影响用户类型和潜在业务损失，形成建议", 3], ["在会议中提醒大家这个问题比较多", 2], ["先和运营同学聊聊是否确实重要", 2], ["觉得自己只是实习生，不适合主动提", 1]]],
  ["business", "看待公司增长", "你判断一家公司是否有发展潜力，会优先关注什么？", [["市场空间、竞争壁垒、商业模式、增长效率和团队执行", 3], ["公司品牌知名度和融资情况", 2], ["产品是否受自己和身边人喜欢", 1], ["薪资、办公环境和员工评价", 2]]],
  ["analytical", "咨询项目利润诊断", "客户是一家连锁餐饮品牌，利润率连续两个季度下降。项目组让你先做问题拆解。", [["先拆收入、成本、门店结构和客单价变化，再验证关键假设", 3], ["先找几家门店访谈，了解一线反馈", 2], ["先看同行是否也在降价或成本上升", 2], ["直接建议提升客单价或减少折扣", 1]], ["consulting", "ba"]],
  ["communication", "客户会议表达", "你需要在客户会议上说明一个不太受欢迎的结论。", [["先说明业务影响，再用证据解释，并给出可执行替代方案", 3], ["先铺垫研究过程，让客户更容易接受", 2], ["尽量弱化结论，避免现场冲突", 1], ["把问题交给项目经理主讲", 1]], ["consulting", "policy"]],
  ["business", "投资标的判断", "你需要快速判断一家消费公司的投资价值。", [["看市场空间、增长质量、利润结构、竞争壁垒和估值", 3], ["重点看融资新闻和创始人背景", 2], ["先判断自己是否喜欢这个产品", 1], ["先找几篇研报拼接核心观点", 2]], ["finance", "ba"]],
  ["stability", "金融材料校验", "你负责投行或行研材料中的关键数据表，提交前发现口径可能不一致。", [["暂停提交，核对数据来源、计算口径和引用页码", 3], ["先提交版本，再提醒团队后续可能需要更新", 1], ["只检查最重要的数据，其余保持原样", 2], ["请同事一起复核关键表格", 3]], ["finance"]],
  ["creativity", "品牌Campaign设计", "你要为一个新品设计校园传播活动。", [["基于目标人群洞察，设计主题、触点、转化路径和复盘指标", 3], ["参考爆款活动形式，快速改造成适合本品牌的版本", 2], ["先做视觉和slogan，让活动更有记忆点", 2], ["沿用去年模板，确保执行稳定", 1]], ["fmcg", "creative"]],
  ["communication", "品牌跨团队推进", "市场部、销售和代理商对活动目标理解不一致。", [["重新对齐目标、人群、渠道、预算和责任人", 3], ["分别沟通各方诉求，再折中推进", 2], ["先推进自己能控制的部分", 1], ["把分歧升级给负责人决定", 2]], ["fmcg"]],
  ["business", "产品需求优先级", "产品团队有三个需求都想排期：提升留存、增加收入、优化体验。", [["结合用户影响、业务价值、实现成本和验证周期排序", 3], ["优先做用户呼声最高的需求", 2], ["优先做领导最关注的需求", 1], ["先做开发成本最低的需求", 2]], ["internet"]],
  ["analytical", "数据异常判断", "运营看板显示某渠道新增用户暴涨，但付费没有变化。", [["检查埋点、渠道质量、用户行为和转化漏斗是否异常", 3], ["先判断这是一次成功拉新", 1], ["问渠道同事最近是否加了预算", 2], ["先等几天观察趋势", 1]], ["internet", "ba"]],
  ["stability", "国央企流程推进", "你在大型组织实习，需要推动一个跨部门流程，但审批链条较长。", [["先明确审批节点、材料要求和关键联系人，再按节奏推进", 3], ["找熟悉的同事帮忙加快流程", 2], ["直接催所有相关方尽快处理", 1], ["等流程自然推进，避免出错", 2]], ["soe"]],
  ["communication", "公共事务沟通", "你要向不同立场的利益相关方说明一个政策或项目方案。", [["分别识别关注点，用事实、影响和风险边界组织表达", 3], ["强调方案的正面意义，争取认同", 2], ["尽量避免谈敏感分歧", 1], ["把正式材料发给对方自行理解", 1]], ["policy", "soe"]],
  ["creativity", "策展内容选择", "你负责一个青年文化展览，需要确定内容线索。", [["先定义受众、主题叙事、作品关系和传播亮点", 3], ["先选自己最喜欢、最有审美感的内容", 2], ["参考成熟展览结构做改编", 2], ["优先选择执行最简单的内容", 1]], ["creative"]],
  ["execution", "作品集推进", "你想申请内容/策展/品牌岗位，但作品集一直没有完成。", [["拆成选题、素材、结构、视觉、复盘，每周固定交付", 3], ["等有灵感时集中完成", 1], ["先做最容易展示的部分", 2], ["找朋友一起督促推进", 2]], ["creative", "fmcg"], true]
].map((q, index) => ({ id: `C${index + 1}`, dimension: q[0], title: q[1], scene: q[2], options: q[3], tags: q[4] || ["all"], lead: Boolean(q[5]) }));

let activeCapabilityQuestions = capabilityQuestions.slice(0, 24);

const personalityQuestions = [
  ["decision", "选择实习机会", "你同时拿到两个实习offer：A公司平台更好但工作内容一般，B公司团队氛围很好但平台较小。", [["比较行业认可度、岗位含金量、后续跳槽价值后决定", "rational"], ["更看重团队氛围和自己是否喜欢", "emotional"], ["询问前辈建议后综合判断", "neutral"], ["选择让自己压力更小、体验更舒服的那个", "emotional"]]],
  ["decision", "项目方案选择", "团队讨论两个方案，一个数据证明更稳，一个更有创意但结果不确定。", [["选择数据更稳的方案", "rational"], ["选择更有创意的方案", "emotional"], ["小范围测试后再决定", "rational"], ["看团队大多数人更支持哪个", "neutral"]]],
  ["decision", "面试失利复盘", "你面试失败后，第一反应通常是？", [["复盘岗位要求和自己的回答差距", "rational"], ["会明显受到情绪影响，先缓一缓", "emotional"], ["找人聊聊，听听外部反馈", "neutral"], ["重新整理简历和面试话术", "rational"]]],
  ["decision", "接受反馈", "领导指出你的方案“不够好”。你更可能？", [["追问具体标准和修改方向", "rational"], ["先感到受挫，再慢慢调整", "emotional"], ["观察领导过去喜欢什么风格", "neutral"], ["立刻对照目标重新改方案", "rational"]]],
  ["decision", "职业选择依据", "你选择职业方向时，最看重什么？", [["行业前景、薪资、成长路径和简历价值", "rational"], ["自己是否喜欢、是否有意义感", "emotional"], ["家庭、前辈、朋友的综合建议", "neutral"], ["工作氛围和生活状态是否舒服", "emotional"]]],

  ["social", "高强度沟通岗位", "如果一份工作每天需要大量开会、客户沟通和跨部门协调，你会觉得？", [["可以接受，甚至会觉得有动力", "extrovert"], ["可以完成，但会消耗比较大", "introvert"], ["取决于沟通对象和议题", "neutral"], ["更希望有独立思考和产出的时间", "introvert"]]],
  ["social", "Networking场景", "参加行业交流活动时，你通常会？", [["主动认识新朋友，交换信息", "extrovert"], ["和熟悉的人一起行动", "introvert"], ["有目标地认识几位关键人士", "neutral"], ["更愿意会后通过邮件或LinkedIn联系", "introvert"]]],
  ["social", "团队合作方式", "你更喜欢哪种工作方式？", [["团队头脑风暴，边讨论边推进", "extrovert"], ["先独立思考，再带着观点讨论", "introvert"], ["根据任务性质选择合作方式", "neutral"], ["多人协作能让我更有状态", "extrovert"]]],
  ["social", "客户汇报", "如果需要你向客户做正式汇报，你会？", [["愿意承担，展示成果也是影响力的一部分", "extrovert"], ["可以做，但需要充分准备", "neutral"], ["更希望由表达更强的同事主讲", "introvert"], ["如果内容是自己负责的，可以接受", "neutral"]]],
  ["social", "工作能量恢复", "忙碌一周后，你更倾向于如何恢复状态？", [["参加社交活动，换换环境", "extrovert"], ["独处、整理、休息", "introvert"], ["和少数亲近朋友见面", "neutral"], ["做一些不需要太多沟通的事情", "introvert"]]],

  ["risk", "初创公司机会", "你拿到一个早期创业公司的offer，薪资一般但成长空间大。", [["如果商业模式和团队靠谱，愿意尝试", "adventurous"], ["更倾向选择大公司或稳定平台", "conservative"], ["看是否有其他更稳的offer", "conservative"], ["短期试试看，但会设置止损点", "neutral"]]],
  ["risk", "转专业求职", "你想转向一个和专业不完全相关的行业，但需要重新积累。", [["如果方向有潜力，愿意投入时间转型", "adventurous"], ["优先选择和专业更相关的方向", "conservative"], ["先做相关项目或实习验证", "neutral"], ["担心沉没成本，不轻易转", "conservative"]]],
  ["risk", "高薪高压选择", "一份工作薪资高、成长快，但工作强度明显高。", [["年轻阶段可以接受，用几年换成长", "adventurous"], ["会谨慎考虑身体和生活状态", "conservative"], ["取决于是否能带来明显职业跃迁", "neutral"], ["不太愿意长期高压", "conservative"]]],
  ["risk", "不确定任务", "领导给你一个没人做过的新项目，没有明确方法。", [["兴奋，愿意从0到1探索", "adventurous"], ["希望先有明确目标和资源支持", "conservative"], ["可以做，但会先拆风险和边界", "neutral"], ["更适合执行成熟任务", "conservative"]]],
  ["risk", "职业城市选择", "如果一个城市机会更多但生活成本高、竞争激烈，你会？", [["愿意去，机会密度更重要", "adventurous"], ["更看重生活稳定和综合成本", "conservative"], ["先看行业机会和收入是否覆盖成本", "neutral"], ["会选择自己熟悉、支持系统更强的城市", "conservative"]]],

  ["structure", "工作流程", "你更喜欢哪种工作环境？", [["目标、流程、分工清楚，知道标准是什么", "rule"], ["有较大自主空间，可以自己定义方法", "free"], ["关键节点清楚，但执行方式灵活", "neutral"], ["不喜欢流程过多，希望快速试错", "free"]]],
  ["structure", "绩效评价", "你更希望绩效如何被评价？", [["有明确指标和评价标准", "rule"], ["看实际影响力和创新价值", "free"], ["指标和主观评价结合", "neutral"], ["不希望被过细流程束缚", "free"]]],
  ["structure", "入职培训", "刚进入一家公司时，你更希望？", [["有系统培训、流程文档和明确导师", "rule"], ["快速进入真实项目，边做边学", "free"], ["先了解基本规则，再实践", "neutral"], ["希望有清晰边界，避免踩坑", "rule"]]],
  ["structure", "任务管理", "你通常如何管理任务？", [["用清单、日程、优先级管理", "rule"], ["根据灵感和状态灵活安排", "free"], ["重要任务会计划，其他灵活处理", "neutral"], ["不喜欢太死的计划，但会保证结果", "free"]]],
  ["structure", "公司制度", "如果公司制度较多、审批较慢，但资源稳定，你会？", [["可以接受，稳定组织需要规则", "rule"], ["会觉得效率低，影响发挥", "free"], ["取决于制度是否合理", "neutral"], ["如果长期发展好，可以适应", "rule"]]]
].map((q, index) => ({ id: `P${index + 1}`, dimension: q[0], title: q[1], scene: q[2], options: q[3] }));

const jobProfiles = {
  consulting: {
    name: "战略/管理咨询",
    weights: { analytical: 5, communication: 5, execution: 5, creativity: 3, stability: 2, business: 4 },
    traits: { decision: "rational", social: "extrovert", risk: "adventurous", structure: "free" },
    gate: "高",
    jobs: "咨询顾问、PTA、战略实习、商业分析实习",
    majors: ["business", "stem", "social"]
  },
  finance: {
    name: "金融投行/行研/投资",
    weights: { analytical: 5, communication: 4, execution: 5, creativity: 2, stability: 4, business: 5 },
    traits: { decision: "rational", social: "neutral", risk: "adventurous", structure: "rule" },
    gate: "高",
    jobs: "投行分析师、行研助理、投资实习、交易咨询",
    majors: ["business", "stem"]
  },
  internet: {
    name: "互联网产品/运营/数据",
    weights: { analytical: 4, communication: 4, execution: 4, creativity: 4, stability: 2, business: 5 },
    traits: { decision: "rational", social: "neutral", risk: "adventurous", structure: "free" },
    gate: "中高",
    jobs: "产品运营、用户增长、商业运营、数据分析",
    majors: ["business", "stem", "media"]
  },
  fmcg: {
    name: "快消品牌/市场",
    weights: { analytical: 3, communication: 5, execution: 4, creativity: 5, stability: 2, business: 4 },
    traits: { decision: "neutral", social: "extrovert", risk: "neutral", structure: "free" },
    gate: "中高",
    jobs: "品牌市场、消费者洞察、Trade Marketing、管培生",
    majors: ["business", "media", "social"]
  },
  soe: {
    name: "国央企/事业单位",
    weights: { analytical: 3, communication: 3, execution: 3, creativity: 1, stability: 5, business: 2 },
    traits: { decision: "rational", social: "neutral", risk: "conservative", structure: "rule" },
    gate: "中高",
    jobs: "管培、综合管理、财务法务、项目管理",
    majors: ["business", "stem", "social"]
  },
  creative: {
    name: "文娱/策展/内容创意",
    weights: { analytical: 2, communication: 4, execution: 3, creativity: 5, stability: 2, business: 3 },
    traits: { decision: "emotional", social: "neutral", risk: "adventurous", structure: "free" },
    gate: "中",
    jobs: "内容策划、策展助理、品牌内容、项目统筹",
    majors: ["media", "social", "business"]
  },
  ba: {
    name: "商业分析/数据分析",
    weights: { analytical: 5, communication: 3, execution: 3, creativity: 2, stability: 4, business: 4 },
    traits: { decision: "rational", social: "introvert", risk: "neutral", structure: "rule" },
    gate: "中高",
    jobs: "商业分析、数据分析、经营分析、策略分析",
    majors: ["stem", "business"]
  },
  policy: {
    name: "政策/公共事务",
    weights: { analytical: 4, communication: 5, execution: 3, creativity: 2, stability: 4, business: 3 },
    traits: { decision: "rational", social: "extrovert", risk: "conservative", structure: "rule" },
    gate: "中高",
    jobs: "公共事务、政策研究、国际组织项目、政府关系",
    majors: ["social", "business", "media"]
  }
};

let currentStep = 0;

function renderQuestions(targetId, questions, kind) {
  const root = document.getElementById(targetId);
  root.innerHTML = questions
    .map((q, idx) => `
      <article class="question-card">
        <div class="q-meta"><span>${q.id} · ${kind === "capability" ? dimensions[q.dimension] : traitDimensionName(q.dimension)}${q.lead ? " · 求职规划线索" : ""}</span><span>${idx + 1}/${questions.length}</span></div>
        <div class="q-title">${q.title}：${q.scene}</div>
        <div class="option-grid">
          ${q.options.map((option, optionIndex) => `
            <label class="option-item">
              <input type="radio" name="${q.id}" value="${optionIndex}" />
              ${String.fromCharCode(65 + optionIndex)}. ${option[0]}
            </label>
          `).join("")}
        </div>
      </article>
    `)
    .join("");
}

function traitDimensionName(key) {
  return {
    decision: "决策风格",
    social: "社交能量",
    risk: "风险偏好",
    structure: "结构偏好"
  }[key];
}

function initTabs() {
  document.getElementById("stepTabs").innerHTML = steps
    .map((step, idx) => `<button class="step-tab" data-step="${idx}" type="button">${idx + 1}. ${step.name}</button>`)
    .join("");
  document.querySelectorAll(".step-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      currentStep = Number(tab.dataset.step);
      if (currentStep === 2) refreshCapabilityQuestions();
      if (currentStep === 4) generateReport();
      updateStep();
    });
  });
}

function updateStep() {
  steps.forEach((step, idx) => {
    document.getElementById(`panel-${step.id}`).classList.toggle("active", idx === currentStep);
  });
  document.querySelectorAll(".step-tab").forEach((tab, idx) => {
    tab.classList.toggle("active", idx === currentStep);
  });
  document.getElementById("progressBar").style.width = `${((currentStep + 1) / steps.length) * 100}%`;
  document.getElementById("stepBadge").textContent = `${currentStep + 1} / ${steps.length}`;
  document.getElementById("prevBtn").disabled = currentStep === 0;
  document.getElementById("nextBtn").textContent = currentStep === steps.length - 1 ? "重新生成报告" : currentStep === steps.length - 2 ? "生成报告" : "下一步";
  document.getElementById("exportBtn").classList.toggle("visible", currentStep === steps.length - 1);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getFormData() {
  const form = document.getElementById("profileForm");
  const data = Object.fromEntries(new FormData(form).entries());
  data.interests = Array.from(form.querySelectorAll('input[name="interest"]:checked')).map((item) => item.value);
  if (!data.interests.length) data.interests = ["internet"];
  data.projects = Array.from(form.querySelectorAll('input[name="projects"]:checked')).map((item) => item.value);
  return data;
}

function refreshCapabilityQuestions() {
  const profile = getFormData();
  const common = capabilityQuestions.filter((q) => q.tags.includes("all"));
  const directionSpecific = capabilityQuestions.filter((q) => !q.tags.includes("all") && q.tags.some((tag) => profile.interests.includes(tag)));
  const requiredDimensions = Object.keys(dimensions);
  const balanced = [];
  requiredDimensions.forEach((dimension) => {
    common.filter((q) => q.dimension === dimension).slice(0, 2).forEach((q) => {
      if (!balanced.includes(q)) balanced.push(q);
    });
    directionSpecific.filter((q) => q.dimension === dimension).slice(0, 3).forEach((q) => {
      if (!balanced.includes(q)) balanced.push(q);
    });
  });
  if (balanced.length < 20) {
    common.forEach((q) => {
      if (balanced.length < 24 && !balanced.includes(q)) balanced.push(q);
    });
  }
  activeCapabilityQuestions = balanced.slice(0, 28);
  document.getElementById("capabilityHint").innerHTML = `<h3>本轮题库已按目标方向调整</h3><p>当前选择方向：${profile.interests.map((key) => jobProfiles[key].name).join("、")}。系统会保留通用职场题，同时增加这些方向更常见的真实工作场景题；带“求职规划线索”的题目会在报告中作为服务承接信号输出。</p>`;
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
  const school = inferSchoolScore([profile.phdSchool, profile.gradSchool, profile.undergradSchool]);
  const gpas = [profile.undergradGpa, profile.gradGpa, profile.phdGpa].map(Number).filter(Boolean);
  const gpa = gpas.length ? Math.max(...gpas) : 65;
  const internship = Number(profile.internship || 50);
  const projectBoost = Math.min((profile.projects || []).length * 3, 12);
  const score = Math.min(100, Math.round(school * 0.42 + gpa * 0.23 + internship * 0.28 + projectBoost));
  const level = score >= 85 ? "T1" : score >= 70 ? "T2" : score >= 55 ? "T3" : score >= 40 ? "T4" : "T5";
  return { score, level, schoolScore: school, projectBoost };
}

function inferSchoolScore(schools) {
  const text = schools.filter(Boolean).join(" ").toLowerCase();
  if (!text.trim()) return 65;
  const tier1 = [
    "harvard", "stanford", "mit", "massachusetts institute", "oxford", "cambridge",
    "princeton", "yale", "columbia", "upenn", "pennsylvania", "chicago", "berkeley",
    "caltech", "imperial", "lse", "ucl", "清华", "北大", "北京大学", "清华大学",
    "复旦", "上海交通", "交大", "浙江大学", "港大", "香港大学", "港科", "香港科技",
    "港中文", "新加坡国立", "nus", "南洋理工", "ntu"
  ];
  const tier2 = [
    "duke", "northwestern", "cornell", "johns hopkins", "michigan", "nyu",
    "carnegie", "cmu", "edinburgh", "manchester", "warwick", "kcl", "king's",
    "bristol", "melbourne", "sydney", "unsw", "多伦多", "toronto", "ubc",
    "麦吉尔", "mcgill", "人大", "中国人民大学", "南京大学", "中科大", "中国科学技术",
    "同济", "北航", "南开", "厦门大学", "武汉大学", "中山大学", "985"
  ];
  const tier3 = [
    "211", "qs100", "qs 100", "qs前100", "qs200", "qs 200", "qs前200",
    "一本", "双一流", "queen mary", "glasgow", "leeds", "birmingham",
    "southampton", "sheffield", "nottingham", "monash", "queensland"
  ];
  if (tier1.some((item) => text.includes(item))) return 90;
  if (tier2.some((item) => text.includes(item))) return 80;
  if (tier3.some((item) => text.includes(item))) return 65;
  if (text.includes("普通") || text.includes("双非") || text.includes("college")) return 50;
  return 62;
}

function majorFit(profile, job) {
  const gradType = profile.gradMajorType && profile.gradMajorType !== "none" ? profile.gradMajorType : null;
  const undergradType = profile.undergradMajorType || "other";
  const gradScore = gradType ? (job.majors.includes(gradType) ? 92 : gradType === "other" ? 62 : 58) : null;
  const undergradScore = job.majors.includes(undergradType) ? 84 : undergradType === "other" ? 62 : 55;
  return gradScore ? Math.round(gradScore * 0.65 + undergradScore * 0.35) : undergradScore;
}

function scoreJob(job, capabilities, personality, background, profile) {
  const weightSum = Object.values(job.weights).reduce((sum, val) => sum + val, 0);
  const capabilityScore = Object.entries(job.weights).reduce((sum, [key, weight]) => sum + capabilities[key] * weight, 0) / weightSum;
  const majorScore = majorFit(profile, job);
  const traitScores = Object.entries(job.traits).map(([key, expected]) => {
    const actual = personality[key].dominant;
    if (expected === "neutral" || actual === "neutral") return 70;
    if (actual === expected) return 95;
    return 42;
  });
  const personalityScore = traitScores.reduce((sum, val) => sum + val, 0) / traitScores.length;
  const highGate = job.gate === "高";
  const match = Math.round(capabilityScore * (highGate ? 0.36 : 0.45) + personalityScore * (highGate ? 0.18 : 0.22) + background.score * (highGate ? 0.34 : 0.23) + majorScore * 0.12);
  return { capabilityScore: Math.round(capabilityScore), personalityScore: Math.round(personalityScore), majorScore, match };
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

function generateReport() {
  const profile = getFormData();
  const capabilities = scoreCapabilities();
  const personality = scorePersonality();
  const background = scoreBackground(profile);
  const ranked = Object.entries(jobProfiles)
    .map(([key, job]) => ({ key, ...job, ...scoreJob(job, capabilities, personality, background, profile) }))
    .sort((a, b) => b.match - a.match);
  const interestJobs = ranked.filter((job) => profile.interests.includes(job.key));
  const top = ranked.slice(0, 3);
  const strong = Object.entries(capabilities).sort((a, b) => b[1] - a[1]).slice(0, 2);
  const weak = Object.entries(capabilities).sort((a, b) => a[1] - b[1]).slice(0, 2);
  const leadSignals = activeCapabilityQuestions
    .filter((q) => q.lead && selectedValue(q.id) !== null && q.options[selectedValue(q.id)][1] <= 2)
    .map((q) => q.title);
  document.getElementById("reportRoot").className = "report-grid";
  document.getElementById("reportRoot").innerHTML = `
    <section class="report-block">
      <h3>用户画像总结</h3>
      <p>你的背景竞争力为 <strong>${background.level}</strong>，背景分 <strong>${background.score}/100</strong>。学校识别分为 <strong>${background.schoolScore}/100</strong>，校园项目加成为 <strong>${background.projectBoost}</strong> 分。</p>
      <p>${profileNarrative(profile, background, top[0])}</p>
      <p>${personalitySummary(personality)}</p>
    </section>
    <section class="report-block">
      <h3>核心优势与短板</h3>
      <p>优势：${strong.map(([key]) => dimensions[key]).join("、")}。建议放在简历项目描述和面试案例的前半段，作为招聘方最先看到的能力证据。</p>
      <p>短板：${weak.map(([key]) => dimensions[key]).join("、")}。短板不代表不能申请，而是需要用训练、项目或实习把风险降下来。</p>
      <p class="small-note">${industryAbilityNote(top[0], strong, weak)}</p>
    </section>
    <section class="report-block wide">
      <h3>能力画像：企业为什么看这些能力</h3>
      ${Object.entries(capabilities).map(([key, val]) => `
        <div class="metric-row">
          <span>${dimensions[key]}</span>
          <div class="bar"><span style="width:${val}%"></span></div>
          <strong>${val}</strong>
        </div>
      `).join("")}
      <div class="insight-list">
        ${Object.entries(capabilities).map(([key, val]) => `<div class="insight-item"><strong>${dimensions[key]}</strong>：${abilityExplain(key, val)}</div>`).join("")}
      </div>
    </section>
    <section class="report-block wide">
      <h3>职业路径推荐</h3>
      <div class="path-list">
        ${top.map((job, index) => `
          <article class="path-card">
            <strong>${index === 0 ? "主推荐：" : index === 1 ? "冲刺路径：" : "保底路径："}${job.name}</strong>
            <p>${pathReason(job, capabilities, personality, profile)}</p>
            <div class="path-meta">
              <span class="pill">匹配度 ${job.match}/100</span>
              <span class="pill">进入难度 ${difficulty(job, background.level)}</span>
              <span class="pill">专业匹配 ${job.majorScore}/100</span>
            </div>
            <p class="small-note">适合岗位：${job.jobs}</p>
          </article>
        `).join("")}
      </div>
    </section>
    <section class="report-block wide ${interestJobs.some((job) => job.match < 62) ? "danger" : "risk"}">
      <h3>兴趣冲突检测</h3>
      ${interestJobs.map((job) => conflictText(job, capabilities, background, profile)).join("")}
    </section>
    <section class="report-block wide">
      <h3>测评结果解读</h3>
      <div class="insight-list">
        ${studentResultInsights(profile, background, top).map((text) => `<div class="insight-item">${text}</div>`).join("")}
      </div>
    </section>
    <section class="report-block wide">
      <h3>未来行动建议</h3>
      <div class="path-list">
        <div>
          <h3>未来3个月：明确方向并补证据</h3>
          <ul>
            <li>确定1个主申请方向、1个冲刺方向、1个保底方向。</li>
            <li>完成一版定向简历，突出${strong.map(([key]) => dimensions[key]).join("、")}。</li>
            <li>每周拆解2个真实JD，记录岗位关键词。</li>
            <li>完成1份与${top[0].name}相关的项目作品或行业分析。</li>
          </ul>
        </div>
        <div>
          <h3>未来6个月：形成实习和面试竞争力</h3>
          <ul>
            <li>集中申请${top[0].jobs.split("、").slice(0, 2).join("、")}相关实习。</li>
            <li>建立投递表，持续跟踪岗位、反馈、面试问题和改进点。</li>
            <li>每周做2次模拟面试，重点训练STAR、岗位理解和项目复盘。</li>
            <li>补齐目标岗位要求的工具或技能，如Excel、SQL、行业研究、英文表达。</li>
          </ul>
        </div>
        <div>
          <h3>未来1年：完成路径验证和求职闭环</h3>
          <ul>
            <li>至少积累1段强相关实习或2个可展示项目。</li>
            <li>根据实习反馈判断是否坚持主线方向，或转向相邻岗位。</li>
            <li>提前准备秋招/春招批次，区分冲刺、主投、保底岗位。</li>
            <li>形成稳定的简历版本、面试故事库和作品集材料。</li>
          </ul>
        </div>
      </div>
    </section>
    <section class="report-block wide">
      <h3>求职成功概率判断</h3>
      <div class="prob-table">
        ${top.map((job) => `<div class="prob-row"><strong>${job.name}</strong><span>${job.match}/100</span><span>${probability(job.match)}</span></div>`).join("")}
      </div>
      <p class="small-note">该判断不是录取承诺，而是基于背景、能力、性格与岗位门槛的相对成功率。</p>
    </section>
    <section class="report-block wide">
      <h3>下一步行动建议</h3>
      <p>建议先领取与你目标方向相关的行业/专业解析资料，例如岗位JD拆解、目标专业就业路径、校招时间线、简历项目模板。</p>
      <p>如果你出现了方向过多、经历包装不足、投递节奏不清晰等情况，建议进入系统求职规划服务，重点完成方向收敛、简历重构、项目补强和面试训练。${leadSignals.length ? `本次测评识别到的规划线索：${leadSignals.join("、")}。` : "本次未出现明显强转化线索，可先以资料领取和方向答疑承接。"}</p>
    </section>
  `;
}

function pathReason(job, capabilities, personality, profile) {
  const strongest = Object.entries(job.weights).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([key]) => dimensions[key]);
  const userStrong = Object.entries(capabilities).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([key]) => dimensions[key]);
  const majorText = job.majorScore >= 80 ? "专业背景对该方向有支撑" : job.majorScore >= 65 ? "专业背景可迁移，但需要项目证明" : "专业背景关联度偏弱，需要跳板经历";
  return `该方向核心要求为${strongest.join("、")}，与你当前的${userStrong.join("、")}有一定重合。${majorText}，建议围绕${profile.projects && profile.projects.length ? "已有项目经历" : "1个新项目作品"}补充岗位证据。`;
}

function conflictText(job, capabilities, background, profile) {
  if (!job) return "<p>暂未识别目标兴趣，请回到背景信息选择目标方向。</p>";
  const weakRequired = Object.entries(job.weights).filter(([key, weight]) => weight >= 4 && capabilities[key] < 60).map(([key]) => dimensions[key]);
  const directionAdvice = conflictAdviceByJob(job.key);
  if (job.match >= 75) {
    return `<p><strong>${job.name}</strong>：当前综合匹配度较好，可作为主线或重点冲刺方向。${directionAdvice.good}</p>`;
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
  return `<p><strong>${job.name}</strong>：当前匹配度中等。${directionAdvice.neutral}</p>`;
}

function profileNarrative(profile, background, topJob) {
  const grad = profile.gradMajorType && profile.gradMajorType !== "none";
  const degreeText = grad ? "研究生专业" : "本科专业";
  const projectText = profile.projects && profile.projects.length ? "已有校园项目可以被包装成岗位证据" : "目前项目证据偏少，需要补一段可展示作品";
  const backgroundText = background.level === "T1" || background.level === "T2"
    ? "在多数主流校招岗位中具备进入候选池的基础"
    : "申请高门槛岗位时需要更依赖实习、项目和技能证明";
  return `从招聘视角看，你的${degreeText}与${topJob.name}的专业匹配分为${topJob.majorScore}/100，${backgroundText}。${projectText}，否则简历容易停留在“背景描述”，而不是“岗位能力证明”。`;
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

function studentResultInsights(profile, background, topJobs) {
  const insights = [];
  insights.push(`背景解读：你的当前背景等级为${background.level}。这会影响部分岗位的简历筛选难度，但不是唯一决定因素。学校和GPA越难改变，越需要用实习、项目、作品和面试表现来补充证明。`);
  insights.push(`专业解读：你的本科专业类型是${majorTypeName(profile.undergradMajorType)}，研究生专业类型是${majorTypeName(profile.gradMajorType)}。如果目标方向和专业不完全一致，建议优先选择能展示迁移能力的项目，例如行业研究、数据分析、产品分析或品牌策划。`);
  insights.push(`方向解读：当前最建议优先考虑${topJobs[0].name}，同时把${topJobs[1].name}作为冲刺或相邻方向。这样既能保留兴趣空间，也能避免只押注一个高风险方向。`);
  insights.push(`经历解读：如果你还没有强相关实习，不建议只靠“我感兴趣、我愿意学习”来申请。更有效的做法是先做出一份能展示岗位能力的作品，再用它支持简历和面试。`);
  return insights;
}

function majorTypeName(type) {
  return {
    business: "商科/经济/管理",
    stem: "理工科/数据/计算机",
    social: "社科/公共政策/法律",
    media: "传媒/语言/艺术/人文",
    other: "其他或暂不确定",
    none: "无研究生学历"
  }[type] || "未填写";
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

document.getElementById("nextBtn").addEventListener("click", () => {
  if (currentStep === 1) refreshCapabilityQuestions();
  if (currentStep >= steps.length - 2) generateReport();
  currentStep = Math.min(steps.length - 1, currentStep + 1);
  updateStep();
});

document.getElementById("exportBtn").addEventListener("click", () => {
  generateReport();
  window.print();
});

refreshCapabilityQuestions();
renderQuestions("personalityQuestions", personalityQuestions, "personality");
initTabs();
updateStep();
