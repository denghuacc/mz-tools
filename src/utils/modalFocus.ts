const FOCUSABLE_ELEMENT_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const getFocusableElements = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENT_SELECTOR))
    .filter((element) => !element.hidden && element.getAttribute("aria-hidden") !== "true");

/** Keep Tab navigation inside an open modal, including empty modal fallbacks. */
export const trapModalFocus = (
  event: KeyboardEvent,
  container: HTMLElement
): void => {
  if (event.key !== "Tab") return;

  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements.at(-1);

  if (!firstElement || !lastElement) {
    event.preventDefault();
    container.focus();
    return;
  }

  const activeElement = document.activeElement;
  const focusMovedOutside = !container.contains(activeElement);

  if (event.shiftKey && (activeElement === firstElement || focusMovedOutside)) {
    event.preventDefault();
    lastElement.focus();
    return;
  }

  if (!event.shiftKey && (activeElement === lastElement || focusMovedOutside)) {
    event.preventDefault();
    firstElement.focus();
  }
};
