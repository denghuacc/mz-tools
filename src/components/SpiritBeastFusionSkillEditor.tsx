import { useState } from "react";
import {
  FUSION_SKILL_MAX_PER_BEAST,
  formatFusionSkillLabel,
  type FusionSkill,
  type FusionSpecialSkillType,
} from "../utils/spiritBeastFusion";

let fusionSkillIdSequence = 0;

const createFusionSkillId = () => {
  fusionSkillIdSequence += 1;
  return `fusion-skill-${Date.now()}-${fusionSkillIdSequence}`;
};

type SpiritBeastFusionSkillEditorProps = {
  title: string;
  accent: "main" | "secondary";
  skills: readonly FusionSkill[];
  onChange: (skills: readonly FusionSkill[]) => void;
};

/** 手动维护一只灵兽的自身技能；宝链技能不在此处录入。 */
const SpiritBeastFusionSkillEditor = ({
  title,
  accent,
  skills,
  onChange,
}: SpiritBeastFusionSkillEditorProps) => {
  const [draftName, setDraftName] = useState("");
  const [isSpecial, setIsSpecial] = useState(false);
  const [specialType, setSpecialType] =
    useState<FusionSpecialSkillType>("active");
  const [notice, setNotice] = useState("");
  const specialSkillCount = skills.filter((skill) => skill.isSpecial).length;
  const accentClasses =
    accent === "main"
      ? "border-amber-200 bg-amber-50/40"
      : "border-cyan-200 bg-cyan-50/40";

  const addSkill = () => {
    const normalizedName = draftName.trim();
    if (!normalizedName) {
      setNotice("请先填写技能名称。");
      return;
    }
    if (skills.length >= FUSION_SKILL_MAX_PER_BEAST) {
      setNotice(`每只灵兽最多录入 ${FUSION_SKILL_MAX_PER_BEAST} 个自身技能。`);
      return;
    }
    if (
      skills.some(
        (skill) =>
          skill.name.toLocaleLowerCase() === normalizedName.toLocaleLowerCase(),
      )
    ) {
      setNotice("同一只灵兽不能重复录入同名技能。");
      return;
    }

    onChange([
      ...skills,
      {
        id: createFusionSkillId(),
        name: normalizedName.slice(0, 20),
        isSpecial,
        specialType: isSpecial ? specialType : null,
      },
    ]);
    setDraftName("");
    setIsSpecial(false);
    setSpecialType("active");
    setNotice("");
  };

  return (
    <section className={`rounded-xl border p-3.5 ${accentClasses}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-[11px] text-slate-500">
            自身技能 {skills.length} · 特殊技能 {specialSkillCount}
          </p>
        </div>
        <span className="rounded-full bg-white px-2 py-1 text-[10px] font-medium text-slate-500 ring-1 ring-inset ring-slate-200">
          不含宝链
        </span>
      </div>

      <div className="mt-3 flex gap-2">
        <input
          type="text"
          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          aria-label={`${title}名称`}
          maxLength={20}
          placeholder="输入技能名称"
          value={draftName}
          onChange={(event) => setDraftName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addSkill();
            }
          }}
        />
        <button
          type="button"
          className="shrink-0 rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          onClick={addSkill}
        >
          添加
        </button>
      </div>

      <label className="mt-2.5 flex cursor-pointer items-center gap-2 text-xs text-slate-600">
        <input
          type="checkbox"
          className="size-4 accent-violet-600"
          aria-label={`${title}该技能为特殊技能`}
          checked={isSpecial}
          onChange={(event) => setIsSpecial(event.target.checked)}
        />
        该技能为特殊技能
      </label>

      {isSpecial ? (
        <fieldset className="mt-2.5 rounded-lg border border-violet-200 bg-white/70 p-2.5">
          <legend className="px-1 text-[11px] font-medium text-violet-700">
            特殊技能类型
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["active", "主动特殊"],
                ["passive", "被动特殊"],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-md border px-2 py-2 text-xs font-medium ${
                  specialType === value
                    ? "border-violet-300 bg-violet-100 text-violet-800"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                <input
                  type="radio"
                  name={`${title}-special-type`}
                  className="size-3.5 accent-violet-600"
                  aria-label={`${title}${label}技能`}
                  checked={specialType === value}
                  onChange={() => setSpecialType(value)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div
        className="mt-3 flex min-h-10 flex-wrap content-start gap-2"
        aria-label={`${title}已录入技能`}
      >
        {skills.length === 0 ? (
          <p className="py-2 text-xs text-slate-400">
            暂无技能，至少录入 4 个。
          </p>
        ) : (
          skills.map((skill) => (
            <span
              key={skill.id}
              className={`inline-flex items-center gap-1 rounded-full py-1 pl-2.5 pr-1 text-xs font-medium ${
                skill.isSpecial
                  ? "bg-violet-100 text-violet-700"
                  : "bg-white text-slate-700 ring-1 ring-inset ring-slate-200"
              }`}
            >
              {formatFusionSkillLabel(skill)}
              <button
                type="button"
                className="grid size-5 place-items-center rounded-full text-current opacity-60 transition hover:bg-black/5 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={`删除${title}${skill.name}`}
                onClick={() =>
                  onChange(
                    skills.filter((candidate) => candidate.id !== skill.id),
                  )
                }
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>

      {notice ? (
        <p className="mt-2 text-xs text-rose-600" role="alert">
          {notice}
        </p>
      ) : null}
    </section>
  );
};

export default SpiritBeastFusionSkillEditor;
