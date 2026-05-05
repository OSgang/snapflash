import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from "react-native";
import { MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import { Colors, SIZES } from "@/constants/theme";
import Animated, { LinearTransition, FadeIn } from "react-native-reanimated";

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface DeckCardProps {
    title: string;
    totalWords: number;
    learnedWords: number;
    timeAgo: string;
    variant?: "home" | "collection";
    isStarred?: boolean;
    onPress?: () => void;
    children?: React.ReactNode;
}

export default function DeckCard({
    title,
    totalWords,
    learnedWords,
    timeAgo,
    variant = "home",
    isStarred = false,
    onPress,
    children,
}: DeckCardProps) {
    const currentTheme = Colors[useColorScheme() ?? "light"];

    return (
        <AnimatedTouchableOpacity
            layout={LinearTransition.duration(200)}
            style={[styles.card, { backgroundColor: currentTheme.white, borderColor: currentTheme.border }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.headerRow}>
                <View style={styles.titleWrapper}>
                    <Text style={[styles.title, { color: currentTheme.mainText }]}>{title}</Text>
                    {isStarred && <AntDesign name="star" size={16} color="#FFD700" style={styles.starIcon} />}
                </View>
                <MaterialCommunityIcons
                    name={variant === "home" ? "chevron-right" : "dots-horizontal"}
                    size={22}
                    color={currentTheme.subText}
                />
            </View>

            <View style={styles.tagRow}>
                <View style={[styles.tag, { backgroundColor: currentTheme.tagBlueBg as string }]}>
                    <Text style={[styles.tagText, { color: currentTheme.tagBlueText as string }]}>
                        {totalWords} words
                    </Text>
                </View>

                <View style={[styles.tag, { backgroundColor: currentTheme.tagRedBg as string }]}>
                    <Text style={[styles.tagText, { color: currentTheme.tagRedText as string }]}>
                        {learnedWords} learned
                    </Text>
                </View>

                <View style={[styles.tag, { backgroundColor: currentTheme.tagGreenBg as string }]}>
                    <Text style={[styles.tagText, { color: currentTheme.tagGreenText as string }]}>{timeAgo}</Text>
                </View>
            </View>

            {children && (
                <Animated.View
                    entering={FadeIn.duration(200)}
                    style={[styles.expandedContent, { borderTopColor: currentTheme.border }]}
                >
                    {children}
                </Animated.View>
            )}
        </AnimatedTouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderRadius: 14,
        padding: 12,
        marginBottom: 10,
        overflow: "hidden",
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    titleWrapper: {
        flexDirection: "row",
        alignItems: "center",
    },
    title: {
        fontSize: SIZES.body1,
        fontWeight: "bold",
    },
    starIcon: {
        marginLeft: 6,
        marginTop: -2,
    },
    tagRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    tagText: { fontSize: 11, fontWeight: "600" },

    expandedContent: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
    },
});
