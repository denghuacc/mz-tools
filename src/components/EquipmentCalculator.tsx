import { useCallback, useMemo, useState } from "react";
import EditorDialog from "./EditorDialog";
import EquipmentItemEditor from "./EquipmentItemEditor";
import EditIconButton from "./EditIconButton";
import {
  EQUIPMENT_ATTRIBUTE_LABELS,
  EQUIPMENT_GEM_CONFIG,
  EQUIPMENT_SLOTS,
  EQUIPMENT_SLOT_LABELS,
  calculateEquipmentGemBonus,
  calculateEquipmentItemAttributes,
  calculateEquipmentSummary,
  getGemLevelLimit,
  getEquipmentEffectLabels,
  getSeasonEquipmentResonance,
  isSeasonEquipmentSlot,
} from "../utils/equipmentAttributes";
import type {
  EquipmentAttribute,
  EquipmentCalculatorState,
  EquipmentItem,
  EquipmentSlot,
} from "../utils/equipmentAttributes";

type EquipmentCalculatorProps = {
  state: EquipmentCalculatorState;
  onChange: (state: EquipmentCalculatorState) => void;
};

const SUMMARY_GROUPS: readonly {
  title: string;
  attributes: readonly EquipmentAttribute[];
}[] = [
  {
    title: "五维",
    attributes: ["constitution", "spirit", "strength", "endurance", "agility"],
  },
  {
    title: "面板属性",
    attributes: [
      "health",
      "healthPercent",
      "mana",
      "physicalAttack",
      "magicAttack",
      "physicalDefense",
      "magicDefense",
      "speed",
      "healingPower",
      "speedPercent",
      "sealHit",
      "sealResistance",
      "dodgeRate",
    ],
  },
  {
    title: "战斗属性",
    attributes: [
      "physicalDamageResult",
      "magicalDamageResult",
      "physicalDamageReduction",
      "magicalDamageReduction",
    ],
  },
  {
    title: "元素亲和",
    attributes: [
      "fireAffinity",
      "iceAffinity",
      "electricAffinity",
      "poisonAffinity",
      "waterAffinity",
      "windAffinity",
    ],
  },
];

const formatValue = (value: number, attribute: EquipmentAttribute) =>
  `${value > 0 ? "+" : ""}${value}${
    attribute.endsWith("Percent") || attribute === "dodgeRate" ? "%" : ""
  }`;

const EquipmentCalculator = ({
  state,
  onChange,
}: EquipmentCalculatorProps) => {
  const { characterLevel, equipment } = state;
  const [activeSlot, setActiveSlot] = useState<EquipmentSlot | null>(null);
  const closeEditor = useCallback(() => setActiveSlot(null), []);
  const summary = useMemo(
    () => calculateEquipmentSummary(equipment, characterLevel),
    [characterLevel, equipment]
  );
  const seasonResonance = useMemo(
    () => getSeasonEquipmentResonance(equipment),
    [equipment]
  );
  const activeItem = activeSlot ? equipment[activeSlot] : null;
  const updateItem = (item: EquipmentItem) => {
    onChange({
      ...state,
      equipment: { ...equipment, [item.slot]: item },
    });
  };
  return (
    <div className="space-y-5">
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(300px,0.72fr)_minmax(620px,1.28fr)]">
        <aside className="space-y-4 xl:sticky xl:top-24">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">装备总属性</h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  已直接接入角色面板计算器的可映射字段。
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                {summary.activeItemCount} / 8 件
              </span>
            </div>

            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-slate-600">
                  当前角色 {characterLevel} 级
                </span>
                <span className="shrink-0 text-xs font-medium text-blue-700">
                  宝石上限 {getGemLevelLimit(characterLevel)} 级
                </span>
              </div>
              <p className="mt-2 text-[11px] leading-4 text-slate-500">
                等级由角色面板统一设置，装备宝石会自动引用并限制可选等级。
              </p>
            </div>

            <div className="mt-4 space-y-4">
              {SUMMARY_GROUPS.map((group) => {
                const attributes = group.attributes.filter(
                  (attribute) => (summary.allAttributes[attribute] ?? 0) !== 0
                );

                return (
                  <div key={group.title}>
                    <h3 className="text-xs font-semibold text-slate-500">
                      {group.title}
                    </h3>
                    {attributes.length > 0 ? (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {attributes.map((attribute) => {
                          const gemValue = summary.gemAttributes[attribute] ?? 0;
                          const independentAffixValue =
                            summary.independentAffixAttributes[attribute] ?? 0;

                          return (
                            <div
                              key={attribute}
                              className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2"
                            >
                              <span className="shrink-0 text-xs text-slate-600">
                                {EQUIPMENT_ATTRIBUTE_LABELS[attribute] ?? "速度"}
                              </span>
                              <span className="flex min-w-0 flex-1 flex-wrap items-baseline justify-end gap-x-2 gap-y-0.5 text-right">
                                {gemValue !== 0 ? (
                                  <span className="whitespace-nowrap text-[10px] text-violet-600">
                                    宝石 {formatValue(gemValue, attribute)}
                                  </span>
                                ) : null}
                                {independentAffixValue !== 0 ? (
                                  <span className="whitespace-nowrap text-[10px] text-amber-600">
                                    词条 {formatValue(independentAffixValue, attribute)}
                                  </span>
                                ) : null}
                                <strong className="shrink-0 whitespace-nowrap text-xs font-semibold text-slate-900">
                                  {formatValue(
                                    summary.allAttributes[attribute] ?? 0,
                                    attribute
                                  )}
                                </strong>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-slate-400">暂无属性</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {seasonResonance ? (
            <section className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-4 text-xs leading-6 text-amber-950">
              <h2 className="font-semibold">神装共鸣</h2>
              <p className="mt-1">
                {seasonResonance.effect}等级和 {seasonResonance.totalLevel}：
                {seasonResonance.reachedThreshold
                  ? `已达成 ${seasonResonance.reachedThreshold} 级共鸣`
                  : "尚未达成 4 级共鸣"}
                {seasonResonance.nextThreshold
                  ? `，下一档 ${seasonResonance.nextThreshold} 级`
                  : "，已达最高档"}
                。
              </p>
              <p className="mt-1 text-amber-800">
                共鸣套装属性待复核，当前不计入总属性。
              </p>
            </section>
          ) : null}

          <section className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-4 text-xs leading-6 text-blue-900">
            <strong className="font-semibold">当前口径：</strong>
            六件基础装备按面板值、宝石与已收录独立词条汇总；戒指、项链为全等级赛年神装，计算装备属性、百炼、副属性和已收录面板特效。
          </section>
        </aside>

        <section>
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">八件装备</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                顺序为武器、上衣、发冠、下装、饰品、鞋子、戒指、项链。
              </p>
            </div>
            <span className="shrink-0 text-xs text-slate-400">点击卡片编辑</span>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {EQUIPMENT_SLOTS.map((slot, index) => {
              const item = equipment[slot];
              const isSeasonEquipment = isSeasonEquipmentSlot(slot);
              const itemAttributes = calculateEquipmentItemAttributes(
                item,
                characterLevel
              );
              const visibleAttributes = Object.entries(itemAttributes).filter(
                ([, value]) => value !== 0
              ) as [EquipmentAttribute, number][];
              const effects = getEquipmentEffectLabels(item);
              const gemBonus = calculateEquipmentGemBonus(item, characterLevel);

              return (
                <article
                  key={slot}
                  className={`rounded-xl border bg-white p-4 shadow-sm transition ${
                    item.enabled
                      ? "border-slate-200 hover:border-blue-200"
                      : "border-slate-200 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-semibold text-white">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900">
                          {EQUIPMENT_SLOT_LABELS[slot]}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {isSeasonEquipment ? "全等级" : `${item.level} 级`} ·{" "}
                          {item.enabled ? "已计入" : "未计入"}
                        </p>
                      </div>
                    </div>
                    <EditIconButton
                      label={`编辑${EQUIPMENT_SLOT_LABELS[slot]}`}
                      onClick={() => setActiveSlot(slot)}
                    />
                  </div>

                  <div className="mt-3 flex min-h-14 flex-wrap content-start gap-1.5">
                    {visibleAttributes.length > 0 ? (
                      visibleAttributes.map(([attribute, value]) => (
                        <span
                          key={attribute}
                          className="rounded-md bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600"
                        >
                          {EQUIPMENT_ATTRIBUTE_LABELS[attribute] ?? "速度"}{" "}
                          <span className="text-blue-600">
                            {formatValue(value, attribute)}
                          </span>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">暂无属性</span>
                    )}
                  </div>

                  <div className="mt-3 flex min-h-6 flex-wrap gap-1.5 border-t border-slate-100 pt-3">
                    {gemBonus || effects.length > 0 ? (
                      <>
                        {gemBonus ? (
                          <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700">
                            {EQUIPMENT_GEM_CONFIG[gemBonus.type].label} · {gemBonus.breakthrough
                              ? `${gemBonus.levelLimit}+1`
                              : gemBonus.level}
                            级
                          </span>
                        ) : null}
                        {effects.map((effect) => (
                          <span
                            key={effect}
                            className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700"
                          >
                            {effect}
                          </span>
                        ))}
                      </>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        无独立词条 / 特效 / 特技
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      {activeItem && (
        <EditorDialog
          title={EQUIPMENT_SLOT_LABELS[activeItem.slot]}
          onClose={closeEditor}
        >
          <EquipmentItemEditor
            item={activeItem}
            equipment={equipment}
            characterLevel={characterLevel}
            onChange={updateItem}
          />
        </EditorDialog>
      )}
    </div>
  );
};

export default EquipmentCalculator;
