import {
  CHARACTER_PROFILE_NAME_MAX_LENGTH,
  getDefaultCharacterProfileName,
  normalizeCharacterProfileName,
  type CharacterProfileSlots as CharacterProfileSlotValues,
} from "../utils/characterProfiles";
import ProfileSlots from "./ProfileSlots";

type CharacterProfileSlotsProps = {
  slots: CharacterProfileSlotValues;
  notice: string;
  onSave: (slotIndex: number, name: string) => void;
  onRestore: (slotIndex: number) => void;
};

/** 为通用存档栏补充角色面板的名称、说明和校验规则。 */
const CharacterProfileSlots = ({
  slots,
  notice,
  onSave,
  onRestore,
}: CharacterProfileSlotsProps) => (
  <ProfileSlots
    title="角色存档"
    details="保存角色等级、八件装备和角色面板加成，仅保存在当前浏览器；清除网站数据或更换设备后会丢失。"
    slots={slots}
    notice={notice}
    nameMaxLength={CHARACTER_PROFILE_NAME_MAX_LENGTH}
    getDefaultName={getDefaultCharacterProfileName}
    normalizeName={normalizeCharacterProfileName}
    onSave={onSave}
    onRestore={onRestore}
  />
);

export default CharacterProfileSlots;
