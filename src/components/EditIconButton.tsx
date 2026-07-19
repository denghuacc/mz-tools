type EditIconButtonProps = {
  label: string;
  onClick: () => void;
};

const EditIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="size-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

/** 统一角色面板卡片和装备卡片的编辑入口。 */
const EditIconButton = ({ label, onClick }: EditIconButtonProps) => (
  <button
    type="button"
    className="flex size-7 shrink-0 items-center justify-center rounded-md text-blue-600 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
    aria-label={label}
    title={label}
    onClick={onClick}
  >
    <EditIcon />
  </button>
);

export default EditIconButton;
