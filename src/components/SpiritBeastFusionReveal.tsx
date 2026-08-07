import { useId, useRef, useState } from "react";
import fusionRevealBackground from "../assets/spirit-beast-fusion-reveal-bg.png";
import { useModalDialog } from "../hooks/useModalDialog";
import { SPIRIT_BEAST_QUALIFICATIONS } from "../utils/spiritBeastAttributes";
import type { FusionResult } from "../utils/spiritBeastFusion";
import { formatFusionGrowth } from "../utils/spiritBeastFusionFormatters";
import { playFusionRevealSound } from "../utils/fusionRevealSound";
import { SPIRIT_BEAST_QUALIFICATION_LABELS } from "./spiritBeastLabels";
import { QualificationBurstMark } from "./SpiritBeastFusionMarks";
import SpiritBeastFusionScratchReveal from "./SpiritBeastFusionScratchReveal";
import SpiritBeastFusionSkillIcons from "./SpiritBeastFusionSkillIcons";

const REVEAL_CARD_COUNT = SPIRIT_BEAST_QUALIFICATIONS.length + 3;

type SpiritBeastFusionRevealProps = {
  result: FusionResult;
  mainName: string;
  secondaryName: string;
  onClose: () => void;
};

const SpiritBeastFusionReveal = ({
  result,
  mainName,
  secondaryName,
  onClose,
}: SpiritBeastFusionRevealProps) => {
  const titleId = useId();
  const primaryButtonRef = useRef<HTMLButtonElement>(null);
  const [revealedCount, setRevealedCount] = useState(0);
  const [revealAll, setRevealAll] = useState(false);
  const dialogRef = useModalDialog(onClose, {
    initialFocusRef: primaryButtonRef,
  });

  const handleCardReveal = () => {
    setRevealedCount((current) => {
      const nextCount = Math.min(REVEAL_CARD_COUNT, current + 1);
      if (nextCount === REVEAL_CARD_COUNT) setRevealAll(true);
      return nextCount;
    });
  };

  const handlePrimaryAction = () => {
    if (revealAll) {
      onClose();
      return;
    }

    setRevealAll(true);
    setRevealedCount(REVEAL_CARD_COUNT);
    playFusionRevealSound();
  };

  return (
    <div className="fixed inset-0 z-[80] bg-[#020b22]/95 p-2 sm:p-5">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-85"
        style={{ backgroundImage: `url(${fusionRevealBackground})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[#03163f]/55" aria-hidden="true" />

      <div
        ref={dialogRef}
        tabIndex={-1}
        className="fusion-reveal-enter relative mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-[28px] border border-blue-200/70 bg-[#061b49]/78 shadow-[0_0_70px_rgba(59,130,246,0.45)] backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-blue-200/25 px-4 py-3 sm:px-7 sm:py-5">
          <div>
            <p className="text-xs font-medium tracking-[0.3em] text-blue-200">
              {mainName || "主宠"} × {secondaryName || "副宠"}
            </p>
            <h2
              id={titleId}
              className="mt-1 text-2xl font-bold tracking-[0.16em] text-white sm:text-3xl"
              style={{ fontFamily: '"STKaiti", "KaiTi", serif' }}
            >
              灵兽融合 · 揭秘
            </h2>
            <p className="mt-1 text-xs text-blue-100/75">
              用鼠标或手指滑动刮开结果，也可以直接一键揭秘。
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-full border border-blue-200/40 bg-blue-950/70 px-3 py-2 text-xs font-medium text-blue-100 transition hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
            onClick={onClose}
          >
            跳过揭秘
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SPIRIT_BEAST_QUALIFICATIONS.map((qualification) => (
              <SpiritBeastFusionScratchReveal
                key={qualification}
                label={SPIRIT_BEAST_QUALIFICATION_LABELS[qualification]}
                revealAll={revealAll}
                onReveal={handleCardReveal}
              >
                <div>
                  <span className="text-xs text-blue-200">
                    {SPIRIT_BEAST_QUALIFICATION_LABELS[qualification]}
                  </span>
                  <span className="mt-1 flex items-center justify-center gap-2">
                    <strong className="text-2xl tabular-nums text-white">
                      {result.qualifications[qualification]}
                    </strong>
                    {result.qualificationBreakthroughs[qualification] ? (
                      <QualificationBurstMark />
                    ) : null}
                  </span>
                </div>
              </SpiritBeastFusionScratchReveal>
            ))}

            <SpiritBeastFusionScratchReveal
              label="成长"
              revealAll={revealAll}
              onReveal={handleCardReveal}
            >
              <div>
                <span className="text-xs text-blue-200">成长</span>
                <strong className="mt-1 block text-2xl tabular-nums text-white">
                  {formatFusionGrowth(result.growth)}
                </strong>
              </div>
            </SpiritBeastFusionScratchReveal>

            <SpiritBeastFusionScratchReveal
              label="初始属性"
              revealAll={revealAll}
              onReveal={handleCardReveal}
              className="sm:col-span-2 lg:col-span-3"
            >
              <div>
                <span className="text-xs text-blue-200">初始属性总和</span>
                <strong className="mt-1 block text-3xl tabular-nums text-white">
                  {result.initialAttributeTotal}
                </strong>
              </div>
            </SpiritBeastFusionScratchReveal>

            <SpiritBeastFusionScratchReveal
              label="技能"
              revealAll={revealAll}
              onReveal={handleCardReveal}
              className="min-h-72 sm:col-span-2 lg:col-span-3"
            >
              <div className="w-full">
                <span className="text-xs text-blue-200">
                  {result.skillCount} 技能 · {result.specialSkillCount} 特殊
                </span>
                <div className="mt-3">
                  <SpiritBeastFusionSkillIcons
                    skills={result.skills}
                    size="large"
                    tone="dark"
                    justify="center"
                  />
                </div>
              </div>
            </SpiritBeastFusionScratchReveal>
          </div>
        </div>

        <footer className="flex shrink-0 flex-col items-center gap-2 border-t border-blue-200/25 bg-[#041538]/80 px-4 py-3 sm:px-7 sm:py-4">
          <span className="text-[11px] tracking-[0.16em] text-blue-200/70">
            已揭秘 {revealedCount}/{REVEAL_CARD_COUNT}
          </span>
          <button
            ref={primaryButtonRef}
            type="button"
            className="min-w-56 rounded-full border border-amber-100 bg-amber-100 px-8 py-3 text-sm font-bold tracking-[0.22em] text-amber-950 shadow-[0_0_28px_rgba(253,230,138,0.45)] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-amber-100 focus:ring-offset-2 focus:ring-offset-blue-950"
            onClick={handlePrimaryAction}
          >
            {revealAll ? "确认" : "一键揭秘"}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default SpiritBeastFusionReveal;
