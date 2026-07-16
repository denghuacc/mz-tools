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
    className={`min-h-10 rounded-lg border px-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
      active
        ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`}
    onClick={onClick}
  >
    {active ? "已收藏" : "收藏"}
  </button>
);

export default FavoriteButton;
