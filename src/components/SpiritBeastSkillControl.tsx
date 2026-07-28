import {
  SPIRIT_BEAST_AFFINITY_SKILL_IDS,
  createEmptySpiritBeastSkills,
} from "../utils/spiritBeastSkills";
import type {
  SpiritBeastCoreSkillId,
  SpiritBeastSkillSelection,
  SpiritBeastSkills,
} from "../utils/spiritBeastSkills";
import { EquipmentEditorSection } from "./equipment/EquipmentEditorFields";
import ResetButton from "./ResetButton";
import { SPIRIT_BEAST_AFFINITY_LABELS } from "./spiritBeastLabels";

const CORE_SKILL_OPTIONS: readonly {
  id: SpiritBeastCoreSkillId;
  label: string;
  normalEffect: string;
  advancedEffect: string;
}[] = [
  {
    id: "magicalPower",
    label: "威能",
    normalEffect: "灵 × 0.06 法攻",
    advancedEffect: "灵 × 0.1 法攻",
  },
  {
    id: "swiftness",
    label: "迅捷",
    normalEffect: "速度 +10%",
    advancedEffect: "速度 +20%",
  },
  {
    id: "slowness",
    label: "迟钝",
    normalEffect: "速度 -10%",
    advancedEffect: "速度 -20%",
  },
  {
    id: "robustness",
    label: "健壮",
    normalEffect: "气血 +15%",
    advancedEffect: "气血 +25%",
  },
  {
    id: "luckyStar",
    label: "吉星",
    normalEffect: "气血 +5%",
    advancedEffect: "气血 +10%",
  },
];

const SkillSelectionControl = ({
  label,
  normalLabel,
  advancedLabel,
  selection,
  normalEffect,
  advancedEffect,
  onChange,
}: {
  label: string;
  normalLabel: string;
  advancedLabel: string;
  selection: SpiritBeastSkillSelection;
  normalEffect: string;
  advancedEffect: string;
  onChange: (selection: SpiritBeastSkillSelection) => void;
}) => {
  const isNormalOverridden = selection.normal && selection.advanced;

  return (
    <fieldset className="min-w-0 rounded-lg border border-slate-200 bg-slate-50/60 p-3">
      <legend className="px-1 text-xs font-semibold text-slate-700">
        {label}
      </legend>
      <div className="space-y-2">
        <label
          className={`flex cursor-pointer items-start gap-2 rounded-md bg-white px-2.5 py-2 text-xs ${
            isNormalOverridden ? "text-slate-400" : "text-slate-700"
          }`}
        >
          <input
            type="checkbox"
            className="mt-0.5 size-4 shrink-0 accent-emerald-600"
            aria-label={normalLabel}
            checked={selection.normal}
            onChange={(event) =>
              onChange({ ...selection, normal: event.target.checked })
            }
          />
          <span>
            <strong className="font-medium">{normalLabel}</strong>
            <span className="ml-1.5">{normalEffect}</span>
            {isNormalOverridden ? (
              <span className="ml-1.5 font-medium text-amber-600">
                已被高级覆盖
              </span>
            ) : null}
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-2 rounded-md bg-white px-2.5 py-2 text-xs text-slate-700">
          <input
            type="checkbox"
            className="mt-0.5 size-4 shrink-0 accent-emerald-600"
            aria-label={advancedLabel}
            checked={selection.advanced}
            onChange={(event) =>
              onChange({ ...selection, advanced: event.target.checked })
            }
          />
          <span>
            <strong className="font-medium">{advancedLabel}</strong>
            <span className="ml-1.5">{advancedEffect}</span>
          </span>
        </label>
      </div>
    </fieldset>
  );
};

const SpiritBeastSkillControl = ({
  skills,
  onChange,
}: {
  skills: SpiritBeastSkills;
  onChange: (skills: SpiritBeastSkills) => void;
}) => (
  <div className="space-y-3" aria-label="灵兽面板技能配置">
    <div className="grid gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <p className="min-w-0 text-pretty text-xs leading-5 text-emerald-800">
        同名低级与高级技能同时存在时，仅高级生效；百分比技能按技能结算前的精确面板值计算。
      </p>
      <div className="justify-self-start sm:justify-self-end">
        <ResetButton
          confirmationTitle="确认重置面板技能？"
          confirmationMessage="重置后将清除威能、速度、气血和六系亲和技能选择。"
          onConfirm={() => onChange(createEmptySpiritBeastSkills())}
        />
      </div>
    </div>

    <EquipmentEditorSection
      title="面板技能"
      description="同名技能高级覆盖低级；不同技能之间，健壮与吉星的气血比例相加，迅捷与迟钝的速度比例相减。"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {CORE_SKILL_OPTIONS.map((skill) => (
          <SkillSelectionControl
            key={skill.id}
            label={skill.label}
            normalLabel={skill.label}
            advancedLabel={`高级${skill.label}`}
            selection={skills[skill.id]}
            normalEffect={skill.normalEffect}
            advancedEffect={skill.advancedEffect}
            onChange={(selection) =>
              onChange({ ...skills, [skill.id]: selection })
            }
          />
        ))}
      </div>
    </EquipmentEditorSection>

    <EquipmentEditorSection
      title="六系亲和技能"
      description="每种亲和独立选择：低级技能增加 15 点，高级技能增加 25 点。"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {SPIRIT_BEAST_AFFINITY_SKILL_IDS.map((affinity) => {
          const label = `${SPIRIT_BEAST_AFFINITY_LABELS[affinity]}亲和`;

          return (
            <SkillSelectionControl
              key={affinity}
              label={label}
              normalLabel={`低级${label}`}
              advancedLabel={`高级${label}`}
              selection={skills.affinities[affinity]}
              normalEffect={`${label} +15`}
              advancedEffect={`${label} +25`}
              onChange={(selection) =>
                onChange({
                  ...skills,
                  affinities: {
                    ...skills.affinities,
                    [affinity]: selection,
                  },
                })
              }
            />
          );
        })}
      </div>
    </EquipmentEditorSection>
  </div>
);

export default SpiritBeastSkillControl;
