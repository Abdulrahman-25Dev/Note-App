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
// 1. استيراد عميل سوبابيس من ملف الإعداد الخاص بك
import { supabase } from "../../supabase"; // تأكد من مطابقة المسار الفعلي لملف supabase.ts

import * as WebBrowser from "expo-web-browser";
const Signup = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showPassword1, setShowPassword1] = useState<boolean>(false);
  const [showPassword2, setShowPassword2] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>(""); // حالة التحميل أثناء الاتصال بالسيرفر

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
        options:{
          data: {
            full_name: fullName,
          },
        },
      }
    );

      if (signUpError) {
        // عرض الخطأ القادم من السيرفر (مثل إيميل مستخدم مسبقاً، إلخ)
        setError(signUpError.message);
      } else {
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: data.user.id, 
                username: fullName,
                // يمكنك إضافة أي أعمدة أخرى إذا وجدت
              }
            ]);

          if (profileError) {
            console.error("خطأ في إنشاء البروفايل:", profileError.message);
          }
        }
        alert(
          "تم إنشاء الحساب بنجاح! إذا تطلب الأمر تفعيل البريد، يرجى مراجعة صندوق الوارد الخاص بك.",
        );
        // بعد نجاح التسجيل، نوجه المستخدم تلقائياً للواجهة الرئيسية أو شاشة الدخول
        router.replace("/");
      }
    } catch (e) {
      setError("حدث خطأ أثناء الاتصال بالخادم، يرجى المحاولة لاحقاً");
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
      <Text style={styles.title}>إنشاء حساب جديد</Text>
      <Text style={styles.subtitle}>انضم إلى عالم ريشة الذكي والآمن</Text>

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
          placeholder="example@gmail.com"
          right={<TextInput.Icon icon="account" color="#64748B" />}
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
          placeholder="example@gmail.com"
          right={<TextInput.Icon icon="email" color="#64748B" />}
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
          placeholder="••••••••"
          right={
            <TextInput.Icon
              icon={showPassword1 ? "eye-off" : "eye"}
              color="#64748B"
              onPress={() => setShowPassword1(!showPassword1)}
            />
          }
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* زر تسجيل حساب جديد (يدعم حالة التحميل الآن) */}
      <TouchableOpacity
        style={[styles.SignupBtn, loading && { opacity: 0.7 }]}
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#020617" size="small" />
        ) : (
          <>
            <Image
              source={require("@/assets/images/signup.png")}
              style={styles.btnIcon}
            />
            <Text style={styles.SignupText}>إنشاء حساب</Text>
          </>
        )}
      </TouchableOpacity>

      {/* الانتقال لصفحة تسجيل الدخول */}
      <TouchableOpacity
        onPress={() => router.replace("/Auth/Login")}
        style={styles.backLogin}
      >
        <Text style={styles.backLoginText}>لديك حساب بالفعل؟ تسجيل الدخول</Text>
      </TouchableOpacity>

      {/* الخط الفاصل الفاخر */}
      <View style={styles.OrContainer}>
        <View style={styles.OrLine}></View>
        <Text style={styles.OrText}>أو</Text>
        <View style={styles.OrLine}></View>
      </View>

      {/* أزرار التواصل الاجتماعي */}
      <View style={styles.socialContainer}>
        <TouchableOpacity 
        onPress={handleGoogleSignIn}
        style={styles.socialBtn}>
          <Image
            source={require("@/assets/images/google.png")}
            style={styles.socialIcon}
          />
          <Text style={styles.socialText}>المتابعة بواسطة Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialBtn}>
          <Image
            source={require("@/assets/images/facebook.png")}
            style={styles.socialIcon}
          />
          <Text style={styles.socialText}>المتابعة بواسطة Facebook</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialBtn}>
          <Image
            source={require("@/assets/images/microsoft.png")}
            style={styles.socialIcon}
          />
          <Text style={styles.socialText}>المتابعة بواسطة Microsoft</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#020617",
    paddingHorizontal: 20,
  },
  logo: {
    width: 70,
    height: 70,
    marginBottom: 12,
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
    marginBottom: 20,
    color: "#64748B",
    fontWeight: "500",
  },
  inputContainer: {
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    marginBottom: 10,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    alignSelf: "center",
    marginBottom: 8,
    fontWeight: "500",
  },
  SignupBtn: {
    flexDirection: "row",
    width: "100%",
    maxWidth: 320,
    height: 50,
    alignItems: "center",
    borderRadius: 14,
    justifyContent: "center",
    backgroundColor: "#00B4D8",
    marginTop: 6,
    shadowColor: "#00B4D8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  btnIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
    tintColor: "#020617",
  },
  SignupText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#020617",
  },
  backLogin: {
    marginTop: 12,
    padding: 5,
  },
  backLoginText: {
    fontSize: 13,
    color: "#00B4D8",
    fontWeight: "600",
  },
  OrContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
    width: "100%",
    maxWidth: 320,
  },
  OrLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#1E293B",
  },
  OrText: {
    marginHorizontal: 12,
    color: "#475569",
    fontSize: 14,
    fontWeight: "600",
  },
  socialContainer: {
    width: "100%",
    maxWidth: 320,
  },
  socialBtn: {
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
