import {
  ACCESSORY_VITALITY_EFFECT_VALUE,
  BASE_EQUIPMENT_EFFECT_LIMIT,
  EQUIPMENT_AFFINITY_EFFECT_OPTIONS,
  EQUIPMENT_AFFINITY_EFFECT_VALUE,
  EQUIPMENT_ATTRIBUTE_LABELS,
  EQUIPMENT_BASE_ATTRIBUTE_CONFIG,
  EQUIPMENT_GEM_CONFIG,
  EQUIPMENT_GEM_SLOT_CONFIG,
  EQUIPMENT_PRIMARY_ATTRIBUTES,
  EQUIPMENT_SLOTS,
  EQUIPMENT_SLOT_LABELS,
  MAX_GEM_EQUIPMENT_COUNT,
  SEASON_EQUIPMENT_EFFECT_OPTIONS,
  calculateEquipmentGemBonus,
  canEnableBaseEquipmentEffect,
  getBaseEquipmentEffectIds,
  getGemLevelLimit,
  getSeasonEquipmentEffectOption,
} from "../../utils/equipmentAttributes";
import type {
  BaseEquipmentEffectId,
  EquipmentAffinityEffectAttribute,
  EquipmentGemType,
  EquipmentItem,
  EquipmentPrimaryAttributeLine,
  EquipmentSet,
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

type EquipmentGemSectionProps = EquipmentSectionProps & {
  equipment: EquipmentSet;
  characterLevel: number;
};

const EquipmentGemSection = ({
  item,
  equipment,
  characterLevel,
  onChange,
}: EquipmentGemSectionProps) => {
  const levelLimit = getGemLevelLimit(characterLevel);
  const gemBonus = calculateEquipmentGemBonus(item, characterLevel);
  const allowedGemTypes = EQUIPMENT_GEM_SLOT_CONFIG[item.slot];
  const getOtherEquipmentUseCount = (gemType: EquipmentGemType) =>
    EQUIPMENT_SLOTS.filter(
      (slot) => slot !== item.slot && equipment[slot].gem?.type === gemType
    ).length;

  return (
    <EquipmentEditorSection
      title="宝石"
      description={`每件装备只能选择一种部位允许的宝石；同种宝石最多用于 ${MAX_GEM_EQUIPMENT_COUNT} 个部位。`}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          <EquipmentFieldLabel>宝石类型</EquipmentFieldLabel>
          <select
            aria-label={`${EQUIPMENT_SLOT_LABELS[item.slot]}：宝石类型`}
            className={equipmentEditorInputClassName}
            value={item.gem?.type ?? ""}
            onChange={(event) => {
              const gemType = event.target.value as EquipmentGemType | "";
              onChange({
                ...item,
                gem: gemType
                  ? {
                      type: gemType,
                      level: Math.min(item.gem?.level ?? 1, levelLimit),
                      breakthrough: false,
                    }
                  : null,
              });
            }}
          >
            <option value="">未镶嵌</option>
            {allowedGemTypes.map((gemType) => {
              const config = EQUIPMENT_GEM_CONFIG[gemType];
              const disabled =
                item.gem?.type !== gemType &&
                getOtherEquipmentUseCount(gemType) >=
                  MAX_GEM_EQUIPMENT_COUNT;

              return (
                <option key={gemType} value={gemType} disabled={disabled}>
                  {config.label} · {EQUIPMENT_ATTRIBUTE_LABELS[config.attribute]} +
                  {config.baseValue}/级
                </option>
              );
            })}
          </select>
        </label>

        <label>
          <EquipmentFieldLabel>宝石等级</EquipmentFieldLabel>
          <select
            aria-label={`${EQUIPMENT_SLOT_LABELS[item.slot]}：宝石等级`}
            className={equipmentEditorInputClassName}
            value={item.gem?.level ?? 1}
            disabled={!item.gem}
            onChange={(event) =>
              onChange({
                ...item,
                gem: item.gem
                  ? {
                      ...item.gem,
                      level: Number(event.target.value),
                      breakthrough: false,
                    }
                  : null,
              })
            }
          >
            {Array.from({ length: levelLimit }, (_, index) => index + 1).map(
              (level) => (
                <option key={level} value={level}>
                  {level} 级
                </option>
              )
            )}
          </select>
        </label>
      </div>

      <div className="mt-3">
        <EquipmentEffectToggle
          checked={item.gem?.breakthrough ?? false}
          disabled={!item.gem || item.gem.level !== levelLimit}
          onChange={(breakthrough) =>
            onChange({
              ...item,
              gem: item.gem ? { ...item.gem, breakthrough } : null,
            })
          }
        >
          <span>
            <span className="block">突破 · 额外提升 1 级</span>
            <span className="mt-0.5 block text-[11px] text-slate-400">
              达到当前宝石等级上限后可用，突破消耗不计入属性计算。
            </span>
          </span>
        </EquipmentEffectToggle>
      </div>

      <p className="mt-3 rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2 text-xs leading-5 text-blue-800">
        角色 {characterLevel} 级，当前宝石上限 {levelLimit} 级
        {gemBonus
          ? `；${EQUIPMENT_GEM_CONFIG[gemBonus.type].label}（${
              gemBonus.breakthrough
                ? `${gemBonus.levelLimit}+1`
                : gemBonus.level
            } 级）提供${EQUIPMENT_ATTRIBUTE_LABELS[gemBonus.attribute]} +${
              gemBonus.value
            }`
          : "；尚未镶嵌宝石"}
        。
      </p>
    </EquipmentEditorSection>
  );
};

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
      description="基础装备最多配置两个特效和一个特技；祝福按面板最终值记录，成长增加 20% 宝石属性。"
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

export const StandardEquipmentSections = ({
  equipment,
  characterLevel,
  ...props
}: EquipmentGemSectionProps) => (
  <>
    <EquipmentGemSection
      {...props}
      equipment={equipment}
      characterLevel={characterLevel}
    />
    <EquipmentCastingSection {...props} />
    <EquipmentSupportSection {...props} />
    <EquipmentEffectsSection {...props} />
  </>
);

export const SeasonEquipmentEffectSection = ({
  item,
  onChange,
}: EquipmentSectionProps) => {
  const selectedEffect = getSeasonEquipmentEffectOption(item.specialEffect);

  return (
    <EquipmentEditorSection
      title="神装特效"
      description="当前仅收录面板属性特效；疾风神固每级增加 10 点速度。"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          <EquipmentFieldLabel>神装特效</EquipmentFieldLabel>
          <select
            aria-label={`${EQUIPMENT_SLOT_LABELS[item.slot]}：神装特效`}
            className={equipmentEditorInputClassName}
            value={selectedEffect?.effect ?? ""}
            onChange={(event) =>
              onChange({
                ...item,
                specialEffect: event.target.value,
                seasonEffectLevel: event.target.value
                  ? item.seasonEffectLevel || 1
                  : 0,
              })
            }
          >
            <option value="">未配置</option>
            {SEASON_EQUIPMENT_EFFECT_OPTIONS.map((effect) => (
              <option key={effect.effect} value={effect.effect}>
                {effect.effect}
              </option>
            ))}
          </select>
        </label>
        <label>
          <EquipmentFieldLabel>特效等级</EquipmentFieldLabel>
          <select
            aria-label={`${EQUIPMENT_SLOT_LABELS[item.slot]}：神装特效等级`}
            className={equipmentEditorInputClassName}
            disabled={!selectedEffect}
            value={selectedEffect ? item.seasonEffectLevel : 0}
            onChange={(event) =>
              onChange({
                ...item,
                seasonEffectLevel: Number(
                  event.target.value
                ) as SeasonEffectLevel,
              })
            }
          >
            <option value={0} disabled>
              请选择特效
            </option>
            {[1, 2, 3, 4, 5].map((level) => (
              <option key={level} value={level}>
                {level} 级
              </option>
            ))}
          </select>
        </label>
      </div>
      {selectedEffect && item.seasonEffectLevel > 0 ? (
        <p className="mt-3 rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2 text-xs leading-5 text-blue-800">
          当前提供速度 +
          {selectedEffect.valuePerLevel * item.seasonEffectLevel}。
        </p>
      ) : null}
      <p className="mt-3 rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2 text-xs leading-5 text-amber-800">
        戒指与项链的同名特效等级和达到 4 / 6 / 8 / 9 / 10
        时产生共鸣；套装属性暂无可靠数据，暂不计入计算。
      </p>
    </EquipmentEditorSection>
  );
};
