import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  Animated, 
  Dimensions, 
  TouchableOpacity 
} from 'react-native';
import { Button } from 'react-native-paper';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: 'كل فكرة تستحق أن تُكتب...',
    subtext: 'ابدأ بتدوين ملاحظاتك بطريقة بسيطة وجميلة تناسب إبداعك وهويتك الفنية.',
    image: require('../assets/images/icon.png'), // الأيقونة الأسطورية لـ "ريشة"
  },
  {
    id: 2,
    title: 'تنظيم ذكي بالـ AI',
    subtext: 'دع ريشة يلخص نصوصك ويقترح لك الوسوم تلقائياً بالذكاء الاصطناعي ليوفر وقتك وجهدك.',
    image: require('../assets/images/ai.png'), // أيقونة الـ AI
  },
  {
    id: 3,
    title: 'ملاحظاتك آمنة في السحاب',
    subtext: 'مزامنة لحظية وفورية لحماية أفكارك والوصول إليها من أي جهاز بفضل قوة وسرعة Supabase.',
    image: require('../assets/images/cloud.png'), // أيقونة السحابة الذكية
  }
];

const Onboarding = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // قيم الأنيميشن للشفافية والحركة
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // دالة تشغيل الأنيميشن عند الانتقال
  const animateTransition = (nextIndex: number) => {
    // 1. إخفاء الشاشة الحالية
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      // 2. تغيير المحتوى في الـ State وهي مخفية
      setCurrentIndex(nextIndex);
      
      // تجهيز الشاشة الجديدة في موضع البداية (من اليمين)
      slideAnim.setValue(50);

      // 3. إظهار الشاشة الجديدة بنعومة
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
    });
  };

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      animateTransition(currentIndex + 1);
    } else {
      // حفظ حالة الإتمام والذهاب لصفحة تسجيل الدخول
      await AsyncStorage.setItem('onboarding', 'true');
      router.replace('../Auth/Login');
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('onboarding', 'true');
    router.replace('../Auth/Login');
  };

  const currentSlide = slides[currentIndex];

  return (
    <View style={styles.container}>
      {/* الخلفية المتدرجة المظلمة الفخمة */}
      <LinearGradient
        colors={['#09090B', '#18181B']}
        style={styles.background}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
      />

      {/* زر التخطي (يختفي تلقائياً في الشاشة الأخيرة للتركيز الكامل على البدء) */}
      {currentIndex < slides.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>تخطي</Text>
        </TouchableOpacity>
      )}

      {/* المحتوى المتحرك والمدعوم بالـ Animated */}
      <Animated.View 
        style={[
          styles.contentContainer, 
          { 
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }] 
          }
        ]}
      >
        <Image
          source={currentSlide.image}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.welcome}>{currentSlide.title}</Text>
        <Text style={styles.subtext}>{currentSlide.subtext}</Text>
      </Animated.View>

      {/* الجزء السفلي الثابت (مؤشرات الصفحات والزر) */}
      <View style={styles.footer}>
        {/* نقاط التتبع (Page Indicators) - تتمدد تلقائياً لـ 3 نقاط */}
        <View style={styles.indicatorContainer}>
          {slides.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.indicator, 
                currentIndex === index ? styles.activeIndicator : styles.inactiveIndicator
              ]} 
            />
          ))}
        </View>

        <Button
          mode="contained"
          style={styles.button}
          buttonColor="#00B4D8" // لون الـ Teal الفخم المعتمد لمعرض أعمالك
          textColor="#000000"
          labelStyle={styles.buttonText}
          onPress={handleNext}
        >
          {currentIndex === slides.length - 1 ? 'ابدأ الآن' : 'التالي'}
        </Button>
      </View>
    </View>
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    color: '#A1A1AA',
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 38,
    marginBottom: 40,
  },
  welcome: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#FFFFFF',
  },
  subtext: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 25,
    color: '#A1A1AA',
    paddingHorizontal: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  indicatorContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeIndicator: {
    width: 24,
    backgroundColor: '#00B4D8', // اللون المميز المعتمد
  },
  inactiveIndicator: {
    width: 8,
    backgroundColor: '#27272A',
  },
  button: {
    borderRadius: 25,
    elevation: 4,
    width: '100%',
    maxWidth: 300,
    paddingVertical: 4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});