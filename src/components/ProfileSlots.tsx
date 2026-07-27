import { useState } from "react";
import InfoTooltipButton from "./InfoTooltipButton";

type ProfileSlotSummary = {
  name: string;
  isActive: boolean;
};

type ProfileSlotValues = readonly [
  ProfileSlotSummary | null,
  ProfileSlotSummary | null,
  ProfileSlotSummary | null,
];

type ProfileSlotsProps = {
  title: string;
  details: string;
  slots: ProfileSlotValues;
  notice: string;
  nameMaxLength: number;
  getDefaultName: (slotIndex: number) => string;
  normalizeName: (value: unknown, slotIndex: number) => string;
  onSave: (slotIndex: number, name: string) => void;
  onRestore: (slotIndex: number) => void;
};

/** 展示三个本地存档位；具体快照的捕获、校验和恢复由父级处理。 */
const ProfileSlots = ({
  title,
  details,
  slots,
  notice,
  nameMaxLength,
  getDefaultName,
  normalizeName,
  onSave,
  onRestore,
}: ProfileSlotsProps) => {
  const [names, setNames] = useState(() =>
    slots.map((slot, slotIndex) => slot?.name ?? getDefaultName(slotIndex)),
  );

  return (
    <section
      className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/20"
      aria-label={title}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <h2 className="shrink-0 text-sm font-semibold text-slate-900">
            {title}
          </h2>
          <InfoTooltipButton label={`查看${title}说明`} details={details} />
        </div>
        <span className="shrink-0 text-xs font-medium text-slate-400">
          {slots.length} 个存档位
        </span>
      </div>

      <div
        className="mt-2 flex min-w-0 gap-2 overflow-x-auto pb-0.5"
        aria-label={`${slots.length}个${title}摘要`}
      >
        {slots.map((slot, slotIndex) => (
          <article
            key={slotIndex}
            aria-current={slot?.isActive ? "true" : undefined}
            className={`flex min-w-[300px] flex-1 items-center gap-1.5 rounded-lg border p-1.5 transition lg:min-w-0 ${
              slot?.isActive
                ? "border-blue-400 bg-blue-50 ring-1 ring-blue-100"
                : "border-slate-200 bg-slate-50/70"
            }`}
          >
            <span
              className={`flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold ${
                slot?.isActive
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-400"
              }`}
            >
              {slotIndex + 1}
            </span>
            <input
              aria-label={`存档${slotIndex + 1}名称`}
              className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              maxLength={nameMaxLength}
              value={names[slotIndex]}
              onChange={(event) => {
                const nextName = event.target.value;
                setNames((currentNames) =>
                  currentNames.map((name, index) =>
                    index === slotIndex ? nextName : name,
                  ),
                );
              }}
            />
            <button
              type="button"
              className="shrink-0 rounded-md bg-blue-600 px-2 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              aria-label={`${slot ? "覆盖保存" : "保存当前到"}存档${
                slotIndex + 1
              }`}
              onClick={() => {
                const normalizedName = normalizeName(
                  names[slotIndex],
                  slotIndex,
                );
                setNames((currentNames) =>
                  currentNames.map((name, index) =>
                    index === slotIndex ? normalizedName : name,
                  ),
                );
                onSave(slotIndex, normalizedName);
              }}
            >
              {slot ? "覆盖" : "保存"}
            </button>
            <button
              type="button"
              className="shrink-0 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300"
              aria-label={`恢复存档${slotIndex + 1}`}
              disabled={!slot}
              onClick={() => onRestore(slotIndex)}
            >
              恢复
            </button>
          </article>
        ))}
      </div>

      {notice ? (
        <p
          className="mt-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-medium text-green-700"
          role="status"
        >
          {notice}
        </p>
      ) : null}
    </section>
  );
};

export default ProfileSlots;
