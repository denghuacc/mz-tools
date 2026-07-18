import {
  CHARACTER_TRAINING_LEVEL_LIMIT,
  formatCharacterTrainingLevel,
} from "../utils/characterTraining";
import type {
  CharacterTrainingLevelConfig,
  CharacterTrainingLevels,
  CharacterTrainingType,
} from "../utils/characterTraining";

const CHARACTER_TRAINING_OPTIONS = [
  {
    id: "attack",
    label: "攻击修炼",
    effectLabel: "治疗强度 +5 / 级 · 封印命中 +2% / 级",
  },
  {
    id: "physicalDefense",
    label: "物防修炼",
    effectLabel: "封印抵抗 +1% / 级",
  },
  {
    id: "magicDefense",
    label: "法防修炼",
    effectLabel: "封印抵抗 +1% / 级",
  },
] as const;

type CharacterTrainingBonusControlProps = {
  title: string;
  levels: CharacterTrainingLevels;
  onChange: (levels: CharacterTrainingLevels) => void;
  onReset: () => void;
};

/** 分别配置三项人物修炼等级；突破只能在常规满级后额外增加一级。 */
const CharacterTrainingBonusControl = ({
  title,
  levels,
  onChange,
  onReset,
}: CharacterTrainingBonusControlProps) => {
  const isDefault = CHARACTER_TRAINING_OPTIONS.every(({ id }) => {
    const config = levels[id];
    return config.level === 1 && !config.breakthrough;
  });

  const updateLevel = (
    type: CharacterTrainingType,
    config: CharacterTrainingLevelConfig
  ) => {
    onChange({ ...levels, [type]: config });
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            69 级常规上限为 12 级；属性按当前等级线性累加，满级后可突破至 12+1。
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 text-xs font-medium text-slate-500 transition hover:text-blue-600 disabled:cursor-not-allowed disabled:text-slate-300"
          disabled={isDefault}
          onClick={onReset}
        >
          重置
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {CHARACTER_TRAINING_OPTIONS.map(({ id, label, effectLabel }) => {
          const config = levels[id];
          const canBreakthrough =
            config.level === CHARACTER_TRAINING_LEVEL_LIMIT;

          return (
            <div
              key={id}
              className="rounded-xl border border-slate-200 bg-slate-50/60 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    {label}
                  </h3>
                  <p className="mt-1 text-[11px] leading-4 text-blue-600">
                    {effectLabel}
                  </p>
                </div>
                <output
                  aria-label={`${label}当前等级`}
                  className="shrink-0 rounded-md bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700"
                >
                  {formatCharacterTrainingLevel(config)} /{" "}
                  {CHARACTER_TRAINING_LEVEL_LIMIT}
                </output>
              </div>

              <label className="mt-3 block text-xs font-medium text-slate-600">
                <span className="mb-1.5 block">等级</span>
                <select
                  aria-label={`${label}等级`}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  value={config.level}
                  onChange={(event) =>
                    updateLevel(id, {
                      level: Number(event.target.value),
                      breakthrough: false,
                    })
                  }
                >
                  {Array.from(
                    { length: CHARACTER_TRAINING_LEVEL_LIMIT },
                    (_, index) => index + 1
                  ).map((level) => (
                    <option key={level} value={level}>
                      {level} 级
                    </option>
                  ))}
                </select>
              </label>

              <label
                className={`mt-3 flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs transition ${
                  canBreakthrough
                    ? "cursor-pointer border-amber-200 bg-amber-50 text-amber-800"
                    : "cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400"
                }`}
              >
                <input
                  type="checkbox"
                  aria-label={`${label}突破`}
                  disabled={!canBreakthrough}
                  checked={config.breakthrough}
                  className="h-4 w-4 shrink-0 accent-amber-500"
                  onChange={(event) =>
                    updateLevel(id, {
                      ...config,
                      breakthrough: event.target.checked,
                    })
                  }
                />
                <span>突破 · 额外提升 1 级</span>
              </label>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CharacterTrainingBonusControl;
