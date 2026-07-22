import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CSSProperties, ReactNode } from "react";
import AttributeBonusCard from "./AttributeBonusCard";
import AttributeBonusSummaryPanel from "./AttributeBonusSummaryPanel";
import type { AttributeBonusSummarySource } from "./AttributeBonusSummaryPanel";
import CharacterTrainingBonusControl from "./CharacterTrainingBonusControl";
import {
  calculateCharacterTrainingBonuses,
  createDefaultCharacterTrainingLevels,
  formatCharacterTrainingLevel,
  normalizeCharacterTrainingLevels,
} from "../utils/characterTraining";
import type { CharacterTrainingLevels } from "../utils/characterTraining";
import EditorDialog from "./EditorDialog";
import EditIconButton from "./EditIconButton";
import GuildBlessingBonusControl from "./GuildBlessingBonusControl";
import GuildTalentBonusControl from "./GuildTalentBonusControl";
import PotentialAllocationControl from "./PotentialAllocationControl";
import SanshengPillBonusControl from "./SanshengPillBonusControl";
import SatinAttributeBonusControl from "./SatinAttributeBonusControl";
import SelectableAttributeBonusControl from "./SelectableAttributeBonusControl";
import SinglePrimaryAttributeBonusControl from "./SinglePrimaryAttributeBonusControl";
import StarBlessingBonusControl, {
  STAR_BLESSING_ATTRIBUTE_COUNT,
} from "./StarBlessingBonusControl";
import TianshuBonusControl from "./TianshuBonusControl";
import TalismanBonusControl from "./TalismanBonusControl";
import TemporaryTalismanBonusControl from "./TemporaryTalismanBonusControl";
import UniformAttributeBonusControl from "./UniformAttributeBonusControl";
import type { TianshuBonusControlOption } from "./TianshuBonusControl";
import type { StarBlessingBonusValue } from "./StarBlessingBonusControl";
import type {
  TemporaryTalismanBonusOption,
  TemporaryTalismanStar,
} from "./TemporaryTalismanBonusControl";
import type {
  SatinBonusAttribute,
  SatinBonusSelection,
} from "./SatinAttributeBonusControl";
import type { SelectableBonusSelection } from "./SelectableAttributeBonusControl";
import {
  AFFINITY_BONUS_FIELDS,
  applyCharacterAttributeBonuses,
  arePrimaryAttributeBonusesBalanced,
  calculateSanshengPillBonuses,
  calculateSanshengPillMaximumCount,
  calculateFixedStatusAttributes,
  calculatePresetAllocation,
  calculateCharacterAttributes,
  CHARACTER_ALLOCATION_PRESETS,
  CHARACTER_BONUS_ATTRIBUTE_KEYS,
  CHARACTER_LEVEL,
  CHARACTER_LEVEL_OPTIONS,
  combineCharacterAttributeBonuses,
  createEmptyCharacterAttributeBonuses,
  DEFAULT_AGILITY_CHARACTER_ALLOCATION,
  DEFAULT_CUSTOM_CHARACTER_ALLOCATION,
  EMPTY_CHARACTER_ALLOCATION,
  getCharacterUpgradeCount,
  getCustomCharacterAllocationValidationError,
  getPrimaryAttributeBonusTotal,
  getTotalPotentialPoints,
  LEVEL_ONE_ADVANCED_ATTRIBUTES,
  LEVEL_ONE_STATUS_ATTRIBUTES,
  PRIMARY_ATTRIBUTE_KEYS,
  SEAL_HIT_POINTS_PER_UPGRADE,
} from "../utils/characterAttributes";
import type {
  CharacterAllocation,
  CharacterAllocationMode,
  CharacterAllocationPresetId,
  CharacterAttributeBonuses,
  CharacterBonusAttribute,
  CharacterLevel,
  CustomCharacterAllocationScheme,
  PrimaryAttribute,
} from "../utils/characterAttributes";
import {
  CHARACTER_ATTRIBUTES_STORAGE_KEY,
  LEGACY_CHARACTER_ATTRIBUTES_STORAGE_KEY,
  loadCalculatorState,
  saveCalculatorState,
} from "../utils/calculatorStorage";

const SKILL_BONUS_FIELDS = [
  { attribute: "health", label: "气血" },
  { attribute: "mana", label: "法力" },
  { attribute: "physicalAttack", label: "物攻" },
  { attribute: "magicAttack", label: "法攻" },
  { attribute: "physicalDefense", label: "物防" },
  { attribute: "magicDefense", label: "法防" },
  { attribute: "speed", label: "速度", allowNegative: true },
  { attribute: "sealResistance", label: "抗封" },
] as const;

const SOUL_ARTIFACT_BONUS_FIELDS = [
  { attribute: "constitution", label: "体", allowNegative: true },
  { attribute: "spirit", label: "灵", allowNegative: true },
  { attribute: "strength", label: "力", allowNegative: true },
  { attribute: "endurance", label: "耐", allowNegative: true },
  { attribute: "agility", label: "敏", allowNegative: true },
  { attribute: "health", label: "气血" },
  { attribute: "physicalAttack", label: "物攻" },
  { attribute: "magicAttack", label: "法攻" },
  { attribute: "physicalDefense", label: "物防" },
  { attribute: "magicDefense", label: "法防" },
  { attribute: "speed", label: "速度" },
] as const;

const DIVINE_SOUL_BONUS_FIELDS = [
  { attribute: "physicalAttack", label: "物攻" },
  { attribute: "magicAttack", label: "法攻" },
  { attribute: "physicalDefense", label: "物防" },
  { attribute: "magicDefense", label: "法防" },
  { attribute: "health", label: "气血" },
] as const;

const TEMPORARY_TALISMAN_BONUS_FIELDS = [
  { attribute: "health", label: "气血", value: 309 },
  { attribute: "mana", label: "法力", value: 309 },
  { attribute: "magicAttack", label: "法攻", value: 62 },
  { attribute: "magicDefense", label: "法防", value: 62 },
  { attribute: "physicalAttack", label: "物攻", value: 62 },
  { attribute: "physicalDefense", label: "物防", value: 62 },
  { attribute: "speed", label: "速度", value: 19 },
  { attribute: "healingPower", label: "治疗强度", value: 31 },
  { attribute: "battleEntryAnger", label: "进战怒气", value: 17 },
  { attribute: "strength", label: "力", value: 17 },
  { attribute: "spirit", label: "灵", value: 17 },
  { attribute: "constitution", label: "体", value: 17 },
  { attribute: "agility", label: "敏", value: 17 },
] as const satisfies readonly TemporaryTalismanBonusOption[];

type TemporaryTalismanBonusAttribute =
  (typeof TEMPORARY_TALISMAN_BONUS_FIELDS)[number]["attribute"];

const TRANSFORMATION_TALISMAN_BONUS_FIELDS = [
  { attribute: "physicalAttack", label: "物攻" },
  { attribute: "magicAttack", label: "法攻" },
  { attribute: "physicalDefense", label: "物防" },
  { attribute: "magicDefense", label: "法防" },
  { attribute: "speed", label: "速度" },
  { attribute: "health", label: "气血" },
  { attribute: "healingPower", label: "治疗强度" },
  { attribute: "sealHit", label: "封印命中" },
  { attribute: "physicalCritical", label: "物理暴击率", unit: "%" },
  { attribute: "magicalCritical", label: "法术暴击率", unit: "%" },
] as const;

type TransformationTalismanBonusAttribute =
  (typeof TRANSFORMATION_TALISMAN_BONUS_FIELDS)[number]["attribute"];
type TransformationTalismanBonusSelection =
  SelectableBonusSelection<TransformationTalismanBonusAttribute>;

const CHARM_BONUS_MAX_VALUE = 120;

const GUILD_BLESSING_FIELDS = [
  { attribute: "physicalAttack", label: "物攻", value: 20 },
  { attribute: "physicalDefense", label: "物防", value: 20 },
  { attribute: "magicAttack", label: "法攻", value: 16 },
  { attribute: "magicDefense", label: "法防", value: 16 },
] as const;

const GUILD_TALENT_SUMMARY_FIELDS = [
  { attribute: "physicalAttack", label: "物攻" },
  { attribute: "magicAttack", label: "法攻" },
  { attribute: "physicalCritical", label: "物理暴击", unit: "%" },
  { attribute: "magicalCritical", label: "法术暴击", unit: "%" },
  { attribute: "physicalDefense", label: "物防" },
  { attribute: "magicDefense", label: "法防" },
  { attribute: "speed", label: "速度" },
  { attribute: "speedPercent", label: "速度", unit: "%" },
  { attribute: "hitRate", label: "命中率", unit: "%" },
  { attribute: "sealHit", label: "封印命中", unit: "%" },
] as const;

const GUILD_TALENT_OPTIONS = [
  {
    id: "attack",
    label: "物攻 +8 / 法攻 +6",
    bonuses: { physicalAttack: 8, magicAttack: 6 },
  },
  {
    id: "critical",
    label: "物理暴击 +3% / 法术暴击 +3%",
    bonuses: { physicalCritical: 3, magicalCritical: 3 },
  },
  {
    id: "defense",
    label: "物防 +8 / 法防 +6",
    bonuses: { physicalDefense: 8, magicDefense: 6 },
  },
  {
    id: "speed",
    label: "速度 +4",
    bonuses: { speed: 4 },
  },
  {
    id: "speed-percent",
    label: "速度 +2%",
    bonuses: { speedPercent: 2 },
  },
  {
    id: "seal-hit",
    label: "命中率 +2% / 封印命中 +1%",
    bonuses: { hitRate: 2, sealHit: 1 },
  },
] as const;

type GuildTalentOptionId = (typeof GUILD_TALENT_OPTIONS)[number]["id"];

const CHARACTER_TRAINING_SUMMARY_FIELDS = [
  { attribute: "healingPower", label: "治疗强度" },
  { attribute: "sealHit", label: "封印命中", unit: "%" },
  { attribute: "sealResistance", label: "封印抵抗", unit: "%" },
] as const;

const createTalismanBonusOptions = (characterLevel: CharacterLevel) => [
  {
    id: "physical-attack",
    name: "天魔幡",
    title: "物攻法宝：天魔幡",
    effectLabel: "等级 × 0.6 物攻",
    bonuses: { physicalAttack: characterLevel * 0.6 },
  },
  {
    id: "magic-attack",
    name: "四灵幡",
    title: "法攻法宝：四灵幡",
    effectLabel: "等级 × 0.6 法攻",
    bonuses: { magicAttack: characterLevel * 0.6 },
  },
  {
    id: "speed-defense",
    name: "鹤云幡",
    title: "辅助 / 封印法宝：鹤云幡",
    effectLabel: "等级 × 0.4 物攻 · 血炼 +5% 物防 · +5% 法防",
    bonuses: {
      physicalAttack: characterLevel * 0.4,
      physicalDefensePercent: 5,
      magicDefensePercent: 5,
    },
  },
] as const;

const TALISMAN_BONUS_OPTIONS = createTalismanBonusOptions(CHARACTER_LEVEL);

type TalismanBonusOptionId = (typeof TALISMAN_BONUS_OPTIONS)[number]["id"];
type TalismanBonusOption = (typeof TALISMAN_BONUS_OPTIONS)[number];

const TALISMAN_BONUS_SUMMARY_FIELDS = [
  { attribute: "physicalAttack", label: "物攻" },
  { attribute: "magicAttack", label: "法攻" },
  { attribute: "physicalDefensePercent", label: "物防", unit: "%" },
  { attribute: "magicDefensePercent", label: "法防", unit: "%" },
] as const;

type TianshuBonusOption = TianshuBonusControlOption & {
  attribute: CharacterBonusAttribute;
  value: number;
};

const createTianshuBonusOptions = (characterLevel: CharacterLevel) => [
  {
    id: "constitution-20",
    title: "20体",
    effectLabel: "+20 体",
    attribute: "constitution",
    value: 20,
  },
  {
    id: "spirit-20",
    title: "20灵",
    effectLabel: "+20 灵",
    attribute: "spirit",
    value: 20,
  },
  {
    id: "strength-20",
    title: "20力",
    effectLabel: "+20 力",
    attribute: "strength",
    value: 20,
  },
  {
    id: "endurance-20",
    title: "20耐",
    effectLabel: "+20 耐",
    attribute: "endurance",
    value: 20,
  },
  {
    id: "agility-20",
    title: "20敏",
    effectLabel: "+20 敏",
    attribute: "agility",
    value: 20,
  },
  {
    id: "health-level-1",
    title: "等级 × 1 气血",
    effectLabel: `+${characterLevel} 气血`,
    attribute: "health",
    value: characterLevel,
  },
  {
    id: "magic-attack-level-02",
    title: "等级 × 0.2 法攻",
    effectLabel: `+${characterLevel * 0.2} 法攻`,
    attribute: "magicAttack",
    value: characterLevel * 0.2,
  },
  {
    id: "magic-attack-level-03",
    title: "等级 × 0.3 法攻",
    effectLabel: `+${characterLevel * 0.3} 法攻`,
    attribute: "magicAttack",
    value: characterLevel * 0.3,
  },
  {
    id: "physical-attack-level-02",
    title: "等级 × 0.2 物攻",
    effectLabel: `+${characterLevel * 0.2} 物攻`,
    attribute: "physicalAttack",
    value: characterLevel * 0.2,
  },
  {
    id: "physical-attack-level-03",
    title: "等级 × 0.3 物攻",
    effectLabel: `+${characterLevel * 0.3} 物攻`,
    attribute: "physicalAttack",
    value: characterLevel * 0.3,
  },
  {
    id: "seal-hit-2",
    title: "2封印命中",
    effectLabel: "+2 封印命中",
    attribute: "sealHit",
    value: 2,
  },
  {
    id: "seal-resistance-2",
    title: "2封印抵抗",
    effectLabel: "+2 封印抵抗",
    attribute: "sealResistance",
    value: 2,
  },
  {
    id: "seal-resistance-3",
    title: "3封印抗性",
    effectLabel: "+3 封印抵抗",
    attribute: "sealResistance",
    value: 3,
  },
  {
    id: "speed-percent-2",
    title: "2%速度",
    effectLabel: "+2% 速度",
    attribute: "speedPercent",
    value: 2,
  },
  ...AFFINITY_BONUS_FIELDS.map(({ attribute, label }) => ({
    id: `${attribute}-2`,
    title: `2点${label}`,
    effectLabel: `+2 ${label}`,
    attribute,
    value: 2,
  })),
] satisfies readonly TianshuBonusOption[];

const TIANSHU_BONUS_OPTIONS = createTianshuBonusOptions(CHARACTER_LEVEL);

const TIANSHU_BONUS_SUMMARY_FIELDS = [
  { attribute: "constitution", label: "体" },
  { attribute: "spirit", label: "灵" },
  { attribute: "strength", label: "力" },
  { attribute: "endurance", label: "耐" },
  { attribute: "agility", label: "敏" },
  { attribute: "health", label: "气血" },
  { attribute: "magicAttack", label: "法攻" },
  { attribute: "physicalAttack", label: "物攻" },
  { attribute: "sealHit", label: "封印命中" },
  { attribute: "sealResistance", label: "封印抵抗" },
  { attribute: "speedPercent", label: "速度", unit: "%" },
  ...AFFINITY_BONUS_FIELDS,
] as const;

const AFFINITY_BACKGROUND_CLASSES = {
  fireAffinity: "bg-[#f6e0e0]",
  iceAffinity: "bg-[#e0f1f6]",
  electricAffinity: "bg-[#f5ede0]",
  poisonAffinity: "bg-[#f1e5f6]",
  waterAffinity: "bg-[#e0e9f6]",
  windAffinity: "bg-[#e0f5f4]",
} as const;

const DERIVED_ATTRIBUTES = [
  ["magicAttack", "法攻"],
  ["magicDefense", "法防"],
  ["physicalAttack", "物攻"],
  ["physicalDefense", "物防"],
  ["speed", "速度"],
] as const;

const PRIMARY_ATTRIBUTE_SHORT_LABELS: Record<PrimaryAttribute, string> = {
  constitution: "体",
  spirit: "灵",
  strength: "力",
  endurance: "耐",
  agility: "敏",
};

type AttributeTab = "basic" | "advanced";
type EditorId =
  | "allocation"
  | "soulArtifact"
  | "divineSoul"
  | "tianshu"
  | "talisman"
  | "seasonArtifact"
  | "charm"
  | "sanshengPill"
  | "satin"
  | "transformationTalisman"
  | "guildBlessing"
  | "guildTalent"
  | "characterTraining"
  | "starBlessing"
  | "temporaryTalisman"
  | "skill";
type AttributeBonusSourceId = Exclude<EditorId, "allocation">;
type EditorDefinition = {
  id: EditorId;
  title: string;
  renderContent: (title: string) => ReactNode;
};
type AttributeBonusSource =
  AttributeBonusSummarySource<AttributeBonusSourceId> & {
    renderContent: (title: string) => ReactNode;
  };

const SATIN_ATTRIBUTE_SHORT_LABELS: Record<SatinBonusAttribute, string> = {
  physicalAttack: "物攻",
  magicAttack: "法攻",
  physicalDefense: "物防",
  magicDefense: "法防",
  speed: "速度",
};

const ADVANCED_ATTRIBUTE_COLUMNS = [
  [
    { label: "物理暴击", attribute: "physicalCritical", unit: "%" },
    { label: "法术暴击", attribute: "magicalCritical", unit: "%" },
    { label: "命中率", attribute: "hitRate", unit: "%" },
    { label: "躲避率", attribute: "dodgeRate", unit: "%" },
  ],
  [
    { label: "治疗暴击", attribute: "healingCritical", unit: "%" },
    { label: "治疗强度", attribute: "healingPower", unit: "" },
    { label: "封印命中", attribute: "sealHit", unit: "", growsWithLevel: true },
    { label: "封印抵抗", attribute: "sealResistance", unit: "" },
  ],
] as const;

const formatAttribute = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");

/** 游戏角色面板只展示整数；内部计算值仍保留完整精度。 */
const formatPanelAttribute = (value: number) =>
  String(Math.floor(Number(value.toFixed(10))));

const formatBonus = (value: number) =>
  `${value > 0 ? "+" : ""}${formatAttribute(value)}`;

type AttributeValueLayoutProps = {
  bonuses?: ReactNode;
  value: ReactNode;
};

/** 最终值固定在行尾；空间不足时，左侧加成可独立换行。 */
const AttributeValueLayout = ({
  bonuses,
  value,
}: AttributeValueLayoutProps) => (
  <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-2 text-right">
    <div className="min-w-0 leading-5">{bonuses}</div>
    {value}
  </div>
);

const createBonusSummaryItems = (
  fields: readonly {
    attribute: CharacterBonusAttribute;
    label: string;
    unit?: string;
  }[],
  values: Partial<Record<CharacterBonusAttribute, number>>
) =>
  fields
    .filter(({ attribute }) => (values[attribute] ?? 0) !== 0)
    .map(({ attribute, label, unit }) => ({
      label,
      value: values[attribute] ?? 0,
      unit,
    }));

const createSinglePrimaryAttributeBonuses = (
  attribute: PrimaryAttribute | null,
  value: number
) => {
  const bonuses = createEmptyCharacterAttributeBonuses();

  if (attribute) {
    bonuses[attribute] = value;
  }

  return bonuses;
};

const createSanshengPillAttributeBonuses = (
  counts: CharacterAllocation
): CharacterAttributeBonuses => ({
  ...createEmptyCharacterAttributeBonuses(),
  ...calculateSanshengPillBonuses(counts),
});

const createSelectedAttributeBonuses = (
  selections: readonly SelectableBonusSelection[]
) => {
  const bonuses = createEmptyCharacterAttributeBonuses();

  for (const selection of selections) {
    bonuses[selection.attribute] = selection.value;
  }

  return bonuses;
};

const createTemporaryTalismanBonuses = (
  star: TemporaryTalismanStar | null,
  attributes: readonly TemporaryTalismanBonusAttribute[]
) => {
  const bonuses = createEmptyCharacterAttributeBonuses();
  if (star !== 6) return bonuses;

  const selectedAttributes = new Set<CharacterBonusAttribute>(attributes);
  for (const { attribute, value } of TEMPORARY_TALISMAN_BONUS_FIELDS) {
    if (selectedAttributes.has(attribute)) {
      bonuses[attribute] = value;
    }
  }

  return bonuses;
};

const createFixedAttributeBonuses = (
  fields: readonly { attribute: CharacterBonusAttribute; value: number }[],
  enabled: boolean
) => {
  const bonuses = createEmptyCharacterAttributeBonuses();

  if (enabled) {
    for (const { attribute, value } of fields) {
      bonuses[attribute] = value;
    }
  }

  return bonuses;
};

const createGuildTalentBonuses = (
  optionIds: readonly GuildTalentOptionId[]
) => {
  const selectedOptionIds = new Set(optionIds);

  return combineCharacterAttributeBonuses(
    ...GUILD_TALENT_OPTIONS.filter(({ id }) =>
      selectedOptionIds.has(id)
    ).map(({ bonuses }) => bonuses)
  );
};

const createDivineSoulBonuses = (value: number) => {
  const bonuses = createEmptyCharacterAttributeBonuses();

  for (const { attribute } of DIVINE_SOUL_BONUS_FIELDS) {
    bonuses[attribute] = value;
  }

  return bonuses;
};

const createTianshuBonuses = (
  counts: Readonly<Record<string, number>>,
  options: readonly TianshuBonusOption[] = TIANSHU_BONUS_OPTIONS
) => {
  const bonuses = createEmptyCharacterAttributeBonuses();

  for (const option of options) {
    bonuses[option.attribute] += option.value * (counts[option.id] ?? 0);
  }

  return bonuses;
};

const createTalismanBonuses = (
  optionId: TalismanBonusOptionId | null,
  options: readonly TalismanBonusOption[] = TALISMAN_BONUS_OPTIONS
) => {
  const bonuses = createEmptyCharacterAttributeBonuses();
  const option = options.find(({ id }) => id === optionId);

  if (option) {
    Object.assign(bonuses, option.bonuses);
  }

  return bonuses;
};

const createStarBlessingBonuses = (
  attributes: readonly PrimaryAttribute[],
  value: StarBlessingBonusValue
) => {
  const bonuses = createEmptyCharacterAttributeBonuses();

  if (attributes.length === STAR_BLESSING_ATTRIBUTE_COUNT) {
    for (const attribute of attributes) {
      bonuses[attribute] = value;
    }
  }

  return bonuses;
};

/** 新增长期表单字段时，必须同步更新默认值、标准化、保存对象和恢复测试。 */
type CharacterCalculatorState = {
  allocationMode: CharacterAllocationMode;
  selectedPresetId: CharacterAllocationPresetId;
  customAllocationScheme: CustomCharacterAllocationScheme;
  customAllocation: CharacterAllocation;
  skillBonuses: CharacterAttributeBonuses;
  temporaryTalismanStar: TemporaryTalismanStar | null;
  temporaryTalismanAttributes: readonly TemporaryTalismanBonusAttribute[];
  soulArtifactBonuses: CharacterAttributeBonuses;
  divineSoulValue: number;
  tianshuBonusCounts: Readonly<Record<string, number>>;
  talismanOptionId: TalismanBonusOptionId | null;
  seasonArtifactAttribute: PrimaryAttribute | null;
  seasonArtifactValue: number;
  charmAttribute: PrimaryAttribute | null;
  charmValue: number;
  sanshengPillCounts: CharacterAllocation;
  satinSelections: readonly SatinBonusSelection[];
  transformationTalismanSelections: readonly TransformationTalismanBonusSelection[];
  isGuildBlessingEnabled: boolean;
  guildTalentOptionIds: readonly GuildTalentOptionId[];
  characterTrainingLevels: CharacterTrainingLevels;
  starBlessingAttributes: readonly PrimaryAttribute[];
  starBlessingValue: StarBlessingBonusValue;
};

const createDefaultCharacterCalculatorState = (): CharacterCalculatorState => ({
  allocationMode: "preset",
  selectedPresetId: CHARACTER_ALLOCATION_PRESETS[0].id,
  customAllocationScheme: "strength-or-spirit",
  customAllocation: { ...DEFAULT_CUSTOM_CHARACTER_ALLOCATION },
  skillBonuses: createEmptyCharacterAttributeBonuses(),
  temporaryTalismanStar: null,
  temporaryTalismanAttributes: [],
  soulArtifactBonuses: createEmptyCharacterAttributeBonuses(),
  divineSoulValue: 0,
  tianshuBonusCounts: {},
  talismanOptionId: null,
  seasonArtifactAttribute: null,
  seasonArtifactValue: 0,
  charmAttribute: null,
  charmValue: 0,
  sanshengPillCounts: { ...EMPTY_CHARACTER_ALLOCATION },
  satinSelections: [],
  transformationTalismanSelections: [],
  isGuildBlessingEnabled: false,
  guildTalentOptionIds: [],
  characterTrainingLevels: createDefaultCharacterTrainingLevels(),
  starBlessingAttributes: [],
  starBlessingValue: 18,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const normalizeCharacterBonuses = (
  value: unknown
): CharacterAttributeBonuses => {
  const bonuses = createEmptyCharacterAttributeBonuses();
  if (!isRecord(value)) return bonuses;

  for (const attribute of CHARACTER_BONUS_ATTRIBUTE_KEYS) {
    const storedValue = value[attribute];
    if (typeof storedValue === "number" && Number.isFinite(storedValue)) {
      bonuses[attribute] = storedValue;
    }
  }

  return bonuses;
};

const PRIMARY_ATTRIBUTE_SET = new Set<string>(PRIMARY_ATTRIBUTE_KEYS);
const CHARACTER_PRESET_ID_SET = new Set<string>(
  CHARACTER_ALLOCATION_PRESETS.map(({ id }) => id)
);
const TALISMAN_OPTION_ID_SET = new Set<string>(
  TALISMAN_BONUS_OPTIONS.map(({ id }) => id)
);
const TIANSHU_OPTION_ID_SET = new Set<string>(
  TIANSHU_BONUS_OPTIONS.map(({ id }) => id)
);
const SATIN_ATTRIBUTE_SET = new Set<string>(
  Object.keys(SATIN_ATTRIBUTE_SHORT_LABELS)
);
const TRANSFORMATION_TALISMAN_ATTRIBUTE_SET = new Set<string>(
  TRANSFORMATION_TALISMAN_BONUS_FIELDS.map(({ attribute }) => attribute)
);
const TEMPORARY_TALISMAN_ATTRIBUTE_SET = new Set<string>(
  TEMPORARY_TALISMAN_BONUS_FIELDS.map(({ attribute }) => attribute)
);
const GUILD_TALENT_OPTION_ID_SET = new Set<string>(
  GUILD_TALENT_OPTIONS.map(({ id }) => id)
);

const isPrimaryAttribute = (value: unknown): value is PrimaryAttribute =>
  typeof value === "string" && PRIMARY_ATTRIBUTE_SET.has(value);

const normalizeNonNegativeNumber = (
  value: unknown,
  fallback = 0,
  maximum = Number.POSITIVE_INFINITY
) =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= 0 &&
  value <= maximum
    ? value
    : fallback;

const normalizeCustomCharacterAllocation = (
  value: unknown,
  scheme: CustomCharacterAllocationScheme
): CharacterAllocation => {
  const fallback = {
    ...(scheme === "agility"
      ? DEFAULT_AGILITY_CHARACTER_ALLOCATION
      : DEFAULT_CUSTOM_CHARACTER_ALLOCATION),
  };
  if (!isRecord(value)) return fallback;

  const allocation = { ...EMPTY_CHARACTER_ALLOCATION };
  for (const attribute of PRIMARY_ATTRIBUTE_KEYS) {
    const storedValue = value[attribute];
    if (
      typeof storedValue !== "number" ||
      !Number.isInteger(storedValue) ||
      storedValue < 0 ||
      storedValue > 10
    ) {
      return fallback;
    }
    allocation[attribute] = storedValue;
  }

  return getCustomCharacterAllocationValidationError(allocation, scheme)
    ? fallback
    : allocation;
};

const normalizeTianshuCounts = (
  value: unknown
): Readonly<Record<string, number>> => {
  if (!isRecord(value)) return {};

  const counts: Record<string, number> = {};
  for (const [optionId, count] of Object.entries(value)) {
    if (
      TIANSHU_OPTION_ID_SET.has(optionId) &&
      typeof count === "number" &&
      Number.isInteger(count) &&
      count > 0
    ) {
      counts[optionId] = count;
    }
  }

  return counts;
};

const normalizeBonusSelections = <Attribute extends CharacterBonusAttribute>(
  value: unknown,
  allowedAttributes: ReadonlySet<string>,
  maximumSelectionCount: number
): readonly SelectableBonusSelection<Attribute>[] => {
  if (!Array.isArray(value)) return [];

  const seenAttributes = new Set<string>();
  const selections: SelectableBonusSelection<Attribute>[] = [];

  for (const candidate of value) {
    if (!isRecord(candidate)) continue;

    const { attribute, value: storedValue } = candidate;
    if (
      typeof attribute !== "string" ||
      !allowedAttributes.has(attribute) ||
      seenAttributes.has(attribute) ||
      typeof storedValue !== "number" ||
      !Number.isFinite(storedValue) ||
      storedValue < 0
    ) {
      continue;
    }

    seenAttributes.add(attribute);
    selections.push({ attribute: attribute as Attribute, value: storedValue });
    if (selections.length === maximumSelectionCount) break;
  }

  return selections;
};

const normalizePrimaryAttributes = (value: unknown): PrimaryAttribute[] => {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isPrimaryAttribute)
    .filter((attribute, index, attributes) => attributes.indexOf(attribute) === index)
    .slice(0, STAR_BLESSING_ATTRIBUTE_COUNT);
};

const normalizeSanshengPillCounts = (value: unknown): CharacterAllocation => {
  const counts = { ...EMPTY_CHARACTER_ALLOCATION };
  if (!isRecord(value)) return counts;

  let remainingCount = calculateSanshengPillMaximumCount();

  for (const attribute of PRIMARY_ATTRIBUTE_KEYS) {
    const storedCount = value[attribute];
    if (
      typeof storedCount !== "number" ||
      !Number.isInteger(storedCount) ||
      storedCount < 0
    ) {
      continue;
    }

    counts[attribute] = Math.min(storedCount, remainingCount);
    remainingCount -= counts[attribute];
  }

  return counts;
};

const normalizeTemporaryTalismanAttributes = (
  value: unknown
): TemporaryTalismanBonusAttribute[] => {
  if (!Array.isArray(value)) return [];

  const storedAttributes = new Set(
    value.filter(
      (attribute): attribute is string =>
        typeof attribute === "string" &&
        TEMPORARY_TALISMAN_ATTRIBUTE_SET.has(attribute)
    )
  );

  return TEMPORARY_TALISMAN_BONUS_FIELDS.map(({ attribute }) => attribute).filter(
    (attribute) => storedAttributes.has(attribute)
  );
};

const normalizeGuildTalentOptionIds = (
  value: unknown,
  legacyEnabled: unknown
): GuildTalentOptionId[] => {
  if (!Array.isArray(value)) {
    return legacyEnabled === true
      ? GUILD_TALENT_OPTIONS.map(({ id }) => id)
      : [];
  }

  const storedOptionIds = new Set(
    value.filter(
      (optionId): optionId is string =>
        typeof optionId === "string" &&
        GUILD_TALENT_OPTION_ID_SET.has(optionId)
    )
  );

  return GUILD_TALENT_OPTIONS.map(({ id }) => id).filter((optionId) =>
    storedOptionIds.has(optionId)
  );
};

const normalizeCharacterCalculatorState = (
  value: unknown
): CharacterCalculatorState | null => {
  if (!isRecord(value)) return null;

  const selectedPresetId =
    typeof value.selectedPresetId === "string" &&
    CHARACTER_PRESET_ID_SET.has(value.selectedPresetId)
      ? (value.selectedPresetId as CharacterAllocationPresetId)
      : CHARACTER_ALLOCATION_PRESETS[0].id;
  const customAllocationScheme: CustomCharacterAllocationScheme =
    value.customAllocationScheme === "agility"
      ? "agility"
      : "strength-or-spirit";
  const talismanOptionId =
    typeof value.talismanOptionId === "string" &&
    TALISMAN_OPTION_ID_SET.has(value.talismanOptionId)
      ? (value.talismanOptionId as TalismanBonusOptionId)
      : null;
  const temporaryTalismanStar =
    value.temporaryTalismanStar === 6 ? 6 : null;

  return {
    allocationMode: value.allocationMode === "custom" ? "custom" : "preset",
    selectedPresetId,
    customAllocationScheme,
    customAllocation: normalizeCustomCharacterAllocation(
      value.customAllocation,
      customAllocationScheme
    ),
    skillBonuses: normalizeCharacterBonuses(value.skillBonuses),
    temporaryTalismanStar,
    temporaryTalismanAttributes:
      temporaryTalismanStar === 6
        ? normalizeTemporaryTalismanAttributes(
            value.temporaryTalismanAttributes
          )
        : [],
    soulArtifactBonuses: normalizeCharacterBonuses(value.soulArtifactBonuses),
    divineSoulValue: normalizeNonNegativeNumber(value.divineSoulValue),
    tianshuBonusCounts: normalizeTianshuCounts(value.tianshuBonusCounts),
    talismanOptionId,
    seasonArtifactAttribute: isPrimaryAttribute(value.seasonArtifactAttribute)
      ? value.seasonArtifactAttribute
      : null,
    seasonArtifactValue: normalizeNonNegativeNumber(value.seasonArtifactValue),
    charmAttribute: isPrimaryAttribute(value.charmAttribute)
      ? value.charmAttribute
      : null,
    charmValue: normalizeNonNegativeNumber(
      value.charmValue,
      0,
      CHARM_BONUS_MAX_VALUE
    ),
    sanshengPillCounts: normalizeSanshengPillCounts(value.sanshengPillCounts),
    satinSelections: normalizeBonusSelections<SatinBonusAttribute>(
      value.satinSelections,
      SATIN_ATTRIBUTE_SET,
      2
    ),
    transformationTalismanSelections:
      normalizeBonusSelections<TransformationTalismanBonusAttribute>(
        value.transformationTalismanSelections,
        TRANSFORMATION_TALISMAN_ATTRIBUTE_SET,
        2
      ),
    isGuildBlessingEnabled: value.isGuildBlessingEnabled === true,
    guildTalentOptionIds: normalizeGuildTalentOptionIds(
      value.guildTalentOptionIds,
      value.isGuildTalentEnabled
    ),
    characterTrainingLevels: normalizeCharacterTrainingLevels(
      value.characterTrainingLevels
    ),
    starBlessingAttributes: normalizePrimaryAttributes(
      value.starBlessingAttributes
    ),
    starBlessingValue: value.starBlessingValue === 25 ? 25 : 18,
  };
};

const loadCharacterCalculatorState = (): CharacterCalculatorState => {
  const currentState = loadCalculatorState<CharacterCalculatorState | null>(
    CHARACTER_ATTRIBUTES_STORAGE_KEY,
    null,
    normalizeCharacterCalculatorState
  );

  if (currentState) return currentState;

  return loadCalculatorState(
    LEGACY_CHARACTER_ATTRIBUTES_STORAGE_KEY,
    createDefaultCharacterCalculatorState(),
    normalizeCharacterCalculatorState
  );
};

type CharacterAttributeCalculatorProps = {
  characterLevel?: CharacterLevel;
  onCharacterLevelChange?: (characterLevel: CharacterLevel) => void;
  equipmentBonuses?: CharacterAttributeBonuses;
  equipmentItemCount?: number;
};

const CharacterAttributeCalculator = ({
  characterLevel = CHARACTER_LEVEL,
  onCharacterLevelChange = () => undefined,
  equipmentBonuses = createEmptyCharacterAttributeBonuses(),
  equipmentItemCount = 0,
}: CharacterAttributeCalculatorProps) => {
  const [initialState] = useState(loadCharacterCalculatorState);
  const [allocationMode, setAllocationMode] =
    useState<CharacterAllocationMode>(initialState.allocationMode);
  const [selectedPresetId, setSelectedPresetId] =
    useState<CharacterAllocationPresetId>(initialState.selectedPresetId);
  const [customAllocationScheme, setCustomAllocationScheme] =
    useState<CustomCharacterAllocationScheme>(
      initialState.customAllocationScheme
    );
  const [customAllocation, setCustomAllocation] = useState(
    initialState.customAllocation
  );
  const [activeAttributeTab, setActiveAttributeTab] =
    useState<AttributeTab>("basic");
  const [areBonusDetailsVisible, setAreBonusDetailsVisible] = useState(true);
  const [skillBonuses, setSkillBonuses] = useState<CharacterAttributeBonuses>(
    initialState.skillBonuses
  );
  const [temporaryTalismanStar, setTemporaryTalismanStar] =
    useState<TemporaryTalismanStar | null>(initialState.temporaryTalismanStar);
  const [temporaryTalismanAttributes, setTemporaryTalismanAttributes] = useState<
    readonly TemporaryTalismanBonusAttribute[]
  >(
    initialState.temporaryTalismanAttributes
  );
  const [soulArtifactBonuses, setSoulArtifactBonuses] = useState(
    initialState.soulArtifactBonuses
  );
  const [divineSoulValue, setDivineSoulValue] = useState(
    initialState.divineSoulValue
  );
  const [tianshuBonusCounts, setTianshuBonusCounts] = useState<
    Readonly<Record<string, number>>
  >(initialState.tianshuBonusCounts);
  const [talismanOptionId, setTalismanOptionId] =
    useState<TalismanBonusOptionId | null>(initialState.talismanOptionId);
  const [seasonArtifactAttribute, setSeasonArtifactAttribute] =
    useState<PrimaryAttribute | null>(initialState.seasonArtifactAttribute);
  const [seasonArtifactValue, setSeasonArtifactValue] = useState(
    initialState.seasonArtifactValue
  );
  const [charmAttribute, setCharmAttribute] =
    useState<PrimaryAttribute | null>(initialState.charmAttribute);
  const [charmValue, setCharmValue] = useState(initialState.charmValue);
  const [sanshengPillCounts, setSanshengPillCounts] = useState(
    initialState.sanshengPillCounts
  );
  const [satinSelections, setSatinSelections] = useState<
    readonly SatinBonusSelection[]
  >(initialState.satinSelections);
  const [transformationTalismanSelections, setTransformationTalismanSelections] =
    useState<readonly TransformationTalismanBonusSelection[]>(
      initialState.transformationTalismanSelections
    );
  const [isGuildBlessingEnabled, setIsGuildBlessingEnabled] = useState(
    initialState.isGuildBlessingEnabled
  );
  const [guildTalentOptionIds, setGuildTalentOptionIds] = useState<
    readonly GuildTalentOptionId[]
  >(
    initialState.guildTalentOptionIds
  );
  const [characterTrainingLevels, setCharacterTrainingLevels] = useState(
    initialState.characterTrainingLevels
  );
  const [starBlessingAttributes, setStarBlessingAttributes] = useState<
    readonly PrimaryAttribute[]
  >(initialState.starBlessingAttributes);
  const [starBlessingValue, setStarBlessingValue] =
    useState<StarBlessingBonusValue>(initialState.starBlessingValue);
  const [activeEditorId, setActiveEditorId] = useState<EditorId | null>(null);
  const [leftAttributePanelHeight, setLeftAttributePanelHeight] = useState(0);
  const leftAttributePanelRef = useRef<HTMLElement>(null);
  const closeEditor = useCallback(() => setActiveEditorId(null), []);
  const characterUpgradeCount = getCharacterUpgradeCount(characterLevel);
  const totalPotentialPoints = getTotalPotentialPoints(characterLevel);
  const fixedStatusAttributes = useMemo(
    () => calculateFixedStatusAttributes(characterLevel),
    [characterLevel]
  );
  const tianshuBonusOptions = useMemo(
    () => createTianshuBonusOptions(characterLevel),
    [characterLevel]
  );
  const talismanBonusOptions = useMemo(
    () => createTalismanBonusOptions(characterLevel),
    [characterLevel]
  );

  useEffect(() => {
    saveCalculatorState<CharacterCalculatorState>(
      CHARACTER_ATTRIBUTES_STORAGE_KEY,
      {
        allocationMode,
        selectedPresetId,
        customAllocationScheme,
        customAllocation,
        skillBonuses,
        temporaryTalismanStar,
        temporaryTalismanAttributes,
        soulArtifactBonuses,
        divineSoulValue,
        tianshuBonusCounts,
        talismanOptionId,
        seasonArtifactAttribute,
        seasonArtifactValue,
        charmAttribute,
        charmValue,
        sanshengPillCounts,
        satinSelections,
        transformationTalismanSelections,
        isGuildBlessingEnabled,
        guildTalentOptionIds,
        characterTrainingLevels,
        starBlessingAttributes,
        starBlessingValue,
      }
    );
  }, [
    allocationMode,
    selectedPresetId,
    customAllocationScheme,
    customAllocation,
    skillBonuses,
    temporaryTalismanStar,
    temporaryTalismanAttributes,
    soulArtifactBonuses,
    divineSoulValue,
    tianshuBonusCounts,
    talismanOptionId,
    seasonArtifactAttribute,
    seasonArtifactValue,
    charmAttribute,
    charmValue,
    sanshengPillCounts,
    satinSelections,
    transformationTalismanSelections,
    isGuildBlessingEnabled,
    guildTalentOptionIds,
    characterTrainingLevels,
    starBlessingAttributes,
    starBlessingValue,
  ]);

  useLayoutEffect(() => {
    const panel = leftAttributePanelRef.current;

    if (!panel) {
      return;
    }

    const updatePanelHeight = () => {
      const nextHeight = Math.ceil(panel.getBoundingClientRect().height);

      if (nextHeight > 0) {
        setLeftAttributePanelHeight(nextHeight);
      }
    };

    updatePanelHeight();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updatePanelHeight);
      return () => window.removeEventListener("resize", updatePanelHeight);
    }

    const resizeObserver = new ResizeObserver(updatePanelHeight);
    resizeObserver.observe(panel);

    return () => resizeObserver.disconnect();
  }, []);
  const seasonArtifactBonuses = useMemo(
    () =>
      createSinglePrimaryAttributeBonuses(
        seasonArtifactAttribute,
        seasonArtifactValue
      ),
    [seasonArtifactAttribute, seasonArtifactValue]
  );
  const divineSoulBonuses = useMemo(
    () => createDivineSoulBonuses(divineSoulValue),
    [divineSoulValue]
  );
  const tianshuBonuses = useMemo(
    () => createTianshuBonuses(tianshuBonusCounts, tianshuBonusOptions),
    [tianshuBonusCounts, tianshuBonusOptions]
  );
  const talismanBonuses = useMemo(
    () => createTalismanBonuses(talismanOptionId, talismanBonusOptions),
    [talismanOptionId, talismanBonusOptions]
  );
  const temporaryTalismanBonuses = useMemo(
    () =>
      createTemporaryTalismanBonuses(
        temporaryTalismanStar,
        temporaryTalismanAttributes
      ),
    [temporaryTalismanStar, temporaryTalismanAttributes]
  );
  const charmBonuses = useMemo(
    () => createSinglePrimaryAttributeBonuses(charmAttribute, charmValue),
    [charmAttribute, charmValue]
  );
  const sanshengPillBonuses = useMemo(
    () => createSanshengPillAttributeBonuses(sanshengPillCounts),
    [sanshengPillCounts]
  );
  const satinBonuses = useMemo(
    () => createSelectedAttributeBonuses(satinSelections),
    [satinSelections]
  );
  const transformationTalismanBonuses = useMemo(
    () => createSelectedAttributeBonuses(transformationTalismanSelections),
    [transformationTalismanSelections]
  );
  const guildBlessingBonuses = useMemo(
    () =>
      createFixedAttributeBonuses(
        GUILD_BLESSING_FIELDS,
        isGuildBlessingEnabled
      ),
    [isGuildBlessingEnabled]
  );
  const guildTalentBonuses = useMemo(
    () => createGuildTalentBonuses(guildTalentOptionIds),
    [guildTalentOptionIds]
  );
  const characterTrainingBonuses = useMemo(
    () => calculateCharacterTrainingBonuses(characterTrainingLevels),
    [characterTrainingLevels]
  );
  const starBlessingBonuses = useMemo(
    () =>
      createStarBlessingBonuses(starBlessingAttributes, starBlessingValue),
    [starBlessingAttributes, starBlessingValue]
  );
  const selectedPreset =
    CHARACTER_ALLOCATION_PRESETS.find(({ id }) => id === selectedPresetId) ??
    CHARACTER_ALLOCATION_PRESETS[0];
  const customAllocationValidationError =
    getCustomCharacterAllocationValidationError(
      customAllocation,
      customAllocationScheme
    );
  const selectedAllocationRatio =
    allocationMode === "custom" && customAllocationValidationError === null
      ? customAllocation
      : selectedPreset.ratio;
  const allocation = useMemo(
    () => calculatePresetAllocation(selectedAllocationRatio, characterLevel),
    [characterLevel, selectedAllocationRatio]
  );
  const calculated = useMemo(
    () => calculateCharacterAttributes(allocation, characterLevel),
    [allocation, characterLevel]
  );
  const soulArtifactPrimaryTotal = getPrimaryAttributeBonusTotal(
    soulArtifactBonuses
  );
  const areSoulArtifactBonusesValid = arePrimaryAttributeBonusesBalanced(
    soulArtifactBonuses
  );
  const soulArtifactValidationError = areSoulArtifactBonusesValid
    ? null
    : `魂器的体/灵/力/耐/敏增减合计必须为 0，当前合计为 ${formatBonus(
        soulArtifactPrimaryTotal
      )}；本组属性暂未计入结果。`;
  const totalBonuses = useMemo(
    () =>
      combineCharacterAttributeBonuses(
        equipmentBonuses,
        skillBonuses,
        areSoulArtifactBonusesValid ? soulArtifactBonuses : {},
        divineSoulBonuses,
        tianshuBonuses,
        talismanBonuses,
        seasonArtifactBonuses,
        charmBonuses,
        sanshengPillBonuses,
        satinBonuses,
        transformationTalismanBonuses,
        guildBlessingBonuses,
        guildTalentBonuses,
        characterTrainingBonuses,
        starBlessingBonuses,
        temporaryTalismanBonuses
      ),
    [
      equipmentBonuses,
      skillBonuses,
      soulArtifactBonuses,
      divineSoulBonuses,
      tianshuBonuses,
      talismanBonuses,
      seasonArtifactBonuses,
      charmBonuses,
      sanshengPillBonuses,
      satinBonuses,
      transformationTalismanBonuses,
      guildBlessingBonuses,
      guildTalentBonuses,
      characterTrainingBonuses,
      starBlessingBonuses,
      temporaryTalismanBonuses,
      areSoulArtifactBonusesValid,
    ]
  );
  const effectiveAttributes = useMemo(
    () =>
      applyCharacterAttributeBonuses(
        calculated,
        totalBonuses,
        characterLevel
    ),
    [calculated, characterLevel, totalBonuses]
  );
  const customMainAttribute: PrimaryAttribute =
    customAllocation.strength > 0 ? "strength" : "spirit";
  const allocationDisplayOrder: readonly PrimaryAttribute[] =
    allocationMode === "custom"
      ? customAllocationScheme === "agility"
        ? ["agility", "constitution", "endurance"]
        : [customMainAttribute, "constitution", "endurance", "agility"]
      : PRIMARY_ATTRIBUTE_KEYS;
  const allocationPlanLabel =
    allocationMode === "custom"
      ? allocationDisplayOrder
          .filter((attribute) => customAllocation[attribute] > 0)
          .map(
            (attribute) =>
              `${customAllocation[attribute]}${PRIMARY_ATTRIBUTE_SHORT_LABELS[attribute]}`
          )
          .join("")
      : selectedPreset.label;
  const allocationSummary = allocationDisplayOrder.filter(
    (attribute) => allocation[attribute] > 0
  )
    .map(
      (attribute) =>
        `${PRIMARY_ATTRIBUTE_SHORT_LABELS[attribute]} +${allocation[attribute]}`
    )
    .join(" · ");
  const soulArtifactSummaryItems = createBonusSummaryItems(
    SOUL_ARTIFACT_BONUS_FIELDS,
    soulArtifactBonuses
  );
  const divineSoulSummaryItems = createBonusSummaryItems(
    DIVINE_SOUL_BONUS_FIELDS,
    divineSoulBonuses
  );
  const tianshuSummaryItems = createBonusSummaryItems(
    TIANSHU_BONUS_SUMMARY_FIELDS,
    tianshuBonuses
  );
  const selectedTalismanOption = talismanBonusOptions.find(
    ({ id }) => id === talismanOptionId
  );
  const talismanSummaryItems = createBonusSummaryItems(
    TALISMAN_BONUS_SUMMARY_FIELDS,
    talismanBonuses
  ).map((item, index) =>
    index === 0 && selectedTalismanOption
      ? { ...item, label: `${selectedTalismanOption.name} · ${item.label}` }
      : item
  );
  const talismanSourceLabel = selectedTalismanOption
    ? `法宝（${selectedTalismanOption.name}）`
    : "法宝";
  const seasonArtifactSummaryItems =
    seasonArtifactAttribute && seasonArtifactValue !== 0
      ? [
          {
            label: PRIMARY_ATTRIBUTE_SHORT_LABELS[seasonArtifactAttribute],
            value: seasonArtifactValue,
          },
        ]
      : [];
  const charmSummaryItems =
    charmAttribute && charmValue !== 0
      ? [
          {
            label: PRIMARY_ATTRIBUTE_SHORT_LABELS[charmAttribute],
            value: charmValue,
          },
        ]
      : [];
  const currentYear = new Date().getFullYear();
  const sanshengPillMaximumCount =
    calculateSanshengPillMaximumCount(currentYear);
  const sanshengPillUsedCount = PRIMARY_ATTRIBUTE_KEYS.reduce(
    (total, attribute) => total + sanshengPillCounts[attribute],
    0
  );
  const sanshengPillSummaryItems = PRIMARY_ATTRIBUTE_KEYS.filter(
    (attribute) => sanshengPillBonuses[attribute] > 0
  ).map((attribute) => ({
    label: PRIMARY_ATTRIBUTE_SHORT_LABELS[attribute],
    value: sanshengPillBonuses[attribute],
  }));
  const satinSummaryItems = satinSelections
    .filter(({ value }) => value !== 0)
    .map(({ attribute, value }) => ({
      label: SATIN_ATTRIBUTE_SHORT_LABELS[attribute],
      value,
    }));
  const transformationTalismanSummaryItems = transformationTalismanSelections
    .filter(({ value }) => value !== 0)
    .map(({ attribute, value }) => {
      const field = TRANSFORMATION_TALISMAN_BONUS_FIELDS.find(
        (candidate) => candidate.attribute === attribute
      );

      return {
        label: field?.label ?? attribute,
        value,
        unit: field && "unit" in field ? field.unit : undefined,
      };
    });
  const skillSummaryItems = createBonusSummaryItems(
    SKILL_BONUS_FIELDS,
    skillBonuses
  );
  const temporaryTalismanSummaryItems = createBonusSummaryItems(
    TEMPORARY_TALISMAN_BONUS_FIELDS,
    temporaryTalismanBonuses
  );
  const guildBlessingSummaryItems = createBonusSummaryItems(
    GUILD_BLESSING_FIELDS,
    guildBlessingBonuses
  );
  const guildTalentSummaryItems = createBonusSummaryItems(
    GUILD_TALENT_SUMMARY_FIELDS,
    guildTalentBonuses
  );
  const characterTrainingSummaryItems = createBonusSummaryItems(
    CHARACTER_TRAINING_SUMMARY_FIELDS,
    characterTrainingBonuses
  );
  const characterTrainingDetails = [
    `攻击修炼 ${formatCharacterTrainingLevel(
      characterTrainingLevels.attack
    )}`,
    `物防修炼 ${formatCharacterTrainingLevel(
      characterTrainingLevels.physicalDefense
    )}`,
    `法防修炼 ${formatCharacterTrainingLevel(
      characterTrainingLevels.magicDefense
    )}`,
  ].join(" · ");
  const starBlessingSummaryItems = starBlessingAttributes.map((attribute) => ({
    label: PRIMARY_ATTRIBUTE_SHORT_LABELS[attribute],
    value: starBlessingValue,
  }));
  const starBlessingValidationError =
    starBlessingAttributes.length > 0 &&
    starBlessingAttributes.length !== STAR_BLESSING_ATTRIBUTE_COUNT
      ? `星运祈福必须选择 ${STAR_BLESSING_ATTRIBUTE_COUNT} 项属性后才计入结果。`
      : null;
  const rightRailStyle =
    leftAttributePanelHeight > 0
      ? ({
          "--attribute-panel-height": `${leftAttributePanelHeight}px`,
        } as CSSProperties)
      : undefined;

  const updateSkillBonus = (
    attribute: CharacterBonusAttribute,
    value: number
  ) => {
    setSkillBonuses((current) => ({ ...current, [attribute]: value }));
  };

  const updateSoulArtifactBonus = (
    attribute: CharacterBonusAttribute,
    value: number
  ) => {
    setSoulArtifactBonuses((current) => ({ ...current, [attribute]: value }));
  };

  const updateTianshuBonusCount = (optionId: string, count: number) => {
    setTianshuBonusCounts((current) => {
      const nextCounts = { ...current };

      if (count > 0) {
        nextCounts[optionId] = count;
      } else {
        delete nextCounts[optionId];
      }

      return nextCounts;
    });
  };

  const resetAttributeBonuses = () => {
    const defaults = createDefaultCharacterCalculatorState();

    setSkillBonuses(defaults.skillBonuses);
    setTemporaryTalismanStar(defaults.temporaryTalismanStar);
    setTemporaryTalismanAttributes(defaults.temporaryTalismanAttributes);
    setSoulArtifactBonuses(defaults.soulArtifactBonuses);
    setDivineSoulValue(defaults.divineSoulValue);
    setTianshuBonusCounts(defaults.tianshuBonusCounts);
    setTalismanOptionId(defaults.talismanOptionId);
    setSeasonArtifactAttribute(defaults.seasonArtifactAttribute);
    setSeasonArtifactValue(defaults.seasonArtifactValue);
    setCharmAttribute(defaults.charmAttribute);
    setCharmValue(defaults.charmValue);
    setSanshengPillCounts(defaults.sanshengPillCounts);
    setSatinSelections(defaults.satinSelections);
    setTransformationTalismanSelections(
      defaults.transformationTalismanSelections
    );
    setIsGuildBlessingEnabled(defaults.isGuildBlessingEnabled);
    setGuildTalentOptionIds(defaults.guildTalentOptionIds);
    setCharacterTrainingLevels(defaults.characterTrainingLevels);
    setStarBlessingAttributes(defaults.starBlessingAttributes);
    setStarBlessingValue(defaults.starBlessingValue);
    setActiveEditorId(null);
  };

  const attributeBonusSources: readonly AttributeBonusSource[] = [
    {
      id: "skill",
      title: "技能",
      items: skillSummaryItems,
      renderContent: (title) => (
        <AttributeBonusCard
          title={title}
          description="不同门派的技能加成不同，请按实际数值填写；速度减少时填负数。"
          fields={SKILL_BONUS_FIELDS}
          values={skillBonuses}
          onChange={updateSkillBonus}
          onReset={() =>
            setSkillBonuses(createEmptyCharacterAttributeBonuses())
          }
        />
      ),
    },
    {
      id: "characterTraining",
      title: "人物修炼",
      details: characterTrainingDetails,
      items: characterTrainingSummaryItems,
      renderContent: (title) => (
        <CharacterTrainingBonusControl
          title={title}
          levels={characterTrainingLevels}
          onChange={setCharacterTrainingLevels}
          onReset={() =>
            setCharacterTrainingLevels(createDefaultCharacterTrainingLevels())
          }
        />
      ),
    },
    {
      id: "divineSoul",
      title: "神魂",
      items: divineSoulSummaryItems,
      renderContent: (title) => (
        <UniformAttributeBonusControl
          title={title}
          description="物攻、法攻、物防、法防和气血使用同一个加成数值。"
          attributeLabels={DIVINE_SOUL_BONUS_FIELDS.map(({ label }) => label)}
          value={divineSoulValue}
          onValueChange={setDivineSoulValue}
          onReset={() => setDivineSoulValue(0)}
        />
      ),
    },
    {
      id: "tianshu",
      title: "天书",
      items: tianshuSummaryItems,
      renderContent: (title) => (
        <TianshuBonusControl
          title={title}
          options={tianshuBonusOptions}
          counts={tianshuBonusCounts}
          onCountChange={updateTianshuBonusCount}
          onReset={() => setTianshuBonusCounts({})}
        />
      ),
    },
    {
      id: "talisman",
      title: "法宝",
      items: talismanSummaryItems,
      renderContent: (title) => (
        <TalismanBonusControl
          title={title}
          options={talismanBonusOptions}
          selectedOptionId={talismanOptionId}
          onSelect={(optionId) => {
            const option = talismanBonusOptions.find(
              ({ id }) => id === optionId
            );

            if (option) {
              setTalismanOptionId(option.id);
            }
          }}
          onReset={() => setTalismanOptionId(null)}
        />
      ),
    },
    {
      id: "charm",
      title: "魅灵",
      items: charmSummaryItems,
      renderContent: (title) => (
        <SinglePrimaryAttributeBonusControl
          title={title}
          description="选择一项属性并填写实际潜能点，最高 120 点。"
          selectedAttribute={charmAttribute}
          value={charmValue}
          onSelect={setCharmAttribute}
          onValueChange={setCharmValue}
          maximumValue={CHARM_BONUS_MAX_VALUE}
          onReset={() => {
            setCharmAttribute(null);
            setCharmValue(0);
          }}
        />
      ),
    },
    {
      id: "satin",
      title: "缎纹",
      items: satinSummaryItems,
      renderContent: (title) => (
        <SatinAttributeBonusControl
          title={title}
          selections={satinSelections}
          onChange={setSatinSelections}
        />
      ),
    },
    {
      id: "transformationTalisman",
      title: "幻形符",
      items: transformationTalismanSummaryItems,
      renderContent: (title) => (
        <SelectableAttributeBonusControl
          title={title}
          description="从 10 种属性中选择一至两项；物理、法术暴击率按百分比填写。"
          groupLabel="幻形符属性选择"
          fields={TRANSFORMATION_TALISMAN_BONUS_FIELDS}
          selections={transformationTalismanSelections}
          onChange={setTransformationTalismanSelections}
        />
      ),
    },
    {
      id: "temporaryTalisman",
      title: "灵符",
      badge: temporaryTalismanStar
        ? `${temporaryTalismanStar}星灵符`
        : undefined,
      items: temporaryTalismanSummaryItems,
      renderContent: (title) => (
        <TemporaryTalismanBonusControl
          title={title}
          options={TEMPORARY_TALISMAN_BONUS_FIELDS}
          selectedStar={temporaryTalismanStar}
          selectedAttributes={temporaryTalismanAttributes}
          onStarChange={setTemporaryTalismanStar}
          onSelectedAttributesChange={setTemporaryTalismanAttributes}
          onReset={() => {
            setTemporaryTalismanStar(null);
            setTemporaryTalismanAttributes([]);
          }}
        />
      ),
    },
    {
      id: "soulArtifact",
      title: "魂器",
      items: soulArtifactSummaryItems,
      validationError: soulArtifactValidationError,
      renderContent: (title) => (
        <AttributeBonusCard
          title={title}
          description="体/灵/力/耐/敏可增可减，五项增减合计必须为 0；其余属性只能增加。"
          fields={SOUL_ARTIFACT_BONUS_FIELDS}
          values={soulArtifactBonuses}
          onChange={updateSoulArtifactBonus}
          onReset={() =>
            setSoulArtifactBonuses(createEmptyCharacterAttributeBonuses())
          }
          validationError={soulArtifactValidationError}
        />
      ),
    },
    {
      id: "seasonArtifact",
      title: "赛季神器",
      items: seasonArtifactSummaryItems,
      renderContent: (title) => (
        <SinglePrimaryAttributeBonusControl
          title={title}
          description="选择一项属性，并填写本次实际潜能点。"
          selectedAttribute={seasonArtifactAttribute}
          value={seasonArtifactValue}
          onSelect={setSeasonArtifactAttribute}
          onValueChange={setSeasonArtifactValue}
          onReset={() => {
            setSeasonArtifactAttribute(null);
            setSeasonArtifactValue(0);
          }}
        />
      ),
    },
    {
      id: "guildBlessing",
      title: "帮派祝福",
      items: guildBlessingSummaryItems,
      renderContent: (title) => (
        <GuildBlessingBonusControl
          title={title}
          enabled={isGuildBlessingEnabled}
          items={GUILD_BLESSING_FIELDS}
          onEnabledChange={setIsGuildBlessingEnabled}
        />
      ),
    },
    {
      id: "guildTalent",
      title: "帮派天赋",
      badge:
        guildTalentOptionIds.length > 0
          ? `已选 ${guildTalentOptionIds.length} / ${GUILD_TALENT_OPTIONS.length}`
          : undefined,
      items: guildTalentSummaryItems,
      renderContent: (title) => (
        <GuildTalentBonusControl
          title={title}
          options={GUILD_TALENT_OPTIONS}
          selectedOptionIds={guildTalentOptionIds}
          onChange={setGuildTalentOptionIds}
        />
      ),
    },
    {
      id: "starBlessing",
      title: "星运祈福",
      items: starBlessingSummaryItems,
      validationError: starBlessingValidationError,
      renderContent: (title) => (
        <StarBlessingBonusControl
          title={title}
          selectedAttributes={starBlessingAttributes}
          bonusValue={starBlessingValue}
          onSelectedAttributesChange={setStarBlessingAttributes}
          onBonusValueChange={setStarBlessingValue}
        />
      ),
    },
    {
      id: "sanshengPill",
      title: "三生造化丹",
      badge:
        sanshengPillUsedCount > 0
          ? `已服 ${sanshengPillUsedCount} / ${sanshengPillMaximumCount} 颗`
          : undefined,
      details: `${currentYear} 年上限 ${sanshengPillMaximumCount} 颗`,
      items: sanshengPillSummaryItems,
      renderContent: (title) => (
        <SanshengPillBonusControl
          title={title}
          counts={sanshengPillCounts}
          currentYear={currentYear}
          maximumCount={sanshengPillMaximumCount}
          onChange={setSanshengPillCounts}
        />
      ),
    },
  ];
  const editorDefinitions: readonly EditorDefinition[] = [
    {
      id: "allocation",
      title: "潜力点分配",
      renderContent: (title) => (
        <PotentialAllocationControl
          title={title}
          allocationMode={allocationMode}
          selectedPresetId={selectedPresetId}
          customScheme={customAllocationScheme}
          customAllocation={customAllocation}
          customValidationError={customAllocationValidationError}
          summary={allocationSummary}
          onAllocationModeChange={setAllocationMode}
          onSelectPreset={setSelectedPresetId}
          onCustomSchemeChange={(scheme) => {
            setCustomAllocationScheme(scheme);
            setCustomAllocation({
              ...(scheme === "agility"
                ? DEFAULT_AGILITY_CHARACTER_ALLOCATION
                : DEFAULT_CUSTOM_CHARACTER_ALLOCATION),
            });
          }}
          onCustomAllocationChange={setCustomAllocation}
        />
      ),
    },
    ...attributeBonusSources,
  ];
  const activeEditor = activeEditorId
    ? editorDefinitions.find(({ id }) => id === activeEditorId)
    : undefined;

  return (
    <div className="space-y-5">
      {equipmentItemCount > 0 && (
        <section
          className="flex items-center justify-between gap-4 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-xs text-blue-900"
          aria-label="装备属性接入状态"
        >
          <span>
            已将角色装备中的可映射字段计入最终属性，装备词条明细可在“角色装备”中编辑。
          </span>
          <strong className="shrink-0 font-semibold">{equipmentItemCount} / 8 件</strong>
        </section>
      )}
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(520px,1.2fr)_minmax(360px,0.8fr)]">
        <div
          className="order-1 space-y-4 xl:order-2 xl:max-h-[var(--attribute-panel-height)] xl:overflow-y-auto xl:overscroll-contain xl:pr-1"
          style={rightRailStyle}
          data-testid="attribute-bonus-rail"
        >
          <AttributeBonusSummaryPanel
            sources={attributeBonusSources}
            onEdit={(sourceId) => setActiveEditorId(sourceId)}
            onReset={resetAttributeBonuses}
          />
        </div>

        <section
          ref={leftAttributePanelRef}
          className="order-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 xl:order-1"
          data-testid="attribute-result-panel"
        >
          <div>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">数值条</h2>
                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                  气血和法力均按等级成长；气血还会随体力增加，真气固定为 100。
                </p>
              </div>
              <div className="flex shrink-0 items-end gap-3">
                <label>
                  <span className="block text-[11px] font-medium text-slate-500">
                    角色等级
                  </span>
                  <select
                    aria-label="角色等级"
                    className="mt-1 min-w-24 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    value={characterLevel}
                    onChange={(event) => {
                      const nextLevel = CHARACTER_LEVEL_OPTIONS.find(
                        (level) => level === Number(event.target.value)
                      );

                      if (nextLevel) onCharacterLevelChange(nextLevel);
                    }}
                  >
                    {CHARACTER_LEVEL_OPTIONS.map((level) => (
                      <option key={level} value={level}>
                        {level} 级
                      </option>
                    ))}
                  </select>
                </label>
                <span className="mb-2 shrink-0 text-xs text-slate-400">
                  暂算值
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="shrink-0 text-sm font-medium text-slate-700">
                    气血
                  </span>
                  <AttributeValueLayout
                    bonuses={
                      areBonusDetailsVisible ? (
                        <>
                          <span className="ml-2 inline-block whitespace-nowrap text-xs text-slate-500">
                            等级 +
                            {formatAttribute(
                              fixedStatusAttributes.health -
                                LEVEL_ONE_STATUS_ATTRIBUTES.health
                            )}
                          </span>
                          {skillBonuses.health > 0 && (
                            <span className="ml-2 inline-block whitespace-nowrap text-xs text-emerald-600">
                              +技能 {formatAttribute(skillBonuses.health)}
                            </span>
                          )}
                          {equipmentBonuses.health > 0 && (
                            <span className="ml-2 inline-block whitespace-nowrap text-xs text-blue-700">
                              +装备 {formatAttribute(equipmentBonuses.health)}
                            </span>
                          )}
                          {equipmentBonuses.healthPercent > 0 && (
                            <span className="ml-2 inline-block whitespace-nowrap text-xs text-blue-700">
                              装备 {formatBonus(equipmentBonuses.healthPercent)}%
                            </span>
                          )}
                          {areSoulArtifactBonusesValid &&
                            soulArtifactBonuses.health > 0 && (
                              <span className="ml-2 inline-block whitespace-nowrap text-xs text-blue-600">
                                +魂器 {formatAttribute(soulArtifactBonuses.health)}
                              </span>
                            )}
                          {divineSoulBonuses.health > 0 && (
                            <span className="ml-2 inline-block whitespace-nowrap text-xs text-teal-600">
                              +神魂 {formatAttribute(divineSoulBonuses.health)}
                            </span>
                          )}
                          {tianshuBonuses.health > 0 && (
                            <span className="ml-2 inline-block whitespace-nowrap text-xs text-orange-600">
                              +天书 {formatAttribute(tianshuBonuses.health)}
                            </span>
                          )}
                          {transformationTalismanBonuses.health > 0 && (
                            <span className="ml-2 inline-block whitespace-nowrap text-xs text-pink-600">
                              +幻形符 {formatAttribute(transformationTalismanBonuses.health)}
                            </span>
                          )}
                          {temporaryTalismanBonuses.health > 0 && (
                            <span className="ml-2 inline-block whitespace-nowrap text-xs text-violet-600">
                              +灵符 {formatAttribute(temporaryTalismanBonuses.health)}
                            </span>
                          )}
                        </>
                      ) : null
                    }
                    value={
                      <strong className="shrink-0 text-base text-emerald-700">
                        {formatPanelAttribute(effectiveAttributes.status.health)}
                      </strong>
                    }
                  />
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-emerald-100">
                  <div className="h-full w-full rounded-full bg-emerald-500" />
                </div>
              </div>
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="shrink-0 text-sm font-medium text-slate-700">
                    法力
                  </span>
                  <AttributeValueLayout
                    bonuses={
                      areBonusDetailsVisible ? (
                        <>
                          <span className="ml-2 inline-block whitespace-nowrap text-xs text-slate-500">
                            等级 +
                            {formatAttribute(
                              fixedStatusAttributes.mana -
                                LEVEL_ONE_STATUS_ATTRIBUTES.mana
                            )}
                          </span>
                            {skillBonuses.mana > 0 && (
                              <span className="ml-2 inline-block whitespace-nowrap text-xs text-blue-600">
                                +技能 {formatAttribute(skillBonuses.mana)}
                              </span>
                            )}
                            {equipmentBonuses.mana > 0 && (
                              <span className="ml-2 inline-block whitespace-nowrap text-xs text-blue-700">
                                +装备 {formatAttribute(equipmentBonuses.mana)}
                              </span>
                            )}
                            {temporaryTalismanBonuses.mana > 0 && (
                              <span className="ml-2 inline-block whitespace-nowrap text-xs text-violet-600">
                                +灵符 {formatAttribute(temporaryTalismanBonuses.mana)}
                              </span>
                            )}
                        </>
                      ) : null
                    }
                    value={
                      <strong className="shrink-0 text-sm text-blue-700">
                        {formatPanelAttribute(effectiveAttributes.status.mana)}
                      </strong>
                    }
                  />
                </div>
                <div
                  className="mt-2 h-1.5 rounded-full bg-blue-500"
                  data-testid="mana-value-bar"
                />
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-700">
                    真气
                  </span>
                  <strong className="text-sm text-amber-700">
                    {fixedStatusAttributes.trueEnergy}
                  </strong>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-amber-100">
                  <div className="h-full w-full rounded-full bg-amber-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <div className="flex items-stretch gap-2">
              <div
                className="grid min-w-0 flex-1 grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1"
                role="tablist"
                aria-label="属性类型"
              >
                {(
                  [
                    ["basic", "基础属性"],
                    ["advanced", "进阶属性"],
                  ] as const
                ).map(([tab, label]) => (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={activeAttributeTab === tab}
                    className={`rounded-lg px-3 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      activeAttributeTab === tab
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                    onClick={() => setActiveAttributeTab(tab)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={
                  areBonusDetailsVisible
                    ? "隐藏全部属性加成"
                    : "显示全部属性加成"
                }
                aria-pressed={areBonusDetailsVisible}
                onClick={() =>
                  setAreBonusDetailsVisible((current) => !current)
                }
              >
                {areBonusDetailsVisible ? "隐藏加成" : "显示加成"}
              </button>
            </div>

            {activeAttributeTab === "basic" ? (
              <div className="mt-5">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <h2 className="text-base font-semibold text-slate-900">
                        基础属性 · 10 项
                      </h2>
                      <span className="text-xs font-medium text-amber-600">
                        五项派生初值待验证
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-5 text-slate-500">
                      当前值 = 1 级物理角色初始值 + {characterUpgradeCount} 次固定成长 + 潜力点 + 属性加成。
                    </p>
                  </div>

                  <section
                    className="w-full shrink-0 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 sm:w-64"
                    aria-label="潜力点分配摘要"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500">潜力点分配</span>
                      <EditIconButton
                        label="编辑潜力点分配"
                        onClick={() => setActiveEditorId("allocation")}
                      />
                    </div>
                    <div className="mt-1 flex items-baseline justify-between gap-2">
                      <strong className="shrink-0 whitespace-nowrap text-sm font-semibold text-slate-900">
                        {allocationPlanLabel}
                      </strong>
                      <span className="truncate text-[11px] font-medium text-emerald-600">
                        {allocationSummary}
                      </span>
                    </div>
                  </section>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2" role="group" aria-label="派生属性列">
                    {DERIVED_ATTRIBUTES.map(([attribute, label]) => (
                      <div
                        key={attribute}
                        className="flex min-w-0 items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2.5"
                      >
                        <span className="shrink-0 text-xs text-slate-600 sm:text-sm">
                          {label}
                        </span>
                        <AttributeValueLayout
                          bonuses={
                            areBonusDetailsVisible ? (
                              <>
                                {skillBonuses[attribute] !== 0 && (
                                  <span
                                    className={`ml-1 inline-block whitespace-nowrap text-[11px] ${
                                      skillBonuses[attribute] > 0
                                        ? "text-blue-600"
                                        : "text-rose-600"
                                    }`}
                                  >
                                    {formatBonus(skillBonuses[attribute])}
                                  </span>
                                )}
                                {equipmentBonuses[attribute] !== 0 && (
                                  <span className="ml-1 inline-block whitespace-nowrap text-[11px] text-blue-700">
                                    装备 {formatBonus(equipmentBonuses[attribute])}
                                  </span>
                                )}
                                {attribute === "speed" &&
                                  equipmentBonuses.speedPercent !== 0 && (
                                    <span className="ml-1 inline-block whitespace-nowrap text-[11px] text-blue-700">
                                      装备 {formatBonus(equipmentBonuses.speedPercent)}%
                                    </span>
                                  )}
                                {areSoulArtifactBonusesValid &&
                                  soulArtifactBonuses[attribute] !== 0 && (
                                    <span className="ml-1 inline-block whitespace-nowrap text-[11px] text-blue-600">
                                      魂器 {formatBonus(soulArtifactBonuses[attribute])}
                                    </span>
                                  )}
                                {divineSoulBonuses[attribute] > 0 && (
                                  <span className="ml-1 inline-block whitespace-nowrap text-[11px] text-teal-600">
                                    神魂 {formatBonus(divineSoulBonuses[attribute])}
                                  </span>
                                )}
                                {tianshuBonuses[attribute] > 0 && (
                                  <span className="ml-1 inline-block whitespace-nowrap text-[11px] text-orange-600">
                                    天书 {formatBonus(tianshuBonuses[attribute])}
                                  </span>
                                )}
                                {talismanBonuses[attribute] > 0 && (
                                  <span className="ml-1 inline-block whitespace-nowrap text-[11px] text-indigo-600">
                                    {talismanSourceLabel} {formatBonus(talismanBonuses[attribute])}
                                  </span>
                                )}
                                {attribute === "physicalDefense" &&
                                  talismanBonuses.physicalDefensePercent > 0 && (
                                    <span className="ml-1 inline-block whitespace-nowrap text-[11px] text-indigo-600">
                                      {talismanSourceLabel} +{formatAttribute(talismanBonuses.physicalDefensePercent)}%
                                    </span>
                                  )}
                                {attribute === "magicDefense" &&
                                  talismanBonuses.magicDefensePercent > 0 && (
                                    <span className="ml-1 inline-block whitespace-nowrap text-[11px] text-indigo-600">
                                      {talismanSourceLabel} +{formatAttribute(talismanBonuses.magicDefensePercent)}%
                                    </span>
                                  )}
                                {attribute === "speed" &&
                                  tianshuBonuses.speedPercent > 0 && (
                                    <span className="ml-1 inline-block whitespace-nowrap text-[11px] text-orange-600">
                                      天书 +{formatAttribute(tianshuBonuses.speedPercent)}%
                                    </span>
                                  )}
                                {satinBonuses[attribute] > 0 && (
                                  <span className="ml-1 inline-block whitespace-nowrap text-[11px] text-amber-600">
                                    缎纹 {formatBonus(satinBonuses[attribute])}
                                  </span>
                                )}
                                {transformationTalismanBonuses[attribute] > 0 && (
                                  <span className="ml-1 inline-block whitespace-nowrap text-[11px] text-pink-600">
                                    幻形符 {formatBonus(transformationTalismanBonuses[attribute])}
                                  </span>
                                )}
                                {guildBlessingBonuses[attribute] > 0 && (
                                  <span className="ml-1 inline-block whitespace-nowrap text-[11px] text-cyan-600">
                                    帮派 {formatBonus(guildBlessingBonuses[attribute])}
                                  </span>
                                )}
                                {guildTalentBonuses[attribute] > 0 && (
                                  <span className="ml-1 inline-block whitespace-nowrap text-[11px] text-sky-600">
                                    天赋 {formatBonus(guildTalentBonuses[attribute])}
                                  </span>
                                )}
                                {attribute === "speed" &&
                                  guildTalentBonuses.speedPercent > 0 && (
                                    <span className="ml-1 inline-block whitespace-nowrap text-[11px] text-sky-600">
                                      天赋 +{formatAttribute(guildTalentBonuses.speedPercent)}%
                                    </span>
                                  )}
                                {temporaryTalismanBonuses[attribute] > 0 && (
                                  <span className="ml-1 inline-block whitespace-nowrap text-[11px] text-violet-600">
                                    灵符 {formatBonus(temporaryTalismanBonuses[attribute])}
                                  </span>
                                )}
                              </>
                            ) : null
                          }
                          value={
                            <strong className="shrink-0 text-sm text-slate-900">
                              {formatPanelAttribute(
                                effectiveAttributes.derived[attribute]
                              )}
                            </strong>
                          }
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2" role="group" aria-label="潜力属性列">
                    {PRIMARY_ATTRIBUTE_KEYS.map((attribute) => (
                      <div
                        key={attribute}
                        className="flex min-w-0 items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2.5"
                      >
                        <span className="shrink-0 text-xs text-slate-600 sm:text-sm">
                          {PRIMARY_ATTRIBUTE_SHORT_LABELS[attribute]}
                        </span>
                        <AttributeValueLayout
                          bonuses={
                            areBonusDetailsVisible ? (
                              <>
                                {allocation[attribute] > 0 && (
                                  <span className="ml-1 inline-block whitespace-nowrap text-[11px] text-emerald-600">
                                    潜力 +{allocation[attribute]}
                                  </span>
                                )}
                                {equipmentBonuses[attribute] > 0 && (
                                  <span className="ml-1 inline-block whitespace-nowrap text-[11px] text-blue-700">
                                    装备 {formatBonus(equipmentBonuses[attribute])}
                                  </span>
                                )}
                                {skillBonuses[attribute] > 0 && (
                                  <span className="ml-1 inline-block whitespace-nowrap text-[11px] text-blue-600">
                                    +加成 {formatAttribute(skillBonuses[attribute])}
                                  </span>
                                )}
                                {areSoulArtifactBonusesValid &&
                                  soulArtifactBonuses[attribute] !== 0 && (
                                    <span
                                      className={`ml-1 inline-block whitespace-nowrap text-[11px] ${
                                        soulArtifactBonuses[attribute] > 0
                                          ? "text-blue-600"
                                          : "text-rose-600"
                                      }`}
                                    >
                                      魂器 {formatBonus(soulArtifactBonuses[attribute])}
                                    </span>
                                  )}
                                {tianshuBonuses[attribute] > 0 && (
                                  <span className="ml-1 inline-block whitespace-nowrap text-[11px] text-orange-600">
                                    天书 {formatBonus(tianshuBonuses[attribute])}
                                  </span>
                                )}
                                {seasonArtifactBonuses[attribute] > 0 && (
                                  <span className="ml-1 inline-block whitespace-nowrap text-[11px] text-violet-600">
                                    神器 {formatBonus(seasonArtifactBonuses[attribute])}
                                  </span>
                                )}
                                {charmBonuses[attribute] > 0 && (
                                  <span className="ml-1 inline-block whitespace-nowrap text-[11px] text-fuchsia-600">
                                    魅灵 {formatBonus(charmBonuses[attribute])}
                                  </span>
                                )}
                                {sanshengPillBonuses[attribute] > 0 && (
                                  <span className="ml-1 inline-block whitespace-nowrap text-[11px] text-lime-700">
                                    三生造化丹 {formatBonus(sanshengPillBonuses[attribute])}
                                  </span>
                                )}
                                {starBlessingBonuses[attribute] > 0 && (
                                  <span className="ml-1 inline-block whitespace-nowrap text-[11px] text-cyan-600">
                                    祈福 {formatBonus(starBlessingBonuses[attribute])}
                                  </span>
                                )}
                                {temporaryTalismanBonuses[attribute] > 0 && (
                                  <span className="ml-1 inline-block whitespace-nowrap text-[11px] text-violet-600">
                                    灵符 {formatBonus(temporaryTalismanBonuses[attribute])}
                                  </span>
                                )}
                              </>
                            ) : null
                          }
                          value={
                            <strong
                              className={`shrink-0 text-sm ${
                                allocation[attribute] > 0
                                  ? "text-emerald-600"
                                  : "text-slate-900"
                              }`}
                            >
                              {formatPanelAttribute(
                                effectiveAttributes.primary[attribute]
                              )}
                            </strong>
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      进阶属性 · 9 项
                    </h2>
                    <p className="mt-1.5 text-xs leading-5 text-slate-500">
                      潜力点不影响进阶属性；封印命中每次升级固定增加 {SEAL_HIT_POINTS_PER_UPGRADE} 点。
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-emerald-600">
                    {characterLevel} 级规则值
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {ADVANCED_ATTRIBUTE_COLUMNS.map((column, columnIndex) => (
                    <div
                      key={columnIndex}
                      className="space-y-2"
                      role="group"
                      aria-label={`进阶属性第 ${columnIndex + 1} 列`}
                    >
                      {column.map((attribute) => (
                        <div
                          key={attribute.label}
                          className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2.5"
                        >
                          <span className="shrink-0 text-xs text-slate-600 sm:text-sm">
                            {attribute.label}
                          </span>
                          <AttributeValueLayout
                            bonuses={
                              areBonusDetailsVisible ? (
                                <>
                                  {"growsWithLevel" in attribute && (
                                    <span className="ml-1 inline-block whitespace-nowrap text-[11px] text-emerald-600">
                                      等级 +
                                      {calculated.advanced.sealHit -
                                        LEVEL_ONE_ADVANCED_ATTRIBUTES.sealHit}
                                    </span>
                                  )}
                                  {(attribute.attribute === "healingPower" ||
                                    attribute.attribute === "sealHit" ||
                                    attribute.attribute === "sealResistance") &&
                                    characterTrainingBonuses[
                                      attribute.attribute
                                    ] > 0 && (
                                      <span className="ml-1 inline-block whitespace-nowrap text-[11px] text-cyan-700">
                                        修炼 {formatBonus(
                                          characterTrainingBonuses[
                                            attribute.attribute
                                          ]
                                        )}
                                        {(attribute.attribute === "sealHit" ||
                                          attribute.attribute ===
                                            "sealResistance") && "%"}
                                      </span>
                                    )}
                                  {attribute.attribute === "sealResistance" &&
                                    skillBonuses.sealResistance !== 0 && (
                                      <span className="ml-1 inline-block whitespace-nowrap text-[11px] text-blue-600">
                                        技能 {formatBonus(
                                          skillBonuses.sealResistance
                                        )}
                                      </span>
                                    )}
                                  {(attribute.attribute === "healingPower" ||
                                    attribute.attribute === "sealHit") &&
                                    temporaryTalismanBonuses[
                                      attribute.attribute
                                    ] > 0 && (
                                      <span className="ml-1 inline-block whitespace-nowrap text-[11px] text-violet-600">
                                        灵符 {formatBonus(
                                          temporaryTalismanBonuses[
                                            attribute.attribute
                                          ]
                                        )}
                                      </span>
                                    )}
                                  {(attribute.attribute === "healingPower" ||
                                    attribute.attribute === "sealHit" ||
                                    attribute.attribute === "sealResistance" ||
                                    attribute.attribute === "dodgeRate" ||
                                    attribute.attribute === "physicalCritical" ||
                                    attribute.attribute === "magicalCritical") &&
                                    equipmentBonuses[attribute.attribute] !== 0 && (
                                      <span className="ml-1 inline-block whitespace-nowrap text-[11px] text-blue-700">
                                        装备 {formatBonus(
                                          equipmentBonuses[attribute.attribute]
                                        )}
                                      </span>
                                    )}
                                  {(attribute.attribute === "sealHit" ||
                                    attribute.attribute === "sealResistance") &&
                                    tianshuBonuses[attribute.attribute] > 0 && (
                                      <span className="ml-1 inline-block whitespace-nowrap text-[11px] text-orange-600">
                                        天书 {formatBonus(
                                          tianshuBonuses[attribute.attribute]
                                        )}
                                      </span>
                                    )}
                                  {(attribute.attribute === "physicalCritical" ||
                                    attribute.attribute === "magicalCritical" ||
                                    attribute.attribute === "healingPower" ||
                                    attribute.attribute === "sealHit") &&
                                    transformationTalismanBonuses[
                                      attribute.attribute
                                    ] > 0 && (
                                      <span className="ml-1 inline-block whitespace-nowrap text-[11px] text-pink-600">
                                        幻形符 {formatBonus(
                                          transformationTalismanBonuses[
                                            attribute.attribute
                                          ]
                                        )}
                                        {(attribute.attribute ===
                                          "physicalCritical" ||
                                          attribute.attribute ===
                                            "magicalCritical") && "%"}
                                      </span>
                                    )}
                                  {(attribute.attribute === "physicalCritical" ||
                                    attribute.attribute === "magicalCritical" ||
                                    attribute.attribute === "hitRate" ||
                                    attribute.attribute === "sealHit") &&
                                    guildTalentBonuses[attribute.attribute] > 0 && (
                                      <span className="ml-1 inline-block whitespace-nowrap text-[11px] text-sky-600">
                                        天赋 {formatBonus(
                                          guildTalentBonuses[attribute.attribute]
                                        )}
                                        {(attribute.attribute ===
                                          "physicalCritical" ||
                                          attribute.attribute ===
                                            "magicalCritical" ||
                                          attribute.attribute === "hitRate" ||
                                          attribute.attribute === "sealHit") &&
                                          "%"}
                                      </span>
                                    )}
                                </>
                              ) : null
                            }
                            value={
                              <strong
                                className={`shrink-0 text-sm ${
                                  "growsWithLevel" in attribute
                                    ? "text-emerald-600"
                                    : "text-slate-900"
                                }`}
                              >
                                {formatPanelAttribute(
                                  effectiveAttributes.advanced[
                                    attribute.attribute
                                  ]
                                )}
                                {attribute.unit}
                              </strong>
                            }
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-slate-800">亲和</h3>
                    <span className="text-xs text-slate-400">潜力点不影响</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {AFFINITY_BONUS_FIELDS.map(({ attribute, label }) => (
                      <div
                        key={attribute}
                        className={`rounded-lg px-2 py-3 text-center ${AFFINITY_BACKGROUND_CLASSES[attribute]}`}
                      >
                        <p className="text-xs text-slate-500">{label}</p>
                        {areBonusDetailsVisible && tianshuBonuses[attribute] > 0 && (
                          <span className="mt-1 block whitespace-nowrap text-[10px] font-medium text-orange-600">
                            天书 {formatBonus(tianshuBonuses[attribute])}
                          </span>
                        )}
                        <strong className="mt-1 block text-sm text-slate-800">
                          {formatPanelAttribute(
                            effectiveAttributes.affinity[attribute]
                          )}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {activeEditor && (
        <EditorDialog
          title={activeEditor.title}
          onClose={closeEditor}
          isCloseDisabled={
            activeEditor.id === "allocation" &&
            allocationMode === "custom" &&
            customAllocationValidationError !== null
          }
        >
          {activeEditor.renderContent(activeEditor.title)}
        </EditorDialog>
      )}

      <section className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-4 text-xs leading-6 text-blue-900 sm:px-5">
        <strong className="font-semibold">当前计算口径：</strong>
        以 1 级物理角色截图样本为基准，升至 {characterLevel} 级共成长 {characterUpgradeCount} 次，
        可分配潜力点 {totalPotentialPoints}。面板最终值暂按向下取整展示，内部保留完整计算精度。
        初始力量多 10 点，以及法攻/法防/物攻/物防/速度初值是否随机，均待更多新号样本确认。
      </section>
    </div>
  );
};

export default CharacterAttributeCalculator;
