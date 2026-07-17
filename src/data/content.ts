import type { Profession, Sect } from "../types";
import { ProfessionEnum, SectEnum } from "../types";

export const CONTENT_VERIFIED_AT = "2026-07-16";

export type ContentSource = {
  title: string;
  url: string;
  publishedAt: string;
};

export type SectProfile = {
  id: Sect;
  profession: Profession;
  positioning: string;
  summary: string;
  source: ContentSource;
};

export type GuideCategory = "版本" | "门派" | "养成" | "坐骑" | "入门" | "合集";

export type GuideEntry = {
  id: string;
  category: GuideCategory;
  title: string;
  summary: string;
  source: ContentSource;
};

export type EquipmentCategory = "打造" | "升级" | "词条" | "全等级装备";

export type EquipmentEntry = {
  id: string;
  category: EquipmentCategory;
  title: string;
  availability: string;
  summary: string;
  source: ContentSource;
};

export type CompanionKind = "灵兽" | "坐骑";

export type CompanionEntry = {
  id: string;
  kind: CompanionKind;
  title: string;
  positioning: string;
  availability: string;
  summary: string;
  source: ContentSource;
};

const CLASSIC_SECTS_SOURCE: ContentSource = {
  title: "《梦幻新诛仙》八大职业来自原著",
  url: "https://mhxzx.wanmei.com/news/gamenews/20200512/223993.shtml",
  publishedAt: "2020-05-12",
};

export const SECT_PROFILES: readonly SectProfile[] = [
  {
    id: SectEnum.GHOST_KING,
    profession: ProfessionEnum.PHYSICAL,
    positioning: "物理爆发、高风险高收益",
    summary: "以近身物理爆发为核心，通过强化自身换取更高输出。",
    source: CLASSIC_SECTS_SOURCE,
  },
  {
    id: SectEnum.HEAVENLY_WAY,
    profession: ProfessionEnum.PHYSICAL,
    positioning: "物理追击、攻守兼备",
    summary: "通过偃甲与战魂组织追击，在单体、群体和防守之间切换。",
    source: {
      title: "二周年全新门派天道府惊喜爆料",
      url: "https://mhxzx.wanmei.com/news/gamenews/20230619/244372.shtml",
      publishedAt: "2023-06-19",
    },
  },
  {
    id: SectEnum.POISON_SECT,
    profession: ProfessionEnum.PHYSICAL,
    positioning: "控毒反击、禁止复活",
    summary: "利用毒物制造持续压力，并以反击和限制复活影响战局。",
    source: CLASSIC_SECTS_SOURCE,
  },
  {
    id: SectEnum.DEMON_TEMPLE,
    profession: ProfessionEnum.PHYSICAL,
    positioning: "近身物理、灵兽协同",
    summary: "可进入魔神形态强化物理爆发，并围绕灵兽协同展开追击。",
    source: {
      title: "五周年公告：全新门派魔神殿",
      url: "https://mhxzx.wanmei.com/m/news/gamenews/20260625/262881.shtml",
      publishedAt: "2026-06-25",
    },
  },
  {
    id: SectEnum.QINGYUN,
    profession: ProfessionEnum.MAGIC,
    positioning: "法术群伤、灵活多面",
    summary: "以控水御雷进行稳定法术输出，并利用元素效果扩大战果。",
    source: CLASSIC_SECTS_SOURCE,
  },
  {
    id: SectEnum.INCENSE_VALLEY,
    profession: ProfessionEnum.MAGIC,
    positioning: "法术输出、召唤反隐",
    summary: "擅长火系法术爆发，并通过召唤与反隐能力应对不同目标。",
    source: CLASSIC_SECTS_SOURCE,
  },
  {
    id: SectEnum.GHOST_PATH,
    profession: ProfessionEnum.MAGIC,
    positioning: "持续法术、灵活控场",
    summary: "以离魂等效果持续输出，同时为队友增益并削弱对手。",
    source: {
      title: "执灯看死生：新门派鬼道抢先预览",
      url: "https://mhxzx.wanmei.com/m/news/gamenews/20220615/238152.shtml",
      publishedAt: "2022-06-15",
    },
  },
  {
    id: SectEnum.COLD_DRAGON,
    profession: ProfessionEnum.MAGIC,
    positioning: "法术速攻、御风扰乱",
    summary: "使用风系法术快速进攻，并借助风蚀与风墙扰乱敌方。",
    source: {
      title: "全新门派龙族技能全面揭秘",
      url: "https://mhxzx.wanmei.com/news/gamebroad/20240525/250795.shtml",
      publishedAt: "2024-05-25",
    },
  },
  {
    id: SectEnum.TIANYIN,
    profession: ProfessionEnum.HEALING,
    positioning: "增益护盾、治疗辅助",
    summary: "经典流派侧重治疗、复活和团队保护；后续版本已开放魔修流派。",
    source: CLASSIC_SECTS_SOURCE,
  },
  {
    id: SectEnum.ANCIENT_WITCH,
    profession: ProfessionEnum.HEALING,
    positioning: "法术增益、持续治疗",
    summary: "借助自然之力持续治疗队友，并提供解除封印等辅助能力。",
    source: CLASSIC_SECTS_SOURCE,
  },
  {
    id: SectEnum.SPIRIT_PALACE,
    profession: ProfessionEnum.HEALING,
    positioning: "治疗辅助、灵体协同",
    summary: "以五音律法治疗友军、召唤灵体，在攻守之间调节战斗节奏。",
    source: {
      title: "四周年庆典：全新门派万灵宫",
      url: "https://mhxzx.wanmei.com/news/gamenews/20250618/256981.shtml",
      publishedAt: "2025-06-18",
    },
  },
  {
    id: SectEnum.HEHUAN,
    profession: ProfessionEnum.SEAL,
    positioning: "高速封印、降防削弱",
    summary: "通过高速封印限制敌方，同时降低防御为队友创造输出机会。",
    source: CLASSIC_SECTS_SOURCE,
  },
  {
    id: SectEnum.LONGEVITY_HALL,
    profession: ProfessionEnum.SEAL,
    positioning: "群体封印、元素转换",
    summary: "以阴阳道法封印对手，并通过异常状态和法门掌控战局。",
    source: CLASSIC_SECTS_SOURCE,
  },
] as const;

export const EQUIPMENT_ENTRIES: readonly EquipmentEntry[] = [
  {
    id: "equipment-110-crafting",
    category: "打造",
    title: "110级装备打造",
    availability: "世界等级开放110级装备后",
    summary:
      "使用110级装备宝玉和对应等级天工符打造；普通打造不再出现蓝色品质，百炼打造不再出现紫色品质，最低为橙色。",
    source: {
      title: "110级新版本最全前瞻",
      url: "https://mhxzx.wanmei.com/news/gamenews/20230906/245799.shtml",
      publishedAt: "2023-09-06",
    },
  },
  {
    id: "equipment-110-upgrade",
    category: "升级",
    title: "100级红装升级至110级",
    availability: "角色达到110级并解锁装备升级",
    summary:
      "可使用开天玉将100级红色品质装备升级为110级，装备外观、图标和属性会随升级变化。",
    source: {
      title: "110级武器与装备升级说明",
      url: "https://mhxzx.wanmei.com/news/gamenews/20230905/245718.shtml",
      publishedAt: "2023-09-05",
    },
  },
  {
    id: "equipment-110-affix",
    category: "词条",
    title: "110级装备词条",
    availability: "打造110级装备时概率获得",
    summary:
      "词条分为需要多件激活的套装词条和单条生效的独立词条；已获得词条可通过转移功能继承到其他装备。",
    source: {
      title: "110级装备词条机制说明",
      url: "https://mhxzx.wanmei.com/news/gamenews/20230905/245718.shtml",
      publishedAt: "2023-09-05",
    },
  },
  {
    id: "spirit-weapon",
    category: "全等级装备",
    title: "成长型装备·灵武",
    availability: "具体开放条件以当前游戏内为准",
    summary:
      "灵武可使用龙纹玉改变装备部位或附加属性类型，并支持定向培养属性、特技、特效和百炼属性。",
    source: {
      title: "灵武装备全服上线说明",
      url: "https://mhxzx.wanmei.com/m/news/gamebroad/20240418/249976.shtml",
      publishedAt: "2024-04-18",
    },
  },
  {
    id: "season-divine-equipment",
    category: "全等级装备",
    title: "赛年神装",
    availability: "角色等级≥69且服务器开服≥67天",
    summary:
      "包含角色戒指、角色项链和灵兽宝冠三个部位，属性随角色等级成长，最多拥有三条副属性，并支持特效等级与同名特效共鸣。",
    source: {
      title: "永夜赛季赛年神装公告",
      url: "https://mhxzx.wanmei.com/m/news/gamebroad/20251231/260149.shtml",
      publishedAt: "2025-12-31",
    },
  },
] as const;

export const COMPANION_ENTRIES: readonly CompanionEntry[] = [
  {
    id: "jiuer",
    kind: "灵兽",
    title: "九儿",
    positioning: "兽潮赛季·多段物理",
    availability: "兽潮赛季内容，当前获取方式以游戏内为准",
    summary:
      "专属技能可连续进行物理攻击并叠加崩裂；攻击崩裂层数满足条件的目标时可追加一次攻击。",
    source: {
      title: "五周年兽潮赛季与九儿公告",
      url: "https://mhxzx.wanmei.com/m/news/gamenews/20260625/262881.shtml",
      publishedAt: "2026-06-25",
    },
  },
  {
    id: "canglong-shenjun",
    kind: "灵兽",
    title: "苍龙神君",
    positioning: "风系单体法术",
    availability: "公告上线期可通过对应任务获取",
    summary:
      "拥有被动法术吸血能力；攻击气血上限高于自身的目标时可额外追击，每回合最多触发一次。",
    source: {
      title: "苍龙神君上线与技能说明",
      url: "https://mhxzx.wanmei.com/m/news/gamenews/20260326/261493.shtml",
      publishedAt: "2026-03-26",
    },
  },
  {
    id: "eshou",
    kind: "灵兽",
    title: "讹兽",
    positioning: "105级灵兽",
    availability: "角色达到105级后可前往集市获取",
    summary:
      "105级灵兽资料条目；官网公告未公开完整战斗技能，具体资质和技能以游戏内图鉴为准。",
    source: {
      title: "105级灵兽·讹兽登场公告",
      url: "https://mhxzx.wanmei.com/news/gamenews/20220721/238817.shtml",
      publishedAt: "2022-07-21",
    },
  },
  {
    id: "huanyuexian",
    kind: "坐骑",
    title: "幻月仙",
    positioning: "速度支援",
    availability: "原活动已结束，当前获取方式以游戏内为准",
    summary:
      "统御灵兽在场时可提升自身与召唤者速度，并根据统御灵兽与攻击目标的速度差提高伤害结果。",
    source: {
      title: "坐骑·幻月仙上线公告",
      url: "https://mhxzx.wanmei.com/news/gamebroad/20250423/256101.shtml",
      publishedAt: "2025-04-23",
    },
  },
  {
    id: "nielihuo",
    kind: "坐骑",
    title: "涅离火",
    positioning: "法术暴击与吸血",
    availability: "原活动已结束，当前获取方式以游戏内为准",
    summary:
      "统御灵兽对主目标的法术暴击率提升12%；对主目标造成法术暴击时，吸收其所掉气血的20%。",
    source: {
      title: "四象坐骑·涅离火上线公告",
      url: "https://mhxzx.wanmei.com/m/news/gamebroad/20260205/260801.shtml",
      publishedAt: "2026-02-05",
    },
  },
  {
    id: "tayunzhui",
    kind: "坐骑",
    title: "踏云骓",
    positioning: "复活与恢复",
    availability: "原活动已结束，当前获取方式以游戏内为准",
    summary:
      "心情技能「单骑救主」具备复活及恢复能力，适合在关键回合提供容错。",
    source: {
      title: "侠客行版本与坐骑·踏云骓公告",
      url: "https://mhxzx.wanmei.com/news/gamenews/20230330/242983.shtml",
      publishedAt: "2023-03-30",
    },
  },
] as const;

export const GUIDE_ENTRIES: readonly GuideEntry[] = [
  {
    id: "five-anniversary-2026",
    category: "版本",
    title: "五周年新门派与年度战斗调整",
    summary: "了解魔神殿、兽潮赛季以及五周年版本的主要战斗变化。",
    source: {
      title: "五周年公告：全新赛季、坐骑等重磅登场",
      url: "https://mhxzx.wanmei.com/m/news/gamenews/20260625/262881.shtml",
      publishedAt: "2026-06-25",
    },
  },
  {
    id: "tianyin-moxiu-2026",
    category: "门派",
    title: "天音寺第二流派·魔修说明",
    summary: "官方介绍魔修流派的圣魔双珠机制、战斗定位与技能变化。",
    source: {
      title: "更新公告：天音魔修流派现已上线",
      url: "https://mhxzx.wanmei.com/m/news/gamenews/20260326/261493.shtml",
      publishedAt: "2026-03-26",
    },
  },
  {
    id: "nielihuo-mount-2026",
    category: "坐骑",
    title: "朱雀坐骑·涅离火技能介绍",
    summary: "查看涅离火的法术暴击和吸血效果，以及官方版本说明。",
    source: {
      title: "朱雀坐骑提升灵兽法暴还能吸血？",
      url: "https://mhxzx.games.laohu.com/news/gamestrategy/20260205/260814.shtml",
      publishedAt: "2026-02-05",
    },
  },
  {
    id: "classic-sects-overview",
    category: "门派",
    title: "经典八门派基础定位",
    summary: "快速了解青云、合欢、焚香、鬼王等经典门派的基础战斗定位。",
    source: CLASSIC_SECTS_SOURCE,
  },
  {
    id: "home-economy-2024",
    category: "养成",
    title: "仙府铜钱经营思路",
    summary: "从房间分配、活力使用和市场价格三个方面整理仙府经营思路。",
    source: {
      title: "在仙府如何实现铜钱自由？",
      url: "https://mhxzx.games.laohu.com/news/gamestrategy/20240407/249703.shtml",
      publishedAt: "2024-04-07",
    },
  },
  {
    id: "returning-player-2023",
    category: "入门",
    title: "老玩家回归指南",
    summary: "官方汇总减负、师徒、赛事与养成系统，适合回归时了解功能框架。",
    source: {
      title: "欢迎老朋友回归：神州畅玩指南",
      url: "https://mhxzx.games.laohu.com/news/gamestrategy/20230617/244363.shtml",
      publishedAt: "2023-06-17",
    },
  },
  {
    id: "official-strategy-hub",
    category: "合集",
    title: "官方攻略合集",
    summary: "前往官网攻略专题查看更多玩法资料；具体规则以当前游戏版本为准。",
    source: {
      title: "梦幻新诛仙官方攻略合集",
      url: "https://mhxzx.wanmei.com/net/220622strategy/index.html",
      publishedAt: "2022-06-22",
    },
  },
] as const;

export const CONTENT_ITEM_IDS = new Set<string>([
  ...SECT_PROFILES.map(({ id }) => `sect:${id}`),
  ...EQUIPMENT_ENTRIES.map(({ id }) => `equipment:${id}`),
  ...COMPANION_ENTRIES.map(({ id }) => `companion:${id}`),
  ...GUIDE_ENTRIES.map(({ id }) => `guide:${id}`),
]);
