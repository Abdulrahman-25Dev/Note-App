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
// 1. استيراد عميل سوبابيس من الملف الذي أنشأناه سابقاً
import { supabase } from "../../supabase"; // تأكد من مطابقة المسار الفعلي لملف supabase.ts في مشروعك
import * as WebBrowser from "expo-web-browser";

const Login = () => {
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
        // عند نجاح العملية، يتم توجيه المستخدم تلقائياً للصفحة الرئيسية
        router.replace("/");
      }
    } catch (e) {
      setError("حدث خطأ غير متوقع أثناء الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://hnadbzlgnyxfbpaaljap.supabase.co/auth/v1/callback",
      },
    });

    if (error) {
      console.error(error);
      return;
    }

    // فتح المتصفح ليقوم المستخدم بتسجيل الدخول
    const res = await WebBrowser.openAuthSessionAsync(data?.url ?? "");

    if (res.type === "success") {
      const { url } = res;
      // هنا سيتعامل Supabase مع الـ URL تلقائياً بسبب الإعدادات التي فعلناها
    }
  };

  return (
    <View style={styles.container}>
      {/* شعار ريشة الفخم في الأعلى لربط الهوية البصرية
      <Image 
        source={require("../../assets/images/icon.png")} // تأكد من مطابقة مسار أيقونة ريشة الجديدة بدون الكلمة العربية
        style={styles.logo}
        resizeMode="contain"
      /> */}

      <Text style={styles.title}>تسجيل الدخول</Text>
      <Text style={styles.subtitle}>الوصول الآمن لمذكراتك الذكية</Text>

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
        activeOutlineColor="#00B4D8"
        outlineColor="#1E293B"
        textColor="#F8FAFC"
        placeholderTextColor="#64748B"
        theme={{
          roundness: 14,
          colors: {
            onSurfaceVariant: "#64748B",
            background: "#0F172A",
          },
        }}
        style={styles.inputs}
        right={<TextInput.Icon icon="email" color="#64748B" />}
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
        activeOutlineColor="#00B4D8"
        outlineColor="#1E293B"
        textColor="#F8FAFC"
        placeholderTextColor="#64748B"
        theme={{
          roundness: 14,
          colors: {
            onSurfaceVariant: "#64748B",
            background: "#0F172A",
          },
        }}
        style={styles.inputs}
        right={
          <TextInput.Icon
            icon={showPassword ? "eye-off" : "eye"}
            color="#64748B"
            onPress={() => setShowPassword(!showPassword)}
          />
        }
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* زر تسجيل الدخول بلون الـ Teal المضيء (محدث ليدعم حالة التحميل) */}
      <TouchableOpacity
        onPress={handleLogin}
        style={[styles.login, loading && { opacity: 0.7 }]}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#020617" size="small" />
        ) : (
          <>
            <Image
              source={require("@/assets/images/user.png")}
              style={styles.loginIcon}
            />
            <Text style={styles.loginText}>تسجيل الدخول</Text>
          </>
        )}
      </TouchableOpacity>

      {/* زر الانتقال لإنشاء الحساب */}
      <Button
        mode="text"
        textColor="#00B4D8"
        onPress={() => router.replace("./Signup")}
        style={styles.New}
        labelStyle={{ fontSize: 13, fontWeight: "600" }}
      >
        ليس لديك حساب؟ أنشئ حسابا جديدا
      </Button>

      {/* الفاصل البصري الأنيق */}
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.or}>أو</Text>
        <View style={styles.divider} />
      </View>

      {/* أزرار التواصل الاجتماعي بالنمط المظلم الفخم */}
      <View style={styles.iconsContainer}>
        <TouchableOpacity
          style={styles.socialButton}
          onPress={handleGoogleSignIn}
        >
          <Image
            source={require("@/assets/images/google.png")}
            style={styles.socialIcon}
          />
          <Text style={styles.socialText}>المتابعة بواسطة Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton}>
          <Image
            source={require("@/assets/images/facebook.png")}
            style={styles.socialIcon}
          />
          <Text style={styles.socialText}>المتابعة بواسطة Facebook</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton}>
          <Image
            source={require("@/assets/images/twitter.png")}
            style={styles.socialIcon}
          />
          <Text style={styles.socialText}>المتابعة بواسطة Twitter/X</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#020617",
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
    shadowColor: "#00B4D8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#F8FAFC",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 24,
    color: "#64748B",
    fontWeight: "500",
  },
  inputs: {
    width: "100%",
    maxWidth: 320,
    marginBottom: 12,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    alignSelf: "center",
    marginBottom: 10,
    fontWeight: "500",
  },
  login: {
    flexDirection: "row",
    width: "100%",
    maxWidth: 320,
    height: 50,
    alignItems: "center",
    borderRadius: 14,
    justifyContent: "center",
    backgroundColor: "#00B4D8",
    marginTop: 8,
    shadowColor: "#00B4D8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  loginIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
    tintColor: "#020617",
  },
  loginText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#020617",
  },
  New: {
    marginTop: 10,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    width: "100%",
    maxWidth: 320,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#1E293B",
  },
  or: {
    marginHorizontal: 12,
    fontSize: 14,
    color: "#475569",
    fontWeight: "600",
  },
  iconsContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: 320,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    width: "100%",
    height: 48,
    backgroundColor: "#0F172A",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  socialIcon: {
    width: 22,
    height: 22,
    marginRight: 12,
  },
  socialText: {
    fontSize: 14,
    color: "#E2E8F0",
    fontWeight: "600",
  },
});
