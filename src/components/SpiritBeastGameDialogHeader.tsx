import closeStarUrl from "../assets/spirit-beast-fusion-close-star.png";
import headerCrescentUrl from "../assets/spirit-beast-fusion-header-crescent.png";
import { SPIRIT_BEAST_GAME_FONT_STYLE } from "./spiritBeastGameStyles";

type SpiritBeastGameDialogHeaderProps = {
  title: string;
  titleId: string;
  closeAriaLabel: string;
  onClose: () => void;
  layout?: "compact" | "wide";
};

/** 复用游戏风结果弹窗的月牙标题栏和星形关闭操作。 */
const SpiritBeastGameDialogHeader = ({
  title,
  titleId,
  closeAriaLabel,
  onClose,
  layout = "wide",
}: SpiritBeastGameDialogHeaderProps) => {
  const isCompact = layout === "compact";

  return (
    <header
      className={
        isCompact
          ? "relative flex h-[52px] shrink-0 items-center overflow-visible border-b border-[#7285b2] bg-[#53689d] px-4 sm:h-[72px] sm:px-6"
          : "relative flex shrink-0 items-center justify-between gap-4 bg-[#536b9e] px-5 py-3 text-white sm:px-8 sm:py-4"
      }
    >
      <img
        className={
          isCompact
            ? "pointer-events-none absolute -left-6 -top-5 z-10 w-24 select-none sm:-left-9 sm:-top-7 sm:w-32"
            : "pointer-events-none absolute -left-8 -top-5 w-28 object-contain sm:-left-10 sm:w-32"
        }
        src={headerCrescentUrl}
        alt=""
        aria-hidden="true"
      />
      {isCompact ? (
        <h2
          id={titleId}
          className="ml-12 text-[26px] font-bold text-[#fff7dc] drop-shadow-sm sm:ml-20 sm:text-[32px]"
          style={SPIRIT_BEAST_GAME_FONT_STYLE}
        >
          {title}
        </h2>
      ) : (
        <div className="relative z-10 pl-8 sm:pl-12">
          <h2
            id={titleId}
            className="mt-1 text-2xl font-bold tracking-[0.12em] sm:text-3xl"
            style={SPIRIT_BEAST_GAME_FONT_STYLE}
          >
            {title}
          </h2>
        </div>
      )}
      <button
        type="button"
        className={
          isCompact
            ? "absolute right-0 top-1/2 grid size-14 -translate-y-1/2 place-items-center rounded-full transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-white/80 sm:size-16"
            : "relative z-10 inline-flex size-11 shrink-0 items-center justify-center rounded-full transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white"
        }
        aria-label={closeAriaLabel}
        onClick={onClose}
      >
        <img
          className={isCompact ? "size-full" : "size-9 object-contain"}
          src={closeStarUrl}
          alt=""
        />
      </button>
    </header>
  );
};

export default SpiritBeastGameDialogHeader;
