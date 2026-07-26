import type { EquipmentItem, EquipmentSet } from "../utils/equipmentAttributes";
import { isSeasonEquipmentSlot } from "../utils/equipmentAttributes";
import EquipmentAttributesSection, {
  EquipmentIndependentAffixSection,
} from "./equipment/EquipmentAttributeSections";
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
  equipment: EquipmentSet;
  characterLevel: number;
  onChange: (item: EquipmentItem) => void;
};

const EquipmentItemEditor = ({
  item,
  equipment,
  characterLevel,
  onChange,
}: EquipmentItemEditorProps) => {
  const sectionProps = { item, onChange };

  return (
    <div className="space-y-3">
      <EquipmentStatusSection {...sectionProps} />
      <EquipmentBaseAttributesSection {...sectionProps} />
      <EquipmentAttributesSection {...sectionProps} />
      {isSeasonEquipmentSlot(item.slot) ? (
        <SeasonEquipmentEffectSection {...sectionProps} />
      ) : (
        <StandardEquipmentSections
          {...sectionProps}
          equipment={equipment}
          characterLevel={characterLevel}
        />
      )}
      <EquipmentIndependentAffixSection {...sectionProps} />
    </div>
  );
};

export default EquipmentItemEditor;
