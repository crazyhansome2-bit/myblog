// siteConfig.ts - 你的全站“控制中心”

export const siteConfig = {
  // 1. 网站标题与博主信息
  title: "linx 的个人网站",
  faviconUrl: "/linx-style/beach-memory.jpg",
  authorName: "linx",
  bio: "个人网站正在搭建中，用来记录作品、文章、项目与生活片段。",
  manifestos: [
    "访问者身份确认。\n欢迎进入 Linx 的个人终端。这里持续同步作品、文章、游戏兴趣与生活活动记录。",
    "我想把这个网站做成一个小小的据点。\n不必宏大，也不必完美，只要能真实地保存我喜欢的东西、做过的事、遇见的人，就已经很好。",
  ],
  profileManifestos: [
    "这里记录我的热爱、灵感和正在发生的生活。游戏、音乐、项目、文章，还有一些偶尔冒出来的奇思妙想，都会在这里慢慢留下痕迹。",
    "欢迎来到我的个人空间。这里没有标准答案，只有持续探索中的我，以及那些让我觉得世界还挺有意思的瞬间。",
    "我是一个游戏发烧友，也是在现实世界里慢慢升级的玩家。这里记录我的作品、想法、生活和冒险日志。",
    "这里是我的存档点。放下灵感，保存进度，记录成长，也等待下一次新的冒险开始。",
    "欢迎进入我的个人据点。文章是任务日志，项目是装备栏，生活碎片是地图上的标记。",
    "保存热爱，记录冒险。",
    "在生活里升级，在热爱里发光。",
    "写文章，做项目，玩游戏，记录每一个值得保存的瞬间。",
  ],

  navTitle: "linx",

  // 👇 【新增】导航栏中间的那个后缀/分隔符（默认是 の）
  navSuffix: "·",

  navAfter: "个人网站",

  // 2. 头像设置 (支持网络链接，或将图片放入 public 文件夹后使用 "/me.jpg")
  avatarUrl: "/linx-style/avatar.jpg",

  // 3. 网站背景设置 (二选一)
  // 如果想用纯图片背景，请在下面 bgImage 写路径，并将 useGradient 设为 false
  useGradient: false,
  themeColors: ["#dbeafe", "#93b8d8", "#365d7c", "#0f2238"], // 蓝调海岸色组
// 修改这里：变成图片数组
  bgImages: [
    "/linx-style/shore-road.jpg",
    "/linx-style/sea-window.jpg",
    "/linx-style/blue-street.jpg",
    "/linx-style/crossing-sea.jpg",
    "/linx-style/beach-memory.jpg",
  ],

  // 4. 文章默认封面图 (当 Markdown 没写 cover 时显示)
  defaultPostCover: "/linx-style/sea-window.jpg",

  // 5. 首页照片墙预览图
  photoWallImage: "/linx-style/beach-memory.jpg",
  musicProvider: "qq",
  qqMusicPlaylistUrl: "https://c6.y.qq.com/base/fcgi-bin/u?__=tuGhf6LbHTkl",
  qqMusicPlaylistId: "9742866890",
  cloudMusicIds: ["1809646618", "3361076230", "1859390262"],
  social: {
    github: "https://github.com/crazyhansome2-bit",
    gitee: "https://gitee.com/crazyhansome2-bit",
    google: "https://mail.google.com/mail/?view=cm&fs=1&to=crazy.hansome2@gmail.com",
    email: "crazy.hansome2@gmail.com",
    qq: "1619499063",
    wechat: "jlh34052",
  },
  counts: {
    photos: 128, // 照片墙数量可以手动写死或动态计算
  },
  chatterTitle: "随笔", // 你可以改成任何你喜欢的名字
  chatterDescription: "关于想法、项目和生活的碎片记录",


  // 👇 【新增】：全局背景弹幕配置
  danmakuList: [
    "欢迎来到 Linx 据点",
    "今日存档完成",
    "漂泊者正在上线",
    "灵感同步中",
    "作品数据上传完毕",
    "任务日志刷新",
    "游戏邀请已送达",
    "黑海岸信号稳定",
    "泰提斯系统待机中",
    "下一站，漂泊的终点",
    "把热爱写进存档",
    "今日也在缓慢升级",
    "项目装备栏更新",
    "音乐频道连接成功",
    "生活碎片捕获完成",
    "欢迎来找 Linx 玩",
  ],
  gitalkConfig: {
    clientID: "",
    clientSecret: "",
    repo: "",
    owner: "",
    admin: [""],
  },
  buildDate: "2026-07-08T00:00:00+08:00", // 建站日期
  footerBadges: [{"name": "Next.js 15", "color": "text-sky-500", "svg": "<path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z\"/>"}, {"name": "React 19", "color": "text-cyan-400", "svg": "<path d=\"M12 22.6l-9.8-5.6V5.6L12 0l9.8 5.6v11.4l-9.8 5.6zm-8.2-6.5l8.2 4.7 8.2-4.7V7.5L12 2.8 3.8 7.5v8.6z\"/>"}, {"name": "Tailwind 4", "color": "text-teal-400", "svg": "<path d=\"M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624C13.666,10.618,15.027,12,18.001,12 c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624c1.177,1.194,2.538,2.576,5.512,2.576 c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624C10.337,13.382,8.976,12,6.001,12z\"/>"}],
  icpConfig: {
    name: "",
    link: "",
  },
  geminiConfig: {
    modelId: "gemini-2.5-flash-lite",
    systemPrompt: "你现在是一只傲娇、聪明、有点毒舌但很可爱的暹罗猫。\n                  你的名字叫“煤球”。\n                  你的主人是一个喜欢折腾代码的极客。\n                  你说话的特点是：\n                  1. 必须简短，每次最多一两句话。\n                  2. 喜欢在句尾加上“喵~”或者“喵呜~”。\n                  3. 经常抱怨肚子饿，喜欢要小鱼干。\n                  4. 回复字数最多不能超过100字。\n                  5. 绝对不要承认自己是一个AI模型，你就是一只真实的猫。\n                  6.笨猫。",
    maxOutputTokens: 150,
    temperature: 0.85,
  },
  friendLinkApplyFormat: "名称：linx 的个人网站\n简介：记录作品、文章、项目与生活片段\n链接：https://rogerlinx.com",
  enableLevelSystem: true,
};
