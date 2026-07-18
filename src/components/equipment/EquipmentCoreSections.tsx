import {
  EQUIPMENT_ATTRIBUTE_LABELS,
  EQUIPMENT_BASE_ATTRIBUTE_CONFIG,
  EQUIPMENT_SLOT_LABELS,
  NECKLACE_BASE_ATTRIBUTE_OPTIONS,
  RING_SECONDARY_ATTRIBUTE_OPTIONS,
  getNecklaceBaseAttributeLines,
  getRingSecondaryAttribute,
  isSeasonEquipmentSlot,
} from "../../utils/equipmentAttributes";
import type {
  EquipmentAttribute,
  EquipmentItem,
  NecklaceBaseAttribute,
  RingSecondaryAttribute,
} from "../../utils/equipmentAttributes";
import {
  EquipmentAttributeSelect,
  EquipmentAttributeValueInput,
  EquipmentEditorSection,
  EquipmentFieldLabel,
  equipmentEditorInputClassName,
} from "./EquipmentEditorFields";

type EquipmentSectionProps = {
  item: EquipmentItem;
  onChange: (item: EquipmentItem) => void;
};

export const EquipmentStatusSection = ({
  item,
  onChange,
}: EquipmentSectionProps) => {
  const isSeasonEquipment = isSeasonEquipmentSlot(item.slot);

  return (
    <EquipmentEditorSection
      title={`${EQUIPMENT_SLOT_LABELS[item.slot]}状态`}
      description="关闭后保留录入值，但不计入装备总属性和角色属性。"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
          <input
            type="checkbox"
            className="size-4 accent-blue-600"
            checked={item.enabled}
            onChange={(event) =>
              onChange({ ...item, enabled: event.target.checked })
            }
          />
          计入总属性
        </label>
        {isSeasonEquipment ? (
          <div className="rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2.5">
            <p className="text-xs font-medium text-amber-800">全等级装备</p>
            <p className="mt-1 text-[11px] leading-4 text-amber-700/80">
              属性随角色等级自动成长
            </p>
          </div>
        ) : (
          <label>
            <EquipmentFieldLabel>装备等级</EquipmentFieldLabel>
            <input
              type="number"
              min="1"
              aria-label={`${EQUIPMENT_SLOT_LABELS[item.slot]}：装备等级`}
              className={equipmentEditorInputClassName}
              value={item.level}
              onChange={(event) =>
                onChange({ ...item, level: Number(event.target.value) || 1 })
              }
            />
          </label>
        )}
      </div>
    </EquipmentEditorSection>
  );
};

export const EquipmentBaseAttributesSection = ({
  item,
  onChange,
}: EquipmentSectionProps) => {
  const fixedAttributes = EQUIPMENT_BASE_ATTRIBUTE_CONFIG[item.slot];
  const ringSecondaryAttribute =
    item.slot === "ring" ? getRingSecondaryAttribute(item.baseAttributes) : null;
  const necklaceBaseAttributeLines =
    item.slot === "necklace"
      ? getNecklaceBaseAttributeLines(item.baseAttributes)
      : [];
  const updateBaseAttribute = (
    attribute: EquipmentAttribute,
    value: number
  ) => {
    onChange({
      ...item,
      baseAttributes: { ...item.baseAttributes, [attribute]: value },
    });
  };

  const description =
    item.slot === "ring"
      ? "戒指第一条固定为气血；第二条按职业选择物攻、法攻或速度。"
      : item.slot === "necklace"
        ? "项链随机生成两条不重复的装备属性，可选气血、物防或法防。"
        : "专业版的基础属性类型固定；请填写游戏面板显示的最终数值。";

  return (
    <EquipmentEditorSection title="装备属性" description={description}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {fixedAttributes.map((attribute) => (
          <EquipmentAttributeValueInput
            key={attribute}
            label={`${EQUIPMENT_SLOT_LABELS[item.slot]}：${EQUIPMENT_ATTRIBUTE_LABELS[attribute]}`}
            value={item.baseAttributes[attribute] ?? 0}
            onChange={(value) => updateBaseAttribute(attribute, value)}
          />
        ))}

        {item.slot === "ring" && ringSecondaryAttribute ? (
          <div className="col-span-2 grid grid-cols-[minmax(0,1fr)_minmax(100px,0.7fr)] gap-3 sm:col-span-2">
            <EquipmentAttributeSelect
              label="戒指：职业对应属性"
              value={ringSecondaryAttribute}
              options={RING_SECONDARY_ATTRIBUTE_OPTIONS}
              onChange={(attribute) => {
                const nextAttribute = attribute as RingSecondaryAttribute;
                const currentValue =
                  item.baseAttributes[ringSecondaryAttribute] ?? 0;
                const baseAttributes = { ...item.baseAttributes };

                for (const option of RING_SECONDARY_ATTRIBUTE_OPTIONS) {
                  delete baseAttributes[option.attribute];
                }
                baseAttributes[nextAttribute] = currentValue;
                onChange({ ...item, baseAttributes });
              }}
            />
            <EquipmentAttributeValueInput
              label={`戒指：${EQUIPMENT_ATTRIBUTE_LABELS[ringSecondaryAttribute]}`}
              value={item.baseAttributes[ringSecondaryAttribute] ?? 0}
              onChange={(value) =>
                updateBaseAttribute(ringSecondaryAttribute, value)
              }
            />
          </div>
        ) : null}

        {item.slot === "necklace"
          ? necklaceBaseAttributeLines.map((line, index) => (
              <div
                key={index}
                className="col-span-2 grid grid-cols-[minmax(0,1fr)_minmax(100px,0.7fr)] gap-3 sm:col-span-2"
              >
                <EquipmentAttributeSelect
                  label={`项链：装备属性 ${index + 1}`}
                  value={line.attribute}
                  options={NECKLACE_BASE_ATTRIBUTE_OPTIONS.map((option) => ({
                    ...option,
                    disabled: necklaceBaseAttributeLines.some(
                      (candidate, candidateIndex) =>
                        candidateIndex !== index &&
                        candidate.attribute === option.attribute
                    ),
                  }))}
                  onChange={(attribute) => {
                    const nextAttribute = attribute as NecklaceBaseAttribute;
                    const nextLines = necklaceBaseAttributeLines.map(
                      (candidate, candidateIndex) =>
                        candidateIndex === index
                          ? { ...candidate, attribute: nextAttribute }
                          : candidate
                    );
                    const baseAttributes: EquipmentItem["baseAttributes"] = {};

                    for (const candidate of nextLines) {
                      baseAttributes[candidate.attribute] = candidate.value;
                    }
                    onChange({ ...item, baseAttributes });
                  }}
                />
                <EquipmentAttributeValueInput
                  label={`项链：装备属性 ${index + 1} 数值`}
                  value={line.value}
                  onChange={(value) =>
                    updateBaseAttribute(line.attribute, value)
                  }
                />
              </div>
            ))
          : null}
      </div>
    </EquipmentEditorSection>
  );
};
