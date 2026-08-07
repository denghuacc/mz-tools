import { SPIRIT_BEAST_QUALIFICATIONS } from "../utils/spiritBeastAttributes";
import {
  FUSION_DOUBLE_SPECIAL_PITY,
  FUSION_PITY_WITHOUT_FRUIT,
  FUSION_PITY_WITH_FRUIT,
  type FusionPityProgress,
  type FusionPreview,
  type FusionProbabilities,
  type FusionStrategy,
  type FusionTarget,
} from "../utils/spiritBeastFusion";
import {
  SPIRIT_BEAST_QUALIFICATION_LABELS,
  SPIRIT_BEAST_QUALIFICATION_SHORT_LABELS,
} from "./spiritBeastLabels";

const clampNumber = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

type SpiritBeastFusionStrategyPanelProps = {
  target: FusionTarget;
  strategy: FusionStrategy;
  pity: FusionPityProgress;
  probabilities: FusionProbabilities;
  preview: FusionPreview;
  onTargetChange: (target: FusionTarget) => void;
  onStrategyChange: (strategy: FusionStrategy) => void;
  onPityChange: (pity: FusionPityProgress) => void;
  onProbabilitiesChange: (probabilities: FusionProbabilities) => void;
};

/** 编辑达标条件、融合路线、保底进度和经验概率。 */
const SpiritBeastFusionStrategyPanel = ({
  target,
  strategy,
  pity,
  probabilities,
  preview,
  onTargetChange,
  onStrategyChange,
  onPityChange,
  onProbabilitiesChange,
}: SpiritBeastFusionStrategyPanelProps) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
    <div>
      <h2 className="text-base font-semibold text-slate-900">目标与融合策略</h2>
      <p className="mt-1 text-xs leading-5 text-slate-500">
        满技能保底按使用灵融果与否分别累计；双特殊保底按满技能结果累计。
      </p>
    </div>

    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      <fieldset className="rounded-xl border border-slate-200 p-3.5">
        <legend className="px-1 text-xs font-semibold text-slate-700">
          目标结果
        </legend>
        <div className="space-y-2.5">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="size-4 accent-blue-600"
              checked={target.requireFullSkills}
              onChange={(event) =>
                onTargetChange({
                  ...target,
                  requireFullSkills: event.target.checked,
                })
              }
            />
            满技能（当前上限 {preview.maximumSkillCount}）
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="size-4 accent-violet-600"
              checked={target.requireDoubleSpecial}
              onChange={(event) =>
                onTargetChange({
                  ...target,
                  requireDoubleSpecial: event.target.checked,
                })
              }
            />
            双特殊技能
          </label>
        </div>

        <details className="mt-3 border-t border-slate-100 pt-3">
          <summary className="cursor-pointer text-xs font-medium text-blue-600">
            设置资质与成长门槛
          </summary>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {SPIRIT_BEAST_QUALIFICATIONS.map((qualification) => (
              <label key={qualification} className="block">
                <span className="mb-1 block text-[11px] text-slate-500">
                  最低{SPIRIT_BEAST_QUALIFICATION_SHORT_LABELS[qualification]}
                </span>
                <input
                  type="number"
                  className="h-8 w-full rounded-lg border border-slate-200 px-2 text-right text-xs font-semibold tabular-nums outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  aria-label={`目标最低${SPIRIT_BEAST_QUALIFICATION_LABELS[qualification]}`}
                  min={0}
                  max={preview.qualificationRanges[qualification].maximum}
                  value={target.minimumQualifications[qualification] || ""}
                  placeholder="不限"
                  onChange={(event) =>
                    onTargetChange({
                      ...target,
                      minimumQualifications: {
                        ...target.minimumQualifications,
                        [qualification]:
                          event.target.value === ""
                            ? 0
                            : Number(event.target.value),
                      },
                    })
                  }
                />
              </label>
            ))}
            <label className="block">
              <span className="mb-1 block text-[11px] text-slate-500">
                最低成长
              </span>
              <input
                type="number"
                className="h-8 w-full rounded-lg border border-slate-200 px-2 text-right text-xs font-semibold tabular-nums outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                aria-label="目标最低成长"
                min={0}
                max={preview.growthRange.maximum}
                step={0.001}
                value={target.minimumGrowth || ""}
                placeholder="不限"
                onChange={(event) =>
                  onTargetChange({
                    ...target,
                    minimumGrowth:
                      event.target.value === ""
                        ? 0
                        : Number(event.target.value),
                  })
                }
              />
            </label>
          </div>
        </details>
      </fieldset>

      <fieldset className="rounded-xl border border-slate-200 p-3.5">
        <legend className="px-1 text-xs font-semibold text-slate-700">
          是否使用灵融果
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ["without-fruit", "不使用", FUSION_PITY_WITHOUT_FRUIT],
              ["with-fruit", "每次使用", FUSION_PITY_WITH_FRUIT],
            ] as const
          ).map(([nextStrategy, label, pityLimit]) => (
            <label
              key={nextStrategy}
              className={`cursor-pointer rounded-lg border p-3 ${
                strategy === nextStrategy
                  ? "border-blue-300 bg-blue-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="fusion-strategy"
                  className="size-4 accent-blue-600"
                  checked={strategy === nextStrategy}
                  onChange={() => onStrategyChange(nextStrategy)}
                />
                <span className="text-xs font-medium text-slate-700">
                  {label}
                </span>
              </span>
              <strong className="mt-2 block text-sm text-slate-900">
                {pityLimit} 次保底
              </strong>
            </label>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <label>
            <span className="mb-1 block text-[10px] text-slate-500">
              无果进度
            </span>
            <input
              type="number"
              className="h-8 w-full rounded-lg border border-slate-200 px-2 text-right text-xs font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              aria-label="不使用灵融果满技能保底进度"
              min={0}
              max={FUSION_PITY_WITHOUT_FRUIT - 1}
              value={pity.withoutFruit}
              onChange={(event) =>
                onPityChange({
                  ...pity,
                  withoutFruit: clampNumber(
                    Number(event.target.value),
                    0,
                    FUSION_PITY_WITHOUT_FRUIT - 1,
                  ),
                })
              }
            />
          </label>
          <label>
            <span className="mb-1 block text-[10px] text-slate-500">
              有果进度
            </span>
            <input
              type="number"
              className="h-8 w-full rounded-lg border border-slate-200 px-2 text-right text-xs font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              aria-label="使用灵融果满技能保底进度"
              min={0}
              max={FUSION_PITY_WITH_FRUIT - 1}
              value={pity.withFruit}
              onChange={(event) =>
                onPityChange({
                  ...pity,
                  withFruit: clampNumber(
                    Number(event.target.value),
                    0,
                    FUSION_PITY_WITH_FRUIT - 1,
                  ),
                })
              }
            />
          </label>
          <label>
            <span className="mb-1 block text-[10px] text-slate-500">
              满技双特
            </span>
            <input
              type="number"
              className="h-8 w-full rounded-lg border border-slate-200 px-2 text-right text-xs font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              aria-label="满技能双特殊保底进度"
              min={0}
              max={FUSION_DOUBLE_SPECIAL_PITY - 1}
              value={pity.fullDoubleSpecial}
              onChange={(event) =>
                onPityChange({
                  ...pity,
                  fullDoubleSpecial: clampNumber(
                    Number(event.target.value),
                    0,
                    FUSION_DOUBLE_SPECIAL_PITY - 1,
                  ),
                })
              }
            />
          </label>
        </div>
      </fieldset>
    </div>

    <details className="mt-4 rounded-xl border border-amber-200 bg-amber-50/50 p-3.5">
      <summary className="cursor-pointer text-xs font-semibold text-amber-800">
        经验概率设置
      </summary>
      <p className="mt-2 text-xs leading-5 text-amber-700">
        官方未公布基础概率。默认满技能 1%、双特殊
        10%，两者同时出现的基础概率约为 0.1%，保底会覆盖随机结果。
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <label>
          <span className="mb-1 block text-xs text-slate-600">满技能概率</span>
          <span className="flex items-center gap-2">
            <input
              type="number"
              className="h-9 min-w-0 flex-1 rounded-lg border border-amber-200 bg-white px-2 text-right text-sm font-semibold outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              aria-label="满技能基础概率"
              min={0}
              max={100}
              step={0.1}
              value={probabilities.fullSkills * 100}
              onChange={(event) =>
                onProbabilitiesChange({
                  ...probabilities,
                  fullSkills:
                    clampNumber(Number(event.target.value), 0, 100) / 100,
                })
              }
            />
            <span className="text-xs text-slate-500">%</span>
          </span>
        </label>
        <label>
          <span className="mb-1 block text-xs text-slate-600">双特殊概率</span>
          <span className="flex items-center gap-2">
            <input
              type="number"
              className="h-9 min-w-0 flex-1 rounded-lg border border-amber-200 bg-white px-2 text-right text-sm font-semibold outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              aria-label="双特殊基础概率"
              min={0}
              max={100}
              step={0.1}
              value={probabilities.doubleSpecial * 100}
              onChange={(event) =>
                onProbabilitiesChange({
                  ...probabilities,
                  doubleSpecial:
                    clampNumber(Number(event.target.value), 0, 100) / 100,
                })
              }
            />
            <span className="text-xs text-slate-500">%</span>
          </span>
        </label>
      </div>
    </details>
  </section>
);

export default SpiritBeastFusionStrategyPanel;
