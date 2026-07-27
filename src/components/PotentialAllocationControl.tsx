import {
  getCharacterAllocationTotal,
  PRIMARY_ATTRIBUTE_LABELS,
} from "../utils/characterAttributes";
import type {
  CharacterAllocation,
  CharacterAllocationMode,
  CustomCharacterAllocationScheme,
  PrimaryAttribute,
} from "../utils/characterAttributes";

const CUSTOM_ALLOCATION_ATTRIBUTE_ORDER = [
  "strength",
  "spirit",
  "constitution",
  "endurance",
  "agility",
] as const satisfies readonly PrimaryAttribute[];

type PotentialAllocationPreset<PresetId extends string> = {
  id: PresetId;
  label: string;
  ratio: CharacterAllocation;
};

type PotentialAllocationControlProps<PresetId extends string> = {
  title: string;
  presets: readonly PotentialAllocationPreset<PresetId>[];
  allocationMode: CharacterAllocationMode;
  selectedPresetId: PresetId;
  customScheme: CustomCharacterAllocationScheme;
  customAllocation: CharacterAllocation;
  customValidationError: string | null;
  summary: string;
  onAllocationModeChange: (mode: CharacterAllocationMode) => void;
  onSelectPreset: (presetId: PresetId) => void;
  onCustomSchemeChange: (scheme: CustomCharacterAllocationScheme) => void;
  onCustomAllocationChange: (allocation: CharacterAllocation) => void;
};

/** 在编辑弹层中选择常见方案，或按两套规则自由分配每级 10 点潜力。 */
const PotentialAllocationControl = <PresetId extends string>({
  title,
  presets,
  allocationMode,
  selectedPresetId,
  customScheme,
  customAllocation,
  customValidationError,
  summary,
  onAllocationModeChange,
  onSelectPreset,
  onCustomSchemeChange,
  onCustomAllocationChange,
}: PotentialAllocationControlProps<PresetId>) => {
  const total = getCharacterAllocationTotal(customAllocation);
  const selectedMainAttribute: "strength" | "spirit" =
    customAllocation.spirit > 0 ? "spirit" : "strength";

  const updateCustomAllocation = (
    attribute: PrimaryAttribute,
    inputValue: string,
  ) => {
    const value = inputValue === "" ? 0 : Number(inputValue);

    if (Number.isInteger(value) && value >= 0 && value <= 10) {
      onCustomAllocationChange({ ...customAllocation, [attribute]: value });
    }
  };

  const selectMainAttribute = (attribute: "strength" | "spirit") => {
    if (attribute === selectedMainAttribute) return;

    const previousValue = customAllocation[selectedMainAttribute];
    onCustomAllocationChange({
      ...customAllocation,
      strength: attribute === "strength" ? Math.max(6, previousValue) : 0,
      spirit: attribute === "spirit" ? Math.max(6, previousValue) : 0,
    });
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            常见方案和自由加点二选一，两种方式都按每 10 点分配。
          </p>
        </div>
        <p className="text-xs font-medium text-emerald-600">{summary}</p>
      </div>

      <div
        className="mt-4 grid grid-cols-2 gap-2"
        role="radiogroup"
        aria-label="潜力点分配方式"
      >
        {(
          [
            ["preset", "常见方案"],
            ["custom", "自由加点"],
          ] as const
        ).map(([mode, label]) => {
          const isSelected = mode === allocationMode;

          return (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`h-10 rounded-lg border text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                isSelected
                  ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              }`}
              onClick={() => onAllocationModeChange(mode)}
            >
              {label}
            </button>
          );
        })}
      </div>

      {allocationMode === "preset" ? (
        <div
          className="mt-3 flex flex-wrap gap-2"
          role="radiogroup"
          aria-label="潜力点加点方案"
        >
          {presets.map((preset) => {
            const isSelected = preset.id === selectedPresetId;

            return (
              <button
                key={preset.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`h-9 rounded-lg border px-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                  isSelected
                    ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                }`}
                onClick={() => onSelectPreset(preset.id)}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium text-slate-600">
              自由加点规则
            </p>
            <div
              className="grid grid-cols-2 gap-2"
              role="radiogroup"
              aria-label="自由加点规则"
            >
              {(
                [
                  ["strength-or-spirit", "力 / 灵主属性"],
                  ["agility", "敏主属性"],
                ] as const
              ).map(([scheme, label]) => {
                const isSelected = scheme === customScheme;

                return (
                  <button
                    key={scheme}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`min-h-10 rounded-lg border px-2 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                      isSelected
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50"
                    }`}
                    onClick={() => onCustomSchemeChange(scheme)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {customScheme === "strength-or-spirit"
                ? "力或灵二选一分配 6～10 点，余下点数仅可分配给体、耐、敏。例如 8力2敏、8灵1体1耐。"
                : "敏至少分配 1 点，体、耐、敏合计 10 点；力和灵不可加点。例如 5敏3体2耐。"}
            </p>
          </div>

          {customScheme === "strength-or-spirit" && (
            <div>
              <p className="mb-2 text-xs font-medium text-slate-600">
                选择主属性
              </p>
              <div
                className="grid grid-cols-2 gap-2"
                role="radiogroup"
                aria-label="自由加点主属性"
              >
                {(["strength", "spirit"] as const).map((attribute) => {
                  const isSelected = selectedMainAttribute === attribute;

                  return (
                    <button
                      key={attribute}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      className={`h-9 rounded-lg border text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                        isSelected
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50"
                      }`}
                      onClick={() => selectMainAttribute(attribute)}
                    >
                      {PRIMARY_ATTRIBUTE_LABELS[attribute]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div
            className="grid grid-cols-2 gap-3 sm:grid-cols-5"
            role="group"
            aria-label="自由加点属性分配"
          >
            {CUSTOM_ALLOCATION_ATTRIBUTE_ORDER.map((attribute) => {
              const isDisabled =
                customScheme === "agility"
                  ? attribute === "strength" || attribute === "spirit"
                  : (attribute === "strength" || attribute === "spirit") &&
                    attribute !== selectedMainAttribute;
              const isMainAttribute =
                customScheme === "strength-or-spirit" &&
                attribute === selectedMainAttribute;

              return (
                <label key={attribute} className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">
                    {PRIMARY_ATTRIBUTE_LABELS[attribute]}
                  </span>
                  <span
                    className={`flex h-10 items-center rounded-lg border px-3 transition ${
                      isDisabled
                        ? "border-slate-100 bg-slate-100"
                        : "border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100"
                    }`}
                  >
                    <input
                      aria-label={`自由加点：${PRIMARY_ATTRIBUTE_LABELS[attribute]}`}
                      aria-invalid={
                        !isDisabled && customValidationError !== null
                          ? true
                          : undefined
                      }
                      type="number"
                      min={
                        isMainAttribute
                          ? 6
                          : customScheme === "agility" &&
                              attribute === "agility"
                            ? 1
                            : 0
                      }
                      max={10}
                      step={1}
                      inputMode="numeric"
                      disabled={isDisabled}
                      className="w-full min-w-0 bg-transparent text-center text-sm font-semibold text-slate-900 outline-none disabled:cursor-not-allowed disabled:text-slate-300"
                      value={customAllocation[attribute] || ""}
                      placeholder="0"
                      onChange={(event) =>
                        updateCustomAllocation(attribute, event.target.value)
                      }
                    />
                  </span>
                </label>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-500">合法后才会应用到面板属性</span>
            <span
              className={
                customValidationError
                  ? "font-medium text-rose-600"
                  : "font-medium text-emerald-600"
              }
              aria-live="polite"
            >
              已分配 {total} / 10 点
            </span>
          </div>

          {customValidationError && (
            <p
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-700"
              role="alert"
            >
              {customValidationError}请完成分配或切回常见方案。
            </p>
          )}
        </div>
      )}
    </section>
  );
};

export default PotentialAllocationControl;
