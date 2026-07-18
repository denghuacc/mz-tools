import {
  ACCESSORY_VITALITY_EFFECT_VALUE,
  BASE_EQUIPMENT_EFFECT_LIMIT,
  EQUIPMENT_AFFINITY_EFFECT_OPTIONS,
  EQUIPMENT_AFFINITY_EFFECT_VALUE,
  EQUIPMENT_ATTRIBUTE_LABELS,
  EQUIPMENT_BASE_ATTRIBUTE_CONFIG,
  EQUIPMENT_PRIMARY_ATTRIBUTES,
  EQUIPMENT_SLOT_LABELS,
  canEnableBaseEquipmentEffect,
  getBaseEquipmentEffectIds,
} from "../../utils/equipmentAttributes";
import type {
  BaseEquipmentEffectId,
  EquipmentAffinityEffectAttribute,
  EquipmentItem,
  EquipmentPrimaryAttributeLine,
  SeasonEffectLevel,
} from "../../utils/equipmentAttributes";
import {
  EquipmentAttributeSelect,
  EquipmentAttributeValueInput,
  EquipmentEditorSection,
  EquipmentEffectToggle,
  EquipmentFieldLabel,
  equipmentEditorInputClassName,
} from "./EquipmentEditorFields";

type EquipmentSectionProps = {
  item: EquipmentItem;
  onChange: (item: EquipmentItem) => void;
};

const EquipmentGemSection = () => (
  <EquipmentEditorSection
    title="宝石"
    description="宝石类型、等级和成长的 20% 加成将在后续规则明确后接入。"
  >
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-400">
      暂未开放录入
    </div>
  </EquipmentEditorSection>
);

const EquipmentCastingSection = ({
  item,
  onChange,
}: EquipmentSectionProps) => (
  <EquipmentEditorSection
    title="铸灵属性"
    description="当前按截图中的实际铸灵数值直接相加。"
  >
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {EQUIPMENT_BASE_ATTRIBUTE_CONFIG[item.slot].map((attribute) => (
        <EquipmentAttributeValueInput
          key={attribute}
          label={`${EQUIPMENT_SLOT_LABELS[item.slot]}铸灵：${EQUIPMENT_ATTRIBUTE_LABELS[attribute]}`}
          value={item.castingAttributes[attribute] ?? 0}
          onChange={(value) =>
            onChange({
              ...item,
              castingAttributes: {
                ...item.castingAttributes,
                [attribute]: value,
              },
            })
          }
        />
      ))}
    </div>
  </EquipmentEditorSection>
);

const EquipmentSupportSection = ({
  item,
  onChange,
}: EquipmentSectionProps) => (
  <EquipmentEditorSection
    title="加持"
    description="加持额外增加一条属性，并计入每件基础装备最多两个特效的限制。"
  >
    <EquipmentEffectToggle
      checked={item.supportAttribute !== null}
      disabled={!canEnableBaseEquipmentEffect(item, "support")}
      onChange={(checked) =>
        onChange({
          ...item,
          supportAttribute: checked
            ? {
                attribute:
                  EQUIPMENT_PRIMARY_ATTRIBUTES.find(
                    (candidate) =>
                      !item.additionalPrimaryAttributes.some(
                        (line) => line.attribute === candidate
                      )
                  ) ?? "constitution",
                value: 0,
              }
            : null,
        })
      }
    >
      这件装备拥有加持
    </EquipmentEffectToggle>

    {item.supportAttribute ? (
      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_minmax(100px,0.7fr)] gap-3">
        <EquipmentAttributeSelect
          label={`${EQUIPMENT_SLOT_LABELS[item.slot]}：加持属性`}
          value={item.supportAttribute.attribute}
          options={EQUIPMENT_PRIMARY_ATTRIBUTES.map((attribute) => ({
            attribute,
            label: EQUIPMENT_ATTRIBUTE_LABELS[attribute],
            disabled: item.additionalPrimaryAttributes.some(
              (line) => line.attribute === attribute
            ),
          }))}
          onChange={(attribute) =>
            onChange({
              ...item,
              supportAttribute: {
                ...item.supportAttribute!,
                attribute:
                  attribute as EquipmentPrimaryAttributeLine["attribute"],
              },
            })
          }
        />
        <EquipmentAttributeValueInput
          label={`${EQUIPMENT_SLOT_LABELS[item.slot]}：加持数值`}
          value={item.supportAttribute.value}
          onChange={(value) =>
            onChange({
              ...item,
              supportAttribute: { ...item.supportAttribute!, value },
            })
          }
        />
      </div>
    ) : null}
  </EquipmentEditorSection>
);

const EquipmentEffectsSection = ({
  item,
  onChange,
}: EquipmentSectionProps) => {
  const configuredEffects = getBaseEquipmentEffectIds(item);
  const canEnable = (effect: BaseEquipmentEffectId) =>
    canEnableBaseEquipmentEffect(item, effect);

  return (
    <EquipmentEditorSection
      title="特效与特技"
      description="基础装备最多配置两个特效和一个特技；祝福按面板最终值记录，成长待宝石接入。"
    >
      <div className="mb-3 flex items-center justify-between gap-3 rounded-lg bg-blue-50/60 px-3 py-2 text-xs text-blue-800">
        <span>已配置特效</span>
        <strong>
          {configuredEffects.length} / {BASE_EQUIPMENT_EFFECT_LIMIT}
        </strong>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <EquipmentEffectToggle
          checked={item.blessing}
          disabled={!canEnable("blessing")}
          onChange={(checked) => onChange({ ...item, blessing: checked })}
        >
          祝福 · 属性按 +10 级生成
        </EquipmentEffectToggle>
        <EquipmentEffectToggle
          checked={item.growth}
          disabled={!canEnable("growth")}
          onChange={(checked) => onChange({ ...item, growth: checked })}
        >
          成长 · 宝石属性 +20%
        </EquipmentEffectToggle>

        {item.slot === "shoes" ? (
          <EquipmentEffectToggle
            wide
            checked={item.gale}
            disabled={!canEnable("gale")}
            onChange={(checked) => onChange({ ...item, gale: checked })}
          >
            疾风 · 最终速度 +3%
          </EquipmentEffectToggle>
        ) : null}

        {item.slot === "armor" ? (
          <EquipmentEffectToggle
            wide
            checked={item.affinityEffectAttribute !== null}
            disabled={!canEnable("affinity")}
            onChange={(checked) =>
              onChange({
                ...item,
                affinityEffectAttribute: checked ? "fireAffinity" : null,
              })
            }
          >
            系别亲和 · 对应亲和固定 +{EQUIPMENT_AFFINITY_EFFECT_VALUE}
          </EquipmentEffectToggle>
        ) : null}

        {item.slot === "accessory" ? (
          <EquipmentEffectToggle
            wide
            checked={item.vitalityEffect}
            disabled={!canEnable("vitality")}
            onChange={(checked) =>
              onChange({ ...item, vitalityEffect: checked })
            }
          >
            体魄 · 角色气血 +{ACCESSORY_VITALITY_EFFECT_VALUE}%
          </EquipmentEffectToggle>
        ) : null}
      </div>

      {item.slot === "armor" && item.affinityEffectAttribute ? (
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_minmax(100px,0.7fr)] items-end gap-3">
          <EquipmentAttributeSelect
            label="上衣：系别亲和"
            value={item.affinityEffectAttribute}
            options={EQUIPMENT_AFFINITY_EFFECT_OPTIONS}
            onChange={(attribute) =>
              onChange({
                ...item,
                affinityEffectAttribute:
                  attribute as EquipmentAffinityEffectAttribute,
              })
            }
          />
          <div className="rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2 text-sm text-amber-800">
            固定 +{EQUIPMENT_AFFINITY_EFFECT_VALUE} 点
          </div>
        </div>
      ) : null}

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label>
          <EquipmentFieldLabel>其它特效</EquipmentFieldLabel>
          <input
            type="text"
            aria-label={`${EQUIPMENT_SLOT_LABELS[item.slot]}：其它特效`}
            className={equipmentEditorInputClassName}
            value={item.specialEffect}
            disabled={!canEnable("custom")}
            placeholder="例如套装或属性特效"
            onChange={(event) =>
              onChange({ ...item, specialEffect: event.target.value })
            }
          />
        </label>
        <label>
          <EquipmentFieldLabel>特技</EquipmentFieldLabel>
          <input
            type="text"
            aria-label={`${EQUIPMENT_SLOT_LABELS[item.slot]}：特技`}
            className={equipmentEditorInputClassName}
            value={item.specialSkill}
            placeholder="功能型效果，不计入属性"
            onChange={(event) =>
              onChange({ ...item, specialSkill: event.target.value })
            }
          />
        </label>
      </div>

      <div className="mt-3">
        <EquipmentEffectToggle
          checked={item.specialEffectAttribute !== null}
          disabled={!canEnable("custom")}
          onChange={(checked) =>
            onChange({
              ...item,
              specialEffectAttribute: checked
                ? { attribute: "physicalAttack", value: 0 }
                : null,
            })
          }
        >
          其它特效提供属性
        </EquipmentEffectToggle>
      </div>

      {item.specialEffectAttribute ? (
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_minmax(100px,0.7fr)] gap-3">
          <EquipmentAttributeSelect
            label={`${EQUIPMENT_SLOT_LABELS[item.slot]}：特效属性`}
            value={item.specialEffectAttribute.attribute}
            onChange={(attribute) =>
              onChange({
                ...item,
                specialEffectAttribute: {
                  ...item.specialEffectAttribute!,
                  attribute,
                },
              })
            }
          />
          <EquipmentAttributeValueInput
            label={`${EQUIPMENT_SLOT_LABELS[item.slot]}：特效属性数值`}
            value={item.specialEffectAttribute.value}
            onChange={(value) =>
              onChange({
                ...item,
                specialEffectAttribute: {
                  ...item.specialEffectAttribute!,
                  value,
                },
              })
            }
          />
        </div>
      ) : null}
    </EquipmentEditorSection>
  );
};

export const StandardEquipmentSections = (props: EquipmentSectionProps) => (
  <>
    <EquipmentGemSection />
    <EquipmentCastingSection {...props} />
    <EquipmentSupportSection {...props} />
    <EquipmentEffectsSection {...props} />
  </>
);

export const SeasonEquipmentEffectSection = ({
  item,
  onChange,
}: EquipmentSectionProps) => (
  <EquipmentEditorSection
    title="神装特效"
    description="赛年神装最多配置一个独立特效，最高 5 级；具体效果后续补充。"
  >
    <div className="grid gap-3 sm:grid-cols-2">
      <label>
        <EquipmentFieldLabel>神装特效</EquipmentFieldLabel>
        <input
          type="text"
          aria-label={`${EQUIPMENT_SLOT_LABELS[item.slot]}：神装特效`}
          className={equipmentEditorInputClassName}
          value={item.specialEffect}
          placeholder="后续补充具体特效"
          onChange={(event) =>
            onChange({ ...item, specialEffect: event.target.value })
          }
        />
      </label>
      <label>
        <EquipmentFieldLabel>特效等级</EquipmentFieldLabel>
        <select
          aria-label={`${EQUIPMENT_SLOT_LABELS[item.slot]}：神装特效等级`}
          className={equipmentEditorInputClassName}
          value={item.seasonEffectLevel}
          onChange={(event) =>
            onChange({
              ...item,
              seasonEffectLevel: Number(event.target.value) as SeasonEffectLevel,
            })
          }
        >
          <option value={0}>未配置</option>
          {[1, 2, 3, 4, 5].map((level) => (
            <option key={level} value={level}>
              {level} 级
            </option>
          ))}
        </select>
      </label>
    </div>
    <p className="mt-3 rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2 text-xs leading-5 text-amber-800">
      赛年神装不能镶嵌宝石或铸灵，也没有祝福、加持、成长和特技。
    </p>
  </EquipmentEditorSection>
);
