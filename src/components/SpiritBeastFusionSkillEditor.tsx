import { useState } from "react";
import {
  FUSION_SKILL_MAX_PER_BEAST,
  type FusionSkill,
  type FusionSpecialSkillType,
} from "../utils/spiritBeastFusion";
import SpiritBeastFusionSkillIcons from "./SpiritBeastFusionSkillIcons";
import SpiritBeastFusionSkillPicker from "./SpiritBeastFusionSkillPicker";

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
  const [specialType, setSpecialType] =
    useState<FusionSpecialSkillType>("active");
  const [notice, setNotice] = useState("");
  const specialSkillCount = skills.filter((skill) => skill.isSpecial).length;
  const accentClasses =
    accent === "main"
      ? "border-amber-200 bg-amber-50/40"
      : "border-cyan-200 bg-cyan-50/40";

  const addSkill = (
    name: string,
    selectedSpecialType: FusionSpecialSkillType | null,
  ) => {
    const normalizedName = name.trim();
    if (skills.length >= FUSION_SKILL_MAX_PER_BEAST) {
      setNotice(`每只灵兽最多录入 ${FUSION_SKILL_MAX_PER_BEAST} 个自身技能。`);
      return false;
    }
    if (
      skills.some(
        (skill) =>
          skill.name.toLocaleLowerCase() === normalizedName.toLocaleLowerCase(),
      )
    ) {
      setNotice("同一只灵兽不能重复录入同名技能。");
      return false;
    }

    onChange([
      ...skills,
      {
        id: createFusionSkillId(),
        name: normalizedName.slice(0, 20),
        isSpecial: selectedSpecialType !== null,
        specialType: selectedSpecialType,
      },
    ]);
    setNotice("");
    return true;
  };

  const toggleSkillOption = (skillName: string) => {
    const selectedSkill = skills.find((skill) => skill.name === skillName);
    if (selectedSkill) {
      onChange(skills.filter((skill) => skill.id !== selectedSkill.id));
      setNotice("");
      return;
    }

    addSkill(skillName, null);
  };

  const addSpecialSkill = () => {
    const normalizedName = draftName.trim();
    if (!normalizedName) {
      setNotice("请先填写特殊技能名称。");
      return;
    }
    if (!addSkill(normalizedName, specialType)) return;

    setDraftName("");
    setSpecialType("active");
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

      <SpiritBeastFusionSkillPicker
        title={title}
        selectedSkillNames={skills.map((skill) => skill.name)}
        onToggle={toggleSkillOption}
      />

      <details className="mt-2.5 rounded-lg border border-violet-200 bg-white/70">
        <summary className="cursor-pointer list-none rounded-lg px-3 py-2 text-xs font-medium text-violet-700 outline-none hover:bg-violet-50 focus-visible:ring-2 focus-visible:ring-violet-500 [&::-webkit-details-marker]:hidden">
          ＋ 补充灵兽特殊技能
        </summary>
        <div className="border-t border-violet-100 p-2.5">
          <p className="mb-2 text-[11px] leading-4 text-slate-500">
            仅用于截图列表以外的灵兽自带主动或被动特殊技能。
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              aria-label={`${title}特殊技能名称`}
              maxLength={20}
              placeholder="输入特殊技能名称"
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addSpecialSkill();
                }
              }}
            />
            <button
              type="button"
              className="shrink-0 rounded-lg bg-violet-700 px-3 py-2 text-xs font-medium text-white transition hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
              onClick={addSpecialSkill}
            >
              添加
            </button>
          </div>

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
        </div>
      </details>

      <div
        className="mt-3 flex min-h-10 flex-wrap content-start gap-2"
        aria-label={`${title}已录入技能`}
      >
        {skills.length === 0 ? (
          <p className="py-2 text-xs text-slate-400">
            暂无技能，至少录入 4 个。
          </p>
        ) : (
          <SpiritBeastFusionSkillIcons
            skills={skills}
            size="small"
            onRemove={(skillId) =>
              onChange(skills.filter((skill) => skill.id !== skillId))
            }
            removeAriaLabel={(skill) => `删除${title}${skill.name}`}
          />
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
