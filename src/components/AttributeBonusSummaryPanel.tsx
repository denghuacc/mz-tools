import AttributeBonusSummaryCard from "./AttributeBonusSummaryCard";
import type { AttributeBonusSummaryItem } from "./AttributeBonusSummaryCard";

export type AttributeBonusSummarySource<SourceId extends string = string> = {
  id: SourceId;
  title: string;
  items: readonly AttributeBonusSummaryItem[];
  validationError?: string | null;
};

type AttributeBonusSummaryPanelProps<SourceId extends string> = {
  sources: readonly AttributeBonusSummarySource<SourceId>[];
  onEdit: (sourceId: SourceId) => void;
};

/** 统一展示全部属性加成来源，并根据来源配置生成摘要卡与统计。 */
const AttributeBonusSummaryPanel = <SourceId extends string>({
  sources,
  onEdit,
}: AttributeBonusSummaryPanelProps<SourceId>) => {
  const configuredSourceCount = sources.filter(
    ({ items }) => items.length > 0
  ).length;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">属性加成</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            点击来源卡片编辑，已填写的增减会显示在卡片内。
          </p>
        </div>
        <span className="shrink-0 text-xs font-medium text-slate-400">
          已配置 {configuredSourceCount} / {sources.length}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {sources.map((source) => (
          <AttributeBonusSummaryCard
            key={source.id}
            title={source.title}
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

