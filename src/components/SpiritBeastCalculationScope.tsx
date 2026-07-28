import {
  SPIRIT_BEAST_GROWTH_MAX,
  SPIRIT_BEAST_GROWTH_MIN,
  SPIRIT_BEAST_LEVEL_ZERO_PRIMARY_TOTAL,
  SPIRIT_BEAST_POTENTIAL_POINTS_PER_LEVEL,
  SPIRIT_BEAST_QUALIFICATION_MAX,
  SPIRIT_BEAST_QUALIFICATION_MIN,
  getSpiritBeastPotentialPoints,
} from "../utils/spiritBeastAttributes";
import CalculationScopePanel from "./CalculationScopePanel";

type SpiritBeastCalculationScopeProps = {
  level: number;
};

const SPIRIT_BEAST_CONVERSION_FORMULAS = [
  {
    label: "物攻",
    formula: "100 + 物攻资质 × 等级 × 5 / 1000 + 力 × 0.5 × 成长",
  },
  {
    label: "速度",
    formula:
      "速度资质 × 等级 × 2.215 / 1000 + [(体 + 力 + 耐) × 0.1 + 灵 × 0.05 + 敏 × 0.5] × 成长",
  },
  {
    label: "气血",
    formula: "50 + 气血资质 × 等级 × 10 / 1000 + 体 × 3 × 成长",
  },
  {
    label: "物防",
    formula: "物防资质 × 等级 × 3.33 / 1000 + 耐 × 成长",
  },
  {
    label: "法攻",
    formula:
      "80 + 灵力资质 × 等级 × 1.425 / 1000 + [灵 × 0.5 + 力 × 0.3 + (体 + 耐) × 0.1] × 成长",
  },
  {
    label: "法防",
    formula:
      "灵力资质 × 等级 × 0.62 / 1000 + [灵 × 0.5 + 力 × 0.3 + (体 + 耐) × 0.1] × 成长",
  },
] as const;

/** 展示灵兽属性计算的样本范围、暂定公式和加成顺序。 */
const SpiritBeastCalculationScope = ({
  level,
}: SpiritBeastCalculationScopeProps) => {
  const totalPotentialPoints = getSpiritBeastPotentialPoints(level);
  const fixedPrimaryIncrease = level * 2;

  return (
    <CalculationScopePanel
      summary={
        <>
          当前计算基于现有 1 级属性与升级预览样本；0 级五维总和暂按{" "}
          {SPIRIT_BEAST_LEVEL_ZERO_PRIMARY_TOTAL}，升一级五维各增加 2 点，并获得{" "}
          {SPIRIT_BEAST_POTENTIAL_POINTS_PER_LEVEL} 点潜力。当前 {level} 级共有{" "}
          {totalPotentialPoints}{" "}
          点潜力；资质、成长和法力公式仍待更多样本复核。数据仅供参考，以实际游戏数据为准。
        </>
      }
    >
      <div className="space-y-4 text-sm leading-6 text-slate-700">
        <section className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
          <h3 className="font-semibold">数据范围和免责声明</h3>
          <p className="mt-1">
            当前规则依据已提供的 1
            级属性截图、升级预览和公式图片整理，尚未覆盖全部灵兽与游戏版本。
            资质、成长和法力均缺少官方公式，样本增加后可能继续调整。所有结果仅供参考，
            以实际游戏数据为准。
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <h3 className="font-semibold text-slate-900">0 级五维与升级</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              0 级体、灵、力、耐、敏总和暂按{" "}
              {SPIRIT_BEAST_LEVEL_ZERO_PRIMARY_TOTAL}
              ；实际分配存在随机差异，默认各 40 仅用于建立可编辑草稿。
            </li>
            <li>
              从 0 级起，每升一级五维各固定增加 2 点，并获得{" "}
              {SPIRIT_BEAST_POTENTIAL_POINTS_PER_LEVEL} 点可分配潜力。
            </li>
            <li>
              当前 {level} 级共升级 {level} 次，各项五维固定增加{" "}
              {fixedPrimaryIncrease} 点，可分配潜力共 {totalPotentialPoints}{" "}
              点。
            </li>
            <li>
              潜力方案按每级 10
              点累计；常见方案和自由方案只影响潜力分配，不改变固定成长。
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <h3 className="font-semibold text-slate-900">资质、成长与法力</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              物攻、物防、气血、灵力和速度基础资质当前可录入{" "}
              {SPIRIT_BEAST_QUALIFICATION_MIN}～{SPIRIT_BEAST_QUALIFICATION_MAX}
              ，成长可录入 {SPIRIT_BEAST_GROWTH_MIN.toFixed(3)}～
              {SPIRIT_BEAST_GROWTH_MAX.toFixed(3)}
              ；这些是当前计算器边界，不代表已核验的游戏极限。
            </li>
            <li>
              已启用的 1 阶、2 阶灵饰分别在五项基础资质上增加 10、20
              点，再进入对应资质公式。
            </li>
            <li>
              五维先叠加固定成长、潜力和来源加成，再与资质、成长共同计算气血和五项派生属性。
            </li>
            <li>
              法力暂只计算升级增量：法力增量 =（等级 - 1）×（12 + 10 × 成长）；1
              级基础法力尚未计入。
            </li>
            <li>
              现有公式可以复现部分样本，但仍存在未解释差异，不会为单个截图反向调整初值。
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-900">灵兽五维转换公式</h3>
            <span className="text-xs font-medium text-amber-600">待复核</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            下列公式中的五维均为固定成长、潜力和来源加成汇总后的体、灵、力、耐、敏。
          </p>
          <dl className="mt-3 space-y-2" aria-label="灵兽五维转换公式">
            {SPIRIT_BEAST_CONVERSION_FORMULAS.map(({ label, formula }) => (
              <div
                key={label}
                className="grid gap-1 rounded-lg bg-slate-50 px-3 py-2 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-3"
              >
                <dt className="font-semibold text-slate-800">{label}</dt>
                <dd>
                  <code className="whitespace-normal break-words font-mono text-xs text-slate-700">
                    {label} = {formula}
                  </code>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <h3 className="font-semibold text-slate-900">面板技能</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              低级 / 高级威能分别增加灵点 × 0.06 / 0.1
              法攻；威能读取其它五维来源结算后的灵点。
            </li>
            <li>
              低级 / 高级迅捷分别增加 10% / 20% 速度，低级 / 高级迟钝分别降低
              10% / 20% 速度。
            </li>
            <li>
              低级 / 高级健壮分别增加 15% / 25% 气血，低级 / 高级吉星分别增加 5%
              / 10% 气血。
            </li>
            <li>低级 / 高级六系亲和技能分别增加对应亲和 15 / 25 点。</li>
            <li>
              同名低级与高级技能同时存在时只按高级技能计算；不同气血技能的比例相加，迅捷与迟钝的比例相减。
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <h3 className="font-semibold text-slate-900">坐骑统御</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              固定属性通常从气血、法力、物攻、法攻、物防、法防、速度中选择两项，按实际数值直接叠加。
            </li>
            <li>
              疾风每级增加 1% 速度，范围 1%～10%；迟钝术每级减少 2% 速度，可选
              2%、4% …
              20%。两者可单独启用、同时启用或都不启用，未启用时可视为选择其它不影响面板的战斗技能。
            </li>
            <li>
              两者同时启用时按同一份技能结算前精确速度相减，并与迅捷、迟钝的速度比例共同加减。
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <h3 className="font-semibold text-slate-900">命格</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              每个命格有 1 个本命技和 6
              个命技，但可能没有任何命技影响面板；计算器只按需添加实际面板命技，最多
              6 条。
            </li>
            <li>
              命技按截图中的普通 / 变异和 1～5
              级固定值直接增加气血、法力、物攻、法攻、物防、法防或速度。
            </li>
            <li>
              本命技“被动·神机妙算”减少等级 × 1
              速度，其它不影响面板的本命技当前无需记录。
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <h3 className="font-semibold text-slate-900">加成与取整顺序</h3>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>
              装备按三件分别录入，灵饰按 1 阶和 2
              阶分别录入；技能、命格与坐骑统御按结构化配置计算。
            </li>
            <li>
              五维加成先进入资质与成长公式；灵饰全资质先增加公式中的资质，面板属性加成在公式结果后直接叠加。
            </li>
            <li>命格命技固定值和“被动·神机妙算”减速作为直接面板属性先结算。</li>
            <li>
              结构化技能最后结算：威能按汇总后的灵点计算，灵兽与坐骑的百分比气血、速度技能按技能前的精确面板值计算。
            </li>
            <li>
              六系亲和汇总初值、来源加成和亲和技能，当前不随等级自动成长。
            </li>
            <li>内部计算保留完整精度，灵兽面板最终展示值统一向下取整。</li>
          </ol>
        </section>
      </div>
    </CalculationScopePanel>
  );
};

export default SpiritBeastCalculationScope;
