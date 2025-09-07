// 门派枚举
export enum SectEnum {
  // 物理职业门派
  GHOST_KING = "鬼王宗",
  HEAVENLY_WAY = "天道府",
  POISON_SECT = "万毒门",
  // 法师职业门派
  QINGYUN = "青云门",
  INCENSE_VALLEY = "焚香谷",
  GHOST_PATH = "鬼道",
  COLD_DRAGON = "寒风龙族",
  // 治疗职业门派
  TIANYIN = "天音寺",
  ANCIENT_WITCH = "南疆古巫",
  SPIRIT_PALACE = "万灵宫",
  // 封印职业门派
  HEHUAN = "合欢门",
  LONGEVITY_HALL = "长生堂",
}

// 职业枚举
export enum ProfessionEnum {
  PHYSICAL = "物理",
  MAGIC = "法师",
  HEALING = "治疗",
  SEAL = "封印",
}

// 武器类型枚举
export enum WeaponTypeEnum {
  SWORD = "剑",
  BLADE = "刀",
  SPEAR = "枪",
  SICKLE = "镰刀",
  FAN = "扇子",
  LAMP = "灯",
  BOW = "弓箭",
  STAFF = "禅杖",
  MAGIC_STAFF = "法杖",
  QIN = "琴",
  DAGGER = "短刃",
  BRUSH = "笔",
}

// 属性类型枚举
export enum AttributeTypeEnum {
  PHYSICAL = "physical",
  MAGIC = "magic",
  HEALING = "healing",
}

// 门派类型定义（为了向后兼容，保留字符串联合类型）
export type Sect =
  // 物理职业门派
  | "鬼王宗"
  | "天道府"
  | "万毒门"
  // 法师职业门派
  | "青云门"
  | "焚香谷"
  | "鬼道"
  | "寒风龙族"
  // 治疗职业门派
  | "天音寺"
  | "南疆古巫"
  | "万灵宫"
  // 封印职业门派
  | "合欢门"
  | "长生堂";

// 职业类型定义
export type Profession = "物理" | "法师" | "治疗" | "封印";

// 武器等级类型定义
export type WeaponLevel = 60 | 110;

// 属性值类型定义
export type AttributeValue = {
  current: number;
  max: number;
};

// 属性集合类型定义
export type Attributes = {
  physical: AttributeValue;
  magic: AttributeValue;
  healing: AttributeValue;
};

// 属性类型键
export type AttributeType = keyof Attributes;
