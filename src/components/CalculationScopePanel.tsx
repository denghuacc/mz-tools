import { useId, useState } from "react";
import type { ReactNode } from "react";
import EditorDialog from "./EditorDialog";

type CalculationScopePanelProps = {
  summary: ReactNode;
  children: ReactNode;
};

/** 统一计算口径摘要、信息入口和详情弹窗的交互与视觉。 */
const CalculationScopePanel = ({
  summary,
  children,
}: CalculationScopePanelProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const titleId = useId();

  return (
    <>
      <section
        className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-4 text-xs leading-6 text-blue-900 sm:px-5"
        aria-labelledby={titleId}
      >
        <div className="flex items-center gap-1.5">
          <strong id={titleId} className="font-semibold">
            当前计算口径
          </strong>
          <button
            type="button"
            className="flex size-6 shrink-0 items-center justify-center rounded-full text-blue-500 transition hover:bg-blue-100 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="查看当前计算口径详情"
            aria-haspopup="dialog"
            aria-expanded={isDialogOpen}
            onClick={() => setIsDialogOpen(true)}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="size-4"
            >
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" d="M12 11v5" />
              <path strokeLinecap="round" d="M12 8h.01" />
            </svg>
          </button>
        </div>
        <p className="mt-1 text-blue-800">{summary}</p>
      </section>

      {isDialogOpen ? (
        <EditorDialog
          title="当前计算口径说明"
          titlePrefix=""
          onClose={() => setIsDialogOpen(false)}
        >
          {children}
        </EditorDialog>
      ) : null}
    </>
  );
};

export default CalculationScopePanel;
