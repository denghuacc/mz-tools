import type { ReactNode } from "react";
import {
  EQUIPMENT_ATTRIBUTE_OPTIONS,
} from "../../utils/equipmentAttributes";
import type { EquipmentAttribute } from "../../utils/equipmentAttributes";
import type { EquipmentAttributeLine } from "../../utils/equipmentAttributes";

export const equipmentEditorInputClassName =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

export const EquipmentFieldLabel = ({ children }: { children: string }) => (
  <span className="text-xs font-medium text-slate-600">{children}</span>
);

export type EquipmentAttributeOption = {
  attribute: EquipmentAttribute;
  label: string;
  disabled?: boolean;
};

export const EquipmentAttributeSelect = ({
  value,
  label,
  options = EQUIPMENT_ATTRIBUTE_OPTIONS,
  onChange,
}: {
  value: EquipmentAttribute;
  label: string;
  options?: readonly EquipmentAttributeOption[];
  onChange: (attribute: EquipmentAttribute) => void;
}) => (
  <label className="min-w-0 flex-1">
    <EquipmentFieldLabel>{label}</EquipmentFieldLabel>
    <select
      aria-label={label}
      className={equipmentEditorInputClassName}
      value={value}
      onChange={(event) => onChange(event.target.value as EquipmentAttribute)}
    >
      {options.map((option) => (
        <option
          key={option.attribute}
          value={option.attribute}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

export const EquipmentAttributeValueInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) => (
  <label className="min-w-0 flex-1">
    <EquipmentFieldLabel>{label}</EquipmentFieldLabel>
    <input
      type="number"
      min="0"
      aria-label={label}
      className={equipmentEditorInputClassName}
      value={value || ""}
      placeholder="0"
      onChange={(event) => onChange(Number(event.target.value) || 0)}
    />
  </label>
);

export const EquipmentEditorSection = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) => (
  <section className="rounded-xl border border-slate-200 bg-white p-4">
    <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
    {description ? (
      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
    ) : null}
    <div className="mt-3">{children}</div>
  </section>
);

export const RemoveAttributeLineButton = ({
  label,
  disabled = false,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    aria-label={label}
    disabled={disabled}
    className="mb-0.5 flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-slate-200 disabled:hover:bg-transparent disabled:hover:text-slate-400"
    onClick={onClick}
  >
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M4 10h12" />
    </svg>
  </button>
);

export const EquipmentAttributeLineEditor = ({
  line,
  selectLabel,
  valueLabel,
  options,
  removeLabel,
  removeDisabled = false,
  onChange,
  onRemove,
}: {
  line: EquipmentAttributeLine;
  selectLabel: string;
  valueLabel: string;
  options?: readonly EquipmentAttributeOption[];
  removeLabel: string;
  removeDisabled?: boolean;
  onChange: (line: EquipmentAttributeLine) => void;
  onRemove: () => void;
}) => (
  <div className="grid grid-cols-[minmax(0,1fr)_minmax(96px,0.65fr)_36px] items-end gap-2">
    <EquipmentAttributeSelect
      label={selectLabel}
      value={line.attribute}
      options={options}
      onChange={(attribute) => onChange({ ...line, attribute })}
    />
    <EquipmentAttributeValueInput
      label={valueLabel}
      value={line.value}
      onChange={(value) => onChange({ ...line, value })}
    />
    <RemoveAttributeLineButton
      label={removeLabel}
      disabled={removeDisabled}
      onClick={onRemove}
    />
  </div>
);

export const AddAttributeLineButton = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) => (
  <button
    type="button"
    className="rounded-lg border border-dashed border-blue-200 px-3 py-2 text-xs font-medium text-blue-600 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
    onClick={onClick}
  >
    {children}
  </button>
);

export const EquipmentEffectToggle = ({
  checked,
  disabled = false,
  wide = false,
  children,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  wide?: boolean;
  children: ReactNode;
  onChange: (checked: boolean) => void;
}) => (
  <label
    className={`flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-slate-700 ${
      wide ? "sm:col-span-2" : ""
    }`}
  >
    <input
      type="checkbox"
      className="size-4 accent-blue-600"
      checked={checked}
      disabled={disabled}
      onChange={(event) => onChange(event.target.checked)}
    />
    {children}
  </label>
);
