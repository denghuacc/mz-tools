import AttributeBonusSummaryCard from "./AttributeBonusSummaryCard";
import type { AttributeBonusSummaryItem } from "./AttributeBonusSummaryCard";
import ResetButton from "./ResetButton";

export type AttributeBonusSummarySource<SourceId extends string = string> = {
  id: SourceId;
  title: string;
  badge?: string;
  details?: string;
  items: readonly AttributeBonusSummaryItem[];
  validationError?: string | null;
};

type AttributeBonusSummaryPanelProps<SourceId extends string> = {
  sources: readonly AttributeBonusSummarySource<SourceId>[];
  onEdit: (sourceId: SourceId) => void;
  onReset: () => void;
};

/** 统一展示全部属性加成来源，并根据来源配置生成摘要卡与统计。 */
const AttributeBonusSummaryPanel = <SourceId extends string>({
  sources,
  onEdit,
  onReset,
}: AttributeBonusSummaryPanelProps<SourceId>) => {
  const configuredSourceCount = sources.filter(
    ({ items }) => items.length > 0
  ).length;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <h2 className="text-base font-semibold text-slate-900">属性加成</h2>
            <span className="text-xs font-medium text-slate-400">
              已配置 {configuredSourceCount} / {sources.length}
            </span>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            点击来源卡片编辑，已填写的增减会显示在卡片内。
          </p>
        </div>
        <ResetButton
          confirmationTitle="确认重置属性加成？"
          confirmationMessage="重置后将清除全部属性加成配置，此操作无法撤销。角色等级和潜力点方案会保留。"
          onConfirm={onReset}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {sources.map((source) => (
          <AttributeBonusSummaryCard
            key={source.id}
            title={source.title}
            badge={source.badge}
            details={source.details}
            items={source.items}
            validationError={source.validationError}
            onEdit={() => onEdit(source.id)}
          />
        ))}
      </div>
    </section>
  );
};

export default AttributeBonusSummaryPanel;
