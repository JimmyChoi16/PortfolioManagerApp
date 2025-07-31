export default {
  // Common
  common: {
    loading: '加载中...',
    noData: '暂无数据',
    error: '错误',
    success: '成功',
    cancel: '取消',
    save: '保存',
    edit: '编辑',
    delete: '删除',
    confirm: '确认',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    close: '关闭',
    submit: '提交',
    reset: '重置',
    search: '搜索',
    filter: '筛选',
    sort: '排序',
    refresh: '刷新',
    export: '导出',
    import: '导入',
    download: '下载',
    upload: '上传',
    view: '查看',
    details: '详情',
    actions: '操作'
  },

  // Navigation
  nav: {
    home: '首页',
    dashboard: '仪表板',
    portfolio: '投资组合',
    holdings: '持仓',
    bonds: '债券',
    stock: '股票',
    fund: '基金',
    cash: '现金',
    analytics: '分析',
    performance: '表现',
    allocation: '配置',
    settings: '设置',
    profile: '个人资料',
    logout: '退出登录',
    login: '登录'
  },

  // Home Page
  home: {
    title: '欢迎使用投资组合管理器！',
    subtitle: '监控股票、债券、现金等多种资产——一站式管理。',
    description: '智能、简单的方式来跟踪和管理您的投资。深入了解您的投资组合表现，做出数据驱动的决策，轻松实现您的财务目标。',
    aboutTitle: '什么是投资组合管理器？',
    aboutDesc: '投资组合管理器是一个直观的平台，旨在帮助像您这样的投资者实时管理、跟踪和分析您的财务投资组合。无论您持有股票、债券、基金还是现金，投资组合管理器都会集中管理您的资产，让您始终清楚地了解您的投资表现。',
    features: {
      title: '主要功能',
      realTime: '实时市场数据',
      analytics: '高级分析',
      portfolio: '投资组合管理',
      bonds: '债券投资组合',
      performance: '表现跟踪',
      allocation: '资产配置',
      privacy: '简单、安全且私密'
    },
    getStarted: '开始使用',
    learnMore: '了解更多'
  },

  // Dashboard
  dashboard: {
    title: '仪表板',
    overview: '投资组合概览',
    totalValue: '投资组合总价值',
    totalGain: '总盈亏',
    totalHoldings: '总持仓数',
    bestPerformer: '表现最佳',
    worstPerformer: '表现最差',
    performanceMetrics: '表现指标',
    cagr: '年复合增长率',
    sharpeRatio: '夏普比率',
    maxDrawdown: '最大回撤',
    recentActivity: '最近活动',
    marketTrends: '市场趋势'
  },

  // Stock Section
  stock: {
    title: '股票投资组合',
    subtitle: '通过实时市场数据跟踪和分析您的股票投资',
    loginWarning: '⚠️ 您尚未登录。显示的所有数据仅供演示使用。',
    noHoldings: '暂无股票持仓',
    noHoldingsDesc: '您还没有任何股票持仓。添加一些股票开始吧！',
    addStockHolding: '添加股票持仓',
    performanceMetrics: '表现指标',
    cagr: '年化收益率',
    cagrDesc: '年化回报',
    sharpeRatio: '夏普比率',
    sharpeDesc: '风险调整后',
    maxDrawdown: '最大回撤',
    drawdownDesc: '最大损失',
    portfolioPerformance: '股票投资组合表现',
    totalValue: '总价值',
    totalHoldings: '总持仓',
    stockPositions: '股票仓位',
    bestPerformer: '最佳表现',
    worstPerformer: '最差表现',
    realtimeHoldings: '您的实时股票持仓',
    addHolding: '添加持仓',
    noHoldingsYet: '暂无持仓',
    noHoldingsYetDesc: '通过添加您的第一个股票持仓开始构建投资组合。',
    previous: '上一页',
    next: '下一页',
    page: '第',
    of: '页，共',
    addNewHolding: '添加新股票持仓',
    symbol: '代码',
    symbolPlaceholder: '例如：AAPL, SH600519',
    name: '名称',
    quantity: '数量',
    purchasePrice: '购买价格',
    purchaseDate: '购买日期',
    selectPurchaseDate: '选择购买日期',
    sector: '行业',
    selectSector: '选择行业',
    notes: '备注',
    notesPlaceholder: '附加备注...',
    save: '保存',
    cancel: '取消',
    sell: '卖出',
    viewDetails: '查看详情',
    holdingDetails: '持仓详情',
    summary: '摘要',
    individualHoldings: '个人持仓',
    purchaseValue: '购买价值',
    currentValue: '当前价值',
    gainLoss: '盈亏',
    gainLossPercent: '盈亏百分比',
    actions: '操作',
    close: '关闭',
    noDataAvailable: '暂无数据',
    // Table headers
    tableHeaders: {
      symbol: '代码',
      name: '名称',
      quantity: '数量',
      avgPurchasePrice: '平均购买价格',
      currentPrice: '当前价格',
      currentValue: '当前价值',
      gainLoss: '盈亏',
      gainLossPercent: '盈亏百分比',
      actions: '操作'
    },
    // Sector options
    sectors: {
      technology: '科技',
      healthcare: '医疗保健',
      financial: '金融',
      consumer: '消费',
      energy: '能源',
      industrial: '工业',
      other: '其他'
    }
  },

  // Bond Section
  bond: {
    title: '债券投资组合',
    subtitle: '通过全面的债券分析管理您的固定收益投资',
    loginWarning: '⚠️ 您尚未登录。显示的所有数据仅供演示使用。',
    loginNotice: '⚠️ 您尚未登录。显示的所有数据仅供演示使用。',
    noBondsYet: '暂无债券',
    noBondsYetDesc: '添加您的第一只债券以查看统计数据',
    currentBondHoldings: '当前债券持仓',
    bonds: '债券',
    buyBond: '购买债券',
    demoMode: '⚠️ 演示模式：显示的数据仅供演示使用。',
    noBondsFound: '未找到债券。添加您的第一只债券！',
    // Table headers
    tableHeaders: {
      bondName: '债券名称',
      ticker: '代码',
      type: '类型',
      faceValue: '面值',
      couponRate: '票面利率',
      maturity: '到期日',
      currentYield: '当前收益率',
      action: '操作'
    },
    // Bond types
    types: {
      government: '政府债券',
      corporate: '公司债券',
      municipal: '市政债券',
      international: '国际债券'
    },
    // Bond type descriptions
    typeDescriptions: {
      government: '政府发行的低风险债券',
      corporate: '具有不同风险水平的公司债券',
      municipal: '税收优惠的市政债券',
      international: '国际政府和公司债券'
    },
    // Metrics
    yield: '收益率',
    duration: '久期',
    years: '年',
    sell: '卖出',
    // Form labels
    addNewBond: '添加新债券',
    symbol: '代码',
    name: '名称',
    bondType: '债券类型',
    selectBondType: '选择债券类型',
    couponRate: '票面利率 (%)',
    maturityDate: '到期日期',
    selectMaturityDate: '选择到期日期',
    faceValue: '面值',
    currentYield: '当前收益率 (%)',
    creditRating: '信用评级',
    selectCreditRating: '选择信用评级',
    issuer: '发行人',
    issuerPlaceholder: '输入发行人名称',
    notes: '备注',
    notesPlaceholder: '附加备注...',
    save: '保存',
    cancel: '取消',
    // Validation messages
    symbolRequired: '代码是必需的',
    nameRequired: '名称是必需的',
    bondTypeRequired: '债券类型是必需的',
    couponRateRequired: '票面利率是必需的',
    maturityDateRequired: '到期日期是必需的',
    faceValueRequired: '面值是必需的',
    // Success/Error messages
    bondCreatedSuccessfully: '债券创建成功！',
    failedToCreateBond: '创建债券失败。',
    bondSoldSuccessfully: '债券卖出成功！',
    failedToSellBond: '卖出债券失败。',
    confirmSellBond: '您确定要卖出这只债券吗？',
    confirmSale: '确认卖出'
  },

  // Form Validation
  validation: {
    required: '此字段为必填项',
    email: '请输入有效的电子邮件地址',
    minLength: '最小长度为 {min} 个字符',
    maxLength: '最大长度为 {max} 个字符',
    numeric: '请输入有效数字',
    positive: '请输入正数',
    date: '请输入有效日期',
    futureDate: '请输入未来日期',
    bondNameRequired: '债券名称为必填项',
    symbolRequired: '代码为必填项',
    bondTypeRequired: '债券类型为必填项',
    quantityRequired: '数量为必填项',
    purchasePriceRequired: '购买价格为必填项',
    purchaseDateRequired: '购买日期为必填项',
    couponRateRequired: '票面利率为必填项',
    maturityDateRequired: '到期日期为必填项',
    faceValueRequired: '面值为必填项'
  },

  // Messages
  messages: {
    confirmDelete: '您确定要删除此项目吗？',
    confirmSell: '您确定要卖出此债券吗？',
    dataSaved: '数据保存成功',
    dataDeleted: '数据删除成功',
    dataUpdated: '数据更新成功',
    operationFailed: '操作失败',
    networkError: '网络错误',
    serverError: '服务器错误',
    unauthorized: '未授权访问',
    forbidden: '访问被禁止',
    notFound: '资源未找到',
    badRequest: '请求错误'
  },

  // Tooltips
  tooltip: {
    yield: '收益率',
    duration: '久期',
    maturity: '到期日',
    years: '年'
  },

  // Login Page
  login: {
    backToHome: '← 返回首页',
    welcomeBack: '欢迎回来',
    startJourney: '开始您的旅程',
    signInTitle: '登录投资组合管理器',
    signUpTitle: '注册投资组合管理器',
    email: '邮箱',
    emailPlaceholder: 'example@email.com',
    password: '密码',
    passwordSignInPlaceholder: '请输入您的密码',
    passwordSignUpPlaceholder: '创建密码',
    rememberMe: '记住我',
    loading: '加载中...',
    signIn: '登录',
    signUp: '注册',
    orSignInWith: '或使用以下方式登录',
    orSignUpWith: '或使用以下方式注册',
    dontHaveAccount: '还没有账户？',
    haveAccount: '已有账户？',
    signUpLink: '注册',
    signInLink: '登录',
    forgotPassword: '忘记密码？',
    // Error messages
    invalidEmail: '请输入有效的邮箱地址',
    passwordRequired: '密码是必需的',
    emailRequired: '邮箱是必需的',
    loginFailed: '登录失败。请检查您的凭据。',
    signupFailed: '注册失败。请重试。',
    // Success messages
    loginSuccess: '登录成功！',
    signupSuccess: '账户创建成功！'
  }
} 