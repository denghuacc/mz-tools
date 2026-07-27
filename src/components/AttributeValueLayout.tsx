import type { ReactNode } from "react";

type AttributeValueLayoutProps = {
  bonuses?: ReactNode;
  value: ReactNode;
};

/** 最终值固定在属性行末尾；空间不足时，左侧加成可独立换行。 */
const AttributeValueLayout = ({
  bonuses,
  value,
}: AttributeValueLayoutProps) => (
  <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-2 text-right">
    <div className="min-w-0 leading-5">{bonuses}</div>
    {value}
  </div>
);

export default AttributeValueLayout;
