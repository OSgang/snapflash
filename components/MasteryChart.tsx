import { View, Text, StyleSheet, useColorScheme, Image } from "react-native";
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";
import { Colors, SIZES } from "@/constants/theme";

interface MasteryChartProps {
    mastered: number;
    learning: number;
    total: number;
}

export default function MasteryChart({ mastered, learning, total }: MasteryChartProps) {
    const currentTheme = Colors[useColorScheme() ?? "light"];

    const size = 160;
    const strokeWidth = 16;
    const center = size / 2;
    const radius = size / 2 - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;

    const masteredPercent = (mastered / total) * 100;
    const learningPercent = (learning / total) * 100;

    const masteredStroke = circumference - (masteredPercent / 100) * circumference;
    const learningStroke = circumference - ((masteredPercent + learningPercent) / 100) * circumference;

    return (
        <View style={{ marginBottom: 30 }}>
            <Text style={[styles.subTitle, { color: currentTheme.mainText }]}>Word Mastery</Text>
            <View style={[styles.card, { backgroundColor: currentTheme.white, borderColor: currentTheme.border }]}>
                <View style={styles.chartContainer}>
                    <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
                        <Defs>
                            <SvgGradient id="gradMastered" x1="0%" y1="0%" x2="100%" y2="0%">
                                <Stop offset="0%" stopColor="#5AB0FF" />
                                <Stop offset="100%" stopColor={currentTheme.primary} />
                            </SvgGradient>
                        </Defs>

                        <Circle
                            cx={center}
                            cy={center}
                            r={radius}
                            stroke={currentTheme.customBackground}
                            strokeWidth={strokeWidth}
                            fill="none"
                        />
                        <Circle
                            cx={center}
                            cy={center}
                            r={radius}
                            stroke={currentTheme.statOrange}
                            strokeWidth={strokeWidth}
                            strokeDasharray={circumference}
                            strokeDashoffset={learningStroke}
                            strokeLinecap="round"
                            fill="none"
                        />
                        <Circle
                            cx={center}
                            cy={center}
                            r={radius}
                            stroke="url(#gradMastered)"
                            strokeWidth={strokeWidth}
                            strokeDasharray={circumference}
                            strokeDashoffset={masteredStroke}
                            strokeLinecap="round"
                            fill="none"
                        />
                    </Svg>
                    <View style={styles.centerContent}>
                        <Image
                            source={require("../assets/images/logo.png")}
                            style={styles.mascotImage}
                            resizeMode="contain"
                        />
                        <Text style={[styles.percentage, { color: currentTheme.mainText }]}>
                            {Math.round(masteredPercent)}%
                        </Text>
                    </View>
                </View>

                <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: currentTheme.primary }]} />
                        <Text style={[styles.legendText, { color: currentTheme.subText }]}>Mastered ({mastered})</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: currentTheme.statOrange as string }]} />
                        <Text style={[styles.legendText, { color: currentTheme.subText }]}>Learning ({learning})</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: currentTheme.customBackground as string }]} />
                        <Text style={[styles.legendText, { color: currentTheme.subText }]}>
                            New ({total - mastered - learning})
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    subTitle: { fontSize: SIZES.body1, fontWeight: "600", marginBottom: 15 },
    card: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        borderWidth: 1,
        borderRadius: 20,
        padding: 20,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    chartContainer: { position: "relative", justifyContent: "center", alignItems: "center" },
    centerContent: { position: "absolute", alignItems: "center", gap: 5 },
    mascotImage: { width: 60, height: 60 },
    percentage: { fontSize: 24, fontWeight: "bold" },
    legendContainer: { justifyContent: "center", gap: 12 },
    legendItem: { flexDirection: "row", alignItems: "center", gap: 8 },
    dot: { width: 12, height: 12, borderRadius: 6 },
    legendText: { fontSize: 13, fontWeight: "500" },
});
