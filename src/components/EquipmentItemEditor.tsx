import type { EquipmentItem } from "../utils/equipmentAttributes";
import { isSeasonEquipmentSlot } from "../utils/equipmentAttributes";
import EquipmentAttributesSection from "./equipment/EquipmentAttributeSections";
import {
  EquipmentBaseAttributesSection,
  EquipmentStatusSection,
} from "./equipment/EquipmentCoreSections";
import {
  SeasonEquipmentEffectSection,
  StandardEquipmentSections,
} from "./equipment/EquipmentEffectSections";

type EquipmentItemEditorProps = {
  item: EquipmentItem;
  onChange: (item: EquipmentItem) => void;
};

const EquipmentItemEditor = ({ item, onChange }: EquipmentItemEditorProps) => {
  const sectionProps = { item, onChange };

  return (
    <div className="space-y-3">
      <EquipmentStatusSection {...sectionProps} />
      <EquipmentBaseAttributesSection {...sectionProps} />
      <EquipmentAttributesSection {...sectionProps} />
      {isSeasonEquipmentSlot(item.slot) ? (
        <SeasonEquipmentEffectSection {...sectionProps} />
      ) : (
        <StandardEquipmentSections {...sectionProps} />
      )}
    </div>
  );
};

export default EquipmentItemEditor;
