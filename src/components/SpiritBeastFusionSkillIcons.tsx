import { useId, useState } from "react";
import { getSpiritBeastFusionSkillOption } from "../data/spiritBeastFusionSkills";
import {
  formatFusionSkillLabel,
  type FusionSkill,
} from "../utils/spiritBeastFusion";

type SpiritBeastFusionSkillIconsProps = {
  skills: readonly FusionSkill[];
  size?: "small" | "medium" | "large";
  tone?: "light" | "dark";
  justify?: "start" | "center";
  onRemove?: (skillId: string) => void;
  removeAriaLabel?: (skill: FusionSkill) => string;
};

const SIZE_CLASSES = {
  small: "size-9",
  medium: "size-11",
  large: "size-14",
} as const;

const SPECIAL_TEXT_CLASSES = {
  small: "text-sm",
  medium: "text-base",
  large: "text-lg",
} as const;

/** 用圆形图标展示融合技能；无专属图标的特殊技能用“特”表示。 */
const SpiritBeastFusionSkillIcons = ({
  skills,
  size = "medium",
  tone = "light",
  justify = "start",
  onRemove,
  removeAriaLabel = (skill) => `删除技能${skill.name}`,
}: SpiritBeastFusionSkillIconsProps) => {
  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);
  const selectedLabelId = useId();
  const activeSkill = skills.find((skill) => skill.id === activeSkillId);
  const isDark = tone === "dark";
  const iconSizeClass = SIZE_CLASSES[size];
  const specialTextClass = SPECIAL_TEXT_CLASSES[size];

  return (
    <div>
      <div
        className={`flex flex-wrap gap-2 ${
          justify === "center" ? "justify-center" : "justify-start"
        }`}
      >
        {skills.map((skill) => {
          const skillOption = getSpiritBeastFusionSkillOption(skill.name);
          const isActive = activeSkillId === skill.id;
          const isCustomSpecial = skill.isSpecial && !skillOption;

          if (!skillOption && !skill.isSpecial) {
            return (
              <span
                key={skill.id}
                className={`inline-flex items-center gap-1 rounded-full border py-1 pl-2.5 text-xs font-semibold ${
                  onRemove ? "pr-1" : "pr-2.5"
                } ${
                  isDark
                    ? "border-violet-200/50 bg-violet-300/15 text-violet-50"
                    : "border-violet-200 bg-violet-50 text-violet-700"
                }`}
              >
                {formatFusionSkillLabel(skill)}
                {onRemove ? (
                  <button
                    type="button"
                    className="grid size-5 place-items-center rounded-full text-current opacity-60 transition hover:bg-black/5 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={removeAriaLabel(skill)}
                    onClick={() => onRemove(skill.id)}
                  >
                    ×
                  </button>
                ) : null}
              </span>
            );
          }

          return (
            <span key={skill.id} className="relative shrink-0">
              <button
                type="button"
                className={`${iconSizeClass} overflow-hidden rounded-full border-2 font-black transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isActive
                    ? isDark
                      ? "border-amber-200 ring-2 ring-amber-200/60"
                      : "border-blue-500 ring-2 ring-blue-200"
                    : isCustomSpecial
                      ? isDark
                        ? "border-fuchsia-200/70 bg-fuchsia-400/20 text-fuchsia-50 hover:border-fuchsia-100"
                        : "border-violet-300 bg-violet-100 text-violet-700 hover:border-violet-400"
                      : isDark
                        ? "border-blue-100/45 hover:border-blue-100"
                        : "border-slate-200 hover:border-blue-300"
                }`}
                aria-label={`查看${formatFusionSkillLabel(skill)}技能名称`}
                aria-expanded={isActive}
                aria-controls={selectedLabelId}
                onClick={() => setActiveSkillId(isActive ? null : skill.id)}
              >
                {skillOption ? (
                  <img
                    className="size-full rounded-full object-cover"
                    src={skillOption.iconUrl}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span
                    className={`grid size-full place-items-center rounded-full ${specialTextClass}`}
                    aria-hidden="true"
                  >
                    特
                  </span>
                )}
              </button>
              {skillOption && skill.isSpecial ? (
                <span
                  className={`absolute -left-1 -top-1 grid size-5 place-items-center rounded-full border border-white text-[10px] font-black text-white shadow-sm ${
                    skill.specialType === "passive"
                      ? "bg-fuchsia-600"
                      : "bg-cyan-600"
                  }`}
                  aria-hidden="true"
                >
                  特
                </span>
              ) : null}
              {onRemove ? (
                <button
                  type="button"
                  className={`absolute -right-1 -top-1 grid size-5 place-items-center rounded-full border text-xs font-bold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark
                      ? "border-blue-100/60 bg-blue-950 text-blue-50 hover:bg-blue-900"
                      : "border-white bg-slate-700 text-white hover:bg-slate-600"
                  }`}
                  aria-label={removeAriaLabel(skill)}
                  onClick={() => onRemove(skill.id)}
                >
                  ×
                </button>
              ) : null}
            </span>
          );
        })}
      </div>

      <p
        id={selectedLabelId}
        className={`mt-2 min-h-5 text-xs font-semibold ${
          justify === "center" ? "text-center" : "text-left"
        } ${isDark ? "text-blue-50" : "text-slate-700"}`}
        aria-live="polite"
      >
        {activeSkill ? formatFusionSkillLabel(activeSkill) : null}
      </p>
    </div>
  );
};

export default SpiritBeastFusionSkillIcons;
