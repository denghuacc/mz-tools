import { useEffect, useMemo, useState } from "react";
import useAttributePanelHeight from "../hooks/useAttributePanelHeight";
import {
  DEFAULT_AGILITY_CHARACTER_ALLOCATION,
  DEFAULT_CUSTOM_CHARACTER_ALLOCATION,
  getCustomCharacterAllocationValidationError,
} from "../utils/characterAttributes";
import type {
  CharacterAllocation,
  CustomCharacterAllocationScheme,
  PrimaryAttribute,
} from "../utils/characterAttributes";
import {
  SPIRIT_BEAST_AFFINITIES,
  SPIRIT_BEAST_BONUS_SOURCE_IDS,
  SPIRIT_BEAST_DERIVED_ATTRIBUTES,
  SPIRIT_BEAST_LEVEL_MAX,
  SPIRIT_BEAST_LEVEL_MIN,
  SPIRIT_BEAST_ALLOCATION_PRESETS,
  SPIRIT_BEAST_PRIMARY_ATTRIBUTES,
  SPIRIT_BEAST_QUALIFICATIONS,
  calculateSpiritBeastAttributes,
  calculateSpiritBeastStructuredMountBonuses,
  calculateSpiritBeastStructuredSkillBonuses,
  createDefaultSpiritBeastState,
  createEmptySpiritBeastBonusSources,
  createEmptySpiritBeastBonuses,
  getSpiritBeastAccessoryBonusTotal,
  getSpiritBeastAccessoryQualificationBonus,
  getSpiritBeastDestinyBonusTotal,
  getSpiritBeastEnlightenmentPrimaryBonus,
  getSpiritBeastEquipmentBonusTotal,
  getSpiritBeastLevelZeroPrimaryValidationError,
  getSpiritBeastMountFixedBonusTotal,
  normalizeSpiritBeastCalculatorState,
} from "../utils/spiritBeastAttributes";
import type {
  SpiritBeastAffinity,
  SpiritBeastBonusAttribute,
  SpiritBeastBonusSourceId,
  SpiritBeastCalculatorState,
  SpiritBeastDerivedAttribute,
  SpiritBeastManualBonusSourceId,
} from "../utils/spiritBeastAttributes";
import {
  calculateSpiritBeastAccessoryBonuses,
  createEmptySpiritBeastAccessories,
} from "../utils/spiritBeastAccessories";
import {
  calculateSpiritBeastEquipmentBonuses,
  createEmptySpiritBeastEquipmentSet,
  SPIRIT_BEAST_EQUIPMENT_SECONDARY_ATTRIBUTE_OPTIONS,
} from "../utils/spiritBeastEquipment";
import type { SpiritBeastEquipmentBonusAttribute } from "../utils/spiritBeastEquipment";
import {
  calculateSpiritBeastEnlightenmentBonuses,
  createEmptySpiritBeastEnlightenment,
  getSpiritBeastEnlightenmentValidationError,
} from "../utils/spiritBeastEnlightenment";
import {
  calculateSpiritBeastDestinyBonuses,
  countConfiguredSpiritBeastDestinySkills,
  createEmptySpiritBeastDestiny,
} from "../utils/spiritBeastDestiny";
import {
  countConfiguredSpiritBeastSkills,
  createEmptySpiritBeastSkills,
} from "../utils/spiritBeastSkills";
import {
  countConfiguredSpiritBeastMountSkills,
  createEmptySpiritBeastMountConfig,
} from "../utils/spiritBeastMount";
import {
  SPIRIT_BEAST_ATTRIBUTES_STORAGE_KEY,
  loadCalculatorState,
  saveCalculatorState,
} from "../utils/calculatorStorage";
import AttributeBonusCard from "./AttributeBonusCard";
import type { AttributeBonusField } from "./AttributeBonusCard";
import AttributeBonusSummaryPanel from "./AttributeBonusSummaryPanel";
import type { AttributeBonusSummarySource } from "./AttributeBonusSummaryPanel";
import AttributeValueLayout from "./AttributeValueLayout";
import EditorDialog from "./EditorDialog";
import EditIconButton from "./EditIconButton";
import PotentialAllocationControl from "./PotentialAllocationControl";
import SpiritBeastAccessoryControl from "./SpiritBeastAccessoryControl";
import {
  SpiritBeastAffinityControl,
  SpiritBeastLevelZeroPrimaryControl,
} from "./SpiritBeastBaseConfigControl";
import SpiritBeastCalculationScope from "./SpiritBeastCalculationScope";
import SpiritBeastDestinyControl from "./SpiritBeastDestinyControl";
import SpiritBeastEquipmentControl from "./SpiritBeastEquipmentControl";
import SpiritBeastEnlightenmentControl from "./SpiritBeastEnlightenmentControl";
import SpiritBeastMountControl from "./SpiritBeastMountControl";
import SpiritBeastQualificationPanel from "./SpiritBeastQualificationPanel";
import SpiritBeastSkillControl from "./SpiritBeastSkillControl";
import {
  SPIRIT_BEAST_AFFINITY_LABELS as AFFINITY_LABELS,
  SPIRIT_BEAST_DERIVED_LABELS as DERIVED_LABELS,
  SPIRIT_BEAST_PRIMARY_LABELS as PRIMARY_LABELS,
  SPIRIT_BEAST_QUALIFICATION_LABELS,
} from "./spiritBeastLabels";

const AFFINITY_CLASSES: Record<SpiritBeastAffinity, string> = {
  fireAffinity: "border-red-100 bg-red-50 text-red-700",
  waterAffinity: "border-cyan-100 bg-cyan-50 text-cyan-700",
  electricAffinity: "border-amber-100 bg-amber-50 text-amber-700",
  poisonAffinity: "border-violet-100 bg-violet-50 text-violet-700",
  iceAffinity: "border-blue-100 bg-blue-50 text-blue-700",
  windAffinity: "border-teal-100 bg-teal-50 text-teal-700",
};

const BONUS_SOURCE_CONFIG: Record<
  SpiritBeastBonusSourceId,
  {
    title: string;
    shortTitle: string;
    badge?: string;
    colorClass: string;
  }
> = {
  enlightenment: {
    title: "仙府点化",
    shortTitle: "点化",
    colorClass: "text-cyan-600",
  },
  equipment: {
    title: "装备",
    shortTitle: "装备",
    colorClass: "text-blue-700",
  },
  accessory: {
    title: "灵饰",
    shortTitle: "灵饰",
    colorClass: "text-violet-600",
  },
  skill: {
    title: "技能",
    shortTitle: "技能",
    colorClass: "text-emerald-600",
  },
  destiny: {
    title: "命格",
    shortTitle: "命格",
    colorClass: "text-orange-600",
  },
  mount: {
    title: "坐骑统御",
    shortTitle: "坐骑",
    colorClass: "text-pink-600",
  },
};

const DERIVED_FIELDS = SPIRIT_BEAST_DERIVED_ATTRIBUTES.map((attribute) => ({
  attribute,
  label: DERIVED_LABELS[attribute],
  allowNegative: true,
})) satisfies readonly AttributeBonusField<SpiritBeastBonusAttribute>[];

const PRIMARY_FIELDS = SPIRIT_BEAST_PRIMARY_ATTRIBUTES.map((attribute) => ({
  attribute,
  label: PRIMARY_LABELS[attribute],
  allowNegative: true,
})) satisfies readonly AttributeBonusField<SpiritBeastBonusAttribute>[];

const AFFINITY_FIELDS = SPIRIT_BEAST_AFFINITIES.map((attribute) => ({
  attribute,
  label: `${AFFINITY_LABELS[attribute]}亲和`,
  allowNegative: true,
})) satisfies readonly AttributeBonusField<SpiritBeastBonusAttribute>[];

const ALL_BONUS_FIELDS = [
  ...DERIVED_FIELDS,
  ...PRIMARY_FIELDS,
  ...AFFINITY_FIELDS,
] satisfies readonly AttributeBonusField<SpiritBeastBonusAttribute>[];

const BONUS_FIELD_LABELS = Object.fromEntries(
  ALL_BONUS_FIELDS.map(({ attribute, label }) => [attribute, label]),
) as Record<SpiritBeastBonusAttribute, string>;

const STANDARD_BONUS_ATTRIBUTE_SET = new Set<string>(
  ALL_BONUS_FIELDS.map(({ attribute }) => attribute),
);

const DERIVED_ATTRIBUTE_COLUMNS = [
  "magicalAttack",
  "magicalDefense",
  "physicalAttack",
  "physicalDefense",
  "speed",
] as const satisfies readonly SpiritBeastDerivedAttribute[];

const LEVEL_OPTIONS = Array.from(
  { length: SPIRIT_BEAST_LEVEL_MAX - SPIRIT_BEAST_LEVEL_MIN + 1 },
  (_, index) => SPIRIT_BEAST_LEVEL_MIN + index,
);

type EditorId = "affinity" | "allocation" | SpiritBeastBonusSourceId;

const formatAttribute = (value: number) =>
  Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");

const formatPanelAttribute = (value: number) =>
  String(Math.floor(Number(value.toFixed(10))));

const formatBonus = (value: number) =>
  `${value > 0 ? "+" : ""}${formatAttribute(value)}`;

const loadSpiritBeastState = (): SpiritBeastCalculatorState =>
  loadCalculatorState(
    SPIRIT_BEAST_ATTRIBUTES_STORAGE_KEY,
    createDefaultSpiritBeastState(),
    normalizeSpiritBeastCalculatorState,
  );

const SpiritBeastAttributeCalculator = () => {
  const [state, setState] = useState(loadSpiritBeastState);
  const [activeEditorId, setActiveEditorId] = useState<EditorId | null>(null);
  const [areBonusDetailsVisible, setAreBonusDetailsVisible] = useState(true);
  const { attributePanelRef: leftAttributePanelRef, rightRailStyle } =
    useAttributePanelHeight();

  const calculated = useMemo(
    () => calculateSpiritBeastAttributes(state),
    [state],
  );
  const customValidationError = getCustomCharacterAllocationValidationError(
    state.customAllocation,
    state.customAllocationScheme,
  );
  const levelZeroValidationError =
    getSpiritBeastLevelZeroPrimaryValidationError(state.levelZeroPrimary);

  useEffect(() => {
    saveCalculatorState(SPIRIT_BEAST_ATTRIBUTES_STORAGE_KEY, state);
  }, [state]);

  const selectedPreset =
    SPIRIT_BEAST_ALLOCATION_PRESETS.find(
      ({ id }) => id === state.selectedPresetId,
    ) ?? SPIRIT_BEAST_ALLOCATION_PRESETS[0];
  const customMainAttribute: PrimaryAttribute =
    state.customAllocation.strength > 0 ? "strength" : "spirit";
  const allocationDisplayOrder: readonly PrimaryAttribute[] =
    state.allocationMode === "custom"
      ? state.customAllocationScheme === "agility"
        ? ["agility", "constitution", "endurance"]
        : [customMainAttribute, "constitution", "endurance", "agility"]
      : SPIRIT_BEAST_PRIMARY_ATTRIBUTES;
  const allocationPlanLabel =
    state.allocationMode === "custom"
      ? allocationDisplayOrder
          .filter((attribute) => state.customAllocation[attribute] > 0)
          .map(
            (attribute) =>
              `${state.customAllocation[attribute]}${PRIMARY_LABELS[attribute]}`,
          )
          .join("")
      : selectedPreset.label;
  const allocationSummary = allocationDisplayOrder
    .filter((attribute) => calculated.allocation[attribute] > 0)
    .map(
      (attribute) =>
        `${PRIMARY_LABELS[attribute]} +${calculated.allocation[attribute]}`,
    )
    .join(" · ");
  const enabledEquipmentCount = [
    state.equipment.garment.enabled,
    state.equipment.necklace.enabled,
    state.equipment.crown.enabled,
  ].filter(Boolean).length;
  const enabledAccessoryCount = [
    state.accessories.tierOne.enabled,
    state.accessories.tierTwo.enabled,
  ].filter(Boolean).length;
  const accessoryBonuses = calculateSpiritBeastAccessoryBonuses(
    state.accessories,
  );
  const enlightenmentBonuses = calculateSpiritBeastEnlightenmentBonuses(
    state.enlightenment,
  );
  const enlightenmentValidationError =
    getSpiritBeastEnlightenmentValidationError(state.enlightenment);
  const structuredSkillBonuses = useMemo(
    () => calculateSpiritBeastStructuredSkillBonuses(state),
    [state],
  );
  const structuredMountBonuses = useMemo(
    () => calculateSpiritBeastStructuredMountBonuses(state),
    [state],
  );
  const structuredDestinyBonuses = useMemo(
    () => calculateSpiritBeastDestinyBonuses(state.destiny, state.level),
    [state.destiny, state.level],
  );
  const configuredSkillCount = countConfiguredSpiritBeastSkills(state.skills);
  const configuredDestinySkillCount = countConfiguredSpiritBeastDestinySkills(
    state.destiny,
  );
  const configuredMountSkillCount = countConfiguredSpiritBeastMountSkills(
    state.mount,
  );
  const configuredMountFixedAttributeCount = state.mount.fixedAttributes.length;

  const attributeBonusSources: readonly AttributeBonusSummarySource<SpiritBeastBonusSourceId>[] =
    SPIRIT_BEAST_BONUS_SOURCE_IDS.map((sourceId) => {
      const config = BONUS_SOURCE_CONFIG[sourceId];
      const detailedEquipmentBonuses =
        sourceId === "equipment"
          ? calculateSpiritBeastEquipmentBonuses(state.equipment)
          : null;
      const detailedAccessoryBonuses =
        sourceId === "accessory" ? accessoryBonuses.panelAttributes : null;
      const detailedSkillBonuses =
        sourceId === "skill" ? structuredSkillBonuses : null;
      const detailedDestinyBonuses =
        sourceId === "destiny" ? structuredDestinyBonuses : null;
      const getDirectSourceValue = (attribute: SpiritBeastBonusAttribute) =>
        sourceId === "enlightenment"
          ? getSpiritBeastEnlightenmentPrimaryBonus(state, attribute)
          : sourceId === "skill"
            ? 0
            : sourceId === "mount"
              ? getSpiritBeastMountFixedBonusTotal(state, attribute) +
                structuredMountBonuses[attribute]
              : state.bonusSources[sourceId][attribute];
      const standardItems = ALL_BONUS_FIELDS.filter(({ attribute }) => {
        const directSourceValue = getDirectSourceValue(attribute);
        const detailedEquipmentValue =
          detailedEquipmentBonuses && attribute in detailedEquipmentBonuses
            ? detailedEquipmentBonuses[
                attribute as SpiritBeastEquipmentBonusAttribute
              ]
            : 0;
        const detailedAccessoryValue =
          detailedAccessoryBonuses && attribute in detailedAccessoryBonuses
            ? detailedAccessoryBonuses[
                attribute as keyof typeof detailedAccessoryBonuses
              ]
            : 0;
        const detailedSkillValue = detailedSkillBonuses
          ? detailedSkillBonuses[attribute]
          : 0;
        const detailedDestinyValue =
          detailedDestinyBonuses && attribute in detailedDestinyBonuses
            ? detailedDestinyBonuses[
                attribute as keyof typeof detailedDestinyBonuses
              ]
            : 0;

        return (
          directSourceValue +
            detailedEquipmentValue +
            detailedAccessoryValue +
            detailedSkillValue +
            detailedDestinyValue !==
          0
        );
      }).map(({ attribute }) => {
        const directSourceValue = getDirectSourceValue(attribute);
        const detailedEquipmentValue =
          detailedEquipmentBonuses && attribute in detailedEquipmentBonuses
            ? detailedEquipmentBonuses[
                attribute as SpiritBeastEquipmentBonusAttribute
              ]
            : 0;
        const detailedAccessoryValue =
          detailedAccessoryBonuses && attribute in detailedAccessoryBonuses
            ? detailedAccessoryBonuses[
                attribute as keyof typeof detailedAccessoryBonuses
              ]
            : 0;
        const detailedSkillValue = detailedSkillBonuses
          ? detailedSkillBonuses[attribute]
          : 0;
        const detailedDestinyValue =
          detailedDestinyBonuses && attribute in detailedDestinyBonuses
            ? detailedDestinyBonuses[
                attribute as keyof typeof detailedDestinyBonuses
              ]
            : 0;

        return {
          label: BONUS_FIELD_LABELS[attribute],
          value:
            directSourceValue +
            detailedEquipmentValue +
            detailedAccessoryValue +
            detailedSkillValue +
            detailedDestinyValue,
        };
      });
      const equipmentOnlyItems =
        sourceId === "equipment" && detailedEquipmentBonuses
          ? SPIRIT_BEAST_EQUIPMENT_SECONDARY_ATTRIBUTE_OPTIONS.filter(
              ({ attribute }) =>
                !STANDARD_BONUS_ATTRIBUTE_SET.has(attribute) &&
                detailedEquipmentBonuses[attribute] !== 0,
            ).map(({ attribute, label, unit }) => ({
              label: label.replace("（%）", ""),
              value: detailedEquipmentBonuses[attribute],
              unit,
            }))
          : [];
      const accessoryQualificationItems =
        sourceId === "accessory" && accessoryBonuses.qualification > 0
          ? [
              {
                label: "全资质",
                value: accessoryBonuses.qualification,
              },
            ]
          : [];
      const enlightenmentQualificationItems =
        sourceId === "enlightenment"
          ? SPIRIT_BEAST_QUALIFICATIONS.filter(
              (qualification) =>
                enlightenmentBonuses.qualifications[qualification] !== 0,
            ).map((qualification) => ({
              label: `${SPIRIT_BEAST_QUALIFICATION_LABELS[qualification]}`,
              value: enlightenmentBonuses.qualifications[qualification],
            }))
          : [];
      const calculatedItems = [
        ...enlightenmentQualificationItems,
        ...accessoryQualificationItems,
        ...standardItems,
        ...equipmentOnlyItems,
      ];
      const items =
        sourceId === "skill" &&
        configuredSkillCount > 0 &&
        calculatedItems.length === 0
          ? [{ label: "面板净加成", value: 0 }]
          : calculatedItems;

      return {
        id: sourceId,
        title: config.title,
        badge:
          sourceId === "enlightenment"
            ? state.enlightenment.star > 0
              ? `${state.enlightenment.star}星`
              : "未点化"
            : sourceId === "equipment"
              ? `${enabledEquipmentCount}/3`
              : sourceId === "accessory"
                ? `${enabledAccessoryCount}/2`
                : sourceId === "skill" && configuredSkillCount > 0
                  ? `${configuredSkillCount} 项`
                  : sourceId === "destiny"
                    ? `${configuredDestinySkillCount}/6`
                    : sourceId === "mount"
                      ? `${configuredMountFixedAttributeCount}/2 · ${configuredMountSkillCount} 技能`
                      : config.badge,
        details:
          sourceId === "enlightenment"
            ? "仙府点化固定获得两项不同资质加成；属性星级决定五维词条数量与范围。资质按游戏内实际点数录入，五维先进入面板公式。"
            : sourceId === "equipment"
              ? "宝衣和宝冠各录入两条装备属性；宝衣、宝链启灵录入五维；宝冠另录入副属性、百炼与属性特效。宝链技能统一在“技能”来源录入。"
              : sourceId === "accessory"
                ? "1 阶灵饰固定增加全资质 10，2 阶灵饰固定增加全资质 20；每件另有一条物攻、法攻、物防、法防、速度或气血随机属性。"
                : sourceId === "skill"
                  ? "威能按灵点增加法攻；迅捷与迟钝调整速度；健壮与吉星调整气血；低级和高级亲和技能分别增加 15、25 点对应亲和。同名低级与高级同时存在时只应用高级效果。"
                  : sourceId === "destiny"
                    ? "命格包含 1 个本命技和 6 个命技。面板命技分为普通、变异和 1～5 级，同一属性只能出现一次；被动·神机妙算按灵兽等级减少速度。"
                    : sourceId === "mount"
                      ? "坐骑统御一般从气血、法力、物攻、法攻、物防、法防、速度中选择两项固定加成；疾风每级增加 1% 速度，迟钝术每级减少 2% 速度，可单选、全选或都不选。"
                      : undefined,
        items,
        validationError:
          sourceId === "enlightenment"
            ? enlightenmentValidationError
            : undefined,
      };
    });

  const updateBonus = (
    sourceId: SpiritBeastManualBonusSourceId,
    attribute: SpiritBeastBonusAttribute,
    value: number,
  ) => {
    setState((current) => ({
      ...current,
      bonusSources: {
        ...current.bonusSources,
        [sourceId]: {
          ...current.bonusSources[sourceId],
          [attribute]: value,
        },
      },
    }));
  };

  const resetBonusSource = (sourceId: SpiritBeastManualBonusSourceId) => {
    setState((current) => ({
      ...current,
      bonusSources: {
        ...current.bonusSources,
        [sourceId]: createEmptySpiritBeastBonuses(),
      },
    }));
  };

  const renderBonusDetails = (attribute: SpiritBeastBonusAttribute) =>
    SPIRIT_BEAST_BONUS_SOURCE_IDS.map((sourceId) => {
      if (sourceId === "equipment" && !state.isEquipmentIncluded) return null;

      const value =
        sourceId === "enlightenment"
          ? getSpiritBeastEnlightenmentPrimaryBonus(state, attribute)
          : sourceId === "equipment"
            ? getSpiritBeastEquipmentBonusTotal(state, attribute)
            : sourceId === "accessory"
              ? getSpiritBeastAccessoryBonusTotal(state, attribute)
              : sourceId === "skill"
                ? structuredSkillBonuses[attribute]
                : sourceId === "destiny"
                  ? getSpiritBeastDestinyBonusTotal(state, attribute)
                  : sourceId === "mount"
                    ? getSpiritBeastMountFixedBonusTotal(state, attribute) +
                      structuredMountBonuses[attribute]
                    : state.bonusSources[sourceId][attribute];
      if (value === 0) return null;

      const config = BONUS_SOURCE_CONFIG[sourceId];
      return (
        <span
          key={sourceId}
          className={`ml-1 inline-block whitespace-nowrap text-[11px] ${config.colorClass}`}
        >
          {config.shortTitle} {formatBonus(value)}
        </span>
      );
    });

  const activeSourceId =
    activeEditorId &&
    SPIRIT_BEAST_BONUS_SOURCE_IDS.includes(
      activeEditorId as SpiritBeastBonusSourceId,
    )
      ? (activeEditorId as SpiritBeastBonusSourceId)
      : null;

  return (
    <div className="space-y-5">
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(520px,1.2fr)_minmax(360px,0.8fr)]">
        <div
          className="order-1 space-y-4 xl:order-2 xl:max-h-[var(--attribute-panel-height)] xl:overflow-y-auto xl:overscroll-contain xl:pr-1"
          style={rightRailStyle}
          data-testid="spirit-beast-attribute-bonus-rail"
        >
          <SpiritBeastQualificationPanel
            qualifications={state.qualifications}
            growth={state.growth}
            accessoryQualificationBonus={getSpiritBeastAccessoryQualificationBonus(
              state,
            )}
            enlightenmentQualificationBonuses={
              enlightenmentBonuses.qualifications
            }
            onQualificationsChange={(qualifications) =>
              setState((current) => ({ ...current, qualifications }))
            }
            onGrowthChange={(growth) =>
              setState((current) => ({ ...current, growth }))
            }
          />
          <AttributeBonusSummaryPanel
            sources={attributeBonusSources}
            isEquipmentIncluded={state.isEquipmentIncluded}
            equipmentToggleLabel="计入装备值"
            equipmentToggleTitle="关闭后保留灵兽装备录入，但不计入灵兽面板属性"
            resetConfirmationMessage="重置后将清除全部灵兽属性加成配置，此操作无法撤销。等级、基础值和潜力点方案会保留。"
            onEdit={setActiveEditorId}
            onEquipmentIncludedChange={(isEquipmentIncluded) =>
              setState((current) => ({ ...current, isEquipmentIncluded }))
            }
            onReset={() =>
              setState((current) => ({
                ...current,
                enlightenment: createEmptySpiritBeastEnlightenment(),
                equipment: createEmptySpiritBeastEquipmentSet(),
                accessories: createEmptySpiritBeastAccessories(),
                skills: createEmptySpiritBeastSkills(),
                destiny: createEmptySpiritBeastDestiny(),
                mount: createEmptySpiritBeastMountConfig(),
                bonusSources: createEmptySpiritBeastBonusSources(),
              }))
            }
          />
        </div>

        <section
          ref={leftAttributePanelRef}
          className="order-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 xl:order-1"
          aria-label="灵兽面板结果"
          data-testid="spirit-beast-attribute-result-panel"
        >
          <div>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  数值条
                </h2>
                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                  气血、法力和五项派生属性按当前暂定规则汇总。
                </p>
              </div>
              <div className="flex shrink-0 items-end gap-2">
                <label>
                  <span className="block text-[11px] font-medium text-slate-500">
                    灵兽等级
                  </span>
                  <select
                    aria-label="灵兽等级"
                    className="mt-1 min-w-24 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    value={state.level}
                    onChange={(event) =>
                      setState((current) => ({
                        ...current,
                        level: Number(event.target.value),
                      }))
                    }
                  >
                    {LEVEL_OPTIONS.map((level) => (
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
              {(["health", "mana"] as const).map((attribute) => (
                <div
                  key={attribute}
                  role="group"
                  aria-label={`${DERIVED_LABELS[attribute]}数值`}
                  className={`rounded-xl border px-4 py-3 ${
                    attribute === "health"
                      ? "border-emerald-100 bg-emerald-50/50"
                      : "border-blue-100 bg-blue-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="shrink-0 text-sm font-medium text-slate-700">
                      {DERIVED_LABELS[attribute]}
                    </span>
                    <AttributeValueLayout
                      bonuses={
                        areBonusDetailsVisible
                          ? renderBonusDetails(attribute)
                          : null
                      }
                      value={
                        <strong
                          className={`shrink-0 text-base ${
                            attribute === "health"
                              ? "text-emerald-700"
                              : "text-blue-700"
                          }`}
                        >
                          {formatPanelAttribute(calculated.derived[attribute])}
                        </strong>
                      }
                    />
                  </div>
                  <div
                    className={`mt-2 h-1.5 w-full rounded-full ${
                      attribute === "health" ? "bg-emerald-500" : "bg-blue-500"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <div>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h2 className="text-base font-semibold text-slate-900">
                      基础属性 · 10 项
                    </h2>
                    <span className="text-xs font-medium text-amber-600">
                      资质公式待复核
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-5 text-slate-500">
                    当前值 = 0 级五维初值 + {state.level} 次固定成长 + 潜力点 +
                    属性加成。
                  </p>
                </div>

                <div className="flex w-full shrink-0 items-stretch gap-2 sm:w-auto">
                  <section
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 sm:w-64"
                    aria-label="潜力点分配摘要"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500">
                        潜力点分配
                      </span>
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
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2" role="group" aria-label="派生属性列">
                  {DERIVED_ATTRIBUTE_COLUMNS.map((attribute) => (
                    <div
                      key={attribute}
                      className="flex min-w-0 items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2.5"
                    >
                      <span className="shrink-0 text-xs text-slate-600 sm:text-sm">
                        {DERIVED_LABELS[attribute]}
                      </span>
                      <AttributeValueLayout
                        bonuses={
                          areBonusDetailsVisible
                            ? renderBonusDetails(attribute)
                            : null
                        }
                        value={
                          <strong className="shrink-0 text-sm text-slate-900">
                            {formatPanelAttribute(
                              calculated.derived[attribute],
                            )}
                          </strong>
                        }
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2" role="group" aria-label="五维属性列">
                  {SPIRIT_BEAST_PRIMARY_ATTRIBUTES.map((attribute) => (
                    <div
                      key={attribute}
                      className="flex min-w-0 items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2.5"
                    >
                      <span className="shrink-0 text-xs text-slate-600 sm:text-sm">
                        {PRIMARY_LABELS[attribute]}
                      </span>
                      <AttributeValueLayout
                        bonuses={
                          areBonusDetailsVisible ? (
                            <>
                              {calculated.allocation[attribute] !== 0 && (
                                <span className="ml-1 inline-block whitespace-nowrap text-[11px] text-emerald-600">
                                  潜力{" "}
                                  {formatBonus(
                                    calculated.allocation[attribute],
                                  )}
                                </span>
                              )}
                              {renderBonusDetails(attribute)}
                            </>
                          ) : null
                        }
                        value={
                          <strong
                            className={`shrink-0 text-sm ${
                              calculated.allocation[attribute] > 0
                                ? "text-emerald-600"
                                : "text-slate-900"
                            }`}
                          >
                            {formatPanelAttribute(
                              calculated.primary[attribute],
                            )}
                          </strong>
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  六系亲和
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  初值和各来源加成合计。
                </p>
              </div>
              <EditIconButton
                label="编辑亲和初值"
                onClick={() => setActiveEditorId("affinity")}
              />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {SPIRIT_BEAST_AFFINITIES.map((attribute) => (
                <div
                  key={attribute}
                  className={`rounded-lg border px-2 py-3 text-center ${AFFINITY_CLASSES[attribute]}`}
                >
                  <p className="text-xs opacity-75">
                    {AFFINITY_LABELS[attribute]}
                  </p>
                  <strong className="mt-1 block text-sm">
                    {formatPanelAttribute(calculated.affinities[attribute])}
                  </strong>
                  {areBonusDetailsVisible && (
                    <div className="mt-1 min-h-4 leading-4">
                      {renderBonusDetails(attribute)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {activeEditorId === "affinity" && (
        <EditorDialog title="亲和初值" onClose={() => setActiveEditorId(null)}>
          <SpiritBeastAffinityControl state={state} onChange={setState} />
        </EditorDialog>
      )}

      {activeEditorId === "allocation" && (
        <EditorDialog
          title="潜力点分配"
          isCloseDisabled={
            levelZeroValidationError !== null ||
            (state.allocationMode === "custom" &&
              customValidationError !== null)
          }
          onClose={() => setActiveEditorId(null)}
        >
          <div className="space-y-4">
            <SpiritBeastLevelZeroPrimaryControl
              state={state}
              onChange={setState}
            />
            <PotentialAllocationControl
              title="潜力点分配"
              presets={SPIRIT_BEAST_ALLOCATION_PRESETS}
              allocationMode={state.allocationMode}
              selectedPresetId={state.selectedPresetId}
              customScheme={state.customAllocationScheme}
              customAllocation={state.customAllocation}
              customValidationError={customValidationError}
              summary={allocationSummary}
              onAllocationModeChange={(allocationMode) =>
                setState((current) => ({ ...current, allocationMode }))
              }
              onSelectPreset={(selectedPresetId) =>
                setState((current) => ({
                  ...current,
                  allocationMode: "preset",
                  selectedPresetId,
                }))
              }
              onCustomSchemeChange={(
                customAllocationScheme: CustomCharacterAllocationScheme,
              ) =>
                setState((current) => ({
                  ...current,
                  customAllocationScheme,
                  customAllocation: {
                    ...(customAllocationScheme === "agility"
                      ? DEFAULT_AGILITY_CHARACTER_ALLOCATION
                      : DEFAULT_CUSTOM_CHARACTER_ALLOCATION),
                  },
                }))
              }
              onCustomAllocationChange={(
                customAllocation: CharacterAllocation,
              ) => setState((current) => ({ ...current, customAllocation }))}
            />
          </div>
        </EditorDialog>
      )}

      {activeSourceId === "equipment" && (
        <EditorDialog
          title={BONUS_SOURCE_CONFIG.equipment.title}
          onClose={() => setActiveEditorId(null)}
        >
          <SpiritBeastEquipmentControl
            equipment={state.equipment}
            onChange={(equipment) =>
              setState((current) => ({ ...current, equipment }))
            }
          />
          {ALL_BONUS_FIELDS.some(
            ({ attribute }) => state.bonusSources.equipment[attribute] !== 0,
          ) && (
            <div className="mt-3">
              <AttributeBonusCard
                title="旧版装备汇总修正"
                description="这是旧版装备合计输入的兼容数据；确认详细装备已覆盖这些数值后可以清空。"
                fields={ALL_BONUS_FIELDS}
                values={state.bonusSources.equipment}
                onChange={(attribute, value) =>
                  updateBonus("equipment", attribute, value)
                }
                onReset={() => resetBonusSource("equipment")}
              />
            </div>
          )}
        </EditorDialog>
      )}

      {activeSourceId === "enlightenment" && (
        <EditorDialog
          title={BONUS_SOURCE_CONFIG.enlightenment.title}
          onClose={() => setActiveEditorId(null)}
        >
          <SpiritBeastEnlightenmentControl
            enlightenment={state.enlightenment}
            onChange={(enlightenment) =>
              setState((current) => ({ ...current, enlightenment }))
            }
          />
        </EditorDialog>
      )}

      {activeSourceId === "accessory" && (
        <EditorDialog
          title={BONUS_SOURCE_CONFIG.accessory.title}
          onClose={() => setActiveEditorId(null)}
        >
          <SpiritBeastAccessoryControl
            accessories={state.accessories}
            onChange={(accessories) =>
              setState((current) => ({ ...current, accessories }))
            }
          />
          {ALL_BONUS_FIELDS.some(
            ({ attribute }) => state.bonusSources.accessory[attribute] !== 0,
          ) && (
            <div className="mt-3">
              <AttributeBonusCard
                title="旧版灵饰汇总修正"
                description="这是旧版灵饰合计输入的兼容数据；确认两件详细灵饰已覆盖这些数值后可以清空。"
                fields={ALL_BONUS_FIELDS}
                values={state.bonusSources.accessory}
                onChange={(attribute, value) =>
                  updateBonus("accessory", attribute, value)
                }
                onReset={() => resetBonusSource("accessory")}
              />
            </div>
          )}
        </EditorDialog>
      )}

      {activeSourceId === "skill" && (
        <EditorDialog
          title={BONUS_SOURCE_CONFIG.skill.title}
          onClose={() => setActiveEditorId(null)}
        >
          <SpiritBeastSkillControl
            skills={state.skills}
            onChange={(skills) =>
              setState((current) => ({ ...current, skills }))
            }
          />
        </EditorDialog>
      )}

      {activeSourceId === "destiny" && (
        <EditorDialog
          title={BONUS_SOURCE_CONFIG.destiny.title}
          onClose={() => setActiveEditorId(null)}
        >
          <SpiritBeastDestinyControl
            destiny={state.destiny}
            spiritBeastLevel={state.level}
            onChange={(destiny) =>
              setState((current) => ({ ...current, destiny }))
            }
          />
          {ALL_BONUS_FIELDS.some(
            ({ attribute }) => state.bonusSources.destiny[attribute] !== 0,
          ) && (
            <div className="mt-3">
              <AttributeBonusCard
                title="旧版命格汇总修正"
                description="这是旧版命格合计输入的兼容数据；确认结构化命格已覆盖这些数值后可以清空。"
                fields={ALL_BONUS_FIELDS}
                values={state.bonusSources.destiny}
                onChange={(attribute, value) =>
                  updateBonus("destiny", attribute, value)
                }
                onReset={() => resetBonusSource("destiny")}
              />
            </div>
          )}
        </EditorDialog>
      )}

      {activeSourceId === "mount" && (
        <EditorDialog
          title={BONUS_SOURCE_CONFIG.mount.title}
          onClose={() => setActiveEditorId(null)}
        >
          <SpiritBeastMountControl
            mount={state.mount}
            onChange={(mount) => setState((current) => ({ ...current, mount }))}
          />
          {ALL_BONUS_FIELDS.some(
            ({ attribute }) => state.bonusSources.mount[attribute] !== 0,
          ) && (
            <div className="mt-3">
              <AttributeBonusCard
                title="旧版坐骑统御汇总修正"
                description="这是旧版坐骑统御合计输入的兼容数据；确认结构化固定属性已覆盖这些数值后可以清空。"
                fields={ALL_BONUS_FIELDS}
                values={state.bonusSources.mount}
                onChange={(attribute, value) =>
                  updateBonus("mount", attribute, value)
                }
                onReset={() => resetBonusSource("mount")}
              />
            </div>
          )}
        </EditorDialog>
      )}

      <SpiritBeastCalculationScope level={state.level} />
    </div>
  );
};

export default SpiritBeastAttributeCalculator;
