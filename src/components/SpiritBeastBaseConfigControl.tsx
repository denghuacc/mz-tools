import { SPIRIT_BEAST_AFFINITIES } from "../utils/spiritBeastAttributes";
import type {
  SpiritBeastAffinity,
  SpiritBeastCalculatorState,
} from "../utils/spiritBeastAttributes";
import { SPIRIT_BEAST_AFFINITY_LABELS as AFFINITY_LABELS } from "./spiritBeastLabels";

type SpiritBeastBaseConfigControlProps = {
  state: SpiritBeastCalculatorState;
  onChange: (state: SpiritBeastCalculatorState) => void;
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
