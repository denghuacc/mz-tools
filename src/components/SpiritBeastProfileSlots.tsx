import {
  SPIRIT_BEAST_PROFILE_NAME_MAX_LENGTH,
  getDefaultSpiritBeastProfileName,
  normalizeSpiritBeastProfileName,
  type SpiritBeastProfileSlots as SpiritBeastProfileSlotValues,
} from "../utils/spiritBeastProfiles";
import ProfileSlots from "./ProfileSlots";

type SpiritBeastProfileSlotsProps = {
  slots: SpiritBeastProfileSlotValues;
  notice: string;
  onSave: (slotIndex: number, name: string) => void;
  onRestore: (slotIndex: number) => void;
};

/** 为通用存档栏补充灵兽面板的名称、说明和校验规则。 */
const SpiritBeastProfileSlots = ({
  slots,
  notice,
  onSave,
  onRestore,
}: SpiritBeastProfileSlotsProps) => (
  <ProfileSlots
    title="灵兽存档"
    details="保存灵兽等级、0 级五维、潜力方案、资质、成长、亲和和全部属性加成，仅保存在当前浏览器；清除网站数据或更换设备后会丢失。"
    slots={slots}
    notice={notice}
    nameMaxLength={SPIRIT_BEAST_PROFILE_NAME_MAX_LENGTH}
    getDefaultName={getDefaultSpiritBeastProfileName}
    normalizeName={normalizeSpiritBeastProfileName}
    onSave={onSave}
    onRestore={onRestore}
  />
);

export default SpiritBeastProfileSlots;
