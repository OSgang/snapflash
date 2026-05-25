import { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Dimensions,
    TouchableOpacity,
    Image,
    useColorScheme,
    Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, SIZES } from "@/constants/theme";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";

const { width, height } = Dimensions.get("window");

const ONBOARDING_DATA = [
    {
        id: "1",
        title: "Create Flashcards\nInstantly",
        description:
            "Just scan a word that you wish to learn, SnapFlash will automatically create a flashcard for you.",
        image: require("../assets/images/onboardings/cards.png"),
    },
    {
        id: "2",
        title: "Study Smart",
        description: "Optimize your learning with spaced repetition in SnapFlash.",
        image: require("../assets/images/onboardings/research.png"),
    },
    {
        id: "3",
        title: "Stay On Track",
        description: "See how many words you have learned every day with SnapFlash.",
        image: require("../assets/images/onboardings/growth.png"),
    },
];

export default function OnboardingScreen() {
    const systemScheme = useColorScheme() ?? "light";
    const [activeMode, setActiveMode] = useState<"light" | "dark">("light");
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef<FlatList>(null);
    const router = useRouter();

    useEffect(() => {
        const syncTheme = async () => {
            const storedTheme = await SecureStore.getItemAsync("themePreference");
            if (storedTheme === "light" || storedTheme === "dark") {
                setActiveMode(storedTheme);
            } else {
                setActiveMode(systemScheme);
            }
        };
        syncTheme();
    }, [systemScheme]);

    const currentTheme = Colors[activeMode];

    const viewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems && viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const handleNext = () => {
        if (currentIndex < ONBOARDING_DATA.length - 1) {
            slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            router.replace("/login");
        }
    };

    const handleSkip = () => {
        router.replace("/login");
    };

    return (
        <View style={[styles.container, { backgroundColor: currentTheme.white }]}>
            <Animated.FlatList
                data={ONBOARDING_DATA}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                bounces={false}
                ref={slidesRef}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                    useNativeDriver: false,
                })}
                onViewableItemsChanged={viewableItemsChanged}
                viewabilityConfig={viewConfig}
                renderItem={({ item }) => (
                    <View style={[styles.slideContainer, { width }]}>
                        <View style={styles.topCurveContainer}>
                            <View style={styles.curveWrapper}>
                                <LinearGradient
                                    colors={activeMode === "dark" ? ["#1F325C", "#151718"] : ["#5B6CFF", "#E4EBF7"]}
                                    style={styles.gradientCurve}
                                />
                            </View>
                            <View style={styles.iconContainer}>
                                <Image source={item.image} style={styles.slideImage} resizeMode="contain" />
                            </View>
                        </View>

                        <View style={[styles.bottomContent, { backgroundColor: currentTheme.white }]}>
                            <Text style={[styles.slideTitle, { color: currentTheme.mainText }]}>{item.title}</Text>
                            <Text style={[styles.slideDescription, { color: currentTheme.subText }]}>
                                {item.description}
                            </Text>
                        </View>
                    </View>
                )}
            />

            <View style={styles.footer}>
                <TouchableOpacity onPress={handleSkip}>
                    <Text style={[styles.btnText, { color: currentTheme.subText }]}>Skip</Text>
                </TouchableOpacity>

                <View style={styles.indicatorContainer}>
                    {ONBOARDING_DATA.map((_, i) => {
                        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                        const dotWidth = scrollX.interpolate({
                            inputRange,
                            outputRange: [10, 22, 10],
                            extrapolate: "clamp",
                        });
                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.3, 1, 0.3],
                            extrapolate: "clamp",
                        });
                        return (
                            <Animated.View
                                key={i.toString()}
                                style={[
                                    styles.dot,
                                    {
                                        width: dotWidth,
                                        opacity,
                                        backgroundColor: currentTheme.primary,
                                    },
                                ]}
                            />
                        );
                    })}
                </View>

                <TouchableOpacity onPress={handleNext}>
                    <Text style={[styles.btnText, { color: currentTheme.primary, fontWeight: "bold" }]}>
                        {currentIndex === ONBOARDING_DATA.length - 1 ? "Get Started" : "Next"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    slideContainer: { flex: 1 },
    topCurveContainer: {
        height: height * 0.55,
        backgroundColor: "transparent",
        justifyContent: "center",
        alignItems: "center",
    },
    curveWrapper: {
        position: "absolute",
        top: 0,
        left: -width * 0.5,
        right: -width * 0.5,
        bottom: 0,
        borderBottomLeftRadius: width,
        borderBottomRightRadius: width,
        overflow: "hidden",
    },
    gradientCurve: { flex: 1 },
    iconContainer: { zIndex: 2, elevation: 2, marginTop: 20 },
    slideImage: { width: 140, height: 140 },
    bottomContent: { flex: 1, paddingHorizontal: 30, paddingTop: 40 },
    slideTitle: { fontSize: SIZES.h2, fontWeight: "bold", marginBottom: 15, lineHeight: 32 },
    slideDescription: { fontSize: SIZES.body1, lineHeight: 24 },
    footer: {
        position: "absolute",
        bottom: 50,
        left: 30,
        right: 30,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    btnText: { fontSize: 16 },
    indicatorContainer: { flexDirection: "row", gap: 8 },
    dot: { height: 10, borderRadius: 5 },
});
