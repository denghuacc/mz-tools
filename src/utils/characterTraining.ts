import { createEmptyCharacterAttributeBonuses } from "./characterAttributes";
import type { CharacterAttributeBonuses } from "./characterAttributes";

export const CHARACTER_TRAINING_LEVEL_LIMIT = 12;

export type CharacterTrainingType =
  | "attack"
  | "physicalDefense"
  | "magicDefense";

export type CharacterTrainingLevelConfig = {
  level: number;
  breakthrough: boolean;
};

export type CharacterTrainingLevels = Record<
  CharacterTrainingType,
  CharacterTrainingLevelConfig
>;

export const createDefaultCharacterTrainingLevels =
  (): CharacterTrainingLevels => ({
    attack: { level: 1, breakthrough: false },
    physicalDefense: { level: 1, breakthrough: false },
    magicDefense: { level: 1, breakthrough: false },
  });

export const getEffectiveCharacterTrainingLevel = ({
  level,
  breakthrough,
}: CharacterTrainingLevelConfig): number => level + (breakthrough ? 1 : 0);

export const formatCharacterTrainingLevel = ({
  level,
  breakthrough,
}: CharacterTrainingLevelConfig): string =>
  breakthrough ? `${level}+1` : String(level);

/** 按当前等级线性累加三项人物修炼的已知面板属性。 */
export const calculateCharacterTrainingBonuses = (
  levels: CharacterTrainingLevels
): CharacterAttributeBonuses => {
  const bonuses = createEmptyCharacterAttributeBonuses();
  const attackLevel = getEffectiveCharacterTrainingLevel(levels.attack);
  const physicalDefenseLevel = getEffectiveCharacterTrainingLevel(
    levels.physicalDefense
  );
  const magicDefenseLevel = getEffectiveCharacterTrainingLevel(
    levels.magicDefense
  );

  bonuses.healingPower = attackLevel * 5;
  bonuses.sealHit = attackLevel * 2;
  bonuses.sealResistance = physicalDefenseLevel + magicDefenseLevel;

  return bonuses;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const normalizeCharacterTrainingLevel = (
  value: unknown
): CharacterTrainingLevelConfig => {
  if (!isRecord(value)) return { level: 1, breakthrough: false };

  const level =
    typeof value.level === "number" &&
    Number.isInteger(value.level) &&
    value.level >= 1 &&
    value.level <= CHARACTER_TRAINING_LEVEL_LIMIT
      ? value.level
      : 1;

  return {
    level,
    breakthrough:
      level === CHARACTER_TRAINING_LEVEL_LIMIT && value.breakthrough === true,
  };
};

/** 校验本地缓存；非法等级回退 1 级，未满 12 级时忽略突破状态。 */
export const normalizeCharacterTrainingLevels = (
  value: unknown
): CharacterTrainingLevels => {
  if (!isRecord(value)) return createDefaultCharacterTrainingLevels();

  return {
    attack: normalizeCharacterTrainingLevel(value.attack),
    physicalDefense: normalizeCharacterTrainingLevel(value.physicalDefense),
    magicDefense: normalizeCharacterTrainingLevel(value.magicDefense),
  };
};
