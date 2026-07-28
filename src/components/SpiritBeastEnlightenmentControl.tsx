import {
  SPIRIT_BEAST_ENLIGHTENMENT_QUALIFICATION_COUNT,
  SPIRIT_BEAST_ENLIGHTENMENT_STARS,
  createEmptySpiritBeastEnlightenment,
  getSpiritBeastEnlightenmentPrimaryCount,
  getSpiritBeastEnlightenmentPrimaryValueMaximum,
  getSpiritBeastEnlightenmentValidationError,
  normalizeSpiritBeastEnlightenment,
} from "../utils/spiritBeastEnlightenment";
import type {
  SpiritBeastEnlightenment,
  SpiritBeastEnlightenmentStar,
} from "../utils/spiritBeastEnlightenment";
import {
  SPIRIT_BEAST_PRIMARY_ATTRIBUTES,
  SPIRIT_BEAST_QUALIFICATIONS,
} from "../utils/spiritBeastAttributes";
import type {
  SpiritBeastPrimaryAttribute,
  SpiritBeastQualification,
} from "../utils/spiritBeastAttributes";
import {
  EquipmentEditorSection,
  EquipmentFieldLabel,
  equipmentEditorInputClassName,
} from "./equipment/EquipmentEditorFields";
import ResetButton from "./ResetButton";
import {
  SPIRIT_BEAST_PRIMARY_LABELS,
  SPIRIT_BEAST_QUALIFICATION_LABELS,
} from "./spiritBeastLabels";

const selectionButtonClassName = (isSelected: boolean) =>
  `min-h-9 rounded-lg border px-2 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-100 disabled:text-slate-300 ${
    isSelected
      ? "border-cyan-600 bg-cyan-600 text-white shadow-sm"
      : "border-slate-200 bg-white text-slate-600 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
  }`;

const SpiritBeastEnlightenmentControl = ({
  enlightenment,
  onChange,
}: {
  enlightenment: SpiritBeastEnlightenment;
  onChange: (enlightenment: SpiritBeastEnlightenment) => void;
}) => {
  const primaryCount = getSpiritBeastEnlightenmentPrimaryCount(
    enlightenment.star,
  );
  const validationError =
    getSpiritBeastEnlightenmentValidationError(enlightenment);

  const toggleQualification = (qualification: SpiritBeastQualification) => {
    const isSelected = enlightenment.qualificationBonuses.some(
      (line) => line.qualification === qualification,
    );

    onChange({
      ...enlightenment,
      qualificationBonuses: isSelected
        ? enlightenment.qualificationBonuses.filter(
            (line) => line.qualification !== qualification,
          )
        : enlightenment.qualificationBonuses.length <
            SPIRIT_BEAST_ENLIGHTENMENT_QUALIFICATION_COUNT
          ? [...enlightenment.qualificationBonuses, { qualification, value: 0 }]
          : enlightenment.qualificationBonuses,
    });
  };

  const togglePrimary = (attribute: SpiritBeastPrimaryAttribute) => {
    const isSelected = enlightenment.primaryBonuses.some(
      (line) => line.attribute === attribute,
    );

    onChange({
      ...enlightenment,
      primaryBonuses: isSelected
        ? enlightenment.primaryBonuses.filter(
            (line) => line.attribute !== attribute,
          )
        : enlightenment.star > 0 &&
            enlightenment.primaryBonuses.length < primaryCount
          ? [...enlightenment.primaryBonuses, { attribute, value: 0 }]
          : enlightenment.primaryBonuses,
    });
  };

  return (
    <div className="space-y-3" aria-label="仙府点化配置">
      <div className="flex items-center justify-between gap-4 rounded-xl border border-cyan-100 bg-cyan-50/60 px-4 py-3">
        <div>
          <p className="text-xs leading-5 text-cyan-900">
            资质上限受仙府配置综合影响，当前按游戏内实际加点录入；属性星级决定五维词条数量和数值范围。
          </p>
          {validationError ? (
            <p className="mt-1 text-xs font-medium text-rose-600">
              {validationError}
            </p>
          ) : null}
        </div>
        <ResetButton
          confirmationTitle="确认重置仙府点化？"
          confirmationMessage="重置后将清除点化星级、两项资质和全部五维属性。"
          onConfirm={() => onChange(createEmptySpiritBeastEnlightenment())}
        />
      </div>

      <EquipmentEditorSection
        title="属性加成星级"
        description="1～2 星出现 1 条、3～4 星出现 2 条、5 星出现 3 条五维属性。"
      >
        <label>
          <EquipmentFieldLabel>当前星级</EquipmentFieldLabel>
          <select
            aria-label="点化属性星级"
            className={equipmentEditorInputClassName}
            value={enlightenment.star}
            onChange={(event) =>
              onChange(
                normalizeSpiritBeastEnlightenment({
                  ...enlightenment,
                  star: Number(
                    event.target.value,
                  ) as SpiritBeastEnlightenmentStar,
                }),
              )
            }
          >
            <option value={0}>请选择星级</option>
            {SPIRIT_BEAST_ENLIGHTENMENT_STARS.map((star) => (
              <option key={star} value={star}>
                {star} 星
              </option>
            ))}
          </select>
        </label>
      </EquipmentEditorSection>

      <EquipmentEditorSection
        title="资质加成"
        description="从物攻、物防、气血、灵力和速度资质中选择 2 项不同资质，录入当前效果显示的实际点数。"
      >
        <div
          className="grid grid-cols-2 gap-1.5 sm:grid-cols-5"
          role="group"
          aria-label="仙府点化资质"
        >
          {SPIRIT_BEAST_QUALIFICATIONS.map((qualification) => {
            const isSelected = enlightenment.qualificationBonuses.some(
              (line) => line.qualification === qualification,
            );
            const isDisabled =
              enlightenment.star === 0 ||
              (!isSelected &&
                enlightenment.qualificationBonuses.length >=
                  SPIRIT_BEAST_ENLIGHTENMENT_QUALIFICATION_COUNT);

            return (
              <button
                key={qualification}
                type="button"
                aria-pressed={isSelected}
                disabled={isDisabled}
                className={selectionButtonClassName(isSelected)}
                onClick={() => toggleQualification(qualification)}
              >
                {SPIRIT_BEAST_QUALIFICATION_LABELS[qualification]}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-right text-xs text-slate-500">
          已选 {enlightenment.qualificationBonuses.length} /{" "}
          {SPIRIT_BEAST_ENLIGHTENMENT_QUALIFICATION_COUNT} 项
        </p>

        {enlightenment.qualificationBonuses.length > 0 ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {enlightenment.qualificationBonuses.map(
              ({ qualification, value }) => (
                <label key={qualification}>
                  <EquipmentFieldLabel>{`${SPIRIT_BEAST_QUALIFICATION_LABELS[qualification]}加成`}</EquipmentFieldLabel>
                  <input
                    type="number"
                    min={0}
                    max={9999}
                    step={1}
                    inputMode="numeric"
                    aria-label={`仙府点化：${SPIRIT_BEAST_QUALIFICATION_LABELS[qualification]}数值`}
                    className={equipmentEditorInputClassName}
                    value={value || ""}
                    placeholder="输入实际点数"
                    onChange={(event) => {
                      const nextValue =
                        event.target.value === ""
                          ? 0
                          : Number(event.target.value);
                      if (
                        !Number.isFinite(nextValue) ||
                        nextValue < 0 ||
                        nextValue > 9999
                      ) {
                        return;
                      }

                      onChange({
                        ...enlightenment,
                        qualificationBonuses:
                          enlightenment.qualificationBonuses.map((line) =>
                            line.qualification === qualification
                              ? { ...line, value: Math.floor(nextValue) }
                              : line,
                          ),
                      });
                    }}
                  />
                </label>
              ),
            )}
          </div>
        ) : null}
      </EquipmentEditorSection>

      <EquipmentEditorSection
        title="五维属性加成"
        description={
          enlightenment.star === 0
            ? "请先选择当前属性星级。"
            : `${enlightenment.star} 星需要选择 ${primaryCount} 条不同五维；按游戏内出现顺序选择，首条范围可能高于其余词条。`
        }
      >
        <div
          className="grid grid-cols-3 gap-1.5 sm:grid-cols-5"
          role="group"
          aria-label="仙府点化五维属性"
        >
          {SPIRIT_BEAST_PRIMARY_ATTRIBUTES.map((attribute) => {
            const isSelected = enlightenment.primaryBonuses.some(
              (line) => line.attribute === attribute,
            );
            const isDisabled =
              enlightenment.star === 0 ||
              (!isSelected &&
                enlightenment.primaryBonuses.length >= primaryCount);

            return (
              <button
                key={attribute}
                type="button"
                aria-pressed={isSelected}
                disabled={isDisabled}
                className={selectionButtonClassName(isSelected)}
                onClick={() => togglePrimary(attribute)}
              >
                {SPIRIT_BEAST_PRIMARY_LABELS[attribute]}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-right text-xs text-slate-500">
          已选 {enlightenment.primaryBonuses.length} / {primaryCount} 条
        </p>

        {enlightenment.primaryBonuses.length > 0 ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {enlightenment.primaryBonuses.map(
              ({ attribute, value }, lineIndex) => {
                const maximum = getSpiritBeastEnlightenmentPrimaryValueMaximum(
                  enlightenment.star,
                  lineIndex,
                );

                return (
                  <label key={attribute}>
                    <EquipmentFieldLabel>{`${lineIndex + 1}. ${SPIRIT_BEAST_PRIMARY_LABELS[attribute]}加成（1～${maximum}）`}</EquipmentFieldLabel>
                    <input
                      type="number"
                      min={1}
                      max={maximum}
                      step={1}
                      inputMode="numeric"
                      aria-label={`仙府点化：${SPIRIT_BEAST_PRIMARY_LABELS[attribute]}属性数值`}
                      className={equipmentEditorInputClassName}
                      value={value || ""}
                      placeholder={`1～${maximum}`}
                      onChange={(event) => {
                        const nextValue =
                          event.target.value === ""
                            ? 0
                            : Number(event.target.value);
                        if (
                          !Number.isFinite(nextValue) ||
                          nextValue < 0 ||
                          nextValue > maximum
                        ) {
                          return;
                        }

                        onChange({
                          ...enlightenment,
                          primaryBonuses: enlightenment.primaryBonuses.map(
                            (line) =>
                              line.attribute === attribute
                                ? { ...line, value: Math.floor(nextValue) }
                                : line,
                          ),
                        });
                      }}
                    />
                  </label>
                );
              },
            )}
          </div>
        ) : null}
      </EquipmentEditorSection>
    </div>
  );
};

export default SpiritBeastEnlightenmentControl;
