import { useCallback, useMemo, useState } from "react";
import EditorDialog from "./EditorDialog";
import EquipmentItemEditor from "./EquipmentItemEditor";
import EditIconButton from "./EditIconButton";
import {
  EQUIPMENT_ATTRIBUTE_LABELS,
  EQUIPMENT_SLOTS,
  EQUIPMENT_SLOT_LABELS,
  calculateEquipmentItemAttributes,
  calculateEquipmentSummary,
  getEquipmentEffectLabels,
  isSeasonEquipmentSlot,
} from "../utils/equipmentAttributes";
import type {
  EquipmentAttribute,
  EquipmentItem,
  EquipmentSet,
  EquipmentSlot,
} from "../utils/equipmentAttributes";

type EquipmentCalculatorProps = {
  equipment: EquipmentSet;
  onChange: (equipment: EquipmentSet) => void;
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
    title: "基础属性",
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
    ],
  },
  {
    title: "战斗词条",
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
  `${value > 0 ? "+" : ""}${value}${attribute.endsWith("Percent") ? "%" : ""}`;

const EquipmentCalculator = ({
  equipment,
  onChange,
}: EquipmentCalculatorProps) => {
  const [activeSlot, setActiveSlot] = useState<EquipmentSlot | null>(null);
  const closeEditor = useCallback(() => setActiveSlot(null), []);
  const summary = useMemo(
    () => calculateEquipmentSummary(equipment),
    [equipment]
  );
  const activeItem = activeSlot ? equipment[activeSlot] : null;
  const updateItem = (item: EquipmentItem) => {
    onChange({ ...equipment, [item.slot]: item });
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
                  已直接接入角色属性计算器的可映射字段。
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                {summary.activeItemCount} / 8 件
              </span>
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
                        {attributes.map((attribute) => (
                          <div
                            key={attribute}
                            className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2"
                          >
                            <span className="text-xs text-slate-600">
                              {EQUIPMENT_ATTRIBUTE_LABELS[attribute] ?? "速度"}
                            </span>
                            <strong className="text-xs text-blue-700">
                              {formatValue(
                                summary.allAttributes[attribute] ?? 0,
                                attribute
                              )}
                            </strong>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-slate-400">暂无属性</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-4 text-xs leading-6 text-blue-900">
            <strong className="font-semibold">当前口径：</strong>
            六件基础装备按面板值汇总；戒指、项链为全等级赛年神装，只计算装备属性、百炼与副属性。
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
              const itemAttributes = calculateEquipmentItemAttributes(item);
              const visibleAttributes = Object.entries(itemAttributes).filter(
                ([, value]) => value !== 0
              ) as [EquipmentAttribute, number][];
              const effects = getEquipmentEffectLabels(item);

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
                    {effects.length > 0 ? (
                      effects.map((effect) => (
                        <span
                          key={effect}
                          className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700"
                        >
                          {effect}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400">无特效 / 特技</span>
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
          <EquipmentItemEditor item={activeItem} onChange={updateItem} />
        </EditorDialog>
      )}
    </div>
  );
};

export default EquipmentCalculator;
