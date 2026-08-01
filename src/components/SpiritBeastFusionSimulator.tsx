import { useSpiritBeastFusionSimulator } from "../hooks/useSpiritBeastFusionSimulator";
import {
  FUSION_PILLS_PER_ATTEMPT,
  FUSION_SILVER_PER_ATTEMPT,
} from "../utils/spiritBeastFusion";
import SpiritBeastFusionComparison from "./SpiritBeastFusionComparison";
import SpiritBeastFusionParentEditor from "./SpiritBeastFusionParentEditor";
import SpiritBeastFusionRecords from "./SpiritBeastFusionRecords";
import SpiritBeastFusionReveal from "./SpiritBeastFusionReveal";
import SpiritBeastFusionStrategyPanel from "./SpiritBeastFusionStrategyPanel";
import SpiritBeastFusionSummaryPanel from "./SpiritBeastFusionSummaryPanel";

const formatInteger = (value: number) =>
  new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 0 }).format(value);

/** 组装灵兽融合配置、模拟结果、对比流程和本地记录。 */
const SpiritBeastFusionSimulator = () => {
  const {
    state,
    preview,
    configurationError,
    fullSkillConfigurationError,
    selectedPity,
    selectedPityLimit,
    lastRun,
    comparisonRun,
    comparisonCurrentResult,
    revealResult,
    analysis,
    notice,
    updateBeast,
    updateBeastQualification,
    updateTarget,
    updateStrategy,
    updatePity,
    updateProbabilities,
    simulateOnce,
    resetCandidateResult,
    fuseUntilFullSkills,
    acceptCurrentResult,
    applyRecord,
    deleteRecord,
    closeReveal,
    closeComparison,
  } = useSpiritBeastFusionSimulator();

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">
                灵兽融合模拟器
              </h2>
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                经验模型
              </span>
            </div>
            <p className="mt-1.5 max-w-3xl text-xs leading-5 text-slate-500">
              保底与材料消耗按现有规则计算；基础概率、资质上限和成长上限为经验估算，可自行调整。
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-700">
            <span>{FUSION_PILLS_PER_ATTEMPT} 伐骨丹</span>
            <span aria-hidden="true">·</span>
            <strong>{formatInteger(FUSION_SILVER_PER_ATTEMPT)} 银/次</strong>
          </div>
        </div>
      </section>

      <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
        <div className="min-w-0 space-y-4">
          <SpiritBeastFusionParentEditor
            parents={state.parents}
            onBeastChange={updateBeast}
            onQualificationChange={updateBeastQualification}
          />
          <SpiritBeastFusionStrategyPanel
            target={state.target}
            strategy={state.strategy}
            pity={state.pity}
            probabilities={state.probabilities}
            preview={preview}
            onTargetChange={updateTarget}
            onStrategyChange={updateStrategy}
            onPityChange={updatePity}
            onProbabilitiesChange={updateProbabilities}
          />
        </div>

        <SpiritBeastFusionSummaryPanel
          parents={state.parents}
          preview={preview}
          pity={state.pity}
          selectedPity={selectedPity}
          selectedPityLimit={selectedPityLimit}
          configurationError={configurationError}
          fullSkillConfigurationError={fullSkillConfigurationError}
          notice={notice}
          lastRun={lastRun}
          analysis={analysis}
          onSimulate={simulateOnce}
          onFuseUntilFullSkills={fuseUntilFullSkills}
        />
      </div>

      <SpiritBeastFusionRecords
        records={state.records}
        onApply={applyRecord}
        onDelete={deleteRecord}
      />

      {revealResult ? (
        <SpiritBeastFusionReveal
          result={revealResult}
          mainName={state.parents.main.name}
          secondaryName={state.parents.secondary.name}
          onClose={closeReveal}
        />
      ) : null}

      {comparisonCurrentResult && !revealResult ? (
        <SpiritBeastFusionComparison
          currentResult={comparisonCurrentResult}
          run={comparisonRun}
          preview={preview}
          mainName={state.parents.main.name}
          secondaryName={state.parents.secondary.name}
          onClose={closeComparison}
          onSave={acceptCurrentResult}
          useFusionFruit={state.strategy === "with-fruit"}
          onUseFusionFruitChange={(useFusionFruit) =>
            updateStrategy(useFusionFruit ? "with-fruit" : "without-fruit")
          }
          onReset={resetCandidateResult}
        />
      ) : null}
    </div>
  );
};

export default SpiritBeastFusionSimulator;
