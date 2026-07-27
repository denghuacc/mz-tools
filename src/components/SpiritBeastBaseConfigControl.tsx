import {
  DEFAULT_SPIRIT_BEAST_LEVEL_ZERO_PRIMARY,
  SPIRIT_BEAST_AFFINITIES,
  SPIRIT_BEAST_PRIMARY_ATTRIBUTES,
  createRandomSpiritBeastLevelZeroPrimary,
  getSpiritBeastLevelZeroPrimaryTotal,
  getSpiritBeastLevelZeroPrimaryValidationError,
} from "../utils/spiritBeastAttributes";
import type {
  SpiritBeastAffinity,
  SpiritBeastCalculatorState,
  SpiritBeastPrimaryAttribute,
} from "../utils/spiritBeastAttributes";
import {
  SPIRIT_BEAST_AFFINITY_LABELS as AFFINITY_LABELS,
  SPIRIT_BEAST_PRIMARY_LABELS as PRIMARY_LABELS,
} from "./spiritBeastLabels";

type SpiritBeastBaseConfigControlProps = {
  state: SpiritBeastCalculatorState;
  onChange: (state: SpiritBeastCalculatorState) => void;
};

export const SpiritBeastLevelZeroPrimaryControl = ({
  state,
  onChange,
}: SpiritBeastBaseConfigControlProps) => {
  const levelZeroTotal = getSpiritBeastLevelZeroPrimaryTotal(
    state.levelZeroPrimary,
  );
  const validationError = getSpiritBeastLevelZeroPrimaryValidationError(
    state.levelZeroPrimary,
  );

  const updatePrimary = (
    attribute: SpiritBeastPrimaryAttribute,
    inputValue: string,
  ) => {
    const value = inputValue === "" ? 0 : Number(inputValue);

    if (Number.isInteger(value) && value >= 0) {
      onChange({
        ...state,
        levelZeroPrimary: {
          ...state.levelZeroPrimary,
          [attribute]: value,
        },
      });
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            0 级五维初值
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            当前暂定总和为 200；可按实际灵兽录入，也可先随机生成。
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() =>
              onChange({
                ...state,
                levelZeroPrimary: createRandomSpiritBeastLevelZeroPrimary(),
              })
            }
          >
            随机分配
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            onClick={() =>
              onChange({
                ...state,
                levelZeroPrimary: {
                  ...DEFAULT_SPIRIT_BEAST_LEVEL_ZERO_PRIMARY,
                },
              })
            }
          >
            重置
          </button>
        </div>
      </div>

      <div
        className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5"
        role="group"
        aria-label="0级五维初值"
      >
        {SPIRIT_BEAST_PRIMARY_ATTRIBUTES.map((attribute) => (
          <label key={attribute} className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">
              {PRIMARY_LABELS[attribute]}
            </span>
            <span className="flex h-10 items-center rounded-lg border border-slate-200 bg-white px-3 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
              <input
                aria-label={`0级${PRIMARY_LABELS[attribute]}初值`}
                aria-invalid={validationError ? true : undefined}
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                className="min-w-0 flex-1 bg-transparent text-center text-sm font-semibold text-slate-900 outline-none"
                value={state.levelZeroPrimary[attribute] || ""}
                placeholder="0"
                onChange={(event) =>
                  updatePrimary(attribute, event.target.value)
                }
              />
            </span>
          </label>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-slate-500">
          1 级时五维会先各 +2，再分配 10 点潜力
        </span>
        <span
          className={
            validationError
              ? "font-medium text-rose-600"
              : "font-medium text-emerald-600"
          }
          aria-live="polite"
        >
          合计 {levelZeroTotal} / 200
        </span>
      </div>

      {validationError && (
        <p
          className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-700"
          role="alert"
        >
          {validationError}
        </p>
      )}
    </section>
  );
};

export const SpiritBeastAffinityControl = ({
  state,
  onChange,
}: SpiritBeastBaseConfigControlProps) => {
  const updateAffinity = (
    attribute: SpiritBeastAffinity,
    inputValue: string,
  ) => {
    const value = inputValue === "" ? 0 : Number(inputValue);

    if (Number.isFinite(value)) {
      onChange({
        ...state,
        affinities: {
          ...state.affinities,
          [attribute]: value,
        },
      });
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div>
        <h2 className="text-base font-semibold text-slate-900">亲和初值</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          支持火、水、电、毒、冰、风六系，弱亲和可录入负值。
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {SPIRIT_BEAST_AFFINITIES.map((attribute) => (
          <label key={attribute} className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">
              {AFFINITY_LABELS[attribute]}
            </span>
            <span className="flex h-10 items-center rounded-lg border border-slate-200 bg-white px-2 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
              <input
                aria-label={`${AFFINITY_LABELS[attribute]}亲和初值`}
                type="number"
                step="any"
                inputMode="decimal"
                className="min-w-0 flex-1 bg-transparent text-center text-sm font-semibold text-slate-900 outline-none"
                value={state.affinities[attribute] || ""}
                placeholder="0"
                onChange={(event) =>
                  updateAffinity(attribute, event.target.value)
                }
              />
            </span>
          </label>
        ))}
      </div>
    </section>
  );
};
