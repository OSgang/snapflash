import { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Dimensions, PanResponder } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");
const SWIPE_THRESHOLD = width * 0.25;

const VOCAB_LIST = [
    {
        id: "1",
        word: "Capitalism",
        type: "Noun",
        definition:
            "an economic system in which a country's businesses and industry are controlled and run for profit by private owners rather than by the government",
    },
    {
        id: "2",
        word: "Incentive",
        type: "Noun",
        definition: "a thing that motivates or encourages one to do something.",
    },
    {
        id: "3",
        word: "Abolish",
        type: "Verb",
        definition: "formally put an end to (a system, practice, or institution).",
    },
    {
        id: "4",
        word: "Market",
        type: "Noun",
        definition:
            "a regular gathering of people for the purchase and sale of provisions, livestock, and other commodities.",
    },
];

export default function StudyScreen() {
    const currentTheme = Colors[useColorScheme() ?? "light"];
    const router = useRouter();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const isSwiping = useRef(false);

    const spin = useSharedValue(0);
    const swipeTranslateX = useSharedValue(0);
    const swipeOpacity = useSharedValue(0);
    const isRightSwipe = useSharedValue(true);

    const progressWidth = useSharedValue((1 / VOCAB_LIST.length) * 100);
    const endScreenOpacity = useSharedValue(0);

    useEffect(() => {
        const percent = (Math.min(currentIndex + 1, VOCAB_LIST.length) / VOCAB_LIST.length) * 100;
        progressWidth.value = withTiming(percent, { duration: 400 });

        if (currentIndex >= VOCAB_LIST.length) {
            endScreenOpacity.value = withTiming(1, { duration: 600 });
        } else {
            endScreenOpacity.value = 0;
        }
    }, [currentIndex]);

    const flipCard = () => {
        const isCurrentlyFlipped = spin.value > 90;
        spin.value = withSpring(isCurrentlyFlipped ? 0 : 180, { damping: 15, stiffness: 90 });
        setIsFlipped(!isCurrentlyFlipped);
    };

    const nextCard = () => {
        setCurrentIndex((prev) => prev + 1);
        swipeTranslateX.value = 0;
        swipeOpacity.value = 0;
        spin.value = 0;
        setIsFlipped(false);
    };

    const resetDeck = () => {
        setCurrentIndex(0);
    };

    const handleSwipe = (isRight: boolean) => {
        if (currentIndex >= VOCAB_LIST.length || isSwiping.current) return;

        isSwiping.current = true;
        isRightSwipe.value = isRight;
        swipeOpacity.value = withTiming(0.8, { duration: 150 });

        swipeTranslateX.value = withTiming(isRight ? width * 1.2 : -width * 1.2, { duration: 250 });

        setTimeout(() => {
            nextCard();
            isSwiping.current = false;
        }, 250);
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                if (isSwiping.current) return;
                swipeTranslateX.value = gestureState.dx;
                isRightSwipe.value = gestureState.dx > 0;
                swipeOpacity.value = Math.min(Math.abs(gestureState.dx) / (width * 0.4), 0.8);
            },
            onPanResponderRelease: (_, gestureState) => {
                if (isSwiping.current) return;

                if (gestureState.dx > SWIPE_THRESHOLD) {
                    handleSwipe(true);
                } else if (gestureState.dx < -SWIPE_THRESHOLD) {
                    handleSwipe(false);
                } else {
                    if (Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5) {
                        flipCard();
                    }
                    swipeTranslateX.value = withSpring(0);
                    swipeOpacity.value = withTiming(0);
                }
            },
        }),
    ).current;

    const progressAnimatedStyle = useAnimatedStyle(() => {
        return { width: `${progressWidth.value}%` };
    });

    const endScreenAnimatedStyle = useAnimatedStyle(() => {
        return { opacity: endScreenOpacity.value };
    });

    const frontAnimatedStyle = useAnimatedStyle(() => {
        const spinVal = interpolate(spin.value, [0, 180], [0, 180]);
        const opacityVal = interpolate(spin.value, [0, 89.9, 90, 180], [1, 1, 0, 0]);
        const zIndexVal = interpolate(spin.value, [0, 89.9, 90, 180], [1, 1, 0, 0]);
        return {
            transform: [{ perspective: 1500 }, { rotateY: `${spinVal}deg` }],
            opacity: opacityVal,
            zIndex: zIndexVal,
        };
    });

    const backAnimatedStyle = useAnimatedStyle(() => {
        const spinVal = interpolate(spin.value, [0, 180], [180, 360]);
        const opacityVal = interpolate(spin.value, [0, 89.9, 90, 180], [0, 0, 1, 1]);
        const zIndexVal = interpolate(spin.value, [0, 89.9, 90, 180], [0, 0, 1, 1]);
        return {
            transform: [{ perspective: 1500 }, { rotateY: `${spinVal}deg` }],
            opacity: opacityVal,
            zIndex: zIndexVal,
        };
    });

    const swipeWrapperStyle = useAnimatedStyle(() => {
        const rotate = interpolate(swipeTranslateX.value, [-width, 0, width], [-12, 0, 12]);
        return { transform: [{ translateX: swipeTranslateX.value }, { rotateZ: `${rotate}deg` }] };
    });

    const overlayStyle = useAnimatedStyle(() => {
        return {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: isRightSwipe.value ? "#4CAF50" : "#F44336",
            opacity: swipeOpacity.value,
            borderRadius: 24,
            zIndex: 100,
        };
    });

    const nextCardAnimatedStyle = useAnimatedStyle(() => {
        const scale = interpolate(swipeTranslateX.value, [-width, 0, width], [1, 0.94, 1], "clamp");
        const translateY = interpolate(swipeTranslateX.value, [-width, 0, width], [0, 15, 0], "clamp");
        const opacity = interpolate(swipeTranslateX.value, [-width, 0, width], [1, 0.6, 1], "clamp");
        return { transform: [{ scale }, { translateY }], opacity, zIndex: 5 };
    });

    const currentWord = VOCAB_LIST[currentIndex];
    const nextWord = VOCAB_LIST[currentIndex + 1];

    return (
        <LinearGradient colors={[currentTheme.customBackground as string, "#FFFFFF"]} style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <AntDesign name="arrow-left" size={28} color={currentTheme.mainText} />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <Text style={[styles.title, { color: currentTheme.mainText }]}>Vocabulary</Text>
                    <Text style={[styles.subtitle, { color: currentTheme.mainText }]}>You are doing great</Text>

                    <View style={styles.progressContainer}>
                        <Text style={[styles.progressText, { color: currentTheme.mainText }]}>
                            {Math.min(currentIndex + 1, VOCAB_LIST.length)} / {VOCAB_LIST.length}
                        </Text>
                        <View style={[styles.progressBarBg, { backgroundColor: currentTheme.border }]}>
                            <Animated.View
                                style={[
                                    styles.progressBarFill,
                                    { backgroundColor: currentTheme.primary },
                                    progressAnimatedStyle,
                                ]}
                            />
                        </View>
                    </View>

                    {currentIndex < VOCAB_LIST.length ? (
                        <>
                            <View style={styles.cardContainer}>
                                {nextWord && (
                                    <Animated.View
                                        style={[styles.card, { backgroundColor: "#92CEFF" }, nextCardAnimatedStyle]}
                                    >
                                        <View style={styles.cardInnerFront}>
                                            <AntDesign name="star" size={32} color="#000" style={styles.starIcon} />
                                            <View style={styles.centerContent}>
                                                <Text style={styles.cardWordFront}>{nextWord.word}</Text>
                                            </View>
                                            <Text style={styles.cardHintFront}>Tap to flip</Text>
                                        </View>
                                    </Animated.View>
                                )}

                                <Animated.View
                                    style={[styles.swipeWrapper, swipeWrapperStyle]}
                                    {...panResponder.panHandlers}
                                >
                                    <Animated.View
                                        style={[styles.card, frontAnimatedStyle, { backgroundColor: "#92CEFF" }]}
                                    >
                                        <Animated.View style={overlayStyle} pointerEvents="none" />
                                        <View style={styles.cardInnerFront}>
                                            <AntDesign name="star" size={32} color="#000" style={styles.starIcon} />
                                            <View style={styles.centerContent}>
                                                <Text style={styles.cardWordFront}>{currentWord.word}</Text>
                                            </View>
                                            <Text style={styles.cardHintFront}>Tap to flip</Text>
                                        </View>
                                    </Animated.View>

                                    <Animated.View
                                        style={[
                                            styles.card,
                                            styles.cardBack,
                                            backAnimatedStyle,
                                            { backgroundColor: "#3B548C" },
                                        ]}
                                    >
                                        <Animated.View style={overlayStyle} pointerEvents="none" />
                                        <View style={styles.cardInnerBack}>
                                            <AntDesign name="star" size={32} color="#FFF" style={styles.starIcon} />
                                            <View style={styles.cardBackContent}>
                                                <Text style={styles.cardBackType}>{currentWord.type}</Text>
                                                <Text style={styles.cardBackDef}>{currentWord.definition}</Text>
                                            </View>
                                            <Text style={styles.cardHintBack}>Tap to flip</Text>
                                        </View>
                                    </Animated.View>
                                </Animated.View>
                            </View>

                            <View style={styles.evalContainer}>
                                <TouchableOpacity
                                    style={[styles.evalBtn, { backgroundColor: "#FFE5E5" }]}
                                    activeOpacity={0.7}
                                    onPress={() => handleSwipe(false)}
                                >
                                    <AntDesign name="close" size={24} color="#F44336" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.evalBtn, { backgroundColor: "#E6FADC" }]}
                                    activeOpacity={0.7}
                                    onPress={() => handleSwipe(true)}
                                >
                                    <AntDesign name="check" size={24} color="#4CAF50" />
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <Animated.View style={[styles.endContainer, endScreenAnimatedStyle]}>
                            <View style={styles.trophyWrapper}>
                                <MaterialCommunityIcons name="trophy-award" size={80} color="#FFD700" />
                            </View>
                            <Text style={[styles.endTitle, { color: currentTheme.mainText }]}>Awesome!</Text>
                            <Text style={[styles.endSubtitle, { color: currentTheme.subText }]}>
                                Bạn đã học xuất sắc hết tất cả các từ trong list này.
                            </Text>
                            <TouchableOpacity
                                style={[styles.resetBtn, { backgroundColor: currentTheme.primary }]}
                                onPress={resetDeck}
                                activeOpacity={0.8}
                            >
                                <Feather name="rotate-ccw" size={18} color="#FFF" />
                                <Text style={styles.resetBtnText}>Học lại từ đầu</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )}
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 10 },
    content: { flex: 1, paddingHorizontal: 20 },

    title: { fontSize: 38, fontWeight: "bold", marginBottom: 5 },
    subtitle: { fontSize: 16, marginBottom: 25 },

    progressContainer: { marginBottom: 40 },
    progressText: { fontSize: 14, fontWeight: "bold", alignSelf: "flex-end", marginBottom: 8 },
    progressBarBg: { height: 8, borderRadius: 4, width: "100%", overflow: "hidden" },
    progressBarFill: { height: "100%", borderRadius: 4 },

    cardContainer: { alignItems: "center", justifyContent: "center", height: height * 0.48 },
    swipeWrapper: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center", zIndex: 10 },

    card: {
        width: width * 0.85,
        height: "100%",
        borderRadius: 24,
        backfaceVisibility: "hidden",
        position: "absolute",
    },
    cardBack: { top: 0 },

    starIcon: { position: "absolute", top: 20, right: 20, zIndex: 10 },

    cardInnerFront: { flex: 1, padding: 25, justifyContent: "space-between", alignItems: "center" },
    centerContent: { flex: 1, justifyContent: "center", alignItems: "center" },
    cardWordFront: { fontSize: 34, fontWeight: "900", color: "#000", textAlign: "center" },
    cardHintFront: { fontSize: 16, color: "#000", opacity: 0.7, marginBottom: 10 },

    cardInnerBack: { flex: 1, padding: 30, justifyContent: "space-between" },
    cardBackContent: { flex: 1, justifyContent: "center", alignItems: "flex-start" },
    cardBackType: { fontSize: 32, fontWeight: "bold", color: "#FFF", marginBottom: 10 },
    cardBackDef: { fontSize: 16, color: "#FFF", lineHeight: 26, fontWeight: "500" },
    cardHintBack: { fontSize: 16, color: "#FFF", opacity: 0.7, alignSelf: "center", marginBottom: 10 },

    evalContainer: { flexDirection: "row", justifyContent: "center", gap: 40, marginTop: 40 },
    evalBtn: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: "center",
        alignItems: "center",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },

    endContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingBottom: 60 },
    trophyWrapper: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#FFF9E6",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    endTitle: { fontSize: 28, fontWeight: "bold", marginBottom: 10 },
    endSubtitle: { fontSize: 16, textAlign: "center", paddingHorizontal: 30, lineHeight: 24, marginBottom: 30 },
    resetBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 30,
        elevation: 2,
    },
    resetBtnText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});
