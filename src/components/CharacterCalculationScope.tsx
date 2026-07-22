import { useId, useState } from "react";
import type { CharacterLevel } from "../utils/characterAttributes";
import EditorDialog from "./EditorDialog";

type CharacterCalculationScopeProps = {
  characterLevel: CharacterLevel;
  characterUpgradeCount: number;
  totalPotentialPoints: number;
};

const PRIMARY_ATTRIBUTE_CONVERSION_ROWS = [
  {
    label: "体力",
    health: "+3",
    physicalAttack: "—",
    magicAttack: "+0.1",
    physicalDefense: "—",
    magicDefense: "+0.1",
    speed: "+0.1",
  },
  {
    label: "灵力",
    health: "—",
    physicalAttack: "—",
    magicAttack: "+0.5",
    physicalDefense: "—",
    magicDefense: "+0.5",
    speed: "+0.05",
  },
  {
    label: "力量",
    health: "—",
    physicalAttack: "+0.5",
    magicAttack: "+0.3",
    physicalDefense: "—",
    magicDefense: "+0.3",
    speed: "+0.1",
  },
  {
    label: "耐力",
    health: "—",
    physicalAttack: "—",
    magicAttack: "+0.1",
    physicalDefense: "+1",
    magicDefense: "+0.1",
    speed: "+0.1",
  },
  {
    label: "敏捷",
    health: "—",
    physicalAttack: "—",
    magicAttack: "—",
    physicalDefense: "—",
    magicDefense: "—",
    speed: "+0.5",
  },
] as const;

/** 展示角色属性计算的样本基准、升级规则与五维转换口径。 */
const CharacterCalculationScope = ({
  characterLevel,
  characterUpgradeCount,
  totalPotentialPoints,
}: CharacterCalculationScopeProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const titleId = useId();
  const fixedPrimaryAttribute = 20 + characterUpgradeCount * 2;

  return (
    <>
      <section
        className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-4 text-xs leading-6 text-blue-900 sm:px-5"
        aria-labelledby={titleId}
      >
        <div className="flex items-center gap-1.5">
          <strong
            id={titleId}
            className="font-semibold"
          >
            当前计算口径
          </strong>
          <button
            type="button"
            className="flex size-6 shrink-0 items-center justify-center rounded-full text-blue-500 transition hover:bg-blue-100 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="查看当前计算口径详情"
            aria-haspopup="dialog"
            aria-expanded={isDialogOpen}
            onClick={() => setIsDialogOpen(true)}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="size-4"
            >
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" d="M12 11v5" />
              <path strokeLinecap="round" d="M12 8h.01" />
            </svg>
          </button>
        </div>
        <p className="mt-1 text-blue-800">
          当前计算仅在现有样本范围内有效；升一级五维各固定增加 2 点，并获得
          10 点潜力。当前 {characterLevel} 级可分配潜力点 {totalPotentialPoints}。
          数据仅供参考，以实际游戏数据为准。
        </p>
      </section>

      {isDialogOpen && (
        <EditorDialog
          title="当前计算口径说明"
          titlePrefix=""
          onClose={() => setIsDialogOpen(false)}
        >
          <div className="space-y-4 text-sm leading-6 text-slate-700">
            <section className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
              <h3 className="font-semibold">数据范围和免责声明</h3>
              <p className="mt-1">
                当前计算仅对已录入样本及其推导范围有效。五维转换公式来自第三方博主测试，
                官方未发布对应公式；不同门派、等级或游戏版本可能存在差异。所有结果仅供参考，
                以实际游戏数据为准。
              </p>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <h3 className="font-semibold text-slate-900">角色初始值与样本基准</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>0 级五维：体、灵、力、耐、敏均为 20 点。</li>
                <li>0 级封印命中为 10%，封印抵抗为 2%；真气固定为 100。</li>
                <li>
                  气血、法力和五项派生属性缺少可靠的 0 级样本，当前从 1 级样本开始计算。
                </li>
                <li>
                  1 级样本五维为体 22、灵 22、力 32、耐 22、敏 22；其中多出的
                  10 点力量来自首批潜力分配。
                </li>
                <li>
                  1 级样本基准为气血 234、法力 157、物攻 98、法攻 100、物防 53、
                  法防 45、速度 19。
                </li>
                <li>
                  1 级进阶基准为物理暴击 2%、法术暴击 1%、命中 100%、躲避 5%、
                  封印命中 12%、封印抵抗 2%；其余当前均按 0 计算。
                </li>
                <li>
                  五项派生初值是否存在随机或门派差异，仍待更多新号样本验证。
                </li>
              </ul>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <h3 className="font-semibold text-slate-900">每次升级增加的属性</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>五维各固定增加 2 点，另获得 10 点可分配潜力。</li>
                <li>封印命中增加 2%；封印抵抗和真气当前不随等级成长。</li>
                <li>
                  升到目标等级 L 时，该次气血固定增加 11 + floor(L × 0.3)，
                  法力固定增加 6 + floor(L × 0.1)，每一级分别向下取整后累加。
                </li>
              </ul>
              <p className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-blue-900">
                当前 {characterLevel} 级从 0 级起共升级 {characterUpgradeCount} 次；
                未分配潜力前五维各为 {fixedPrimaryAttribute} 点，可分配潜力共
                {" "}
                {totalPotentialPoints} 点。
              </p>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <h3 className="font-semibold text-slate-900">五维属性转换</h3>
              <p className="mt-1 text-xs text-slate-500">
                下表表示每增加 1 点对应五维，对其他面板属性产生的变化。
              </p>
              <div className="mt-3 overflow-x-auto">
                <table
                  className="min-w-[620px] w-full border-collapse text-center text-xs"
                  aria-label="五维属性转换规则"
                >
                  <thead>
                    <tr className="bg-slate-100 text-slate-600">
                      <th className="rounded-l-lg px-2 py-2 text-left font-medium">五维</th>
                      <th className="px-2 py-2 font-medium">气血</th>
                      <th className="px-2 py-2 font-medium">物攻</th>
                      <th className="px-2 py-2 font-medium">法攻</th>
                      <th className="px-2 py-2 font-medium">物防</th>
                      <th className="px-2 py-2 font-medium">法防</th>
                      <th className="rounded-r-lg px-2 py-2 font-medium">速度</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {PRIMARY_ATTRIBUTE_CONVERSION_ROWS.map((row) => (
                      <tr key={row.label}>
                        <th className="px-2 py-2 text-left font-medium text-slate-800">
                          {row.label}
                        </th>
                        <td className="px-2 py-2">{row.health}</td>
                        <td className="px-2 py-2">{row.physicalAttack}</td>
                        <td className="px-2 py-2">{row.magicAttack}</td>
                        <td className="px-2 py-2">{row.physicalDefense}</td>
                        <td className="px-2 py-2">{row.magicDefense}</td>
                        <td className="px-2 py-2">{row.speed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <h3 className="font-semibold text-slate-900">加成与取整顺序</h3>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>先按当前五维计算气血、物攻、法攻、物防、法防和速度。</li>
                <li>装备、魂器等额外五维按同一比例转换，再叠加直接固定属性。</li>
                <li>气血、物防、法防和速度的百分比加成在固定属性之后计算。</li>
                <li>内部保留完整精度，角色面板最终展示值统一向下取整。</li>
              </ol>
            </section>
          </div>
        </EditorDialog>
      )}
    </>
  );
};

export default CharacterCalculationScope;
