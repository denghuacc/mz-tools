import { useEffect, useRef, useState } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from "react";
import fusionScratchFilm from "../assets/spirit-beast-fusion-scratch-film.png";
import { SPIRIT_BEAST_GAME_FONT_STYLE } from "./spiritBeastGameStyles";

type SpiritBeastFusionScratchRevealProps = {
  label: string;
  children: ReactNode;
  revealAll: boolean;
  onReveal: () => void;
  className?: string;
};

/** 提供可由指针或键盘操作的刮膜区域，并在尺寸变化时保留刮除进度。 */
const SpiritBeastFusionScratchReveal = ({
  label,
  children,
  revealAll,
  onReveal,
  className = "",
}: SpiritBeastFusionScratchRevealProps) => {
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
    let hasDrawnCover = false;

    const drawCover = (preserveExisting: boolean) => {
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      const pixelRatio = window.devicePixelRatio || 1;
      const nextWidth = Math.round(bounds.width * pixelRatio);
      const nextHeight = Math.round(bounds.height * pixelRatio);
      if (
        hasDrawnCover &&
        canvas.width === nextWidth &&
        canvas.height === nextHeight
      ) {
        return;
      }

      let previousCover: HTMLCanvasElement | null = null;
      if (preserveExisting && hasDrawnCover) {
        previousCover = document.createElement("canvas");
        previousCover.width = canvas.width;
        previousCover.height = canvas.height;
        previousCover.getContext("2d")?.drawImage(canvas, 0, 0);
      }

      canvas.width = nextWidth;
      canvas.height = nextHeight;
      const context = canvas.getContext("2d");
      if (!context) return;

      context.globalCompositeOperation = "source-over";
      context.clearRect(0, 0, nextWidth, nextHeight);
      if (previousCover) {
        context.drawImage(previousCover, 0, 0, nextWidth, nextHeight);
        hasDrawnCover = true;
        return;
      }

      if (!texture.complete || texture.naturalWidth === 0) return;

      context.drawImage(texture, 0, 0, nextWidth, nextHeight);
      hasDrawnCover = true;
    };

    const handleTextureLoad = () => drawCover(false);
    const handleResize = () => drawCover(true);

    texture.addEventListener("load", handleTextureLoad);
    texture.src = fusionScratchFilm;
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(handleResize);
    resizeObserver?.observe(canvas);
    window.addEventListener("resize", handleResize);

    return () => {
      texture.removeEventListener("load", handleTextureLoad);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", handleResize);
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
        className="flex h-full min-h-24 items-center justify-center p-4 text-center"
        aria-hidden={!isRevealed}
      >
        {children}
      </div>

      {!isRevealed ? (
        <>
          <canvas
            ref={canvasRef}
            className="absolute inset-0 z-10 size-full cursor-crosshair touch-none"
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
            style={SPIRIT_BEAST_GAME_FONT_STYLE}
          >
            {label}
          </span>
        </>
      ) : null}
    </div>
  );
};

export default SpiritBeastFusionScratchReveal;
