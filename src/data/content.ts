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
  ...GUIDE_ENTRIES.map(({ id }) => `guide:${id}`),
]);
