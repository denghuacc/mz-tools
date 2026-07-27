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
  calculateSpiritBeastAttributes,
  createDefaultSpiritBeastState,
  createEmptySpiritBeastBonusSources,
  createEmptySpiritBeastBonuses,
  getSpiritBeastEquipmentBonusTotal,
  getSpiritBeastLevelZeroPrimaryValidationError,
  normalizeSpiritBeastCalculatorState,
} from "../utils/spiritBeastAttributes";
import type {
  SpiritBeastAffinity,
  SpiritBeastBonusAttribute,
  SpiritBeastBonusSourceId,
  SpiritBeastCalculatorState,
  SpiritBeastDerivedAttribute,
} from "../utils/spiritBeastAttributes";
import {
  calculateSpiritBeastEquipmentBonuses,
  createEmptySpiritBeastEquipmentSet,
  SPIRIT_BEAST_EQUIPMENT_SECONDARY_ATTRIBUTE_OPTIONS,
} from "../utils/spiritBeastEquipment";
import type { SpiritBeastEquipmentBonusAttribute } from "../utils/spiritBeastEquipment";
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
import {
  SpiritBeastAffinityControl,
  SpiritBeastLevelZeroPrimaryControl,
} from "./SpiritBeastBaseConfigControl";
import SpiritBeastCalculationScope from "./SpiritBeastCalculationScope";
import SpiritBeastEquipmentControl from "./SpiritBeastEquipmentControl";
import SpiritBeastQualificationPanel from "./SpiritBeastQualificationPanel";
import {
  SPIRIT_BEAST_AFFINITY_LABELS as AFFINITY_LABELS,
  SPIRIT_BEAST_DERIVED_LABELS as DERIVED_LABELS,
  SPIRIT_BEAST_PRIMARY_LABELS as PRIMARY_LABELS,
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
    description: string;
    badge?: string;
    colorClass: string;
  }
> = {
  equipment: {
    title: "装备",
    shortTitle: "装备",
    description: "录入 3 件灵兽装备提供的属性合计。",
    colorClass: "text-blue-700",
  },
  accessory: {
    title: "灵饰",
    shortTitle: "灵饰",
    description: "录入 2 件灵兽灵饰提供的属性合计。",
    badge: "2 件",
    colorClass: "text-violet-600",
  },
  skill: {
    title: "技能",
    shortTitle: "技能",
    description: "录入灵兽技能提供的直接属性加成。",
    colorClass: "text-emerald-600",
  },
  destiny: {
    title: "命格",
    shortTitle: "命格",
    description: "录入命格提供的直接属性加成。",
    colorClass: "text-orange-600",
  },
  mount: {
    title: "坐骑统御",
    shortTitle: "坐骑",
    description: "录入坐骑统御提供的直接属性加成。",
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

  const attributeBonusSources: readonly AttributeBonusSummarySource<SpiritBeastBonusSourceId>[] =
    SPIRIT_BEAST_BONUS_SOURCE_IDS.map((sourceId) => {
      const config = BONUS_SOURCE_CONFIG[sourceId];
      const detailedEquipmentBonuses =
        sourceId === "equipment"
          ? calculateSpiritBeastEquipmentBonuses(state.equipment)
          : null;
      const standardItems = ALL_BONUS_FIELDS.filter(({ attribute }) => {
        const detailedValue =
          detailedEquipmentBonuses && attribute in detailedEquipmentBonuses
            ? detailedEquipmentBonuses[
                attribute as SpiritBeastEquipmentBonusAttribute
              ]
            : 0;

        return state.bonusSources[sourceId][attribute] + detailedValue !== 0;
      }).map(({ attribute }) => {
        const detailedValue =
          detailedEquipmentBonuses && attribute in detailedEquipmentBonuses
            ? detailedEquipmentBonuses[
                attribute as SpiritBeastEquipmentBonusAttribute
              ]
            : 0;

        return {
          label: BONUS_FIELD_LABELS[attribute],
          value: state.bonusSources[sourceId][attribute] + detailedValue,
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
      const items = [...standardItems, ...equipmentOnlyItems];

      return {
        id: sourceId,
        title: config.title,
        badge:
          sourceId === "equipment"
            ? `${enabledEquipmentCount}/3`
            : config.badge,
        details:
          sourceId === "equipment"
            ? "宝衣和宝冠各录入两条装备属性；宝衣、宝链启灵录入五维；宝冠另录入副属性、百炼与属性特效。宝链技能统一在“技能”来源录入。"
            : undefined,
        items,
      };
    });

  const updateBonus = (
    sourceId: SpiritBeastBonusSourceId,
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

  const resetBonusSource = (sourceId: SpiritBeastBonusSourceId) => {
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
        sourceId === "equipment"
          ? getSpiritBeastEquipmentBonusTotal(state, attribute)
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
                equipment: createEmptySpiritBeastEquipmentSet(),
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

      {activeSourceId && activeSourceId !== "equipment" && (
        <EditorDialog
          title={BONUS_SOURCE_CONFIG[activeSourceId].title}
          onClose={() => setActiveEditorId(null)}
        >
          <AttributeBonusCard
            title={BONUS_SOURCE_CONFIG[activeSourceId].title}
            description={BONUS_SOURCE_CONFIG[activeSourceId].description}
            fields={ALL_BONUS_FIELDS}
            values={state.bonusSources[activeSourceId]}
            onChange={(attribute, value) =>
              updateBonus(activeSourceId, attribute, value)
            }
            onReset={() => resetBonusSource(activeSourceId)}
          />
        </EditorDialog>
      )}

      <SpiritBeastCalculationScope level={state.level} />
    </div>
  );
};

export default SpiritBeastAttributeCalculator;
