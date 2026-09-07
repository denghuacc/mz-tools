const FavoriteButton = ({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    aria-pressed={active}
    aria-label={`${active ? "取消收藏" : "收藏"}${label}`}
    className={`min-h-10 rounded-lg border px-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
      active
        ? "border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100"
        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`}
    onClick={onClick}
  >
    {active ? "已收藏" : "收藏"}
  </button>
);

export default FavoriteButton;
