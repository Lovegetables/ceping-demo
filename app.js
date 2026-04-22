const steps = [
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
  ["execution", "长周期目标", "你计划半年后求职，但现在课程和生活都很忙。你会怎么安排？", [["制定每周固定求职任务，如改简历、练面试、投递、复盘", 3], ["等到招聘季开始后集中准备", 1], ["偶尔参加宣讲会和活动，保持了解", 2], ["先专注GPA，求职之后再补", 1]]],

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
  ["business", "看待公司增长", "你判断一家公司是否有发展潜力，会优先关注什么？", [["市场空间、竞争壁垒、商业模式、增长效率和团队执行", 3], ["公司品牌知名度和融资情况", 2], ["产品是否受自己和身边人喜欢", 1], ["薪资、办公环境和员工评价", 2]]]
].map((q, index) => ({ id: `C${index + 1}`, dimension: q[0], title: q[1], scene: q[2], options: q[3] }));

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
    jobs: "咨询顾问、PTA、战略实习、商业分析实习"
  },
  finance: {
    name: "金融投行/行研/投资",
    weights: { analytical: 5, communication: 4, execution: 5, creativity: 2, stability: 4, business: 5 },
    traits: { decision: "rational", social: "neutral", risk: "adventurous", structure: "rule" },
    gate: "高",
    jobs: "投行分析师、行研助理、投资实习、交易咨询"
  },
  internet: {
    name: "互联网产品/运营/数据",
    weights: { analytical: 4, communication: 4, execution: 4, creativity: 4, stability: 2, business: 5 },
    traits: { decision: "rational", social: "neutral", risk: "adventurous", structure: "free" },
    gate: "中高",
    jobs: "产品运营、用户增长、商业运营、数据分析"
  },
  fmcg: {
    name: "快消品牌/市场",
    weights: { analytical: 3, communication: 5, execution: 4, creativity: 5, stability: 2, business: 4 },
    traits: { decision: "neutral", social: "extrovert", risk: "neutral", structure: "free" },
    gate: "中高",
    jobs: "品牌市场、消费者洞察、Trade Marketing、管培生"
  },
  soe: {
    name: "国央企/事业单位",
    weights: { analytical: 3, communication: 3, execution: 3, creativity: 1, stability: 5, business: 2 },
    traits: { decision: "rational", social: "neutral", risk: "conservative", structure: "rule" },
    gate: "中高",
    jobs: "管培、综合管理、财务法务、项目管理"
  },
  creative: {
    name: "文娱/策展/内容创意",
    weights: { analytical: 2, communication: 4, execution: 3, creativity: 5, stability: 2, business: 3 },
    traits: { decision: "emotional", social: "neutral", risk: "adventurous", structure: "free" },
    gate: "中",
    jobs: "内容策划、策展助理、品牌内容、项目统筹"
  },
  ba: {
    name: "商业分析/数据分析",
    weights: { analytical: 5, communication: 3, execution: 3, creativity: 2, stability: 4, business: 4 },
    traits: { decision: "rational", social: "introvert", risk: "neutral", structure: "rule" },
    gate: "中高",
    jobs: "商业分析、数据分析、经营分析、策略分析"
  },
  policy: {
    name: "政策/公共事务",
    weights: { analytical: 4, communication: 5, execution: 3, creativity: 2, stability: 4, business: 3 },
    traits: { decision: "rational", social: "extrovert", risk: "conservative", structure: "rule" },
    gate: "中高",
    jobs: "公共事务、政策研究、国际组织项目、政府关系"
  }
};

let currentStep = 0;

function renderQuestions(targetId, questions, kind) {
  const root = document.getElementById(targetId);
  root.innerHTML = questions
    .map((q, idx) => `
      <article class="question-card">
        <div class="q-meta"><span>${q.id} · ${kind === "capability" ? dimensions[q.dimension] : traitDimensionName(q.dimension)}</span><span>${idx + 1}/${questions.length}</span></div>
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
      if (currentStep === 3) generateReport();
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
  return data;
}

function selectedValue(questionId) {
  const selected = document.querySelector(`input[name="${questionId}"]:checked`);
  return selected ? Number(selected.value) : null;
}

function scoreCapabilities() {
  const raw = Object.fromEntries(Object.keys(dimensions).map((key) => [key, 0]));
  const counts = Object.fromEntries(Object.keys(dimensions).map((key) => [key, 0]));
  capabilityQuestions.forEach((q) => {
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
  const score = Math.round(school * 0.45 + gpa * 0.25 + internship * 0.3);
  const level = score >= 85 ? "T1" : score >= 70 ? "T2" : score >= 55 ? "T3" : score >= 40 ? "T4" : "T5";
  return { score, level, schoolScore: school };
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

function scoreJob(job, capabilities, personality, background) {
  const weightSum = Object.values(job.weights).reduce((sum, val) => sum + val, 0);
  const capabilityScore = Object.entries(job.weights).reduce((sum, [key, weight]) => sum + capabilities[key] * weight, 0) / weightSum;
  const traitScores = Object.entries(job.traits).map(([key, expected]) => {
    const actual = personality[key].dominant;
    if (expected === "neutral" || actual === "neutral") return 70;
    if (actual === expected) return 95;
    return 42;
  });
  const personalityScore = traitScores.reduce((sum, val) => sum + val, 0) / traitScores.length;
  const highGate = job.gate === "高";
  const match = Math.round(capabilityScore * (highGate ? 0.4 : 0.5) + personalityScore * (highGate ? 0.2 : 0.25) + background.score * (highGate ? 0.4 : 0.25));
  return { capabilityScore: Math.round(capabilityScore), personalityScore: Math.round(personalityScore), match };
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
    .map(([key, job]) => ({ key, ...job, ...scoreJob(job, capabilities, personality, background) }))
    .sort((a, b) => b.match - a.match);
  const interestJobs = ranked.filter((job) => profile.interests.includes(job.key));
  const top = ranked.slice(0, 3);
  const strong = Object.entries(capabilities).sort((a, b) => b[1] - a[1]).slice(0, 2);
  const weak = Object.entries(capabilities).sort((a, b) => a[1] - b[1]).slice(0, 2);
  document.getElementById("reportRoot").className = "report-grid";
  document.getElementById("reportRoot").innerHTML = `
    <section class="report-block">
      <h3>用户画像总结</h3>
      <p>你的背景竞争力为 <strong>${background.level}</strong>，背景分 <strong>${background.score}/100</strong>。学校层级由系统根据学校名称自动估算，学校识别分为 <strong>${background.schoolScore}/100</strong>。系统判断你当前更适合从“可进入性较高、能力证明清晰”的方向切入，再根据实习和项目结果冲刺更高门槛岗位。</p>
      <div class="tag-row">
        ${Object.values(personality).map((item) => `<span class="tag">${item.label}</span>`).join("")}
      </div>
    </section>
    <section class="report-block">
      <h3>核心优势与短板</h3>
      <p>优势：${strong.map(([key]) => dimensions[key]).join("、")}。这些能力可作为简历和面试中的主卖点。</p>
      <p>短板：${weak.map(([key]) => dimensions[key]).join("、")}。若目标岗位高度依赖这些能力，需要先用项目或实习补证据。</p>
    </section>
    <section class="report-block wide">
      <h3>能力画像</h3>
      ${Object.entries(capabilities).map(([key, val]) => `
        <div class="metric-row">
          <span>${dimensions[key]}</span>
          <div class="bar"><span style="width:${val}%"></span></div>
          <strong>${val}</strong>
        </div>
      `).join("")}
    </section>
    <section class="report-block wide">
      <h3>职业路径推荐</h3>
      <div class="path-list">
        ${top.map((job, index) => `
          <article class="path-card">
            <strong>${index === 0 ? "主推荐：" : index === 1 ? "冲刺路径：" : "保底路径："}${job.name}</strong>
            <p>${pathReason(job, capabilities, personality)}</p>
            <div class="path-meta">
              <span class="pill">匹配度 ${job.match}/100</span>
              <span class="pill">进入难度 ${difficulty(job, background.level)}</span>
            </div>
            <p class="small-note">适合岗位：${job.jobs}</p>
          </article>
        `).join("")}
      </div>
    </section>
    <section class="report-block wide ${interestJobs.some((job) => job.match < 62) ? "danger" : "risk"}">
      <h3>兴趣冲突检测</h3>
      ${interestJobs.map((job) => conflictText(job, capabilities, background)).join("")}
    </section>
    <section class="report-block wide">
      <h3>未来3个月行动建议</h3>
      <div class="plan-columns">
        <div>
          <h3>第1个月：定位与基础</h3>
          <ul>
            <li>确定1个主申请方向、1个冲刺方向、1个保底方向。</li>
            <li>完成一版定向简历，突出${strong.map(([key]) => dimensions[key]).join("、")}。</li>
            <li>每周拆解2个真实JD，记录岗位关键词。</li>
            <li>补充Excel、SQL或行业研究基础，形成一份作品。</li>
          </ul>
        </div>
        <div>
          <h3>第2-3个月：项目与投递</h3>
          <ul>
            <li>申请${top[0].jobs.split("、").slice(0, 2).join("、")}相关实习。</li>
            <li>完成1份竞品分析、用户增长分析或品牌复盘作品。</li>
            <li>每周投递20-30个岗位，并记录反馈。</li>
            <li>每周做2次模拟面试，重点训练STAR和岗位理解。</li>
          </ul>
        </div>
      </div>
    </section>
    <section class="report-block wide">
      <h3>求职成功概率判断</h3>
      <p>${top.map((job) => `${job.name}：${probability(job.match)}`).join("；")}。</p>
      <p class="small-note">该判断不是录取承诺，而是基于背景、能力、性格与岗位门槛的相对成功率。</p>
    </section>
    <section class="report-block wide">
      <h3>下一步建议</h3>
      <p>建议围绕主推荐方向进行系统职业规划或求职辅导，重点完成方向确认、简历重构、项目包装和面试训练。当前最重要的不是泛泛投递，而是把经历转化为招聘方能识别的岗位能力证据。</p>
    </section>
  `;
}

function pathReason(job, capabilities) {
  const strongest = Object.entries(job.weights).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([key]) => dimensions[key]);
  const userStrong = Object.entries(capabilities).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([key]) => dimensions[key]);
  return `该方向核心要求为${strongest.join("、")}，与你当前的${userStrong.join("、")}有一定重合，可形成清晰求职叙事。`;
}

function conflictText(job, capabilities, background) {
  if (!job) return "<p>暂未识别目标兴趣，请回到背景信息选择目标方向。</p>";
  const weakRequired = Object.entries(job.weights).filter(([key, weight]) => weight >= 4 && capabilities[key] < 60).map(([key]) => dimensions[key]);
  if (job.match >= 75) {
    return `<p>你选择的兴趣方向是 <strong>${job.name}</strong>，当前综合匹配度较好。建议把它作为主线或重点冲刺方向，但仍需通过实习和项目增强市场可信度。</p>`;
  }
  if (background.score < 60 && job.gate !== "中") {
    return `<p>你对 <strong>${job.name}</strong> 感兴趣，但该方向背景门槛为${job.gate}，你的当前背景竞争力为${background.level}。建议先选择相邻跳板岗位，积累相关实习后再冲刺。</p>`;
  }
  if (weakRequired.length) {
    return `<p>你对 <strong>${job.name}</strong> 感兴趣，但该方向高度依赖${weakRequired.join("、")}，而这些是你当前相对薄弱的部分。建议先通过案例训练、项目作品或相关实习补强。</p>`;
  }
  return `<p>你对 <strong>${job.name}</strong> 感兴趣，当前匹配度中等。建议作为冲刺方向，同时保留更稳妥的主线和保底路径。</p>`;
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
  if (currentStep >= steps.length - 2) generateReport();
  currentStep = Math.min(steps.length - 1, currentStep + 1);
  updateStep();
});

document.getElementById("exportBtn").addEventListener("click", () => {
  generateReport();
  window.print();
});

renderQuestions("capabilityQuestions", capabilityQuestions, "capability");
renderQuestions("personalityQuestions", personalityQuestions, "personality");
initTabs();
updateStep();
