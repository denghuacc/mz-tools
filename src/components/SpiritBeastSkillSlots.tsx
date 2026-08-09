import { getSpiritBeastFusionSkillOption } from "../data/spiritBeastFusionSkills";
import { SPIRIT_BEAST_SKILL_LEARNING_MAX_SKILLS } from "../utils/spiritBeastSkillLearning";

type SpiritBeastSkillSlotsProps = {
  skillNames: readonly string[];
  chainSkillNames?: readonly string[];
  ariaLabel: string;
  highlightedIndex?: number;
  onToggleChainSkill?: (skillName: string) => void;
  displayMode?: "standard" | "game-result";
};

/** 按游戏技能格顺序展示当前或待保存的灵兽技能。 */
const SpiritBeastSkillSlots = ({
  skillNames,
  chainSkillNames = [],
  ariaLabel,
  highlightedIndex,
  onToggleChainSkill,
  displayMode = "standard",
}: SpiritBeastSkillSlotsProps) => {
  const isGameResult = displayMode === "game-result";
  const slotCount = isGameResult ? 18 : SPIRIT_BEAST_SKILL_LEARNING_MAX_SKILLS;

  return (
    <div
      className={
        isGameResult
          ? "grid min-h-0 flex-1 grid-cols-6 place-items-center gap-x-1 gap-y-1.5 sm:gap-x-2 sm:gap-y-3"
          : "grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-6"
      }
      role="list"
      aria-label={ariaLabel}
    >
      {Array.from({ length: slotCount }, (_, index) => {
        const skillName = skillNames[index];
        const isChainSkill = Boolean(
          skillName && chainSkillNames.includes(skillName),
        );
        const skillOption = skillName
          ? getSpiritBeastFusionSkillOption(skillName)
          : null;
        const isHighlighted = index === highlightedIndex;
        const skillCircleClassName = isGameResult
          ? `relative mx-auto grid size-9 place-items-center rounded-full sm:size-14 ${
              skillOption
                ? "shadow-[0_2px_5px_rgba(69,76,96,0.24)]"
                : "bg-[#d6dfeb]/85"
            }`
          : `relative mx-auto grid size-16 place-items-center rounded-full border-2 sm:size-[4.5rem] ${
              isHighlighted
                ? "border-amber-400 bg-amber-50 ring-4 ring-amber-100"
                : skillOption
                  ? "border-slate-200 bg-white shadow-sm"
                  : "border-dashed border-slate-200 bg-slate-100/80"
            }`;
        const skillCircleContent = (
          <>
            {skillOption ? (
              <img
                className="size-full rounded-full object-cover"
                src={skillOption.iconUrl}
                alt=""
                loading="lazy"
                decoding="async"
              />
            ) : null}
            {isHighlighted ? (
              <span
                className={
                  isGameResult
                    ? "absolute -right-1 -top-1 grid size-4 place-items-center rounded-full border border-[#fff1d4] bg-[#ff8a19] text-[11px] font-black leading-none text-white shadow-sm sm:size-5 sm:text-[13px]"
                    : "absolute right-0 top-0 rounded-full border-2 border-white bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm"
                }
                aria-hidden="true"
              >
                {isGameResult ? "!" : "新技能"}
              </span>
            ) : null}
            {isChainSkill ? (
              <span
                className={
                  isGameResult
                    ? "absolute -left-1 -top-1 grid size-4 place-items-center rounded-full border border-white bg-fuchsia-700 text-[9px] font-black leading-none text-white shadow-sm sm:size-5 sm:text-[11px]"
                    : "absolute -left-1 -top-1 grid size-6 place-items-center rounded-md border-2 border-white bg-cyan-700 text-[11px] font-bold text-white shadow-sm"
                }
                aria-hidden="true"
              >
                宝
              </span>
            ) : null}
          </>
        );

        return (
          <div
            key={`${index}-${skillName ?? "empty"}`}
            className={isGameResult ? "min-w-0" : "min-w-0 text-center"}
            role="listitem"
            aria-label={
              isChainSkill
                ? `${skillName}（宝链技能，不参与替换）`
                : (skillName ?? `空技能格 ${index + 1}`)
            }
          >
            {skillName && onToggleChainSkill && !isGameResult ? (
              <button
                type="button"
                className={`${skillCircleClassName} cursor-pointer transition hover:border-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-200`}
                aria-label={`${skillName}，${isChainSkill ? "取消宝链标记" : "标记为宝链技能"}`}
                aria-pressed={isChainSkill}
                onClick={() => onToggleChainSkill(skillName)}
              >
                {skillCircleContent}
              </button>
            ) : (
              <span className={skillCircleClassName}>{skillCircleContent}</span>
            )}
            {isGameResult ? null : (
              <span
                className={`mt-1.5 block min-h-8 text-xs font-medium leading-4 ${
                  skillName ? "text-slate-700" : "text-slate-300"
                }`}
              >
                {skillName ?? "空位"}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SpiritBeastSkillSlots;
