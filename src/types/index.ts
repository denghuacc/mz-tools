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

// 类型直接从枚举派生，新增枚举项时不需要同步维护字符串联合类型。
export type Sect = `${SectEnum}`;

// 职业类型定义
export type Profession = `${ProfessionEnum}`;

// 武器类型定义
export type WeaponType = `${WeaponTypeEnum}`;

// 数字 60 保留为原有的 69 特色服配置，避免现有选择逻辑发生隐式变化。
export type WeaponLevel = 60 | "60-standard" | 80 | 110;

// 属性值类型定义
export type AttributeValue = {
  current: number;
  max: number;
};

// 表单允许属性值暂未填写，完成校验后再转换为 AttributeValue。
export type AttributeInputValue = {
  current: number | null;
  max: number;
};

// 属性集合类型定义
export type Attributes = {
  physical: AttributeValue;
  magic: AttributeValue;
  healing: AttributeValue;
};

export type AttributeInputs = {
  physical: AttributeInputValue;
  magic: AttributeInputValue;
  healing: AttributeInputValue;
};

// 属性类型键
export type AttributeType = keyof Attributes;
