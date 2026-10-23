export const FontFamily = {
  displayBold: "PlayfairDisplay-Bold",
  displaySemiBold: "PlayfairDisplay-SemiBold",
  displayMedium: "PlayfairDisplay-Medium",
  bodyRegular: "Inter-Regular",
  bodyMedium: "Inter-Medium",
  arabicRegular: "IBMPlexSansArabic-Regular",
  arabicBold: "IBMPlexSansArabic-Bold",
};

export const Typography = {
  displayLarge: {
    fontFamily: FontFamily.displayBold,
    fontSize: 42,
    lineHeight: 52,
    letterSpacing: -0.5,
  },
  displayMedium: {
    fontFamily: FontFamily.displaySemiBold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.3,
  },
  displaySmall: {
    fontFamily: FontFamily.displayMedium,
    fontSize: 24,
    lineHeight: 32,
  },
  bodyLarge: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 16,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    lineHeight: 16,
  },
  labelLarge: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 16,
    lineHeight: 20,
  },
  labelMedium: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14,
    lineHeight: 18,
  },
  labelSmall: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 12,
    lineHeight: 16,
  },
  arabicBody: {
    fontFamily: FontFamily.arabicRegular,
    fontSize: 16,
    lineHeight: 26,
  },
  arabicTitle: {
    fontFamily: FontFamily.arabicBold,
    fontSize: 20,
    lineHeight: 30,
  },
};
