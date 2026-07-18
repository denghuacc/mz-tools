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
import EditorDialog from "./EditorDialog";
import GuildBlessingBonusControl from "./GuildBlessingBonusControl";
import PotentialAllocationControl from "./PotentialAllocationControl";
import SatinAttributeBonusControl from "./SatinAttributeBonusControl";
import SelectableAttributeBonusControl from "./SelectableAttributeBonusControl";
import SinglePrimaryAttributeBonusControl from "./SinglePrimaryAttributeBonusControl";
import StarBlessingBonusControl, {
  STAR_BLESSING_ATTRIBUTE_COUNT,
} from "./StarBlessingBonusControl";
import TianshuBonusControl from "./TianshuBonusControl";
import TalismanBonusControl from "./TalismanBonusControl";
import UniformAttributeBonusControl from "./UniformAttributeBonusControl";
import type { TianshuBonusControlOption } from "./TianshuBonusControl";
import type { StarBlessingBonusValue } from "./StarBlessingBonusControl";
import type {
  SatinBonusAttribute,
  SatinBonusSelection,
} from "./SatinAttributeBonusControl";
import type { SelectableBonusSelection } from "./SelectableAttributeBonusControl";
import {
  AFFINITY_BONUS_FIELDS,
  applyCharacterAttributeBonuses,
  arePrimaryAttributeBonusesBalanced,
  calculatePresetAllocation,
  calculateCharacterAttributes,
  CHARACTER_ALLOCATION_PRESETS,
  CHARACTER_BONUS_ATTRIBUTE_KEYS,
  CHARACTER_LEVEL,
  CHARACTER_UPGRADE_COUNT,
  combineCharacterAttributeBonuses,
  createEmptyCharacterAttributeBonuses,
  getPrimaryAttributeBonusTotal,
  LEVEL_ONE_ADVANCED_ATTRIBUTES,
  LEVEL_ONE_STATUS_ATTRIBUTES,
  PRIMARY_ATTRIBUTE_KEYS,
  SEAL_HIT_POINTS_PER_UPGRADE,
  TOTAL_POTENTIAL_POINTS,
} from "../utils/characterAttributes";
import type {
  CharacterAllocationPresetId,
  CharacterAttributeBonuses,
  CharacterBonusAttribute,
  PrimaryAttribute,
} from "../utils/characterAttributes";
import {
  CHARACTER_ATTRIBUTES_STORAGE_KEY,
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
  { attribute: "constitution", label: "体" },
  { attribute: "spirit", label: "灵" },
  { attribute: "strength", label: "力" },
  { attribute: "endurance", label: "耐" },
  { attribute: "agility", label: "敏" },
  { attribute: "physicalAttack", label: "物攻" },
  { attribute: "magicAttack", label: "法攻" },
  { attribute: "physicalDefense", label: "物防" },
  { attribute: "magicDefense", label: "法防" },
  { attribute: "speed", label: "速度" },
  { attribute: "health", label: "气血" },
  { attribute: "mana", label: "法力" },
  { attribute: "sealHit", label: "封印命中" },
  { attribute: "healingPower", label: "治疗强度" },
] as const;

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

const TALISMAN_BONUS_OPTIONS = [
  {
    id: "physical-attack",
    title: "物攻法宝",
    effectLabel: `+${CHARACTER_LEVEL * 0.6} 物攻`,
    bonuses: { physicalAttack: CHARACTER_LEVEL * 0.6 },
  },
  {
    id: "magic-attack",
    title: "法攻法宝",
    effectLabel: `+${CHARACTER_LEVEL * 0.6} 法攻`,
    bonuses: { magicAttack: CHARACTER_LEVEL * 0.6 },
  },
  {
    id: "speed-defense",
    title: "速度与防御法宝",
    effectLabel: `+${CHARACTER_LEVEL * 0.4} 速度 · +5% 物防 · +5% 法防`,
    bonuses: {
      speed: CHARACTER_LEVEL * 0.4,
      physicalDefensePercent: 5,
      magicDefensePercent: 5,
    },
  },
] as const;

type TalismanBonusOptionId = (typeof TALISMAN_BONUS_OPTIONS)[number]["id"];

const TALISMAN_BONUS_SUMMARY_FIELDS = [
  { attribute: "physicalAttack", label: "物攻" },
  { attribute: "magicAttack", label: "法攻" },
  { attribute: "speed", label: "速度" },
  { attribute: "physicalDefensePercent", label: "物防", unit: "%" },
  { attribute: "magicDefensePercent", label: "法防", unit: "%" },
] as const;

type TianshuBonusOption = TianshuBonusControlOption & {
  attribute: CharacterBonusAttribute;
  value: number;
};

const TIANSHU_BONUS_OPTIONS = [
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
    effectLabel: `+${CHARACTER_LEVEL} 气血`,
    attribute: "health",
    value: CHARACTER_LEVEL,
  },
  {
    id: "magic-attack-level-02",
    title: "等级 × 0.2 法攻",
    effectLabel: `+${CHARACTER_LEVEL * 0.2} 法攻`,
    attribute: "magicAttack",
    value: CHARACTER_LEVEL * 0.2,
  },
  {
    id: "magic-attack-level-03",
    title: "等级 × 0.3 法攻",
    effectLabel: `+${CHARACTER_LEVEL * 0.3} 法攻`,
    attribute: "magicAttack",
    value: CHARACTER_LEVEL * 0.3,
  },
  {
    id: "physical-attack-level-02",
    title: "等级 × 0.2 物攻",
    effectLabel: `+${CHARACTER_LEVEL * 0.2} 物攻`,
    attribute: "physicalAttack",
    value: CHARACTER_LEVEL * 0.2,
  },
  {
    id: "physical-attack-level-03",
    title: "等级 × 0.3 物攻",
    effectLabel: `+${CHARACTER_LEVEL * 0.3} 物攻`,
    attribute: "physicalAttack",
    value: CHARACTER_LEVEL * 0.3,
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
  | "satin"
  | "transformationTalisman"
  | "guildBlessing"
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

const createSelectedAttributeBonuses = (
  selections: readonly SelectableBonusSelection[]
) => {
  const bonuses = createEmptyCharacterAttributeBonuses();

  for (const selection of selections) {
    bonuses[selection.attribute] = selection.value;
  }

  return bonuses;
};

const createGuildBlessingBonuses = (enabled: boolean) => {
  const bonuses = createEmptyCharacterAttributeBonuses();

  if (enabled) {
    for (const { attribute, value } of GUILD_BLESSING_FIELDS) {
      bonuses[attribute] = value;
    }
  }

  return bonuses;
};

const createDivineSoulBonuses = (value: number) => {
  const bonuses = createEmptyCharacterAttributeBonuses();

  for (const { attribute } of DIVINE_SOUL_BONUS_FIELDS) {
    bonuses[attribute] = value;
  }

  return bonuses;
};

const createTianshuBonuses = (counts: Readonly<Record<string, number>>) => {
  const bonuses = createEmptyCharacterAttributeBonuses();

  for (const option of TIANSHU_BONUS_OPTIONS) {
    bonuses[option.attribute] += option.value * (counts[option.id] ?? 0);
  }

  return bonuses;
};

const createTalismanBonuses = (optionId: TalismanBonusOptionId | null) => {
  const bonuses = createEmptyCharacterAttributeBonuses();
  const option = TALISMAN_BONUS_OPTIONS.find(({ id }) => id === optionId);

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
  selectedPresetId: CharacterAllocationPresetId;
  skillBonuses: CharacterAttributeBonuses;
  temporaryTalismanBonuses: CharacterAttributeBonuses;
  soulArtifactBonuses: CharacterAttributeBonuses;
  divineSoulValue: number;
  tianshuBonusCounts: Readonly<Record<string, number>>;
  talismanOptionId: TalismanBonusOptionId | null;
  seasonArtifactAttribute: PrimaryAttribute | null;
  seasonArtifactValue: number;
  charmAttribute: PrimaryAttribute | null;
  charmValue: number;
  satinSelections: readonly SatinBonusSelection[];
  transformationTalismanSelections: readonly TransformationTalismanBonusSelection[];
  isGuildBlessingEnabled: boolean;
  starBlessingAttributes: readonly PrimaryAttribute[];
  starBlessingValue: StarBlessingBonusValue;
};

const createDefaultCharacterCalculatorState = (): CharacterCalculatorState => ({
  selectedPresetId: CHARACTER_ALLOCATION_PRESETS[0].id,
  skillBonuses: createEmptyCharacterAttributeBonuses(),
  temporaryTalismanBonuses: createEmptyCharacterAttributeBonuses(),
  soulArtifactBonuses: createEmptyCharacterAttributeBonuses(),
  divineSoulValue: 0,
  tianshuBonusCounts: {},
  talismanOptionId: null,
  seasonArtifactAttribute: null,
  seasonArtifactValue: 0,
  charmAttribute: null,
  charmValue: 0,
  satinSelections: [],
  transformationTalismanSelections: [],
  isGuildBlessingEnabled: false,
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

const normalizeCharacterCalculatorState = (
  value: unknown
): CharacterCalculatorState | null => {
  if (!isRecord(value)) return null;

  const selectedPresetId =
    typeof value.selectedPresetId === "string" &&
    CHARACTER_PRESET_ID_SET.has(value.selectedPresetId)
      ? (value.selectedPresetId as CharacterAllocationPresetId)
      : CHARACTER_ALLOCATION_PRESETS[0].id;
  const talismanOptionId =
    typeof value.talismanOptionId === "string" &&
    TALISMAN_OPTION_ID_SET.has(value.talismanOptionId)
      ? (value.talismanOptionId as TalismanBonusOptionId)
      : null;

  return {
    selectedPresetId,
    skillBonuses: normalizeCharacterBonuses(value.skillBonuses),
    temporaryTalismanBonuses: normalizeCharacterBonuses(
      value.temporaryTalismanBonuses
    ),
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
    starBlessingAttributes: normalizePrimaryAttributes(
      value.starBlessingAttributes
    ),
    starBlessingValue: value.starBlessingValue === 25 ? 25 : 18,
  };
};

const loadCharacterCalculatorState = (): CharacterCalculatorState =>
  loadCalculatorState(
    CHARACTER_ATTRIBUTES_STORAGE_KEY,
    createDefaultCharacterCalculatorState(),
    normalizeCharacterCalculatorState
  );

type CharacterAttributeCalculatorProps = {
  equipmentBonuses?: CharacterAttributeBonuses;
  equipmentItemCount?: number;
};

const CharacterAttributeCalculator = ({
  equipmentBonuses = createEmptyCharacterAttributeBonuses(),
  equipmentItemCount = 0,
}: CharacterAttributeCalculatorProps) => {
  const [initialState] = useState(loadCharacterCalculatorState);
  const [selectedPresetId, setSelectedPresetId] =
    useState<CharacterAllocationPresetId>(initialState.selectedPresetId);
  const [activeAttributeTab, setActiveAttributeTab] =
    useState<AttributeTab>("basic");
  const [areBonusDetailsVisible, setAreBonusDetailsVisible] = useState(true);
  const [skillBonuses, setSkillBonuses] = useState<CharacterAttributeBonuses>(
    initialState.skillBonuses
  );
  const [temporaryTalismanBonuses, setTemporaryTalismanBonuses] = useState(
    initialState.temporaryTalismanBonuses
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
  const [starBlessingAttributes, setStarBlessingAttributes] = useState<
    readonly PrimaryAttribute[]
  >(initialState.starBlessingAttributes);
  const [starBlessingValue, setStarBlessingValue] =
    useState<StarBlessingBonusValue>(initialState.starBlessingValue);
  const [activeEditorId, setActiveEditorId] = useState<EditorId | null>(null);
  const [leftAttributePanelHeight, setLeftAttributePanelHeight] = useState(0);
  const leftAttributePanelRef = useRef<HTMLElement>(null);
  const closeEditor = useCallback(() => setActiveEditorId(null), []);

  useEffect(() => {
    saveCalculatorState<CharacterCalculatorState>(
      CHARACTER_ATTRIBUTES_STORAGE_KEY,
      {
        selectedPresetId,
        skillBonuses,
        temporaryTalismanBonuses,
        soulArtifactBonuses,
        divineSoulValue,
        tianshuBonusCounts,
        talismanOptionId,
        seasonArtifactAttribute,
        seasonArtifactValue,
        charmAttribute,
        charmValue,
        satinSelections,
        transformationTalismanSelections,
        isGuildBlessingEnabled,
        starBlessingAttributes,
        starBlessingValue,
      }
    );
  }, [
    selectedPresetId,
    skillBonuses,
    temporaryTalismanBonuses,
    soulArtifactBonuses,
    divineSoulValue,
    tianshuBonusCounts,
    talismanOptionId,
    seasonArtifactAttribute,
    seasonArtifactValue,
    charmAttribute,
    charmValue,
    satinSelections,
    transformationTalismanSelections,
    isGuildBlessingEnabled,
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
    () => createTianshuBonuses(tianshuBonusCounts),
    [tianshuBonusCounts]
  );
  const talismanBonuses = useMemo(
    () => createTalismanBonuses(talismanOptionId),
    [talismanOptionId]
  );
  const charmBonuses = useMemo(
    () => createSinglePrimaryAttributeBonuses(charmAttribute, charmValue),
    [charmAttribute, charmValue]
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
    () => createGuildBlessingBonuses(isGuildBlessingEnabled),
    [isGuildBlessingEnabled]
  );
  const starBlessingBonuses = useMemo(
    () =>
      createStarBlessingBonuses(starBlessingAttributes, starBlessingValue),
    [starBlessingAttributes, starBlessingValue]
  );
  const selectedPreset =
    CHARACTER_ALLOCATION_PRESETS.find(({ id }) => id === selectedPresetId) ??
    CHARACTER_ALLOCATION_PRESETS[0];
  const allocation = useMemo(
    () => calculatePresetAllocation(selectedPreset.ratio),
    [selectedPreset]
  );
  const calculated = useMemo(
    () => calculateCharacterAttributes(allocation),
    [allocation]
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
        satinBonuses,
        transformationTalismanBonuses,
        guildBlessingBonuses,
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
      satinBonuses,
      transformationTalismanBonuses,
      guildBlessingBonuses,
      starBlessingBonuses,
      temporaryTalismanBonuses,
      areSoulArtifactBonusesValid,
    ]
  );
  const effectiveAttributes = useMemo(
    () => applyCharacterAttributeBonuses(calculated, totalBonuses),
    [calculated, totalBonuses]
  );
  const allocationSummary = PRIMARY_ATTRIBUTE_KEYS.filter(
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
  const talismanSummaryItems = createBonusSummaryItems(
    TALISMAN_BONUS_SUMMARY_FIELDS,
    talismanBonuses
  );
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

  const updateTemporaryTalismanBonus = (
    attribute: CharacterBonusAttribute,
    value: number
  ) => {
    setTemporaryTalismanBonuses((current) => ({
      ...current,
      [attribute]: value,
    }));
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

  const attributeBonusSources: readonly AttributeBonusSource[] = [
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
          options={TIANSHU_BONUS_OPTIONS}
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
          options={TALISMAN_BONUS_OPTIONS}
          selectedOptionId={talismanOptionId}
          onSelect={(optionId) => {
            const option = TALISMAN_BONUS_OPTIONS.find(
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
      id: "temporaryTalisman",
      title: "灵符",
      items: temporaryTalismanSummaryItems,
      renderContent: (title) => (
        <AttributeBonusCard
          title={title}
          description="可填写基础属性、气血、法力、封印命中与治疗强度的实际加成。"
          fields={TEMPORARY_TALISMAN_BONUS_FIELDS}
          values={temporaryTalismanBonuses}
          onChange={updateTemporaryTalismanBonus}
          onReset={() =>
            setTemporaryTalismanBonuses(
              createEmptyCharacterAttributeBonuses()
            )
          }
        />
      ),
    },
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
  ];
  const editorDefinitions: readonly EditorDefinition[] = [
    {
      id: "allocation",
      title: "潜力点分配",
      renderContent: (title) => (
        <PotentialAllocationControl
          title={title}
          selectedPresetId={selectedPresetId}
          summary={allocationSummary}
          onSelect={setSelectedPresetId}
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
          />
        </div>

        <section
          ref={leftAttributePanelRef}
          className="order-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 xl:order-1"
          data-testid="attribute-result-panel"
        >
          <div>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">状态条</h2>
                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                  气血按体力增长；法力只展示 1 级基准，怒气/真气沿用截图值。
                </p>
              </div>
              <span className="shrink-0 text-xs text-slate-400">暂算值</span>
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
                        {formatAttribute(effectiveAttributes.status.health)}
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
                      <>
                        {areBonusDetailsVisible && (
                          <>
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
                        )}
                        {skillBonuses.mana === 0 &&
                          equipmentBonuses.mana === 0 &&
                          temporaryTalismanBonuses.mana === 0 && (
                            <span className="ml-2 inline-block whitespace-nowrap text-xs text-slate-400">
                              1 级基准 · 成长待补
                            </span>
                          )}
                      </>
                    }
                    value={
                      <strong className="shrink-0 text-sm text-blue-700">
                        {formatAttribute(effectiveAttributes.status.mana)}
                      </strong>
                    }
                  />
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-blue-100" />
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-700">
                    怒气 / 真气
                  </span>
                  <strong className="text-sm text-amber-700">
                    {LEVEL_ONE_STATUS_ATTRIBUTES.anger}
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
                      当前值 = 1 级物理角色初始值 + {CHARACTER_UPGRADE_COUNT} 次固定成长 + 潜力点 + 属性加成。
                    </p>
                  </div>

                  <button
                    type="button"
                    className="w-full shrink-0 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-left transition hover:border-blue-200 hover:bg-blue-50/60 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-44"
                    aria-label="编辑潜力点分配"
                    onClick={() => setActiveEditorId("allocation")}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500">潜力点分配</span>
                      <span className="text-xs font-medium text-blue-600">编辑</span>
                    </span>
                    <span className="mt-1 flex items-baseline justify-between gap-2">
                      <strong className="shrink-0 whitespace-nowrap text-sm font-semibold text-slate-900">
                        {selectedPreset.label}
                      </strong>
                      <span className="truncate text-[11px] font-medium text-emerald-600">
                        {allocationSummary}
                      </span>
                    </span>
                  </button>
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
                                    法宝 {formatBonus(talismanBonuses[attribute])}
                                  </span>
                                )}
                                {attribute === "physicalDefense" &&
                                  talismanBonuses.physicalDefensePercent > 0 && (
                                    <span className="ml-1 inline-block whitespace-nowrap text-[11px] text-indigo-600">
                                      法宝 +{formatAttribute(talismanBonuses.physicalDefensePercent)}%
                                    </span>
                                  )}
                                {attribute === "magicDefense" &&
                                  talismanBonuses.magicDefensePercent > 0 && (
                                    <span className="ml-1 inline-block whitespace-nowrap text-[11px] text-indigo-600">
                                      法宝 +{formatAttribute(talismanBonuses.magicDefensePercent)}%
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
                              {formatAttribute(effectiveAttributes.derived[attribute])}
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
                              {effectiveAttributes.primary[attribute]}
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
                      进阶属性 · 8 项
                    </h2>
                    <p className="mt-1.5 text-xs leading-5 text-slate-500">
                      潜力点不影响进阶属性；封印命中每次升级固定增加 {SEAL_HIT_POINTS_PER_UPGRADE} 点。
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-emerald-600">
                    69 级规则值
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
                                {effectiveAttributes.advanced[attribute.attribute]}
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
                          {effectiveAttributes.affinity[attribute]}
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
        <EditorDialog title={activeEditor.title} onClose={closeEditor}>
          {activeEditor.renderContent(activeEditor.title)}
        </EditorDialog>
      )}

      <section className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-4 text-xs leading-6 text-blue-900 sm:px-5">
        <strong className="font-semibold">当前计算口径：</strong>
        以 1 级物理角色截图样本为基准，升至 69 级共成长 {CHARACTER_UPGRADE_COUNT} 次，
        可分配潜力点 {TOTAL_POTENTIAL_POINTS}。初始力量多 10 点，以及法攻/法防/物攻/物防/速度初值是否随机，均待更多新号样本确认。
      </section>
    </div>
  );
};

export default CharacterAttributeCalculator;
