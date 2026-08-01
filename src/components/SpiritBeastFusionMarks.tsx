/** 标记融合结果资质高于主副宠原有资质。 */
export const QualificationBurstMark = ({ compact = false }) => (
  <span
    className={`inline-grid shrink-0 place-items-center rounded-full border border-amber-200 bg-amber-400 font-black leading-none text-amber-950 shadow-[0_0_14px_rgba(251,191,36,0.75)] ${
      compact ? "size-5 text-xs" : "size-7 text-base"
    }`}
    style={{ fontFamily: '"STKaiti", "KaiTi", serif' }}
    title="该资质高于主副宠原有资质"
    aria-label="爆资质"
  >
    爆
  </span>
);
