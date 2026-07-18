import {
  EQUIPMENT_ATTRIBUTE_LABELS,
  EQUIPMENT_ATTRIBUTE_OPTIONS,
  EQUIPMENT_NON_PRIMARY_ATTRIBUTE_OPTIONS,
  EQUIPMENT_PRIMARY_ATTRIBUTES,
  EQUIPMENT_SLOT_LABELS,
  isSeasonEquipmentSlot,
} from "../../utils/equipmentAttributes";
import type {
  EquipmentAttributeLine,
  EquipmentItem,
  EquipmentPrimaryAttributeLine,
} from "../../utils/equipmentAttributes";
import {
  AddAttributeLineButton,
  EquipmentAttributeLineEditor,
  EquipmentAttributeSelect,
  EquipmentAttributeValueInput,
  EquipmentEditorSection,
  EquipmentFieldLabel,
  equipmentEditorInputClassName,
} from "./EquipmentEditorFields";

type EquipmentAttributesSectionProps = {
  item: EquipmentItem;
  onChange: (item: EquipmentItem) => void;
};

const createNextSeasonAffixes = (
  currentAffixes: readonly EquipmentAttributeLine[],
  count: number
) => {
  const affixes = currentAffixes.slice(0, count);

  while (affixes.length < count) {
    const attribute = EQUIPMENT_ATTRIBUTE_OPTIONS.find(
      (option) =>
        !affixes.some((affix) => affix.attribute === option.attribute)
    )?.attribute;

    if (!attribute) break;
    affixes.push({ attribute, value: 0 });
  }

  return affixes;
};

const AdditionalPrimaryAttributesEditor = ({
  item,
  onChange,
}: EquipmentAttributesSectionProps) => {
  const updateLine = (
    index: number,
    line: EquipmentPrimaryAttributeLine
  ) => {
    const additionalPrimaryAttributes = [...item.additionalPrimaryAttributes];
    additionalPrimaryAttributes[index] = line;
    onChange({ ...item, additionalPrimaryAttributes });
  };

  return (
    <div className="space-y-2">
      {item.additionalPrimaryAttributes.map((line, index) => (
        <EquipmentAttributeLineEditor
          key={index}
          line={line}
          selectLabel={`${EQUIPMENT_SLOT_LABELS[item.slot]}：附加五维 ${index + 1}`}
          valueLabel={`附加五维 ${index + 1} 数值`}
          options={EQUIPMENT_PRIMARY_ATTRIBUTES.map((attribute) => ({
            attribute,
            label: EQUIPMENT_ATTRIBUTE_LABELS[attribute],
            disabled:
              item.additionalPrimaryAttributes.some(
                (candidate, candidateIndex) =>
                  candidateIndex !== index &&
                  candidate.attribute === attribute
              ) || item.supportAttribute?.attribute === attribute,
          }))}
          removeLabel={`删除${EQUIPMENT_SLOT_LABELS[item.slot]}附加五维 ${index + 1}`}
          removeDisabled={item.additionalPrimaryAttributes.length === 1}
          onChange={(nextLine) =>
            updateLine(index, nextLine as EquipmentPrimaryAttributeLine)
          }
          onRemove={() =>
            onChange({
              ...item,
              additionalPrimaryAttributes:
                item.additionalPrimaryAttributes.filter(
                  (_, current) => current !== index
                ),
            })
          }
        />
      ))}

      {item.additionalPrimaryAttributes.length < 2 ? (
        <AddAttributeLineButton
          onClick={() => {
            const attribute = EQUIPMENT_PRIMARY_ATTRIBUTES.find(
              (candidate) =>
                !item.additionalPrimaryAttributes.some(
                  (line) => line.attribute === candidate
                ) && item.supportAttribute?.attribute !== candidate
            );

            if (!attribute) return;
            onChange({
              ...item,
              additionalPrimaryAttributes: [
                ...item.additionalPrimaryAttributes,
                { attribute, value: 0 },
              ],
            });
          }}
        >
          添加第 2 条附加五维
        </AddAttributeLineButton>
      ) : null}
    </div>
  );
};

const TemperingEditor = ({
  item,
  onChange,
  bordered,
}: EquipmentAttributesSectionProps & { bordered: boolean }) => (
  <div className={bordered ? "mt-4 border-t border-slate-100 pt-4" : ""}>
    <p className="mb-2 text-xs font-semibold text-slate-500">百炼属性</p>
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(100px,0.7fr)] gap-3">
      <EquipmentAttributeSelect
        label={`${EQUIPMENT_SLOT_LABELS[item.slot]}：百炼属性`}
        value={item.tempering.attribute}
        options={EQUIPMENT_PRIMARY_ATTRIBUTES.map((attribute) => ({
          attribute,
          label: EQUIPMENT_ATTRIBUTE_LABELS[attribute],
        }))}
        onChange={(attribute) =>
          onChange({
            ...item,
            tempering: { ...item.tempering, attribute },
          })
        }
      />
      <EquipmentAttributeValueInput
        label={`${EQUIPMENT_SLOT_LABELS[item.slot]}：百炼数值`}
        value={item.tempering.value}
        onChange={(value) =>
          onChange({
            ...item,
            tempering: { ...item.tempering, value },
          })
        }
      />
    </div>
  </div>
);

const EquipmentAffixesEditor = ({
  item,
  onChange,
}: EquipmentAttributesSectionProps) => {
  const isSeasonEquipment = isSeasonEquipmentSlot(item.slot);
  const affixLabel = isSeasonEquipment ? "副属性" : "词条";
  const updateAffix = (index: number, line: EquipmentAttributeLine) => {
    const affixes = [...item.affixes];
    affixes[index] = line;
    onChange({ ...item, affixes });
  };
  const updateSeasonAffixCount = (count: number) =>
    onChange({
      ...item,
      affixes: createNextSeasonAffixes(item.affixes, count),
    });

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <div className="mb-2 flex items-end justify-between gap-3">
        <p className="text-xs font-semibold text-slate-500">
          {isSeasonEquipment ? "副属性（1～3 条）" : "其它词条"}
        </p>
        {isSeasonEquipment ? (
          <label className="w-32">
            <EquipmentFieldLabel>副属性条数</EquipmentFieldLabel>
            <select
              aria-label={`${EQUIPMENT_SLOT_LABELS[item.slot]}：副属性条数`}
              className={equipmentEditorInputClassName}
              value={Math.min(3, Math.max(1, item.affixes.length))}
              onChange={(event) =>
                updateSeasonAffixCount(Number(event.target.value))
              }
            >
              <option value={1}>1 条</option>
              <option value={2}>2 条</option>
              <option value={3}>3 条</option>
            </select>
          </label>
        ) : null}
      </div>

      <div className="space-y-2">
        {item.affixes.map((line, index) => (
          <EquipmentAttributeLineEditor
            key={index}
            line={line}
            selectLabel={`${EQUIPMENT_SLOT_LABELS[item.slot]}：${affixLabel} ${index + 1}`}
            valueLabel={`${affixLabel} ${index + 1} 数值`}
            options={
              isSeasonEquipment
                ? EQUIPMENT_ATTRIBUTE_OPTIONS.map((option) => ({
                    ...option,
                    disabled: item.affixes.some(
                      (candidate, candidateIndex) =>
                        candidateIndex !== index &&
                        candidate.attribute === option.attribute
                    ),
                  }))
                : EQUIPMENT_NON_PRIMARY_ATTRIBUTE_OPTIONS
            }
            removeLabel={`删除${EQUIPMENT_SLOT_LABELS[item.slot]}${affixLabel} ${index + 1}`}
            removeDisabled={isSeasonEquipment && item.affixes.length === 1}
            onChange={(nextLine) => updateAffix(index, nextLine)}
            onRemove={() =>
              onChange({
                ...item,
                affixes: item.affixes.filter(
                  (_, current) => current !== index
                ),
              })
            }
          />
        ))}

        {item.affixes.length < 3 ? (
          <AddAttributeLineButton
            onClick={() =>
              isSeasonEquipment
                ? updateSeasonAffixCount(item.affixes.length + 1)
                : onChange({
                    ...item,
                    affixes: [
                      ...item.affixes,
                      { attribute: "physicalAttack", value: 0 },
                    ],
                  })
            }
          >
            添加{affixLabel}
          </AddAttributeLineButton>
        ) : null}
      </div>
    </div>
  );
};

const EquipmentAttributesSection = ({
  item,
  onChange,
}: EquipmentAttributesSectionProps) => {
  const isSeasonEquipment = isSeasonEquipmentSlot(item.slot);

  return (
    <EquipmentEditorSection
      title={isSeasonEquipment ? "百炼与副属性" : "附加五维与百炼"}
      description={
        isSeasonEquipment
          ? "赛年神装随机出现一至三条互不重复的副属性，更多副属性类型后续补充。"
          : "每件装备有一至两条可重铸的力、灵、体、耐、敏属性，百炼属性单独计算。"
      }
    >
      {isSeasonEquipment ? null : (
        <AdditionalPrimaryAttributesEditor item={item} onChange={onChange} />
      )}
      <TemperingEditor
        item={item}
        onChange={onChange}
        bordered={!isSeasonEquipment}
      />
      <EquipmentAffixesEditor item={item} onChange={onChange} />
    </EquipmentEditorSection>
  );
};

export default EquipmentAttributesSection;
