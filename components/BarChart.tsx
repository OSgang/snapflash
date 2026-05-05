import { useEffect, useRef, useMemo } from "react";
import { View, Text, StyleSheet, useColorScheme, Animated } from "react-native";
import { Colors, SIZES } from "@/constants/theme";

const AnimatedBar = ({ item, maxWords, currentTheme }: any) => {
    const heightAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const targetHeight = (item.words / Math.max(maxWords, 1)) * 130;
        Animated.timing(heightAnim, {
            toValue: targetHeight,
            duration: 600,
            useNativeDriver: false,
        }).start();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item.words, maxWords]);

    return (
        <View style={styles.barContainer}>
            <View style={styles.barWrapper}>
                <Animated.View
                    style={[
                        styles.bar,
                        {
                            height: heightAnim,
                            backgroundColor: item.isPrediction
                                ? "transparent"
                                : item.active
                                  ? currentTheme.primary
                                  : currentTheme.customBackground,
                            borderStyle: item.isPrediction ? "dashed" : "solid",
                            borderWidth: item.isPrediction ? 1 : 0,
                            borderColor: currentTheme.primary,
                            opacity: item.isPrediction ? 0.4 : 1,
                        },
                    ]}
                />
            </View>
            <Text style={[styles.barLabel, { color: currentTheme.subText }]}>{item.day}</Text>
        </View>
    );
};

export default function BarChart({ title, data, goalValue, expectedLabels }: any) {
    const currentTheme = Colors[useColorScheme() ?? "light"];

    const processedData = useMemo(() => {
        let result = [...data];

        if (expectedLabels && data.length > 0 && data.length < expectedLabels.length) {
            const avg = data.reduce((acc: number, curr: any) => acc + curr.words, 0) / data.length;

            const missingLabels = expectedLabels.slice(data.length);

            const predictions = missingLabels.map((label: string) => ({
                day: label,
                words: Math.round(avg * (0.9 + Math.random() * 0.2)),
                isPrediction: true,
                active: false,
            }));

            result = [...result, ...predictions];
        }
        return result;
    }, [data, expectedLabels]);

    const maxWords = Math.max(...processedData.map((d: any) => d.words), goalValue || 0);
    const goalLinePos = goalValue ? (goalValue / Math.max(maxWords, 1)) * 130 : 0;

    return (
        <View style={{ marginBottom: 30 }}>
            <Text style={[styles.subTitle, { color: currentTheme.mainText }]}>{title}</Text>
            <View style={[styles.chartCard, { backgroundColor: currentTheme.white, borderColor: currentTheme.border }]}>
                <View style={styles.chartRow}>
                    {goalValue > 0 && (
                        <View
                            style={[
                                styles.goalLine,
                                { bottom: goalLinePos + 22, borderColor: currentTheme.statOrange },
                            ]}
                        >
                            <View style={[styles.goalTag, { backgroundColor: currentTheme.statOrange }]}>
                                <Text style={styles.goalTagText}>Goal: {goalValue}</Text>
                            </View>
                        </View>
                    )}

                    {processedData.map((item: any, index: number) => (
                        <AnimatedBar key={index} item={item} maxWords={maxWords} currentTheme={currentTheme} />
                    ))}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    subTitle: { fontSize: SIZES.body1, fontWeight: "600", marginBottom: 15 },
    chartCard: { borderWidth: 1, borderRadius: 20, padding: 15, paddingTop: 45, elevation: 2 },
    chartRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        height: 160,
        position: "relative",
    },
    barContainer: { alignItems: "center", flex: 1 },
    barWrapper: { height: 130, justifyContent: "flex-end", alignItems: "center", width: "100%" },
    bar: { width: 12, borderRadius: 6, marginBottom: 10 },
    barLabel: { fontSize: 10, fontWeight: "500" },
    goalLine: { position: "absolute", left: 0, right: 0, borderTopWidth: 1, borderStyle: "dashed", zIndex: 1 },
    goalTag: { position: "absolute", right: -5, top: -10, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    goalTagText: { color: "#FFF", fontSize: 8, fontWeight: "bold" },
});
