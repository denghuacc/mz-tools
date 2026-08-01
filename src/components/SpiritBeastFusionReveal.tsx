import { useEffect, useId, useRef, useState } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from "react";
import fusionRevealBackground from "../assets/spirit-beast-fusion-reveal-bg.png";
import fusionScratchFilm from "../assets/spirit-beast-fusion-scratch-film.png";
import { useModalDialog } from "../hooks/useModalDialog";
import { SPIRIT_BEAST_QUALIFICATIONS } from "../utils/spiritBeastAttributes";
import type { FusionResult } from "../utils/spiritBeastFusion";
import { formatFusionSkillLabel } from "../utils/spiritBeastFusion";
import { playFusionRevealSound } from "../utils/fusionRevealSound";
import { SPIRIT_BEAST_QUALIFICATION_LABELS } from "./spiritBeastLabels";
import { QualificationBurstMark } from "./SpiritBeastFusionMarks";

const REVEAL_CARD_COUNT = SPIRIT_BEAST_QUALIFICATIONS.length + 3;

const formatGrowth = (value: number) => value.toFixed(3);

type ScratchRevealProps = {
  label: string;
  children: ReactNode;
  revealAll: boolean;
  onReveal: () => void;
  className?: string;
};

const ScratchReveal = ({
  label,
  children,
  revealAll,
  onReveal,
  className = "",
}: ScratchRevealProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const previousPointRef = useRef<{ x: number; y: number } | null>(null);
  const strokeCountRef = useRef(0);
  const hasReportedRevealRef = useRef(false);
  const onRevealRef = useRef(onReveal);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    onRevealRef.current = onReveal;
  }, [onReveal]);

  const reveal = () => {
    setIsRevealed(true);
    if (!hasReportedRevealRef.current) {
      hasReportedRevealRef.current = true;
      onRevealRef.current();
    }
  };

  useEffect(() => {
    if (revealAll) reveal();
  }, [revealAll]);

  useEffect(() => {
    if (isRevealed) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const texture = new Image();
    texture.src = fusionScratchFilm;

    const drawCover = () => {
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = Math.round(bounds.width * pixelRatio);
      canvas.height = Math.round(bounds.height * pixelRatio);
      const context = canvas.getContext("2d");
      if (!context) return;

      context.globalCompositeOperation = "source-over";
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(texture, 0, 0, canvas.width, canvas.height);
    };

    texture.addEventListener("load", drawCover);
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(drawCover);
    resizeObserver?.observe(canvas);
    window.addEventListener("resize", drawCover);

    return () => {
      texture.removeEventListener("load", drawCover);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", drawCover);
    };
  }, [isRevealed]);

  const checkRevealProgress = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparentSamples = 0;
    let totalSamples = 0;

    for (let index = 3; index < pixels.length; index += 96) {
      totalSamples += 1;
      if (pixels[index] < 48) transparentSamples += 1;
    }

    if (totalSamples > 0 && transparentSamples / totalSamples >= 0.38) {
      reveal();
    }
  };

  const getCanvasPoint = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return null;

    return {
      x: ((event.clientX - bounds.left) / bounds.width) * canvas.width,
      y: ((event.clientY - bounds.top) / bounds.height) * canvas.height,
    };
  };

  const scratchTo = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const point = getCanvasPoint(event);
    if (!canvas || !context || !point) return;

    const previousPoint = previousPointRef.current ?? point;
    context.globalCompositeOperation = "destination-out";
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = Math.max(34, canvas.width * 0.055);
    context.beginPath();
    context.moveTo(previousPoint.x, previousPoint.y);
    context.lineTo(point.x, point.y);
    context.stroke();
    previousPointRef.current = point;
    strokeCountRef.current += 1;

    if (strokeCountRef.current % 10 === 0) checkRevealProgress();
  };

  const finishScratching = () => {
    if (!drawingRef.current) return;

    drawingRef.current = false;
    previousPointRef.current = null;
    checkRevealProgress();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLCanvasElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    reveal();
  };

  return (
    <div
      className={`relative min-h-24 overflow-hidden rounded-2xl border border-blue-200/70 bg-blue-950/80 shadow-[inset_0_0_24px_rgba(96,165,250,0.2),0_0_24px_rgba(59,130,246,0.18)] ${className}`}
    >
      <div
        className="flex min-h-24 h-full items-center justify-center p-4 text-center"
        aria-hidden={!isRevealed}
      >
        {children}
      </div>

      {!isRevealed ? (
        <>
          <canvas
            ref={canvasRef}
            className="absolute inset-0 z-10 size-full touch-none cursor-crosshair"
            role="button"
            tabIndex={0}
            aria-label={`刮开${label}`}
            onPointerDown={(event) => {
              drawingRef.current = true;
              event.currentTarget.setPointerCapture(event.pointerId);
              previousPointRef.current = getCanvasPoint(event);
              scratchTo(event);
            }}
            onPointerMove={(event) => {
              if (drawingRef.current) scratchTo(event);
            }}
            onPointerUp={finishScratching}
            onPointerCancel={finishScratching}
            onKeyDown={handleKeyDown}
          />
          <span
            className="pointer-events-none absolute left-6 right-3 top-1/2 z-20 -translate-y-1/2 text-left text-xl font-semibold tracking-[0.12em] text-white drop-shadow-md sm:text-2xl"
            style={{ fontFamily: '"STKaiti", "KaiTi", serif' }}
          >
            {label}
          </span>
        </>
      ) : null}
    </div>
  );
};

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
              <ScratchReveal
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
              </ScratchReveal>
            ))}

            <ScratchReveal
              label="成长"
              revealAll={revealAll}
              onReveal={handleCardReveal}
            >
              <div>
                <span className="text-xs text-blue-200">成长</span>
                <strong className="mt-1 block text-2xl tabular-nums text-white">
                  {formatGrowth(result.growth)}
                </strong>
              </div>
            </ScratchReveal>

            <ScratchReveal
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
            </ScratchReveal>

            <ScratchReveal
              label="技能"
              revealAll={revealAll}
              onReveal={handleCardReveal}
              className="min-h-72 sm:col-span-2 lg:col-span-3"
            >
              <div className="w-full">
                <span className="text-xs text-blue-200">
                  {result.skillCount} 技能 · {result.specialSkillCount} 特殊
                </span>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {result.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                        skill.isSpecial
                          ? skill.specialType === "passive"
                            ? "border-fuchsia-200/60 bg-fuchsia-400/20 text-fuchsia-100"
                            : "border-cyan-200/60 bg-cyan-400/20 text-cyan-100"
                          : "border-blue-200/30 bg-blue-100/10 text-blue-50"
                      }`}
                    >
                      {formatFusionSkillLabel(skill)}
                    </span>
                  ))}
                </div>
              </div>
            </ScratchReveal>
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
