import {
  SPIRIT_BEAST_DESTINY_SKILL_SLOT_COUNT,
  SPIRIT_BEAST_DESTINY_SKILL_LEVELS,
  SPIRIT_BEAST_DESTINY_SKILL_OPTIONS,
  createEmptySpiritBeastDestiny,
  createEmptySpiritBeastDestinySkill,
  getSpiritBeastDestinySkillValue,
} from "../utils/spiritBeastDestiny";
import type {
  SpiritBeastDestiny,
  SpiritBeastDestinyBirthSkill,
  SpiritBeastDestinySkill,
  SpiritBeastDestinySkillAttribute,
} from "../utils/spiritBeastDestiny";
import {
  AddAttributeLineButton,
  EquipmentEditorSection,
  RemoveAttributeLineButton,
  equipmentEditorInputClassName,
} from "./equipment/EquipmentEditorFields";
import ResetButton from "./ResetButton";

const SpiritBeastDestinySkillControl = ({
  slotIndex,
  skill,
  destiny,
  onChange,
  onRemove,
}: {
  slotIndex: number;
  skill: SpiritBeastDestinySkill;
  destiny: SpiritBeastDestiny;
  onChange: (skill: SpiritBeastDestinySkill) => void;
  onRemove: () => void;
}) => {
  const usedAttributes = new Set(
    destiny.skills
      .filter((_, index) => index !== slotIndex)
      .map(({ attribute }) => attribute)
      .filter(
        (attribute): attribute is SpiritBeastDestinySkillAttribute =>
          attribute !== null,
      ),
  );
  const skillLabel = `命技 ${slotIndex + 1}`;
  const skillAriaLabel = `命技${slotIndex + 1}`;
  const value = getSpiritBeastDestinySkillValue(skill);

  return (
    <fieldset className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
      <legend className="px-1 text-xs font-semibold text-slate-700">
        {skillLabel}
      </legend>
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1.35fr)_minmax(88px,0.65fr)_minmax(88px,0.65fr)_auto_36px] sm:items-end">
        <label>
          <span className="text-xs font-medium text-slate-600">面板属性</span>
          <select
            aria-label={`${skillAriaLabel}属性`}
            className={equipmentEditorInputClassName}
            value={skill.attribute ?? ""}
            onChange={(event) =>
              onChange({
                ...skill,
                attribute:
                  (event.target.value as SpiritBeastDestinySkillAttribute) ||
                  null,
              })
            }
          >
            <option value="">请选择属性</option>
            {SPIRIT_BEAST_DESTINY_SKILL_OPTIONS.map((option) => (
              <option
                key={option.attribute}
                value={option.attribute}
                disabled={usedAttributes.has(option.attribute)}
              >
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="text-xs font-medium text-slate-600">等级</span>
          <select
            aria-label={`${skillAriaLabel}等级`}
            className={equipmentEditorInputClassName}
            value={skill.level}
            disabled={!skill.attribute}
            onChange={(event) =>
              onChange({
                ...skill,
                level: Number(
                  event.target.value,
                ) as SpiritBeastDestinySkill["level"],
              })
            }
          >
            {SPIRIT_BEAST_DESTINY_SKILL_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level} 级
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="text-xs font-medium text-slate-600">品质</span>
          <select
            aria-label={`${skillAriaLabel}品质`}
            className={equipmentEditorInputClassName}
            value={skill.isMutated ? "mutated" : "normal"}
            disabled={!skill.attribute}
            onChange={(event) =>
              onChange({
                ...skill,
                isMutated: event.target.value === "mutated",
              })
            }
          >
            <option value="normal">普通</option>
            <option value="mutated">变异</option>
          </select>
        </label>

        <div className="pb-2 sm:min-w-16 sm:text-right">
          <span className="text-[11px] text-slate-400">加成</span>
          <strong
            className={`ml-2 text-sm sm:ml-0 sm:block ${
              skill.attribute ? "text-blue-600" : "text-slate-300"
            }`}
          >
            {skill.attribute ? `+${value}` : "—"}
          </strong>
        </div>
        <RemoveAttributeLineButton
          label={`删除${skillAriaLabel}`}
          onClick={onRemove}
        />
      </div>
    </fieldset>
  );
};

const SpiritBeastDestinyControl = ({
  destiny,
  spiritBeastLevel,
  onChange,
}: {
  destiny: SpiritBeastDestiny;
  spiritBeastLevel: number;
  onChange: (destiny: SpiritBeastDestiny) => void;
}) => (
  <div className="space-y-3" aria-label="灵兽命格配置">
    <div className="flex items-center gap-3 rounded-xl border border-orange-100 bg-orange-50/60 px-4 py-3">
      <p className="min-w-0 flex-1 text-pretty text-xs leading-5 text-orange-800">
        一个命格有 1 个本命技和 6
        个命技，但命技不一定影响面板。这里只添加实际面板命技，同一属性只能出现一次。
      </p>
      <div className="shrink-0">
        <ResetButton
          confirmationTitle="确认重置命格？"
          confirmationMessage="重置后将清除本命技和已添加的面板命技。"
          onConfirm={() => onChange(createEmptySpiritBeastDestiny())}
        />
      </div>
    </div>

    <EquipmentEditorSection
      title="本命技"
      description="当前仅记录会影响面板的“被动·神机妙算”；其它本命技选择“无面板影响”。"
    >
      <label className="block">
        <span className="text-xs font-medium text-slate-600">本命技效果</span>
        <select
          aria-label="本命技"
          className={equipmentEditorInputClassName}
          value={destiny.birthSkill}
          onChange={(event) =>
            onChange({
              ...destiny,
              birthSkill: event.target.value as SpiritBeastDestinyBirthSkill,
            })
          }
        >
          <option value="none">无面板影响 / 未记录</option>
          <option value="divineCalculation">
            被动·神机妙算（速度 -{spiritBeastLevel}）
          </option>
        </select>
      </label>
    </EquipmentEditorSection>

    <EquipmentEditorSection
      title="命技"
      description="只添加实际会增加面板属性的命技，最多 6 条；没有面板命技时无需添加。截图数值当前仍待复核。"
    >
      <div className="space-y-3">
        {destiny.skills.length > 0 ? (
          destiny.skills.map((skill, slotIndex) => (
            <SpiritBeastDestinySkillControl
              key={slotIndex}
              slotIndex={slotIndex}
              skill={skill}
              destiny={destiny}
              onChange={(nextSkill) =>
                onChange({
                  ...destiny,
                  skills: destiny.skills.map((currentSkill, index) =>
                    index === slotIndex ? nextSkill : currentSkill,
                  ),
                })
              }
              onRemove={() =>
                onChange({
                  ...destiny,
                  skills: destiny.skills.filter(
                    (_, index) => index !== slotIndex,
                  ),
                })
              }
            />
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-xs text-slate-400">
            尚未添加会影响面板的命技
          </p>
        )}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            已添加 {destiny.skills.length} /{" "}
            {SPIRIT_BEAST_DESTINY_SKILL_SLOT_COUNT}
          </span>
          {destiny.skills.length < SPIRIT_BEAST_DESTINY_SKILL_SLOT_COUNT ? (
            <AddAttributeLineButton
              onClick={() =>
                onChange({
                  ...destiny,
                  skills: [
                    ...destiny.skills,
                    createEmptySpiritBeastDestinySkill(),
                  ],
                })
              }
            >
              添加面板命技
            </AddAttributeLineButton>
          ) : null}
        </div>
      </div>
    </EquipmentEditorSection>
  </div>
);

export default SpiritBeastDestinyControl;
