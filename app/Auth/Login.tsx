import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { Button, TextInput } from "react-native-paper";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
// 1. استيراد عميل سوبابيس من الملف الذي أنشأناه سابقاً
import { supabase } from "../../supabase"; // تأكد من مطابقة المسار الفعلي لملف supabase.ts في مشروعك
import {
  LAST_USER_ID_KEY,
  migrateLegacyProfileCache,
} from "../../profileService";
import { useAuthStore } from "../../store/useAuthStore";
import { Colors } from "../../Constants/Colors";
import {
  getBodyFont,
  getDisplayFont,
  getRowDirection,
  Radius,
  Spacing,
} from "../../Constants/Layout";
import { useThemeStore } from "../../store/useThemeStore";

const Login = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const mainColor = useThemeStore((state) => state.mainColor);
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const buttonTextColor = getContrastingTextColor(mainColor);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false); // حالة التحميل أثناء الاتصال بالسيرفر

  // 2. تعديل دالة تسجيل الدخول لتصبح asynchronous والاتصال بـ Supabase
  const handleLogin = async () => {
    if (!email || !password) {
      setError("يرجى ملء جميع الحقول");
      return;
    }
    if (password.length < 6) {
      setError("كلمة المرور يجب ان تكون على الاقل 6 حروف");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // إرسال الطلب لسوبابيس لتسجيل الدخول بكلمة المرور والبريد الإلكتروني
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email: email.trim(),
          password: password,
        },
      );

      if (authError) {
        // إذا حدث خطأ من السيرفر (مثل كلمة مرور خاطئة أو الحساب غير موجود)
        setError(authError.message);
      } else {
        if (data.session?.user) {
          try {
            await migrateLegacyProfileCache(data.session.user.id);
          } catch (migrationError) {
            console.log("تعذر ترحيل كاش الملف الشخصي القديم.", migrationError);
          }

          try {
            await AsyncStorage.setItem(LAST_USER_ID_KEY, data.session.user.id);
          } catch (storageError) {
            console.log("تعذر حفظ علامة تسجيل الدخول.", storageError);
          }

          useAuthStore.getState().setSession(data.session);
          useAuthStore.getState().setSessionStatus("valid");
        }

        router.replace("/");
      }
    } catch {
      setError("حدث خطأ غير متوقع أثناء الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* شعار ريشة الفخم في الأعلى لربط الهوية البصرية
      <Image 
        source={require("../../assets/images/icon.png")} // تأكد من مطابقة مسار أيقونة ريشة الجديدة بدون الكلمة العربية
        style={styles.logo}
        resizeMode="contain"
      /> */}

      <Text
        style={[
          styles.title,
          { color: theme.primary, fontFamily: getDisplayFont(isRTL) },
        ]}
      >
        تسجيل الدخول
      </Text>
      <Text
        style={[
          styles.subtitle,
          { color: theme.secondary, fontFamily: getBodyFont(isRTL) },
        ]}
      >
        الوصول الآمن لمذكراتك الذكية
      </Text>

      {/* حقل البريد الإلكتروني */}
      <TextInput
        label="البريد الالكتروني"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (error) setError("");
        }}
        mode="outlined"
        keyboardType="email-address"
        textContentType="emailAddress"
        autoCapitalize="none" // يمنع تكبير الحرف الأول تلقائياً في الإيميل لتجنب الأخطاء
        error={!!error}
        activeOutlineColor={mainColor}
        outlineColor={theme.borders}
        textColor={theme.primary}
        placeholderTextColor={theme.secondary}
        theme={{
          roundness: Radius.md,
          colors: {
            onSurfaceVariant: theme.secondary,
            background: theme.card,
          },
        }}
        style={styles.inputs}
        right={<TextInput.Icon icon="email" color={theme.secondary} />}
      />

      {/* حقل كلمة المرور */}
      <TextInput
        label="كلمة المرور"
        value={password}
        error={!!error}
        onChangeText={(text) => {
          setPassword(text);
          if (error) setError("");
        }}
        secureTextEntry={!showPassword}
        mode="outlined"
        activeOutlineColor={mainColor}
        outlineColor={theme.borders}
        textColor={theme.primary}
        placeholderTextColor={theme.secondary}
        theme={{
          roundness: Radius.md,
          colors: {
            onSurfaceVariant: theme.secondary,
            background: theme.card,
          },
        }}
        style={styles.inputs}
        right={
          <TextInput.Icon
            icon={showPassword ? "eye-off" : "eye"}
            color={theme.secondary}
            onPress={() => setShowPassword(!showPassword)}
          />
        }
      />

      {error && (
        <Text
          style={[
            styles.errorText,
            { color: theme.destructive, fontFamily: getBodyFont(isRTL) },
          ]}
        >
          {error}
        </Text>
      )}

      {/* زر تسجيل الدخول بلون الـ Teal المضيء (محدث ليدعم حالة التحميل) */}
      <TouchableOpacity
        onPress={handleLogin}
        style={[
          styles.login,
          { backgroundColor: mainColor, flexDirection: getRowDirection(isRTL) },
          loading && { opacity: 0.7 },
        ]}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={buttonTextColor} size="small" />
        ) : (
          <>
            <Image
              source={require("@/assets/images/user.png")}
              style={styles.loginIcon}
            />
            <Text
              style={[
                styles.loginText,
                {
                  color: buttonTextColor,
                  fontFamily: getBodyFont(isRTL),
                },
              ]}
            >
              تسجيل الدخول
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* زر الانتقال لإنشاء الحساب */}
      <Button
        mode="text"
        textColor={mainColor}
        onPress={() => router.replace("./Signup")}
        style={styles.New}
        labelStyle={{
          fontSize: 13,
          fontWeight: "600",
          fontFamily: getBodyFont(isRTL),
        }}
      >
        ليس لديك حساب؟ أنشئ حسابا جديدا
      </Button>
    </View>
  );
};

export default Login;

function getContrastingTextColor(hexColor: string) {
  const normalizedColor = hexColor.replace("#", "");
  const red = parseInt(normalizedColor.slice(0, 2), 16);
  const green = parseInt(normalizedColor.slice(2, 4), 16);
  const blue = parseInt(normalizedColor.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

  return luminance > 0.6 ? "#000000" : "#FFFFFF";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: Spacing.xxl,
    fontWeight: "500",
  },
  inputs: {
    width: "100%",
    maxWidth: 320,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: 12,
    alignSelf: "center",
    marginBottom: Spacing.md,
    fontWeight: "500",
  },
  login: {
    width: "100%",
    maxWidth: 320,
    height: 52,
    alignItems: "center",
    borderRadius: Radius.lg,
    justifyContent: "center",
    marginTop: Spacing.sm,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  loginIcon: {
    width: 18,
    height: 18,
    marginHorizontal: Spacing.sm,
  },
  loginText: {
    fontSize: 15,
    fontWeight: "700",
  },
  New: {
    marginTop: Spacing.sm,
  },
});
