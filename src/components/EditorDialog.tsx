import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { trapModalFocus } from "../utils/modalFocus";

type EditorDialogProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
  isCloseDisabled?: boolean;
  titlePrefix?: string;
};

/** 通用编辑窗口，统一处理遮罩、关闭、滚动锁定与焦点恢复。 */
const EditorDialog = ({
  title,
  children,
  onClose,
  isCloseDisabled = false,
  titlePrefix = "编辑",
}: EditorDialogProps) => {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const isCloseDisabledRef = useRef(isCloseDisabled);

  // 保持事件读取最新参数，同时避免参数变化时重复执行弹窗焦点初始化。
  useEffect(() => {
    onCloseRef.current = onClose;
    isCloseDisabledRef.current = isCloseDisabled;
  }, [isCloseDisabled, onClose]);

  useEffect(() => {
    const previousActiveElement = document.activeElement;
    const previousBodyOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isCloseDisabledRef.current) {
        onCloseRef.current();
        return;
      }

      if (dialogRef.current) {
        trapModalFocus(event, dialogRef.current);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener("keydown", handleKeyDown);

      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus();
      }
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-[1px] sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isCloseDisabled) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="flex max-h-[min(88vh,760px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-3.5 sm:px-5">
          <h2 id={titleId} className="text-base font-semibold text-slate-900">
            {titlePrefix}
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:text-slate-200 disabled:hover:bg-transparent"
            aria-label="关闭弹窗"
            disabled={isCloseDisabled}
            onClick={onClose}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="m5 5 10 10M15 5 5 15" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/70 p-3 sm:p-5">
          {children}
        </div>

        <div className="flex justify-end border-t border-slate-200 bg-white px-4 py-3 sm:px-5">
          <button
            type="button"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={isCloseDisabled}
            onClick={onClose}
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorDialog;
