import { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, SIZES } from "@/constants/theme";

interface AuthInputProps {
    label: string;
    placeholder?: string;
    isPassword?: boolean;
    value: string;
    onChangeText: (text: string) => void;
}

export default function AuthInput({ label, placeholder, isPassword, value, onChangeText }: AuthInputProps) {
    const currentTheme = Colors[useColorScheme() ?? "light"];
    const [isSecure, setIsSecure] = useState(isPassword);

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: currentTheme.primary }]}>{label}</Text>
            <View style={[styles.inputWrapper, { borderColor: currentTheme.primary }]}>
                <TextInput
                    style={[styles.input, { color: currentTheme.mainText }]}
                    placeholder={placeholder}
                    placeholderTextColor={currentTheme.subText}
                    secureTextEntry={isSecure}
                    value={value}
                    onChangeText={onChangeText}
                    autoCapitalize="none"
                />
                {isPassword && (
                    <TouchableOpacity onPress={() => setIsSecure(!isSecure)} style={styles.eyeIcon}>
                        <Ionicons
                            name={isSecure ? "eye-off-outline" : "eye-outline"}
                            size={20}
                            color={currentTheme.subText}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        width: "100%",
    },
    label: {
        fontSize: SIZES.body2,
        fontWeight: "bold",
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 15,
        height: 50,
    },
    input: {
        flex: 1,
        fontSize: SIZES.body1,
    },
    eyeIcon: {
        padding: 5,
    },
});
