import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";

interface SummaryCardProps {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    color?: string;
}

export default function SummaryCard({ label, value, icon, color }: SummaryCardProps) {
    const currentTheme = Colors["light"];

    return (
        <View style={[styles.card, { backgroundColor: color || currentTheme.lightButton }]}>
            <View style={styles.content}>
                {icon && <View style={styles.iconWrapper}>{icon}</View>}
                <View>
                    <Text style={[styles.value, { color: currentTheme.primary }]}>{value}</Text>
                    <Text style={[styles.label, { color: currentTheme.subText }]}>{label}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        height: 80,
        borderRadius: 16,
        paddingHorizontal: 15,
        justifyContent: "center",
        marginHorizontal: 6,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconWrapper: {
        marginRight: 12,
    },
    value: {
        fontSize: 20,
        fontWeight: "bold",
    },
    label: {
        fontSize: 12,
        fontWeight: "500",
    },
});
