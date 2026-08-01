import { useEffect, useRef } from "react";

import { trapModalFocus } from "../utils/modalFocus";

type FocusTargetRef = {
  readonly current: HTMLElement | null;
};

type UseModalDialogOptions = {
  enabled?: boolean;
  initialFocusRef?: FocusTargetRef;
  restoreFocusRef?: FocusTargetRef;
  isCloseDisabled?: boolean;
};

/** 统一处理弹窗的滚动锁定、Escape 关闭、焦点约束与焦点恢复。 */
export const useModalDialog = <
  DialogElement extends HTMLElement = HTMLDivElement,
>(
  onClose: () => void,
  {
    enabled = true,
    initialFocusRef,
    restoreFocusRef,
    isCloseDisabled = false,
  }: UseModalDialogOptions = {},
) => {
  const dialogRef = useRef<DialogElement>(null);
  const onCloseRef = useRef(onClose);
  const isCloseDisabledRef = useRef(isCloseDisabled);

  useEffect(() => {
    onCloseRef.current = onClose;
    isCloseDisabledRef.current = isCloseDisabled;
  }, [isCloseDisabled, onClose]);

  useEffect(() => {
    if (!enabled) return;

    const previousActiveElement =
      restoreFocusRef?.current ?? document.activeElement;
    const previousBodyOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    initialFocusRef?.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isCloseDisabledRef.current) {
        onCloseRef.current();
        return;
      }

      if (dialogRef.current) trapModalFocus(event, dialogRef.current);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener("keydown", handleKeyDown);

      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus();
      }
    };
  }, [enabled, initialFocusRef, restoreFocusRef]);

  return dialogRef;
};
