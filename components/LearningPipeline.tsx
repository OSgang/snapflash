import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, useColorScheme, Animated } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Colors } from "@/constants/theme";

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface LearningPipelineProps {
    mastered: number;
    learning: number;
    newWords: number;
    retentionRate: number;
}

export default function LearningPipeline({ mastered, learning, newWords, retentionRate }: LearningPipelineProps) {
    const currentTheme = Colors[useColorScheme() ?? "light"];
    const total = mastered + learning + newWords;

    const radius = 40;
    const circumference = 2 * Math.PI * radius;

    const progressOffsetAnim = useRef(new Animated.Value(circumference)).current;
    const masteredFlexAnim = useRef(new Animated.Value(mastered)).current;
    const learningFlexAnim = useRef(new Animated.Value(learning)).current;
    const newFlexAnim = useRef(new Animated.Value(newWords)).current;

    useEffect(() => {
        const targetOffset = circumference - (retentionRate / 100) * (circumference / 2);

        Animated.parallel([
            Animated.timing(progressOffsetAnim, { toValue: targetOffset, duration: 500, useNativeDriver: false }),
            Animated.timing(masteredFlexAnim, { toValue: mastered, duration: 500, useNativeDriver: false }),
            Animated.timing(learningFlexAnim, { toValue: learning, duration: 500, useNativeDriver: false }),
            Animated.timing(newFlexAnim, { toValue: newWords, duration: 500, useNativeDriver: false }),
        ]).start();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mastered, learning, newWords, retentionRate]);

    return (
        <View style={styles.container}>
            <Text style={[styles.sectionTitle, { color: currentTheme.mainText }]}>Learning Journey</Text>

            <View style={[styles.card, { backgroundColor: currentTheme.white, borderColor: currentTheme.border }]}>
                <View style={styles.gaugeSection}>
                    <View style={styles.svgWrapper}>
                        <Svg width="100" height="60" viewBox="0 0 100 60">
                            <Path
                                d="M 10 50 A 40 40 0 0 1 90 50"
                                stroke={currentTheme.customBackground}
                                strokeWidth="8"
                                fill="none"
                                strokeLinecap="round"
                            />
                            <AnimatedPath
                                d="M 10 50 A 40 40 0 0 1 90 50"
                                stroke={currentTheme.primary}
                                strokeWidth="8"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={progressOffsetAnim}
                            />
                        </Svg>
                        <View style={styles.gaugeTextWrapper}>
                            <Text style={[styles.gaugeValue, { color: currentTheme.mainText }]}>{retentionRate}%</Text>
                        </View>
                    </View>
                    <Text style={[styles.gaugeLabel, { color: currentTheme.subText }]}>Retention Rate</Text>
                </View>

                <View style={styles.pipelineSection}>
                    <View style={styles.barLabelRow}>
                        <Text style={[styles.barLabel, { color: currentTheme.mainText }]}>Mastery Level</Text>
                        <Text style={[styles.totalText, { color: currentTheme.subText }]}>{total} words total</Text>
                    </View>

                    <View style={styles.stackedBar}>
                        <Animated.View
                            style={[
                                styles.barSegment,
                                { flex: masteredFlexAnim, backgroundColor: currentTheme.primary },
                            ]}
                        />
                        <Animated.View
                            style={[
                                styles.barSegment,
                                { flex: learningFlexAnim, backgroundColor: currentTheme.statOrange },
                            ]}
                        />
                        <Animated.View
                            style={[
                                styles.barSegment,
                                { flex: newFlexAnim, backgroundColor: currentTheme.customBackground },
                            ]}
                        />
                    </View>

                    <View style={styles.legendRow}>
                        <View style={styles.legendItem}>
                            <View style={[styles.dot, { backgroundColor: currentTheme.primary }]} />
                            <Text style={styles.legendText}>Mastered ({mastered})</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.dot, { backgroundColor: currentTheme.statOrange as string }]} />
                            <Text style={styles.legendText}>Learning ({learning})</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 25 },
    sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
    card: { padding: 16, borderRadius: 20, borderWidth: 1, flexDirection: "row", alignItems: "center" },
    gaugeSection: { alignItems: "center", paddingRight: 16, borderRightWidth: 1, borderRightColor: "#F0F0F0" },
    svgWrapper: { position: "relative", width: 100, height: 60, alignItems: "center" },
    gaugeTextWrapper: { position: "absolute", bottom: 0 },
    gaugeValue: { fontSize: 18, fontWeight: "800" },
    gaugeLabel: { fontSize: 11, fontWeight: "600", marginTop: 4 },
    pipelineSection: { flex: 1, paddingLeft: 16 },
    barLabelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 },
    barLabel: { fontSize: 14, fontWeight: "bold" },
    totalText: { fontSize: 11 },
    stackedBar: { height: 12, flexDirection: "row", borderRadius: 6, overflow: "hidden", backgroundColor: "#F0F0F0" },
    barSegment: { height: "100%" },
    legendRow: { flexDirection: "row", gap: 12, marginTop: 10 },
    legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { fontSize: 10, color: "#7C89AB", fontWeight: "500" },
});
