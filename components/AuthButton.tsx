import { TouchableOpacity, Text, StyleSheet, useColorScheme, ViewStyle } from "react-native";
import { Colors, SIZES } from "@/constants/theme";

interface AuthButtonProps {
    title: string;
    onPress: () => void;
    variant?: "primary" | "secondary";
    style?: ViewStyle;
}

export default function AuthButton({ title, onPress, variant = "primary", style }: AuthButtonProps) {
    const currentTheme = Colors[useColorScheme() ?? "light"];

    const backgroundColor = variant === "primary" ? currentTheme.primary : currentTheme.lightButton;
    const textColor = variant === "primary" ? currentTheme.white : currentTheme.primary;

    return (
        <TouchableOpacity style={[styles.button, { backgroundColor }, style]} onPress={onPress} activeOpacity={0.8}>
            <Text style={[styles.text, { color: textColor }]}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    text: {
        fontSize: SIZES.body1,
        fontWeight: "bold",
    },
});
