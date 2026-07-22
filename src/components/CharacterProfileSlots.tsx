import { useState } from "react";
import {
  CHARACTER_PROFILE_NAME_MAX_LENGTH,
  CHARACTER_PROFILE_SLOT_COUNT,
  getDefaultCharacterProfileName,
  normalizeCharacterProfileName,
  type CharacterProfileSlots as CharacterProfileSlotValues,
} from "../utils/characterProfiles";
import InfoTooltipButton from "./InfoTooltipButton";

type CharacterProfileSlotsProps = {
  slots: CharacterProfileSlotValues;
  notice: string;
  onSave: (slotIndex: number, name: string) => void;
  onRestore: (slotIndex: number) => void;
};

/** 管理三个本地角色存档位；存档数据由父级统一捕获和恢复。 */
const CharacterProfileSlots = ({
  slots,
  notice,
  onSave,
  onRestore,
}: CharacterProfileSlotsProps) => {
  const [names, setNames] = useState(() =>
    slots.map(
      (slot, slotIndex) => slot?.name ?? getDefaultCharacterProfileName(slotIndex)
    )
  );

  return (
    <section
      className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/20"
      aria-label="角色存档"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <h2 className="shrink-0 text-sm font-semibold text-slate-900">
            角色存档
          </h2>
          <InfoTooltipButton
            label="查看角色存档说明"
            details="保存角色等级、八件装备和角色面板加成，仅保存在当前浏览器；清除网站数据或更换设备后会丢失。"
          />
        </div>
        <span className="shrink-0 text-xs font-medium text-slate-400">
          {CHARACTER_PROFILE_SLOT_COUNT} 个存档位
        </span>
      </div>

      <div
        className="mt-2 flex min-w-0 gap-2 overflow-x-auto pb-0.5"
        aria-label={`${CHARACTER_PROFILE_SLOT_COUNT}个角色存档摘要`}
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
              maxLength={CHARACTER_PROFILE_NAME_MAX_LENGTH}
              value={names[slotIndex]}
              onChange={(event) => {
                const nextName = event.target.value;
                setNames((currentNames) =>
                  currentNames.map((name, index) =>
                    index === slotIndex ? nextName : name
                  )
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
                const normalizedName = normalizeCharacterProfileName(
                  names[slotIndex],
                  slotIndex
                );
                setNames((currentNames) =>
                  currentNames.map((name, index) =>
                    index === slotIndex ? normalizedName : name
                  )
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
      {notice ? <p className="sr-only" role="status">{notice}</p> : null}
    </section>
  );
};

export default CharacterProfileSlots;
