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

type ModalRegistration = {
  handleKeyDown: (event: KeyboardEvent) => void;
};

const modalStack: ModalRegistration[] = [];
let bodyOverflowBeforeModal = "";

const handleModalKeyDown = (event: KeyboardEvent) => {
  modalStack.at(-1)?.handleKeyDown(event);
};

const registerModal = (registration: ModalRegistration) => {
  if (modalStack.length === 0) {
    bodyOverflowBeforeModal = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleModalKeyDown);
  }
  modalStack.push(registration);

  return () => {
    const registrationIndex = modalStack.lastIndexOf(registration);
    if (registrationIndex !== -1) modalStack.splice(registrationIndex, 1);

    if (modalStack.length === 0) {
      document.body.style.overflow = bodyOverflowBeforeModal;
      window.removeEventListener("keydown", handleModalKeyDown);
    }
  };
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
    const unregisterModal = registerModal({
      handleKeyDown: (event) => {
        if (event.key === "Escape" && !isCloseDisabledRef.current) {
          onCloseRef.current();
          return;
        }

        if (dialogRef.current) trapModalFocus(event, dialogRef.current);
      },
    });
    initialFocusRef?.current?.focus();

    return () => {
      unregisterModal();

      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus();
      }
    };
  }, [enabled, initialFocusRef, restoreFocusRef]);

  return dialogRef;
};
