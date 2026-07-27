import { useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

type AttributePanelStyle = CSSProperties & {
  "--attribute-panel-height": string;
};

/** 让右侧加成栏在宽屏下与左侧属性面板等高，并兼容无 ResizeObserver 的环境。 */
const useAttributePanelHeight = () => {
  const attributePanelRef = useRef<HTMLElement>(null);
  const [attributePanelHeight, setAttributePanelHeight] = useState<
    number | null
  >(null);

  useLayoutEffect(() => {
    const panel = attributePanelRef.current;
    if (!panel) return;

    const updatePanelHeight = () => {
      const nextHeight = Math.ceil(panel.getBoundingClientRect().height);
      if (nextHeight > 0) setAttributePanelHeight(nextHeight);
    };

    updatePanelHeight();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updatePanelHeight);
      return () => window.removeEventListener("resize", updatePanelHeight);
    }

    const observer = new ResizeObserver(updatePanelHeight);
    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  const rightRailStyle: AttributePanelStyle | undefined = attributePanelHeight
    ? {
        "--attribute-panel-height": `${attributePanelHeight}px`,
      }
    : undefined;

  return { attributePanelRef, rightRailStyle };
};

export default useAttributePanelHeight;
