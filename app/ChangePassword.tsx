import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import OTPTextInput from "react-native-otp-textinput";
import { Colors } from "../Constants/Colors";
import i18n from "../i18n/i18n";
import { useAlertStore } from "../store/useAlertStore";
import { useThemeStore } from "../store/useThemeStore";
import { supabase } from "../supabase"; // تأكد من أن هذا المسار يؤدي لملف سوبابيس الخاص بك

const ChangePassword = () => {
  // --- States ---
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useThemeStore();
  const mainColor = useThemeStore((state) => state.mainColor);

  const theme = isDarkMode ? Colors.dark : Colors.light;
  const isRTL = i18n.language === "ar";
  const { t } = useTranslation();
  const showAlert = useAlertStore((s) => s.showAlert);

  const otpInputRef = useRef<any>(null);
  // --- Handlers ---
  const handleSendEmail = async () => {
    if (!email.trim() || !email.includes("@")) {
      showAlert({ title: t("error"), message: t("validEmailRequired") });
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());

      if (error) throw error;

      showAlert({
        title: t("success"),
        message: "تم إرسال رمز التحقق إلى بريدك الإلكتروني",
      });
      setStep(2);
    } catch (error: any) {
      showAlert({
        title: t("error"),
        message:
          error.message || "حدث خطأ أثناء إرسال الرمز، تأكد من صحة البريد",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 8) {
      showAlert({ title: t("error"), message: t("validOtpRequired") });
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otpCode,
        type: "recovery",
      });

      if (error) throw error;

      setStep(3);
    } catch (error: any) {
      showAlert({
        title: t("error"),
        message: error.message || "رمز التحقق غير صحيح أو انتهت صلاحيته",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      showAlert({ title: t("error"), message: t("passwordMinLength") });
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert({ title: t("error"), message: t("passwordsNotMatch") });
      return;
    }

    try {
      setLoading(true);

      // 3. تحديث كلمة المرور في Supabase للمستخدم الحالي (صاحب الـ Session الموثقة بعد الـ OTP)
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      showAlert({
        title: t("success"),
        message: t("passwordChangedSuccess"),
        buttons: [
          {
            text: t("ok"),
            onPress: () => router.back(),
          },
        ],
      });
    } catch (error: any) {
      showAlert({
        title: t("error"),
        message:
          error.message || "حدث خطأ أثناء تحديث كلمة المرور، حاول مجدداً",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-forward" size={28} color={mainColor} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Step Indicator */}
        <View
          style={[
            styles.stepIndicatorContainer,
            { backgroundColor: theme.background },
          ]}
        >
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.stepWrapper}>
              <View
                style={[
                  styles.stepBadge,
                  step >= item && { backgroundColor: mainColor },
                ]}
              >
                <Text
                  style={[
                    styles.stepBadgeText,
                    { color: theme.secondary },
                    step >= item && styles.stepBadgeTextActive,
                  ]}
                >
                  {item}
                </Text>
              </View>
              {item < 3 && (
                <View
                  style={[
                    styles.stepLine,
                    { backgroundColor: theme.borders },
                    step > item && { backgroundColor: mainColor },
                  ]}
                />
              )}
            </View>
          ))}
        </View>

        {/* ----------------- الخطوة 1: البريد الإلكتروني ----------------- */}
        {step === 1 && (
          <View style={[styles.formCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.title, { color: theme.primary }]}>
              {t("resetPassword")}
            </Text>
            <Text style={[styles.subtitle, { color: theme.secondary }]}>
              {t("enterEmailToSendCode")}
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.borders,
                  color: theme.primary,
                },
              ]}
              placeholder={t("emailAddress")}
              placeholderTextColor={theme.secondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.button, { backgroundColor: mainColor }]}
              onPress={handleSendEmail}
            >
              <Text style={styles.buttonText}>
                {loading ? t("sending") : t("sendCode")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ----------------- الخطوة 2: رمز التحقق باستخدام react-native-otp-textinput ----------------- */}
        {step === 2 && (
          <View style={[styles.formCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.title, { color: theme.primary }]}>
              {t("verificationCode")}
            </Text>
            <Text style={[styles.subtitle, { color: theme.secondary }]}>
              {t("enterOtpSentTo")} {email}
            </Text>

            <View style={styles.otpContainer}>
              <OTPTextInput
                ref={otpInputRef}
                inputCount={8}
                handleTextChange={(text) => setOtpCode(text)}
                textInputStyle={
                  {
                    ...styles.otpInput,
                    backgroundColor: theme.card,
                    color: theme.primary,
                  } as any
                }
                tintColor={mainColor}
                offTintColor={theme.borders}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: mainColor }]}
              onPress={handleVerifyOTP}
            >
              <Text style={styles.buttonText}>
                {loading ? t("sending") : t("verifyCode")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setStep(1)}
            >
              <Text
                style={[styles.secondaryButtonText, { color: theme.secondary }]}
              >
                {t("changeEmail")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ----------------- الخطوة 3: كلمة المرور الجديدة ----------------- */}
        {step === 3 && (
          <View style={[styles.formCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.title, { color: theme.primary }]}>
              {t("newPassword")}
            </Text>
            <Text style={[styles.subtitle, { color: theme.secondary }]}>
              {t("createNewPassword")}
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.borders,
                  color: theme.primary,
                },
              ]}
              placeholder={t("newPassword")}
              placeholderTextColor={theme.secondary}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.borders,
                  color: theme.primary,
                },
              ]}
              placeholder={t("confirmPassword")}
              placeholderTextColor={theme.secondary}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <TouchableOpacity
              style={[styles.button, { backgroundColor: mainColor }]}
              onPress={handleResetPassword}
            >
              <Text style={styles.buttonText}>
                {loading ? t("sending") : t("savePassword")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    justifyContent: "center",
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
  position: 'absolute',
  top: Platform.OS === 'ios' ? 50 : 30, // 👈 مراعاة مسافة الـ Status Bar
  right: 16, // 👈 جهة اليمين لتناسب اللغة العربية
  zIndex: 10, // 👈 يضمن أن الزر فوق كل الطبقات وقابل للضغط
  padding: 8,
  borderRadius: 12,
},
  // Step Indicator
  stepIndicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  stepWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  stepBadgeText: {
    fontWeight: "bold",
  },
  stepBadgeTextActive: {
    color: "#FFF",
  },
  stepLine: {
    width: 40,
    height: 3,
    marginHorizontal: 4,
  },
  // Form Card
  formCard: {
    borderRadius: 16,
    padding: 24,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 16,
    textAlign: "right",
  },
  // OTP Styling الخاص بمكتبة react-native-otp-textinput
  otpContainer: {
    marginBottom: 24,
    flexDirection: "row",
    flexWrap: "wrap", // 👈 يسمح لنزول المربعات الزائدة للسطر الثاني
    justifyContent: "center",
    alignItems: "center",
    gap: 8, // 👈 مسافة متناسقة بين المربعات
  },
  otpInput: {
    width: 32, // 👈 تصغير العرض قليلاً لتناسب الشاشة
    height: 48,
    borderWidth: 1.5,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginHorizontal: 1, // إلغاء المارجن الافتراضي لأننا استخدمنا gap
  },
  // Buttons
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    marginTop: 12,
    alignItems: "center",
    paddingVertical: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
  },
});
