import {
  EQUIPMENT_ATTRIBUTE_LABELS,
  EQUIPMENT_ATTRIBUTE_OPTIONS,
  EQUIPMENT_INDEPENDENT_AFFIX_CONFIG,
  EQUIPMENT_INDEPENDENT_AFFIX_LEVELS,
  EQUIPMENT_PRIMARY_ATTRIBUTES,
  EQUIPMENT_SLOT_LABELS,
  calculateEquipmentIndependentAffixBonus,
  canEnableBaseEquipmentEffect,
  isSeasonEquipmentSlot,
} from "../../utils/equipmentAttributes";
import type {
  EquipmentAttributeLine,
  EquipmentIndependentAffixLevel,
  EquipmentIndependentAffixName,
  EquipmentItem,
  EquipmentPrimaryAttributeLine,
} from "../../utils/equipmentAttributes";
import {
  AddAttributeLineButton,
  EquipmentAttributeLineEditor,
  EquipmentAttributeSelect,
  EquipmentAttributeValueInput,
  EquipmentEditorSection,
  EquipmentEffectToggle,
  EquipmentFieldLabel,
  equipmentEditorInputClassName,
} from "./EquipmentEditorFields";

type EquipmentAttributesSectionProps = {
  item: EquipmentItem;
  onChange: (item: EquipmentItem) => void;
};

const createNextSeasonAffixes = (
  currentAffixes: readonly EquipmentAttributeLine[],
  count: number,
) => {
  const affixes = currentAffixes.slice(0, count);

  while (affixes.length < count) {
    const attribute = EQUIPMENT_ATTRIBUTE_OPTIONS.find(
      (option) =>
        !affixes.some((affix) => affix.attribute === option.attribute),
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
  const displayedAttributes = item.supportAttribute
    ? [...item.additionalPrimaryAttributes, item.supportAttribute]
    : [...item.additionalPrimaryAttributes];
  const updateLine = (index: number, line: EquipmentPrimaryAttributeLine) => {
    if (index === item.additionalPrimaryAttributes.length) {
      onChange({ ...item, supportAttribute: line });
      return;
    }

    const additionalPrimaryAttributes = [...item.additionalPrimaryAttributes];
    additionalPrimaryAttributes[index] = line;
    onChange({ ...item, additionalPrimaryAttributes });
  };
  const removeLine = (index: number) => {
    if (index === item.additionalPrimaryAttributes.length) {
      onChange({ ...item, supportAttribute: null });
      return;
    }

    onChange({
      ...item,
      additionalPrimaryAttributes: item.additionalPrimaryAttributes.filter(
        (_, current) => current !== index,
      ),
    });
  };

  return (
    <div className="space-y-2">
      <EquipmentEffectToggle
        checked={item.supportAttribute !== null}
        disabled={!canEnableBaseEquipmentEffect(item, "support")}
        onChange={(checked) => {
          const attribute = EQUIPMENT_PRIMARY_ATTRIBUTES.find(
            (candidate) =>
              !item.additionalPrimaryAttributes.some(
                (line) => line.attribute === candidate,
              ),
          );

          onChange({
            ...item,
            supportAttribute:
              checked && attribute ? { attribute, value: 0 } : null,
          });
        }}
      >
        加持 · 新增加1条附加五维
      </EquipmentEffectToggle>

      <div className="space-y-2 pt-1">
        {displayedAttributes.map((line, index) => (
          <EquipmentAttributeLineEditor
            key={index}
            line={line}
            selectLabel={`${EQUIPMENT_SLOT_LABELS[item.slot]}：附加五维 ${index + 1}`}
            valueLabel={`附加五维 ${index + 1} 数值`}
            options={EQUIPMENT_PRIMARY_ATTRIBUTES.map((attribute) => ({
              attribute,
              label: EQUIPMENT_ATTRIBUTE_LABELS[attribute],
              disabled: displayedAttributes.some(
                (candidate, candidateIndex) =>
                  candidateIndex !== index && candidate.attribute === attribute,
              ),
            }))}
            removeLabel={`删除${EQUIPMENT_SLOT_LABELS[item.slot]}附加五维 ${index + 1}`}
            removeDisabled={
              index < item.additionalPrimaryAttributes.length &&
              item.additionalPrimaryAttributes.length === 1
            }
            onChange={(nextLine) =>
              updateLine(index, nextLine as EquipmentPrimaryAttributeLine)
            }
            onRemove={() => removeLine(index)}
          />
        ))}
      </div>

      {item.additionalPrimaryAttributes.length < 2 ? (
        <AddAttributeLineButton
          onClick={() => {
            const attribute = EQUIPMENT_PRIMARY_ATTRIBUTES.find(
              (candidate) =>
                !item.additionalPrimaryAttributes.some(
                  (line) => line.attribute === candidate,
                ) && item.supportAttribute?.attribute !== candidate,
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
          添加第 {displayedAttributes.length + 1} 条附加五维
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
      <p className="mb-2 text-xs font-semibold text-slate-500">
        副属性（1～3 条）
      </p>

      <div className="space-y-2">
        {item.affixes.map((line, index) => (
          <EquipmentAttributeLineEditor
            key={index}
            line={line}
            selectLabel={`${EQUIPMENT_SLOT_LABELS[item.slot]}：副属性 ${index + 1}`}
            valueLabel={`副属性 ${index + 1} 数值`}
            options={EQUIPMENT_ATTRIBUTE_OPTIONS.map((option) => ({
              ...option,
              disabled: item.affixes.some(
                (candidate, candidateIndex) =>
                  candidateIndex !== index &&
                  candidate.attribute === option.attribute,
              ),
            }))}
            removeLabel={`删除${EQUIPMENT_SLOT_LABELS[item.slot]}副属性 ${index + 1}`}
            removeDisabled={item.affixes.length === 1}
            onChange={(nextLine) => updateAffix(index, nextLine)}
            onRemove={() =>
              onChange({
                ...item,
                affixes: item.affixes.filter((_, current) => current !== index),
              })
            }
          />
        ))}

        {item.affixes.length < 3 ? (
          <AddAttributeLineButton
            onClick={() => updateSeasonAffixCount(item.affixes.length + 1)}
          >
            添加副属性
          </AddAttributeLineButton>
        ) : null}
      </div>
    </div>
  );
};

export const EquipmentIndependentAffixSection = ({
  item,
  onChange,
}: EquipmentAttributesSectionProps) => {
  const independentAffixBonus = calculateEquipmentIndependentAffixBonus(item);
  const availableAffixes = Object.entries(
    EQUIPMENT_INDEPENDENT_AFFIX_CONFIG,
  ).filter(([, config]) =>
    (config.slots as readonly EquipmentItem["slot"][]).includes(item.slot),
  );
  if (availableAffixes.length === 0) return null;

  return (
    <EquipmentEditorSection
      title="独立词条"
      description="独立词条随机出现，并非每件装备都有；当前只列出该部位会增加面板属性的词条。"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          <EquipmentFieldLabel>词条名称</EquipmentFieldLabel>
          <select
            aria-label={`${EQUIPMENT_SLOT_LABELS[item.slot]}：独立词条`}
            className={equipmentEditorInputClassName}
            value={item.independentAffix?.name ?? ""}
            onChange={(event) => {
              const name = event.target.value as
                | EquipmentIndependentAffixName
                | "";
              onChange({
                ...item,
                independentAffix: name
                  ? {
                      name,
                      level: item.independentAffix?.level ?? 1,
                    }
                  : null,
              });
            }}
          >
            <option value="">未出现独立词条</option>
            {availableAffixes.map(([name, config]) => (
              <option key={name} value={name}>
                {name} · {EQUIPMENT_ATTRIBUTE_LABELS[config.attribute]} +
                {config.baseValue}/级
              </option>
            ))}
          </select>
        </label>

        <label>
          <EquipmentFieldLabel>词条等级</EquipmentFieldLabel>
          <select
            aria-label={`${EQUIPMENT_SLOT_LABELS[item.slot]}：独立词条等级`}
            className={equipmentEditorInputClassName}
            value={item.independentAffix?.level ?? 1}
            disabled={!item.independentAffix}
            onChange={(event) =>
              onChange({
                ...item,
                independentAffix: item.independentAffix
                  ? {
                      ...item.independentAffix,
                      level: Number(
                        event.target.value,
                      ) as EquipmentIndependentAffixLevel,
                    }
                  : null,
              })
            }
          >
            {EQUIPMENT_INDEPENDENT_AFFIX_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level} 级
              </option>
            ))}
          </select>
        </label>
      </div>

      {independentAffixBonus ? (
        <p className="mt-3 rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2 text-xs leading-5 text-blue-800">
          当前提供{EQUIPMENT_ATTRIBUTE_LABELS[independentAffixBonus.attribute]}{" "}
          +{independentAffixBonus.value}。
        </p>
      ) : null}
    </EquipmentEditorSection>
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
          ? "赛年神装随机出现一至三条互不重复的副属性。"
          : "普通装备最多录入两条互斥的附加五维；拥有加持时最多三条。百炼属性单独计算，不参与互斥。"
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
      {isSeasonEquipment ? (
        <EquipmentAffixesEditor item={item} onChange={onChange} />
      ) : null}
    </EquipmentEditorSection>
  );
};

export default EquipmentAttributesSection;
