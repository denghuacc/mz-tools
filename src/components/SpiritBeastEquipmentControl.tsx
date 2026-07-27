import type { PrimaryAttribute } from "../utils/characterAttributes";
import {
  SPIRIT_BEAST_EQUIPMENT_PANEL_ATTRIBUTES,
  SPIRIT_BEAST_EQUIPMENT_SECONDARY_ATTRIBUTE_OPTIONS,
  createEmptySpiritBeastEquipmentSet,
} from "../utils/spiritBeastEquipment";
import type {
  SpiritBeastEquipmentAttributeLine,
  SpiritBeastEquipmentBonusAttribute,
  SpiritBeastEquipmentPanelAttribute,
  SpiritBeastEquipmentPanelLine,
  SpiritBeastEquipmentSecondaryAttribute,
  SpiritBeastEquipmentSet,
} from "../utils/spiritBeastEquipment";
import {
  SPIRIT_BEAST_PRIMARY_LABELS,
  SPIRIT_BEAST_DERIVED_LABELS,
} from "./spiritBeastLabels";
import {
  AddAttributeLineButton,
  EquipmentEditorSection,
  EquipmentFieldLabel,
  RemoveAttributeLineButton,
  equipmentEditorInputClassName,
} from "./equipment/EquipmentEditorFields";
import ResetButton from "./ResetButton";

type AttributeOption<Attribute extends SpiritBeastEquipmentBonusAttribute> = {
  attribute: Attribute;
  label: string;
};

const PANEL_OPTIONS = SPIRIT_BEAST_EQUIPMENT_PANEL_ATTRIBUTES.map(
  (attribute) => ({
    attribute,
    label: SPIRIT_BEAST_DERIVED_LABELS[attribute],
  }),
) satisfies readonly AttributeOption<SpiritBeastEquipmentPanelAttribute>[];

const PRIMARY_OPTIONS = (
  [
    "constitution",
    "spirit",
    "strength",
    "endurance",
    "agility",
  ] as const satisfies readonly PrimaryAttribute[]
).map((attribute) => ({
  attribute,
  label: SPIRIT_BEAST_PRIMARY_LABELS[attribute],
})) satisfies readonly AttributeOption<PrimaryAttribute>[];

const SECONDARY_OPTIONS =
  SPIRIT_BEAST_EQUIPMENT_SECONDARY_ATTRIBUTE_OPTIONS.map(
    ({ attribute, label }) => ({
      attribute,
      label,
    }),
  ) satisfies readonly AttributeOption<SpiritBeastEquipmentSecondaryAttribute>[];

const EquipmentLineEditor = <
  Attribute extends SpiritBeastEquipmentBonusAttribute,
>({
  line,
  selectLabel,
  valueLabel,
  options,
  usedAttributes,
  allowNegative = false,
  removeLabel,
  removeDisabled = false,
  onChange,
  onRemove,
}: {
  line: SpiritBeastEquipmentAttributeLine<Attribute>;
  selectLabel: string;
  valueLabel: string;
  options: readonly AttributeOption<Attribute>[];
  usedAttributes: readonly Attribute[];
  allowNegative?: boolean;
  removeLabel?: string;
  removeDisabled?: boolean;
  onChange: (line: SpiritBeastEquipmentAttributeLine<Attribute>) => void;
  onRemove?: () => void;
}) => (
  <div
    className={`grid items-end gap-2 ${
      onRemove
        ? "grid-cols-[minmax(0,1fr)_minmax(96px,0.65fr)_36px]"
        : "grid-cols-[minmax(0,1fr)_minmax(96px,0.65fr)]"
    }`}
  >
    <label className="min-w-0">
      <EquipmentFieldLabel>{selectLabel}</EquipmentFieldLabel>
      <select
        aria-label={selectLabel}
        className={equipmentEditorInputClassName}
        value={line.attribute}
        onChange={(event) =>
          onChange({
            ...line,
            attribute: event.target.value as Attribute,
          })
        }
      >
        {options.map((option) => (
          <option
            key={option.attribute}
            value={option.attribute}
            disabled={
              option.attribute !== line.attribute &&
              usedAttributes.includes(option.attribute)
            }
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>

    <label className="min-w-0">
      <EquipmentFieldLabel>{valueLabel}</EquipmentFieldLabel>
      <span className="relative block">
        <span className="pointer-events-none absolute left-3 top-1/2 mt-0.5 -translate-y-1/2 text-xs text-slate-400">
          {allowNegative ? "±" : "+"}
        </span>
        <input
          type="number"
          min={allowNegative ? undefined : 0}
          step="any"
          inputMode="decimal"
          aria-label={valueLabel}
          className={`${equipmentEditorInputClassName} pl-7`}
          value={line.value || ""}
          placeholder="0"
          onChange={(event) => {
            if (event.target.value === "") {
              onChange({ ...line, value: 0 });
              return;
            }

            const value = Number(event.target.value);
            if (Number.isFinite(value) && (allowNegative || value >= 0)) {
              onChange({ ...line, value });
            }
          }}
        />
      </span>
    </label>

    {onRemove && removeLabel ? (
      <RemoveAttributeLineButton
        label={removeLabel}
        disabled={removeDisabled}
        onClick={onRemove}
      />
    ) : null}
  </div>
);

const FixedPanelLinesEditor = ({
  itemLabel,
  lines,
  onChange,
}: {
  itemLabel: string;
  lines: SpiritBeastEquipmentSet["garment"]["baseAttributes"];
  onChange: (
    lines: SpiritBeastEquipmentSet["garment"]["baseAttributes"],
  ) => void;
}) => (
  <div className="space-y-2">
    {lines.map((line, index) => (
      <EquipmentLineEditor
        key={index}
        line={line}
        selectLabel={`${itemLabel}：装备属性 ${index + 1}`}
        valueLabel={`${itemLabel}：装备属性 ${index + 1} 数值`}
        options={PANEL_OPTIONS}
        usedAttributes={lines.map(({ attribute }) => attribute)}
        onChange={(nextLine) => {
          const nextLines: [
            SpiritBeastEquipmentPanelLine,
            SpiritBeastEquipmentPanelLine,
          ] = [{ ...lines[0] }, { ...lines[1] }];
          nextLines[index] = nextLine;
          onChange(nextLines);
        }}
      />
    ))}
  </div>
);

const FlexibleLinesEditor = <
  Attribute extends SpiritBeastEquipmentBonusAttribute,
>({
  itemLabel,
  fieldLabel,
  lines,
  options,
  maximumLineCount,
  allowNegative = false,
  onChange,
}: {
  itemLabel: string;
  fieldLabel: string;
  lines: readonly SpiritBeastEquipmentAttributeLine<Attribute>[];
  options: readonly AttributeOption<Attribute>[];
  maximumLineCount: number;
  allowNegative?: boolean;
  onChange: (
    lines: readonly SpiritBeastEquipmentAttributeLine<Attribute>[],
  ) => void;
}) => {
  const usedAttributes = lines.map(({ attribute }) => attribute);

  return (
    <div className="space-y-2">
      {lines.map((line, index) => (
        <EquipmentLineEditor
          key={index}
          line={line}
          selectLabel={`${itemLabel}：${fieldLabel} ${index + 1}`}
          valueLabel={`${itemLabel}：${fieldLabel} ${index + 1} 数值`}
          options={options}
          usedAttributes={usedAttributes}
          allowNegative={allowNegative}
          removeLabel={`删除${itemLabel}${fieldLabel} ${index + 1}`}
          removeDisabled={lines.length === 1}
          onChange={(nextLine) =>
            onChange(
              lines.map((candidate, candidateIndex) =>
                candidateIndex === index ? nextLine : candidate,
              ),
            )
          }
          onRemove={() =>
            onChange(
              lines.filter((_, candidateIndex) => candidateIndex !== index),
            )
          }
        />
      ))}

      {lines.length < maximumLineCount ? (
        <AddAttributeLineButton
          onClick={() => {
            const attribute = options.find(
              (option) => !usedAttributes.includes(option.attribute),
            )?.attribute;
            if (!attribute) return;

            onChange([...lines, { attribute, value: 0 }]);
          }}
        >
          添加{itemLabel}第 {lines.length + 1} 条{fieldLabel}
        </AddAttributeLineButton>
      ) : null}
    </div>
  );
};

const EquipmentEnabledToggle = ({
  itemLabel,
  enabled,
  onChange,
}: {
  itemLabel: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}) => (
  <label className="mb-4 flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
    <input
      type="checkbox"
      className="size-4 accent-blue-600"
      aria-label={`${itemLabel}：计入装备`}
      checked={enabled}
      onChange={(event) => onChange(event.target.checked)}
    />
    计入灵兽面板
  </label>
);

const SpiritBeastEquipmentControl = ({
  equipment,
  onChange,
}: {
  equipment: SpiritBeastEquipmentSet;
  onChange: (equipment: SpiritBeastEquipmentSet) => void;
}) => (
  <div className="space-y-3" aria-label="灵兽装备配置">
    <div className="flex items-start justify-between gap-4 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
      <p className="text-xs leading-5 text-blue-800">
        三件装备均无等级。宝链技能请统一在“技能”来源录入，这里只记录会影响面板的属性。
      </p>
      <ResetButton
        confirmationTitle="确认重置三件灵兽装备？"
        confirmationMessage="重置后将清除宝衣、宝链和宝冠的全部属性与特效配置，此操作无法撤销。"
        onConfirm={() => onChange(createEmptySpiritBeastEquipmentSet())}
      />
    </div>

    <EquipmentEditorSection
      title="宝衣"
      description="从物攻、法攻、物防、法防、速度、气血中选择两条装备属性；启灵可提供 1～2 条五维增减。"
    >
      <EquipmentEnabledToggle
        itemLabel="宝衣"
        enabled={equipment.garment.enabled}
        onChange={(enabled) =>
          onChange({
            ...equipment,
            garment: { ...equipment.garment, enabled },
          })
        }
      />
      <p className="mb-2 text-xs font-semibold text-slate-500">
        装备属性（固定 2 条）
      </p>
      <FixedPanelLinesEditor
        itemLabel="宝衣"
        lines={equipment.garment.baseAttributes}
        onChange={(baseAttributes) =>
          onChange({
            ...equipment,
            garment: { ...equipment.garment, baseAttributes },
          })
        }
      />
      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="mb-2 text-xs font-semibold text-slate-500">
          启灵属性（1～2 条，可正可负）
        </p>
        <FlexibleLinesEditor
          itemLabel="宝衣"
          fieldLabel="启灵属性"
          lines={equipment.garment.enlightenmentAttributes}
          options={PRIMARY_OPTIONS}
          maximumLineCount={2}
          allowNegative
          onChange={(enlightenmentAttributes) =>
            onChange({
              ...equipment,
              garment: {
                ...equipment.garment,
                enlightenmentAttributes,
              },
            })
          }
        />
      </div>
    </EquipmentEditorSection>

    <EquipmentEditorSection
      title="宝链"
      description="宝链的两个技能不在这里重复录入；启灵后可提供 1～2 条五维增减。"
    >
      <EquipmentEnabledToggle
        itemLabel="宝链"
        enabled={equipment.necklace.enabled}
        onChange={(enabled) =>
          onChange({
            ...equipment,
            necklace: { ...equipment.necklace, enabled },
          })
        }
      />
      <p className="mb-2 text-xs font-semibold text-slate-500">
        启灵属性（1～2 条，可正可负）
      </p>
      <FlexibleLinesEditor
        itemLabel="宝链"
        fieldLabel="启灵属性"
        lines={equipment.necklace.enlightenmentAttributes}
        options={PRIMARY_OPTIONS}
        maximumLineCount={2}
        allowNegative
        onChange={(enlightenmentAttributes) =>
          onChange({
            ...equipment,
            necklace: {
              ...equipment.necklace,
              enlightenmentAttributes,
            },
          })
        }
      />
    </EquipmentEditorSection>

    <EquipmentEditorSection
      title="宝冠"
      description="赛年神装：两条装备属性、1～3 条副属性、百炼五维，以及 1～2 条特效五维修正。"
    >
      <EquipmentEnabledToggle
        itemLabel="宝冠"
        enabled={equipment.crown.enabled}
        onChange={(enabled) =>
          onChange({
            ...equipment,
            crown: { ...equipment.crown, enabled },
          })
        }
      />
      <p className="mb-2 text-xs font-semibold text-slate-500">
        装备属性（固定 2 条）
      </p>
      <FixedPanelLinesEditor
        itemLabel="宝冠"
        lines={equipment.crown.baseAttributes}
        onChange={(baseAttributes) =>
          onChange({
            ...equipment,
            crown: { ...equipment.crown, baseAttributes },
          })
        }
      />

      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="mb-2 text-xs font-semibold text-slate-500">
          副属性（1～3 条）
        </p>
        <FlexibleLinesEditor
          itemLabel="宝冠"
          fieldLabel="副属性"
          lines={equipment.crown.secondaryAttributes}
          options={SECONDARY_OPTIONS}
          maximumLineCount={3}
          onChange={(secondaryAttributes) =>
            onChange({
              ...equipment,
              crown: { ...equipment.crown, secondaryAttributes },
            })
          }
        />
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="mb-2 text-xs font-semibold text-slate-500">百炼属性</p>
        <EquipmentLineEditor
          line={equipment.crown.temperingAttribute}
          selectLabel="宝冠：百炼属性"
          valueLabel="宝冠：百炼属性数值"
          options={PRIMARY_OPTIONS}
          usedAttributes={[]}
          onChange={(temperingAttribute) =>
            onChange({
              ...equipment,
              crown: { ...equipment.crown, temperingAttribute },
            })
          }
        />
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="mb-2 text-xs font-semibold text-slate-500">属性特效</p>
        <label className="block">
          <EquipmentFieldLabel>特效名称</EquipmentFieldLabel>
          <input
            type="text"
            maxLength={40}
            aria-label="宝冠：特效名称"
            className={equipmentEditorInputClassName}
            value={equipment.crown.specialEffectName}
            placeholder="例如：五行之水"
            onChange={(event) =>
              onChange({
                ...equipment,
                crown: {
                  ...equipment.crown,
                  specialEffectName: event.target.value,
                },
              })
            }
          />
        </label>
        <div className="mt-3">
          <FlexibleLinesEditor
            itemLabel="宝冠"
            fieldLabel="特效修正"
            lines={equipment.crown.specialEffectAdjustments}
            options={PRIMARY_OPTIONS}
            maximumLineCount={2}
            allowNegative
            onChange={(specialEffectAdjustments) =>
              onChange({
                ...equipment,
                crown: {
                  ...equipment.crown,
                  specialEffectAdjustments,
                },
              })
            }
          />
        </div>
      </div>
    </EquipmentEditorSection>
  </div>
);

export default SpiritBeastEquipmentControl;
