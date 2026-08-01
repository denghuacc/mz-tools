import {
  FUSION_RECORD_LIMIT,
  type FusionRecord,
} from "../utils/spiritBeastFusion";

const formatGrowth = (value: number) => value.toFixed(3);

type SpiritBeastFusionRecordsProps = {
  records: readonly FusionRecord[];
  onApply: (record: FusionRecord) => void;
  onDelete: (recordId: string) => void;
};

/** 展示和管理用户主动保存的融合记录。 */
const SpiritBeastFusionRecords = ({
  records,
  onApply,
  onDelete,
}: SpiritBeastFusionRecordsProps) => (
  <details className="rounded-2xl border border-slate-200 bg-white shadow-sm">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 sm:p-5">
      <span>
        <strong className="block text-sm font-semibold text-slate-900">
          融合记录
        </strong>
        <span className="mt-1 block text-xs text-slate-500">
          已保存 {records.length}/{FUSION_RECORD_LIMIT}
          ；应用记录免费且不推进保底。
        </span>
      </span>
      <span className="text-xs font-medium text-blue-600">展开查看</span>
    </summary>

    <div className="border-t border-slate-100 p-4 sm:p-5">
      {records.length === 0 ? (
        <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
          暂无记录，生成结果后可以手动保存。
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {records.map((record) => (
            <article
              key={record.id}
              className="rounded-xl border border-slate-200 p-3.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <strong className="text-sm text-slate-900">
                    {record.mainName} + {record.secondaryName}
                  </strong>
                  <p className="mt-1 text-xs text-slate-500">
                    {record.result.skillCount} 技能 ·{" "}
                    {record.result.specialSkillCount} 特殊 · 成长{" "}
                    {formatGrowth(record.result.growth)} · 初始属性{" "}
                    {record.result.initialAttributeTotal}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-xs text-rose-600 hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  aria-label={`删除${record.mainName}与${record.secondaryName}的融合记录`}
                  onClick={() => onDelete(record.id)}
                >
                  删除
                </button>
              </div>
              <button
                type="button"
                className="mt-3 w-full rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                onClick={() => onApply(record)}
              >
                免费应用记录
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  </details>
);

export default SpiritBeastFusionRecords;
