import { useId } from "react";

type InfoTooltipButtonProps = {
  label: string;
  details: string;
};

/** 统一摘要卡片的信息入口，点击、键盘聚焦或悬停时展示说明。 */
const InfoTooltipButton = ({ label, details }: InfoTooltipButtonProps) => {
  const tooltipId = useId();

  return (
    <span className="group relative shrink-0">
      <button
        type="button"
        aria-label={label}
        aria-describedby={tooltipId}
        className="flex size-5 items-center justify-center rounded-full text-slate-400 transition hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none invisible absolute left-0 top-full z-20 mt-1 w-max max-w-64 rounded-md bg-slate-900 px-2.5 py-1.5 text-[11px] font-medium leading-5 text-white opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
      >
        {details}
      </span>
    </span>
  );
};

export default InfoTooltipButton;
