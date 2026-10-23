import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { TextInput } from "react-native-paper";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
// 1. استيراد عميل سوبابيس من ملف الإعداد الخاص بك
import { supabase } from "../../supabase"; // تأكد من مطابقة المسار الفعلي لملف supabase.ts
import { useAlertStore } from "../../store/useAlertStore";
import { Colors } from "../../Constants/Colors";
import {
  getBodyFont,
  getDisplayFont,
  getRowDirection,
  Radius,
  Spacing,
} from "../../Constants/Layout";
import { useThemeStore } from "../../store/useThemeStore";

const Signup = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const mainColor = useThemeStore((state) => state.mainColor);
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const buttonTextColor = getContrastingTextColor(mainColor);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showPassword1, setShowPassword1] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>(""); // حالة التحميل أثناء الاتصال بالسيرفر

  const showAlert = useAlertStore((s) => s.showAlert);

  // 2. تحديث الدالة لتتصل بـ Supabase سحابياً
  const handleSignup = async () => {
    if (!email || !password || !fullName) {
      setError("يرجى ملء جميع الحقول");
      return;
    } else if (password.length < 6) {
      setError("كلمة المرور يجب ان تكون على الاقل 6 حروف");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // محاولة تسجيل حساب جديد في سوبابيس
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) {
        // عرض الخطأ القادم من السيرفر (مثل إيميل مستخدم مسبقاً، إلخ)
        setError(signUpError.message);
      } else {
        if (data.user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert([
              {
                id: data.user.id,
                username: fullName,
                // يمكنك إضافة أي أعمدة أخرى إذا وجدت
              },
            ]);

          if (profileError) {
            console.error("خطأ في إنشاء البروفايل:", profileError.message);
          }
        }
        showAlert({
          title: "نجاح",
          message:
            "تم إنشاء الحساب بنجاح! إذا تطلب الأمر تفعيل البريد، يرجى مراجعة صندوق الوارد الخاص بك.",
        });
        // بعد نجاح التسجيل، نوجه المستخدم تلقائياً للواجهة الرئيسية أو شاشة الدخول
        router.replace("/");
      }
    } catch {
      setError("حدث خطأ أثناء الاتصال بالخادم، يرجى المحاولة لاحقاً");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text
        style={[
          styles.title,
          { color: theme.primary, fontFamily: getDisplayFont(isRTL) },
        ]}
      >
        إنشاء حساب جديد
      </Text>
      <Text
        style={[
          styles.subtitle,
          { color: theme.secondary, fontFamily: getBodyFont(isRTL) },
        ]}
      >
        انضم إلى عالم ريشة الذكي والآمن
      </Text>

      <View style={styles.inputContainer}>
        {/* حقل الاسم الكامل */}

        <TextInput
          label="اسم المستخدم"
          value={fullName}
          keyboardType="default"
          autoCapitalize="none" // منع تكبير الحرف الأول تلقائياً لتجنب مشاكل تسجيل الدخول
          onChangeText={(text) => {
            setFullName(text);
            if (error) setError("");
          }}
          style={styles.input}
          mode="outlined"
          activeOutlineColor={mainColor}
          outlineColor={theme.borders}
          textColor={theme.primary}
          placeholderTextColor={theme.tertiary}
          theme={{
            roundness: Radius.md,
            colors: {
              onSurfaceVariant: theme.secondary,
              background: theme.card,
            },
          }}
          right={<TextInput.Icon icon="account" color={theme.secondary} />}
        />
        <TextInput
          label="البريد الالكتروني"
          value={email}
          keyboardType="email-address"
          autoCapitalize="none" // منع تكبير الحرف الأول تلقائياً لتجنب مشاكل تسجيل الدخول
          onChangeText={(text) => {
            setEmail(text);
            if (error) setError("");
          }}
          style={styles.input}
          mode="outlined"
          activeOutlineColor={mainColor}
          outlineColor={theme.borders}
          textColor={theme.primary}
          placeholderTextColor={theme.tertiary}
          theme={{
            roundness: Radius.md,
            colors: {
              onSurfaceVariant: theme.secondary,
              background: theme.card,
            },
          }}
          placeholder="example@gmail.com"
          right={<TextInput.Icon icon="email" color={theme.secondary} />}
        />

        {/* حقل كلمة المرور */}
        <TextInput
          label="كلمة المرور"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (error) setError("");
          }}
          secureTextEntry={!showPassword1}
          style={styles.input}
          mode="outlined"
          activeOutlineColor={mainColor}
          outlineColor={theme.borders}
          textColor={theme.primary}
          placeholderTextColor={theme.tertiary}
          theme={{
            roundness: Radius.md,
            colors: {
              onSurfaceVariant: theme.secondary,
              background: theme.card,
            },
          }}
          right={
            <TextInput.Icon
              icon={showPassword1 ? "eye-off" : "eye"}
              color={theme.secondary}
              onPress={() => setShowPassword1(!showPassword1)}
            />
          }
        />
      </View>

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

      {/* زر تسجيل حساب جديد (يدعم حالة التحميل الآن) */}
      <TouchableOpacity
        style={[
          styles.SignupBtn,
          { backgroundColor: mainColor, flexDirection: getRowDirection(isRTL) },
          loading && { opacity: 0.7 },
        ]}
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={buttonTextColor} size="small" />
        ) : (
          <>
            <Image
              source={require("@/assets/images/signup.png")}
              style={styles.btnIcon}
            />
            <Text
              style={[
                styles.SignupText,
                { color: buttonTextColor, fontFamily: getBodyFont(isRTL) },
              ]}
            >
              إنشاء حساب
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* الانتقال لصفحة تسجيل الدخول */}
      <TouchableOpacity
        onPress={() => router.replace("/Auth/Login")}
        style={styles.backLogin}
      >
        <Text
          style={[
            styles.backLoginText,
            { color: mainColor, fontFamily: getBodyFont(isRTL) },
          ]}
        >
          لديك حساب بالفعل؟ تسجيل الدخول
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Signup;

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
    marginBottom: Spacing.xl,
    fontWeight: "500",
  },
  inputContainer: {
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  input: {
    width: "100%",
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: 12,
    alignSelf: "center",
    marginBottom: Spacing.sm,
    fontWeight: "500",
  },
  SignupBtn: {
    width: "100%",
    maxWidth: 320,
    height: 52,
    alignItems: "center",
    borderRadius: Radius.lg,
    justifyContent: "center",
    marginTop: Spacing.xs,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  btnIcon: {
    width: 18,
    height: 18,
    marginHorizontal: Spacing.sm,
  },
  SignupText: {
    fontSize: 15,
    fontWeight: "700",
  },
  backLogin: {
    marginTop: Spacing.md,
    padding: Spacing.xs,
  },
  backLoginText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
