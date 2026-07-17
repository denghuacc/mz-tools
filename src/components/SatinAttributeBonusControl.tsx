import SelectableAttributeBonusControl from "./SelectableAttributeBonusControl";
import type { SelectableBonusSelection } from "./SelectableAttributeBonusControl";

const SATIN_ATTRIBUTE_FIELDS = [
  { attribute: "physicalAttack", label: "物攻" },
  { attribute: "magicAttack", label: "法攻" },
  { attribute: "physicalDefense", label: "物防" },
  { attribute: "magicDefense", label: "法防" },
  { attribute: "speed", label: "速度" },
] as const;

export type SatinBonusAttribute =
  (typeof SATIN_ATTRIBUTE_FIELDS)[number]["attribute"];

export type SatinBonusSelection = SelectableBonusSelection<SatinBonusAttribute>;

type SatinAttributeBonusControlProps = {
  title: string;
  selections: readonly SatinBonusSelection[];
  onChange: (selections: readonly SatinBonusSelection[]) => void;
};

/** 录入一至两项缎纹直接属性，并在达到两项后阻止继续选择。 */
const SatinAttributeBonusControl = ({
  title,
  selections,
  onChange,
}: SatinAttributeBonusControlProps) => (
  <SelectableAttributeBonusControl
    title={title}
    description="从物攻、法攻、物防、法防、速度中选择一至两项，并填写实际数值。"
    groupLabel="缎纹属性选择"
    fields={SATIN_ATTRIBUTE_FIELDS}
    selections={selections}
    onChange={onChange}
  />
);

export default SatinAttributeBonusControl;
