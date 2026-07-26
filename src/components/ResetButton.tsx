import { useEffect, useId, useRef, useState } from "react";
import { trapModalFocus } from "../utils/modalFocus";

type ResetButtonProps = {
  confirmationTitle: string;
  confirmationMessage: string;
  onConfirm: () => void;
};

/** 为敏感重置操作提供统一的 warning 按钮和二次确认。 */
const ResetButton = ({
  confirmationTitle,
  confirmationMessage,
  onConfirm,
}: ResetButtonProps) => {
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const titleId = useId();
  const descriptionId = useId();
  const resetButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isConfirmationOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const resetButton = resetButtonRef.current;
    document.body.style.overflow = "hidden";
    cancelButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsConfirmationOpen(false);
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
      resetButton?.focus();
    };
  }, [isConfirmationOpen]);

  return (
    <>
      <button
        ref={resetButtonRef}
        type="button"
        className="shrink-0 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:border-amber-400 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        onClick={() => setIsConfirmationOpen(true)}
      >
        重置
      </button>

      {isConfirmationOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[1px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsConfirmationOpen(false);
            }
          }}
        >
          <div
            ref={dialogRef}
            tabIndex={-1}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-2xl"
          >
            <div className="flex items-start gap-3 border-b border-amber-100 bg-amber-50/70 px-5 py-4">
              <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-lg font-bold text-amber-700"
              >
                !
              </span>
              <div>
                <h2
                  id={titleId}
                  className="text-base font-semibold text-slate-900"
                >
                  {confirmationTitle}
                </h2>
                <p
                  id={descriptionId}
                  className="mt-1 text-sm leading-6 text-slate-600"
                >
                  {confirmationMessage}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-5 py-4">
              <button
                ref={cancelButtonRef}
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => setIsConfirmationOpen(false)}
              >
                取消
              </button>
              <button
                type="button"
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                onClick={() => {
                  setIsConfirmationOpen(false);
                  onConfirm();
                }}
              >
                确认重置
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default ResetButton;
