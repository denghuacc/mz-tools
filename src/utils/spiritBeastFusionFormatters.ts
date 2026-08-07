const fusionIntegerFormatter = new Intl.NumberFormat("zh-CN", {
  maximumFractionDigits: 0,
});

/** 将融合成长值统一展示为三位小数。 */
export const formatFusionGrowth = (value: number) => value.toFixed(3);

/** 使用中文数字分组格式展示融合次数与材料数量。 */
export const formatFusionInteger = (value: number) =>
  fusionIntegerFormatter.format(value);
