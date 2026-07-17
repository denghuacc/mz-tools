import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import AttributeBonusCard from "./AttributeBonusCard";
import AttributeBonusSummaryPanel from "./AttributeBonusSummaryPanel";
import type { AttributeBonusSummarySource } from "./AttributeBonusSummaryPanel";
import EditorDialog from "./EditorDialog";
import GuildBlessingBonusControl from "./GuildBlessingBonusControl";
import PotentialAllocationControl from "./PotentialAllocationControl";
import SatinAttributeBonusControl from "./SatinAttributeBonusControl";
import SinglePrimaryAttributeBonusControl from "./SinglePrimaryAttributeBonusControl";
import StarBlessingBonusControl, {
  STAR_BLESSING_ATTRIBUTE_COUNT,
} from "./StarBlessingBonusControl";
import type { StarBlessingBonusValue } from "./StarBlessingBonusControl";
import type {
  SatinBonusAttribute,
  SatinBonusSelection,
} from "./SatinAttributeBonusControl";
import {
  AFFINITY_LABELS,
  applyCharacterAttributeBonuses,
  arePrimaryAttributeBonusesBalanced,
  calculatePresetAllocation,
  calculateCharacterAttributes,
  CHARACTER_ALLOCATION_PRESETS,
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
  CharacterBonusAttribute,
  PrimaryAttribute,
} from "../utils/characterAttributes";

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

const CHARM_BONUS_MAX_VALUE = 120;

const GUILD_BLESSING_FIELDS = [
  { attribute: "physicalAttack", label: "物攻", value: 20 },
  { attribute: "physicalDefense", label: "物防", value: 20 },
  { attribute: "magicAttack", label: "法攻", value: 16 },
  { attribute: "magicDefense", label: "法防", value: 16 },
] as const;

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
  | "seasonArtifact"
  | "charm"
  | "satin"
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

const createBonusSummaryItems = (
  fields: readonly {
    attribute: CharacterBonusAttribute;
    label: string;
  }[],
  values: Partial<Record<CharacterBonusAttribute, number>>
) =>
  fields
    .filter(({ attribute }) => (values[attribute] ?? 0) !== 0)
    .map(({ attribute, label }) => ({
      label,
      value: values[attribute] ?? 0,
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

const createSatinBonuses = (
  selections: readonly SatinBonusSelection[]
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

const CharacterAttributeCalculator = () => {
  const [selectedPresetId, setSelectedPresetId] =
    useState<CharacterAllocationPresetId>(CHARACTER_ALLOCATION_PRESETS[0].id);
  const [activeAttributeTab, setActiveAttributeTab] =
    useState<AttributeTab>("basic");
  const [skillBonuses, setSkillBonuses] = useState(
    createEmptyCharacterAttributeBonuses
  );
  const [temporaryTalismanBonuses, setTemporaryTalismanBonuses] = useState(
    createEmptyCharacterAttributeBonuses
  );
  const [soulArtifactBonuses, setSoulArtifactBonuses] = useState(
    createEmptyCharacterAttributeBonuses
  );
  const [seasonArtifactAttribute, setSeasonArtifactAttribute] =
    useState<PrimaryAttribute | null>(null);
  const [seasonArtifactValue, setSeasonArtifactValue] = useState(0);
  const [charmAttribute, setCharmAttribute] =
    useState<PrimaryAttribute | null>(null);
  const [charmValue, setCharmValue] = useState(0);
  const [satinSelections, setSatinSelections] = useState<
    readonly SatinBonusSelection[]
  >([]);
  const [isGuildBlessingEnabled, setIsGuildBlessingEnabled] = useState(false);
  const [starBlessingAttributes, setStarBlessingAttributes] = useState<
    readonly PrimaryAttribute[]
  >([]);
  const [starBlessingValue, setStarBlessingValue] =
    useState<StarBlessingBonusValue>(18);
  const [activeEditorId, setActiveEditorId] = useState<EditorId | null>(null);
  const [leftAttributePanelHeight, setLeftAttributePanelHeight] = useState(0);
  const leftAttributePanelRef = useRef<HTMLElement>(null);
  const closeEditor = useCallback(() => setActiveEditorId(null), []);

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
  const charmBonuses = useMemo(
    () => createSinglePrimaryAttributeBonuses(charmAttribute, charmValue),
    [charmAttribute, charmValue]
  );
  const satinBonuses = useMemo(
    () => createSatinBonuses(satinSelections),
    [satinSelections]
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
        skillBonuses,
        areSoulArtifactBonusesValid ? soulArtifactBonuses : {},
        seasonArtifactBonuses,
        charmBonuses,
        satinBonuses,
        guildBlessingBonuses,
        starBlessingBonuses,
        temporaryTalismanBonuses
      ),
    [
      skillBonuses,
      soulArtifactBonuses,
      seasonArtifactBonuses,
      charmBonuses,
      satinBonuses,
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

  const attributeBonusSources: readonly AttributeBonusSource[] = [
    {
      id: "soulArtifact",
      title: "魂器属性",
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
      title: "缎纹属性",
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
      title: "临时符",
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
      title: "技能属性加成",
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
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">
                {CHARACTER_LEVEL} 级裸属性
              </h2>
              <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                白版
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                物理角色基准
              </span>
            </div>
            <p className="mt-1.5 text-sm leading-6 text-slate-500">
              从刚创建的 1 级角色裸值开始计算，可在下方叠加魂器、赛季神器、魅灵、缎纹、祝福、临时符与门派技能；不含装备。
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50/70">
          <div className="px-3 py-4 text-center sm:px-5">
            <p className="text-xs text-slate-500">潜力点总计</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {TOTAL_POTENTIAL_POINTS}
            </p>
          </div>
          <div className="px-3 py-4 text-center sm:px-5">
            <p className="text-xs text-slate-500">已分配</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {calculated.allocatedPoints}
            </p>
          </div>
          <div className="px-3 py-4 text-center sm:px-5">
            <p className="text-xs text-slate-500">剩余</p>
            <p
              className={`mt-1 text-xl font-semibold ${
                calculated.remainingPoints === 0
                  ? "text-emerald-600"
                  : "text-blue-600"
              }`}
            >
              {calculated.remainingPoints}
            </p>
          </div>
        </div>
      </section>

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
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">气血</span>
                  <div className="text-right">
                    <strong className="text-base text-emerald-700">
                      {formatAttribute(effectiveAttributes.status.health)}
                    </strong>
                    {skillBonuses.health > 0 && (
                      <span className="ml-2 text-xs text-emerald-600">
                        +技能 {formatAttribute(skillBonuses.health)}
                      </span>
                    )}
                    {areSoulArtifactBonusesValid &&
                      soulArtifactBonuses.health > 0 && (
                        <span className="ml-2 text-xs text-blue-600">
                          +魂器 {formatAttribute(soulArtifactBonuses.health)}
                        </span>
                      )}
                    {temporaryTalismanBonuses.health > 0 && (
                      <span className="ml-2 text-xs text-violet-600">
                        +临时符 {formatAttribute(temporaryTalismanBonuses.health)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-emerald-100">
                  <div className="h-full w-full rounded-full bg-emerald-500" />
                </div>
              </div>
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-700">法力</span>
                  <div className="text-right">
                    <strong className="text-sm text-blue-700">
                      {formatAttribute(effectiveAttributes.status.mana)}
                    </strong>
                    {skillBonuses.mana > 0 && (
                      <span className="ml-2 text-xs text-blue-600">
                        +技能 {formatAttribute(skillBonuses.mana)}
                      </span>
                    )}
                    {temporaryTalismanBonuses.mana > 0 && (
                      <span className="ml-2 text-xs text-violet-600">
                        +临时符 {formatAttribute(temporaryTalismanBonuses.mana)}
                      </span>
                    )}
                    {skillBonuses.mana === 0 &&
                      temporaryTalismanBonuses.mana === 0 && (
                        <span className="ml-2 text-xs text-slate-400">
                          1 级基准 · 成长待补
                        </span>
                      )}
                  </div>
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
            <div
              className="grid grid-cols-2 rounded-xl bg-slate-100 p-1"
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
                        <span className="text-xs text-slate-600 sm:text-sm">
                          {label}
                        </span>
                        <div className="min-w-0 text-right">
                          <strong className="text-sm text-slate-900">
                            {formatAttribute(effectiveAttributes.derived[attribute])}
                          </strong>
                          {skillBonuses[attribute] !== 0 && (
                            <span
                              className={`ml-1 text-[11px] ${
                                skillBonuses[attribute] > 0
                                  ? "text-blue-600"
                                  : "text-rose-600"
                              }`}
                            >
                              {formatBonus(skillBonuses[attribute])}
                            </span>
                          )}
                          {areSoulArtifactBonusesValid &&
                            soulArtifactBonuses[attribute] !== 0 && (
                              <span className="ml-1 text-[11px] text-blue-600">
                                魂器 {formatBonus(soulArtifactBonuses[attribute])}
                              </span>
                            )}
                          {satinBonuses[attribute] > 0 && (
                            <span className="ml-1 text-[11px] text-amber-600">
                              缎纹 {formatBonus(satinBonuses[attribute])}
                            </span>
                          )}
                          {guildBlessingBonuses[attribute] > 0 && (
                            <span className="ml-1 text-[11px] text-cyan-600">
                              帮派 {formatBonus(guildBlessingBonuses[attribute])}
                            </span>
                          )}
                          {temporaryTalismanBonuses[attribute] > 0 && (
                            <span className="ml-1 text-[11px] text-violet-600">
                              临时符 {formatBonus(temporaryTalismanBonuses[attribute])}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2" role="group" aria-label="潜力属性列">
                    {PRIMARY_ATTRIBUTE_KEYS.map((attribute) => (
                      <div
                        key={attribute}
                        className="flex min-w-0 items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2.5"
                      >
                        <span className="text-xs text-slate-600 sm:text-sm">
                          {PRIMARY_ATTRIBUTE_SHORT_LABELS[attribute]}
                        </span>
                        <div className="min-w-0 text-right">
                          <strong
                            className={`text-sm ${
                              allocation[attribute] > 0
                                ? "text-emerald-600"
                                : "text-slate-900"
                            }`}
                          >
                            {effectiveAttributes.primary[attribute]}
                          </strong>
                          {allocation[attribute] > 0 && (
                            <span className="ml-1 text-[11px] text-emerald-600">
                              +{allocation[attribute]}
                            </span>
                          )}
                          {skillBonuses[attribute] > 0 && (
                            <span className="ml-1 text-[11px] text-blue-600">
                              +加成 {formatAttribute(skillBonuses[attribute])}
                            </span>
                          )}
                          {areSoulArtifactBonusesValid &&
                            soulArtifactBonuses[attribute] !== 0 && (
                              <span
                                className={`ml-1 text-[11px] ${
                                  soulArtifactBonuses[attribute] > 0
                                    ? "text-blue-600"
                                    : "text-rose-600"
                                }`}
                              >
                                魂器 {formatBonus(soulArtifactBonuses[attribute])}
                              </span>
                            )}
                          {seasonArtifactBonuses[attribute] > 0 && (
                            <span className="ml-1 text-[11px] text-violet-600">
                              神器 {formatBonus(seasonArtifactBonuses[attribute])}
                            </span>
                          )}
                          {charmBonuses[attribute] > 0 && (
                            <span className="ml-1 text-[11px] text-fuchsia-600">
                              魅灵 {formatBonus(charmBonuses[attribute])}
                            </span>
                          )}
                          {starBlessingBonuses[attribute] > 0 && (
                            <span className="ml-1 text-[11px] text-cyan-600">
                              祈福 {formatBonus(starBlessingBonuses[attribute])}
                            </span>
                          )}
                          {temporaryTalismanBonuses[attribute] > 0 && (
                            <span className="ml-1 text-[11px] text-violet-600">
                              临时符 {formatBonus(temporaryTalismanBonuses[attribute])}
                            </span>
                          )}
                        </div>
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
                          <span className="text-xs text-slate-600 sm:text-sm">
                            {attribute.label}
                          </span>
                          <div className="text-right">
                            <strong
                              className={`text-sm ${
                                "growsWithLevel" in attribute
                                  ? "text-emerald-600"
                                  : "text-slate-900"
                              }`}
                            >
                              {effectiveAttributes.advanced[attribute.attribute]}
                              {attribute.unit}
                            </strong>
                            {"growsWithLevel" in attribute && (
                              <span className="ml-1 text-[11px] text-emerald-600">
                                +
                                {calculated.advanced.sealHit -
                                  LEVEL_ONE_ADVANCED_ATTRIBUTES.sealHit}
                              </span>
                            )}
                            {(attribute.attribute === "healingPower" ||
                              attribute.attribute === "sealHit") &&
                              temporaryTalismanBonuses[attribute.attribute] > 0 && (
                                <span className="ml-1 text-[11px] text-violet-600">
                                  临时符 {formatBonus(
                                    temporaryTalismanBonuses[attribute.attribute]
                                  )}
                                </span>
                              )}
                          </div>
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
                    {AFFINITY_LABELS.map((affinity) => (
                      <div
                        key={affinity}
                        className="rounded-lg bg-slate-50 px-2 py-3 text-center"
                      >
                        <p className="text-xs text-slate-500">{affinity}</p>
                        <strong className="mt-1 block text-sm text-slate-800">0</strong>
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
