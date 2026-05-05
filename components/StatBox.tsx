import { View, Text, StyleSheet } from "react-native";

interface StatBoxProps {
    label: string;
    number: string | number;
    desc: string;
    backgroundColor: string;
}

export default function StatBox({ label, number, desc, backgroundColor }: StatBoxProps) {
    return (
        <View style={[styles.statBox, { backgroundColor }]}>
            <View>
                <Text style={styles.statNumber}>{number}</Text>
                <Text style={styles.statLabel}>{label}</Text>
            </View>
            <Text style={styles.statDesc}>{desc}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    statBox: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        marginHorizontal: 5,
        justifyContent: "space-between",
    },
    statLabel: {
        color: "#FFF",
        fontSize: 13,
        opacity: 0.9,
        marginTop: 2,
    },
    statNumber: {
        color: "#FFF",
        fontSize: 24,
        fontWeight: "bold",
    },
    statDesc: {
        color: "#FFF",
        fontSize: 11,
        opacity: 0.8,
        marginTop: 4,
    },
});
