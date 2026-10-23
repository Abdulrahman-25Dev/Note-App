export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 999,
};

export const getTextDirection = (isRTL: boolean) => (isRTL ? "right" : "left");

export const getRowDirection = (isRTL: boolean): "row" | "row-reverse" =>
  isRTL ? "row-reverse" : "row";

export const getBodyFont = (isRTL: boolean) =>
  isRTL ? "IBMPlexSansArabic-Regular" : "Inter-Regular";

export const getTitleFont = (isRTL: boolean) =>
  isRTL ? "IBMPlexSansArabic-Bold" : "PlayfairDisplay-SemiBold";

export const getDisplayFont = (isRTL: boolean) =>
  isRTL ? "IBMPlexSansArabic-Bold" : "PlayfairDisplay-Bold";
