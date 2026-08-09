import { useId, useRef } from "react";
import closeStarUrl from "../assets/spirit-beast-fusion-close-star.png";
import transitionArrowUrl from "../assets/spirit-beast-fusion-transition-arrow.png";
import resultBackgroundUrl from "../assets/spirit-beast-skill-learning-result-bg.jpg";
import { useModalDialog } from "../hooks/useModalDialog";
import type { SpiritBeastSkillLearningAttempt } from "../utils/spiritBeastSkillLearning";
import { SPIRIT_BEAST_GAME_FONT_STYLE } from "./spiritBeastGameStyles";
import SpiritBeastGameDialogHeader from "./SpiritBeastGameDialogHeader";
import SpiritBeastSkillSlots from "./SpiritBeastSkillSlots";

type SpiritBeastSkillLearningResultDialogProps = {
  attempt: SpiritBeastSkillLearningAttempt;
  onDiscard: () => void;
  onSave: () => void;
};

/** 对照游戏的学习成功窗口，让用户保存或放弃新增、替换结果。 */
const SpiritBeastSkillLearningResultDialog = ({
  attempt,
  onDiscard,
  onSave,
}: SpiritBeastSkillLearningResultDialogProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const discardButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useModalDialog(onDiscard, {
    initialFocusRef: discardButtonRef,
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-2 backdrop-blur-[3px] sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onDiscard();
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="skill-learning-result-enter relative flex aspect-[0.82] max-h-[94vh] w-[min(94vw,77vh,620px)] flex-col overflow-visible rounded-b-lg border border-white/80 bg-[#e8eff9] shadow-[0_24px_80px_rgba(2,12,35,0.6)] outline-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <SpiritBeastGameDialogHeader
          title="学习成功"
          titleId={titleId}
          closeAriaLabel="关闭学习结果窗口"
          onClose={onDiscard}
          layout="compact"
        />
        <p id={descriptionId} className="sr-only">
          {attempt.resultType === "added"
            ? `本次成功新增了“${attempt.learnedSkillName}”，请选择是否保存学习结果。参考消耗 ${attempt.referencePrice} 银。`
            : `本次随机替换了“${attempt.replacedSkillName}”，请选择是否保存学习结果。参考消耗 ${attempt.referencePrice} 银。`}
        </p>

        <div
          className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#e8eff9] bg-cover bg-center"
          style={{ backgroundImage: `url(${resultBackgroundUrl})` }}
        >
          <div className="flex min-h-0 flex-1 flex-col px-4 pb-1 pt-3 sm:px-7 sm:pb-2 sm:pt-5">
            <section
              className="flex min-h-0 flex-1 flex-col"
              aria-label="已有技能"
            >
              <h3
                className="mb-1.5 flex shrink-0 items-center gap-2 border-b border-[#c7d2e1] pb-1.5 text-[15px] font-semibold text-[#6f655e] sm:mb-3 sm:pb-2 sm:text-[22px]"
                style={SPIRIT_BEAST_GAME_FONT_STYLE}
              >
                <img className="size-4 sm:size-5" src={closeStarUrl} alt="" />
                <span>已有技能</span>
              </h3>
              <SpiritBeastSkillSlots
                skillNames={attempt.beforeSkillNames}
                chainSkillNames={attempt.chainSkillNames}
                ariaLabel="学习前技能"
                displayMode="game-result"
              />
            </section>

            <div className="flex h-5 shrink-0 items-center justify-center sm:h-8">
              <img
                className="h-5 w-auto rotate-90 opacity-55 sm:h-8"
                src={transitionArrowUrl}
                alt=""
                aria-hidden="true"
              />
            </div>

            <section
              className="flex min-h-0 flex-1 flex-col"
              aria-label="学习结果"
            >
              <h3
                className="mb-1.5 flex shrink-0 items-center gap-2 border-b border-[#c7d2e1] pb-1.5 text-[13px] font-semibold text-[#6f655e] sm:mb-3 sm:pb-2 sm:text-[20px]"
                style={SPIRIT_BEAST_GAME_FONT_STYLE}
              >
                <img className="size-4 sm:size-5" src={closeStarUrl} alt="" />
                <span className="whitespace-nowrap">
                  学习结果（请选择是否保存学习结果）
                </span>
              </h3>
              <SpiritBeastSkillSlots
                skillNames={attempt.afterSkillNames}
                chainSkillNames={attempt.chainSkillNames}
                ariaLabel="学习后技能"
                highlightedIndex={attempt.learnedSkillIndex}
                displayMode="game-result"
              />
            </section>
          </div>

          <footer className="grid shrink-0 grid-cols-2 gap-5 px-5 pb-4 pt-2 sm:gap-12 sm:px-14 sm:pb-6 sm:pt-3">
            <button
              ref={discardButtonRef}
              type="button"
              className="inline-flex h-11 items-center justify-center rounded-[22px] border-2 border-[#9db4ef] bg-[#5f82dc] px-4 !text-[18px] !font-semibold !leading-none text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.45),0_4px_10px_rgba(66,91,159,0.22)] transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-[#7a9cf0] focus:ring-offset-2 sm:h-14 sm:rounded-[28px] sm:!text-[24px]"
              style={SPIRIT_BEAST_GAME_FONT_STYLE}
              onClick={onDiscard}
            >
              关闭
            </button>
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center rounded-[22px] border-2 border-[#ffe6a6] bg-[#f4ca70] px-4 !text-[18px] !font-semibold !leading-none text-[#8b4d24] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.45),0_4px_10px_rgba(158,110,36,0.18)] transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-[#efbd52] focus:ring-offset-2 sm:h-14 sm:rounded-[28px] sm:!text-[24px]"
              style={SPIRIT_BEAST_GAME_FONT_STYLE}
              onClick={onSave}
            >
              保存
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default SpiritBeastSkillLearningResultDialog;
