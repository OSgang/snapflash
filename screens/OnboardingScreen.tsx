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
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const router = useRouter();

    const colorScheme = useColorScheme();
    const currentTheme = Colors[colorScheme ?? "light"];

    const [showSplash, setShowSplash] = useState(true);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start(() => {
                setShowSplash(false);
            });
        }, 1000);

        return () => clearTimeout(timer);
    }, [fadeAnim]);

    const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;
    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems[0]) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const handleDotPress = (index: number) => {
        flatListRef.current?.scrollToIndex({ index, animated: true });
    };

    const handleNext = () => {
        if (currentIndex < ONBOARDING_DATA.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
        } else {
            router.navigate("/login");
        }
    };

    const renderItem = ({ item }: { item: (typeof ONBOARDING_DATA)[0] }) => {
        return (
            <View style={styles.screenContainer}>
                <View style={styles.topCurveContainer}>
                    <View style={styles.curveWrapper}>
                        <LinearGradient
                            colors={[currentTheme.lightButton, currentTheme.background]}
                            style={styles.gradientCurve}
                        />
                    </View>

                    <View style={styles.iconContainer}>
                        <Image source={item.image} style={styles.slideImage} resizeMode="contain" />
                    </View>
                </View>

                <View style={styles.bottomContent}>
                    <Text style={[styles.slideTitle, { color: currentTheme.mainText }]}>{item.title}</Text>
                    <Text style={[styles.slideDescription, { color: currentTheme.subText }]}>{item.description}</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: currentTheme.white }]}>
            {showSplash && (
                <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim, zIndex: 10 }]}>
                    <LinearGradient
                        colors={[currentTheme.lightButton, currentTheme.background]}
                        style={[styles.screenContainer, { justifyContent: "center", alignItems: "center" }]}
                    >
                        <Image
                            source={require("../assets/images/logo.png")}
                            style={styles.mainLogo}
                            resizeMode="contain"
                        />
                        <Text style={[styles.welcomeTitle, { color: currentTheme.heading }]}>SnapFlash</Text>
                    </LinearGradient>
                </Animated.View>
            )}

            <FlatList
                ref={flatListRef}
                data={ONBOARDING_DATA}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                bounces={false}
                snapToInterval={width}
                snapToAlignment="center"
                decelerationRate="fast"
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
            />

            <View style={styles.footer}>
                <View style={styles.pagination}>
                    {ONBOARDING_DATA.map((_, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => handleDotPress(index)}
                            activeOpacity={0.7}
                            style={{ padding: 5 }}
                        >
                            <View
                                style={[
                                    styles.dot,
                                    currentIndex === index
                                        ? [styles.activeDot, { backgroundColor: currentTheme.primary }]
                                        : [styles.inactiveDot, { backgroundColor: currentTheme.border }],
                                ]}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.nextButton, { backgroundColor: currentTheme.lightButton }]}
                    onPress={handleNext}
                >
                    <Text style={[styles.nextButtonText, { color: currentTheme.primary }]}>Next</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    screenContainer: { width, height },
    mainLogo: { width: 250, height: 250, marginBottom: 20 },
    welcomeTitle: { fontSize: SIZES.h1, fontWeight: "bold" },
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
    gradientCurve: {
        flex: 1,
    },
    iconContainer: {
        zIndex: 2,
        elevation: 2,
        marginTop: 20,
    },
    slideImage: {
        width: 140,
        height: 140,
    },

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
    pagination: { flexDirection: "row", alignItems: "center" },
    dot: { height: 8, borderRadius: 4, marginHorizontal: 4 },
    activeDot: { width: 24 },
    inactiveDot: { width: 8 },
    nextButton: { paddingVertical: 12, paddingHorizontal: 30, borderRadius: SIZES.radius || 25 },
    nextButtonText: { fontSize: SIZES.body1, fontWeight: "bold" },
});
