import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from 'react-native';

type OnboardingSlide = {
  title: string;
  body: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
};

const slides: OnboardingSlide[] = [
  {
    title: 'Create Flashcards Instantly',
    body: 'Just scan a word that you wish to learn, SnapFlash will automatically create a flashcard for you.',
    icon: 'style',
  },
  {
    title: 'Study Smart',
    body: 'Optimize your learning with spaced repetition in SnapFlash.',
    icon: 'menu-book',
  },
  {
    title: 'Stay On Track',
    body: 'See how many words you have learned every day with SnapFlash.',
    icon: 'trending-up',
  },
];

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const slide = slides[activeIndex];
  const isLastSlide = activeIndex === slides.length - 1;

  function handleNext(event?: GestureResponderEvent) {
    event?.preventDefault();

    if (isLastSlide) {
      router.replace('/(tabs)');
      return;
    }

    setActiveIndex((current) => current + 1);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.heroPanel}>
          <MaterialIcons name={slide.icon} size={118} color={colors.ink} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.body}>{slide.body}</Text>
        </View>

        <View style={styles.footer}>
          <View
            accessibilityLabel={`Onboarding slide ${activeIndex + 1} of ${slides.length}`}
            style={styles.dots}>
            {slides.map((item, index) => (
              <View
                key={item.title}
                style={[styles.dot, index === activeIndex ? styles.activeDot : undefined]}
              />
            ))}
          </View>

          <Pressable
            accessibilityLabel={isLastSlide ? 'Get started' : 'Next onboarding slide'}
            accessibilityRole="button"
            onPress={handleNext}
            style={({ pressed }) => [styles.nextButton, pressed ? styles.pressed : undefined]}>
            <Text style={styles.nextButtonText}>{isLastSlide ? 'Get Started' : 'Next'}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const colors = {
  background: '#E4EBF7',
  lightButton: '#92CEFF',
  primary: '#4A30B9',
  active: '#2863D2',
  ink: '#111111',
  border: '#1A0E4F',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  screen: {
    flex: 1,
    width: '100%',
    maxWidth: 412,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  heroPanel: {
    height: '56%',
    marginHorizontal: -100,
    marginTop: -26,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 320,
    borderBottomRightRadius: 320,
    backgroundColor: colors.lightButton,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 8,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 40,
    gap: 24,
  },
  title: {
    color: colors.ink,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: 0,
  },
  body: {
    color: colors.ink,
    fontSize: 19,
    lineHeight: 27,
    fontWeight: '500',
    letterSpacing: 0,
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: 20,
    paddingBottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.lightButton,
  },
  activeDot: {
    width: 52,
    backgroundColor: colors.active,
  },
  nextButton: {
    minWidth: 136,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: colors.lightButton,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonText: {
    color: colors.primary,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: 0,
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
});
