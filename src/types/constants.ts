import type {
  AttributeType,
  Profession,
  Sect,
  WeaponType,
} from "./index";
import {
  AttributeTypeEnum,
  SectEnum,
  ProfessionEnum,
  WeaponTypeEnum,
} from "./index";

// 门派与职业的映射关系
export const SECT_TO_PROFESSION: Record<Sect, Profession> = {
  // 物理职业门派
  [SectEnum.GHOST_KING]: ProfessionEnum.PHYSICAL,
  [SectEnum.HEAVENLY_WAY]: ProfessionEnum.PHYSICAL,
  [SectEnum.POISON_SECT]: ProfessionEnum.PHYSICAL,
  // 法师职业门派
  [SectEnum.QINGYUN]: ProfessionEnum.MAGIC,
  [SectEnum.INCENSE_VALLEY]: ProfessionEnum.MAGIC,
  [SectEnum.GHOST_PATH]: ProfessionEnum.MAGIC,
  [SectEnum.COLD_DRAGON]: ProfessionEnum.MAGIC,
  // 治疗职业门派
  [SectEnum.TIANYIN]: ProfessionEnum.HEALING,
  [SectEnum.ANCIENT_WITCH]: ProfessionEnum.HEALING,
  [SectEnum.SPIRIT_PALACE]: ProfessionEnum.HEALING,
  // 封印职业门派
  [SectEnum.HEHUAN]: ProfessionEnum.SEAL,
  [SectEnum.LONGEVITY_HALL]: ProfessionEnum.SEAL,
};

// 按职业分组的门派
export const SECTS_BY_PROFESSION: Record<Profession, readonly Sect[]> = {
  [ProfessionEnum.PHYSICAL]: [
    SectEnum.GHOST_KING,
    SectEnum.HEAVENLY_WAY,
    SectEnum.POISON_SECT,
  ],
  [ProfessionEnum.MAGIC]: [
    SectEnum.QINGYUN,
    SectEnum.INCENSE_VALLEY,
    SectEnum.GHOST_PATH,
    SectEnum.COLD_DRAGON,
  ],
  [ProfessionEnum.HEALING]: [
    SectEnum.TIANYIN,
    SectEnum.ANCIENT_WITCH,
    SectEnum.SPIRIT_PALACE,
  ],
  [ProfessionEnum.SEAL]: [SectEnum.HEHUAN, SectEnum.LONGEVITY_HALL],
};

// 门派武器类型映射
export const SECT_WEAPON_TYPES: Record<Sect, WeaponType> = {
  // 物理职业门派
  [SectEnum.GHOST_KING]: WeaponTypeEnum.BLADE,
  [SectEnum.HEAVENLY_WAY]: WeaponTypeEnum.SPEAR,
  [SectEnum.POISON_SECT]: WeaponTypeEnum.SICKLE,
  // 法师职业门派
  [SectEnum.QINGYUN]: WeaponTypeEnum.SWORD,
  [SectEnum.INCENSE_VALLEY]: WeaponTypeEnum.FAN,
  [SectEnum.GHOST_PATH]: WeaponTypeEnum.LAMP,
  [SectEnum.COLD_DRAGON]: WeaponTypeEnum.BOW,
  // 治疗职业门派
  [SectEnum.TIANYIN]: WeaponTypeEnum.STAFF,
  [SectEnum.ANCIENT_WITCH]: WeaponTypeEnum.MAGIC_STAFF,
  [SectEnum.SPIRIT_PALACE]: WeaponTypeEnum.QIN,
  // 封印职业门派
  [SectEnum.HEHUAN]: WeaponTypeEnum.DAGGER,
  [SectEnum.LONGEVITY_HALL]: WeaponTypeEnum.BRUSH,
};

// 武器等级配置
export const WEAPON_LEVELS = {
  60: {
    physical: 665,
    magic: 210,
    healing: 192,
  },
  "60-standard": {
    physical: 589,
    magic: 186,
    healing: 170,
  },
  80: {
    physical: 744,
    magic: 232,
    healing: 217,
  },
  110: {
    physical: 976,
    magic: 302,
    healing: 286,
  },
} as const;

// 属性展示与校验共享同一份配置，避免新增属性时遗漏某个界面分支。
export const ATTRIBUTE_FIELDS = [
  { type: AttributeTypeEnum.PHYSICAL, label: "物攻" },
  { type: AttributeTypeEnum.MAGIC, label: "法攻" },
  { type: AttributeTypeEnum.HEALING, label: "治疗" },
] as const satisfies readonly { type: AttributeType; label: string }[];
