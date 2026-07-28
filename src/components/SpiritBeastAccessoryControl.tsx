import {
  SPIRIT_BEAST_ACCESSORY_TIERS,
  createEmptySpiritBeastAccessories,
} from "../utils/spiritBeastAccessories";
import type {
  SpiritBeastAccessories,
  SpiritBeastAccessoryAttribute,
  SpiritBeastAccessoryItem,
} from "../utils/spiritBeastAccessories";
import { SPIRIT_BEAST_EQUIPMENT_PANEL_ATTRIBUTES } from "../utils/spiritBeastEquipment";
import {
  EquipmentEditorSection,
  EquipmentFieldLabel,
  equipmentEditorInputClassName,
} from "./equipment/EquipmentEditorFields";
import ResetButton from "./ResetButton";
import { SPIRIT_BEAST_DERIVED_LABELS } from "./spiritBeastLabels";

const ACCESSORY_ATTRIBUTE_OPTIONS = SPIRIT_BEAST_EQUIPMENT_PANEL_ATTRIBUTES.map(
  (attribute) => ({
    attribute,
    label: SPIRIT_BEAST_DERIVED_LABELS[attribute],
  }),
);

const AccessoryEditor = ({
  item,
  tierLabel,
  qualificationBonus,
  onChange,
}: {
  item: SpiritBeastAccessoryItem;
  tierLabel: string;
  qualificationBonus: number;
  onChange: (item: SpiritBeastAccessoryItem) => void;
}) => (
  <EquipmentEditorSection
    title={tierLabel}
    description={`第一条固定为全资质 +${qualificationBonus}；第二条从物攻、法攻、物防、法防、速度、气血中随机获得一项。`}
  >
    <label className="mb-4 flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
      <input
        type="checkbox"
        className="size-4 accent-blue-600"
        aria-label={`${tierLabel}：计入灵饰`}
        checked={item.enabled}
        onChange={(event) =>
          onChange({ ...item, enabled: event.target.checked })
        }
      />
      计入灵兽面板
    </label>

    <div
      className={`mb-3 rounded-lg border px-3 py-2.5 text-xs font-medium ${
        item.enabled
          ? "border-violet-100 bg-violet-50 text-violet-700"
          : "border-slate-200 bg-slate-50 text-slate-400"
      }`}
    >
      固定属性：全资质 +{qualificationBonus}
    </div>

    <div className="grid items-end gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(96px,0.65fr)]">
      <label className="min-w-0">
        <EquipmentFieldLabel>{`${tierLabel}：随机属性`}</EquipmentFieldLabel>
        <select
          aria-label={`${tierLabel}：随机属性`}
          className={equipmentEditorInputClassName}
          disabled={!item.enabled}
          value={item.attribute}
          onChange={(event) =>
            onChange({
              ...item,
              attribute: event.target.value as SpiritBeastAccessoryAttribute,
            })
          }
        >
          {ACCESSORY_ATTRIBUTE_OPTIONS.map((option) => (
            <option key={option.attribute} value={option.attribute}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="min-w-0">
        <EquipmentFieldLabel>{`${tierLabel}：随机属性数值`}</EquipmentFieldLabel>
        <span className="relative block">
          <span className="pointer-events-none absolute left-3 top-1/2 mt-0.5 -translate-y-1/2 text-xs text-slate-400">
            +
          </span>
          <input
            type="number"
            min={0}
            step="any"
            inputMode="decimal"
            aria-label={`${tierLabel}：随机属性数值`}
            className={`${equipmentEditorInputClassName} pl-7`}
            disabled={!item.enabled}
            value={item.value || ""}
            placeholder="0"
            onChange={(event) => {
              if (event.target.value === "") {
                onChange({ ...item, value: 0 });
                return;
              }

              const value = Number(event.target.value);
              if (Number.isFinite(value) && value >= 0) {
                onChange({ ...item, value });
              }
            }}
          />
        </span>
      </label>
    </div>
  </EquipmentEditorSection>
);

const SpiritBeastAccessoryControl = ({
  accessories,
  onChange,
}: {
  accessories: SpiritBeastAccessories;
  onChange: (accessories: SpiritBeastAccessories) => void;
}) => (
  <div className="space-y-3" aria-label="灵兽灵饰配置">
    <div className="flex items-center justify-between gap-4 rounded-xl border border-violet-100 bg-violet-50/60 px-4 py-3">
      <p className="text-xs leading-5 text-violet-800">
        全资质仅作记录，不会再次计入公式；灵兽资质请填写游戏内已包含灵饰的最终值。随机属性按实际数值录入并直接计入面板。
      </p>
      <ResetButton
        confirmationTitle="确认重置两件灵兽灵饰？"
        confirmationMessage="重置后将关闭 1 阶和 2 阶灵饰并清除两条随机属性，此操作无法撤销。"
        onConfirm={() => onChange(createEmptySpiritBeastAccessories())}
      />
    </div>

    {SPIRIT_BEAST_ACCESSORY_TIERS.map((tier) => (
      <AccessoryEditor
        key={tier.id}
        item={accessories[tier.id]}
        tierLabel={tier.label}
        qualificationBonus={tier.qualificationBonus}
        onChange={(item) =>
          onChange({
            ...accessories,
            [tier.id]: item,
          })
        }
      />
    ))}
  </div>
);

export default SpiritBeastAccessoryControl;
