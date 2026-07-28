import {
  SPIRIT_BEAST_MOUNT_FIXED_ATTRIBUTES,
  SPIRIT_BEAST_MOUNT_FIXED_ATTRIBUTE_MAX_COUNT,
  SPIRIT_BEAST_MOUNT_GALE_PERCENTAGE_MAX,
  SPIRIT_BEAST_MOUNT_GALE_PERCENTAGE_MIN,
  SPIRIT_BEAST_MOUNT_SLOWNESS_PERCENTAGE_MAX,
  SPIRIT_BEAST_MOUNT_SLOWNESS_PERCENTAGE_MIN,
  SPIRIT_BEAST_MOUNT_SLOWNESS_PERCENTAGE_STEP,
  createEmptySpiritBeastMountConfig,
} from "../utils/spiritBeastMount";
import type {
  SpiritBeastMountConfig,
  SpiritBeastMountFixedAttribute,
  SpiritBeastMountSpeedSkill,
} from "../utils/spiritBeastMount";
import {
  EquipmentEditorSection,
  EquipmentFieldLabel,
  equipmentEditorInputClassName,
} from "./equipment/EquipmentEditorFields";
import ResetButton from "./ResetButton";
import { SPIRIT_BEAST_DERIVED_LABELS } from "./spiritBeastLabels";

const FIXED_ATTRIBUTE_OPTIONS = SPIRIT_BEAST_MOUNT_FIXED_ATTRIBUTES.map(
  (attribute) => ({
    attribute,
    label: SPIRIT_BEAST_DERIVED_LABELS[attribute],
  }),
);

const PercentageSkillEditor = ({
  label,
  effect,
  skill,
  minimum,
  maximum,
  step = 1,
  onChange,
}: {
  label: string;
  effect: "increase" | "decrease";
  skill: SpiritBeastMountSpeedSkill;
  minimum: number;
  maximum: number;
  step?: number;
  onChange: (skill: SpiritBeastMountSpeedSkill) => void;
}) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
    <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
      <input
        type="checkbox"
        className="size-4 accent-pink-600"
        aria-label={`启用${label}`}
        checked={skill.enabled}
        onChange={(event) =>
          onChange({ ...skill, enabled: event.target.checked })
        }
      />
      {label}
    </label>
    <label className="mt-3 block">
      <EquipmentFieldLabel>{`${label}比例`}</EquipmentFieldLabel>
      <select
        aria-label={`${label}比例`}
        className={equipmentEditorInputClassName}
        disabled={!skill.enabled}
        value={skill.percentage}
        onChange={(event) =>
          onChange({ ...skill, percentage: Number(event.target.value) })
        }
      >
        {Array.from(
          { length: Math.floor((maximum - minimum) / step) + 1 },
          (_, index) => minimum + index * step,
        ).map((percentage) => (
          <option key={percentage} value={percentage}>
            {effect === "increase" ? "+" : "-"}
            {percentage}%
          </option>
        ))}
      </select>
    </label>
  </div>
);

const SpiritBeastMountControl = ({
  mount,
  onChange,
}: {
  mount: SpiritBeastMountConfig;
  onChange: (mount: SpiritBeastMountConfig) => void;
}) => {
  const toggleFixedAttribute = (attribute: SpiritBeastMountFixedAttribute) => {
    const isSelected = mount.fixedAttributes.some(
      (line) => line.attribute === attribute,
    );

    if (isSelected) {
      onChange({
        ...mount,
        fixedAttributes: mount.fixedAttributes.filter(
          (line) => line.attribute !== attribute,
        ),
      });
      return;
    }

    if (
      mount.fixedAttributes.length <
      SPIRIT_BEAST_MOUNT_FIXED_ATTRIBUTE_MAX_COUNT
    ) {
      onChange({
        ...mount,
        fixedAttributes: [...mount.fixedAttributes, { attribute, value: 0 }],
      });
    }
  };

  const updateFixedAttribute = (
    attribute: SpiritBeastMountFixedAttribute,
    inputValue: string,
  ) => {
    const value = inputValue === "" ? 0 : Number(inputValue);
    if (!Number.isFinite(value) || value < 0) return;

    onChange({
      ...mount,
      fixedAttributes: mount.fixedAttributes.map((line) =>
        line.attribute === attribute ? { ...line, value } : line,
      ),
    });
  };

  return (
    <div className="space-y-3" aria-label="坐骑统御配置">
      <div className="flex items-center justify-between gap-4 rounded-xl border border-pink-100 bg-pink-50/60 px-4 py-3">
        <p className="text-xs leading-5 text-pink-800">
          固定属性与速度技能互不冲突；疾风、迟钝术可单独启用、同时启用或都不启用。
        </p>
        <ResetButton
          confirmationTitle="确认重置坐骑统御？"
          confirmationMessage="重置后将清除两项固定属性，并关闭疾风和迟钝术。"
          onConfirm={() => onChange(createEmptySpiritBeastMountConfig())}
        />
      </div>

      <EquipmentEditorSection
        title="固定属性"
        description="从气血、法力、物攻、法攻、物防、法防、速度中最多选择 2 项，按游戏内实际数值录入。"
      >
        <div
          className="grid grid-cols-2 gap-1.5 sm:grid-cols-4"
          role="group"
          aria-label="坐骑统御固定属性"
        >
          {FIXED_ATTRIBUTE_OPTIONS.map(({ attribute, label }) => {
            const isSelected = mount.fixedAttributes.some(
              (line) => line.attribute === attribute,
            );
            const isDisabled =
              !isSelected &&
              mount.fixedAttributes.length >=
                SPIRIT_BEAST_MOUNT_FIXED_ATTRIBUTE_MAX_COUNT;

            return (
              <button
                key={attribute}
                type="button"
                aria-pressed={isSelected}
                disabled={isDisabled}
                className={`min-h-9 rounded-lg border px-2 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-100 disabled:text-slate-300 ${
                  isSelected
                    ? "border-pink-600 bg-pink-600 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-pink-200 hover:bg-pink-50 hover:text-pink-700"
                }`}
                onClick={() => toggleFixedAttribute(attribute)}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-xs">
          <span className="text-slate-400">一般选择 2 项</span>
          <span
            className={
              mount.fixedAttributes.length ===
              SPIRIT_BEAST_MOUNT_FIXED_ATTRIBUTE_MAX_COUNT
                ? "font-medium text-emerald-600"
                : "text-slate-500"
            }
          >
            已选 {mount.fixedAttributes.length} /{" "}
            {SPIRIT_BEAST_MOUNT_FIXED_ATTRIBUTE_MAX_COUNT} 项
          </span>
        </div>

        {mount.fixedAttributes.length > 0 ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {mount.fixedAttributes.map(({ attribute, value }) => (
              <label key={attribute}>
                <EquipmentFieldLabel>{`坐骑统御：${SPIRIT_BEAST_DERIVED_LABELS[attribute]}数值`}</EquipmentFieldLabel>
                <span className="relative block">
                  <span className="pointer-events-none absolute left-3 top-1/2 mt-0.5 -translate-y-1/2 text-xs text-slate-400">
                    +
                  </span>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    inputMode="decimal"
                    aria-label={`坐骑统御：${SPIRIT_BEAST_DERIVED_LABELS[attribute]}数值`}
                    className={`${equipmentEditorInputClassName} pl-7`}
                    value={value || ""}
                    placeholder="0"
                    onChange={(event) =>
                      updateFixedAttribute(attribute, event.target.value)
                    }
                  />
                </span>
              </label>
            ))}
          </div>
        ) : null}
      </EquipmentEditorSection>

      <EquipmentEditorSection
        title="速度技能"
        description="疾风每级增加 1% 速度，范围 1%～10%；迟钝术每级减少 2% 速度，可选 2%、4% … 20%。两项都不启用时，表示坐骑选择了其它不影响面板的战斗技能。"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <PercentageSkillEditor
            label="疾风"
            effect="increase"
            skill={mount.gale}
            minimum={SPIRIT_BEAST_MOUNT_GALE_PERCENTAGE_MIN}
            maximum={SPIRIT_BEAST_MOUNT_GALE_PERCENTAGE_MAX}
            onChange={(gale) => onChange({ ...mount, gale })}
          />
          <PercentageSkillEditor
            label="迟钝术"
            effect="decrease"
            skill={mount.slownessSpell}
            minimum={SPIRIT_BEAST_MOUNT_SLOWNESS_PERCENTAGE_MIN}
            maximum={SPIRIT_BEAST_MOUNT_SLOWNESS_PERCENTAGE_MAX}
            step={SPIRIT_BEAST_MOUNT_SLOWNESS_PERCENTAGE_STEP}
            onChange={(slownessSpell) => onChange({ ...mount, slownessSpell })}
          />
        </div>
      </EquipmentEditorSection>
    </div>
  );
};

export default SpiritBeastMountControl;
