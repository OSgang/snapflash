import { useState, useEffect } from "react";
import { Text, StyleSheet, useColorScheme, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/theme";
import AuthInput from "@/components/AuthInput";
import AuthButton from "@/components/AuthButton";
import AuthLayout from "@/components/AuthLayout";
import * as SecureStore from "expo-secure-store";

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const systemScheme = useColorScheme() ?? "light";
    const [activeMode, setActiveMode] = useState<"light" | "dark">("light");

    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    useEffect(() => {
        const syncTheme = async () => {
            const storedTheme = await SecureStore.getItemAsync("themePreference");
            if (storedTheme === "light" || storedTheme === "dark") {
                setActiveMode(storedTheme);
            } else {
                setActiveMode(systemScheme);
            }
        };
        syncTheme();

        Alert.alert("Notice", "The Forgot Password feature is currently under development!", [
            { text: "OK", onPress: () => router.back() },
        ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [systemScheme]);

    const currentTheme = Colors[activeMode];

    const handleResetPassword = () => {};

    return (
        <AuthLayout title="Forgot password ?">
            <AuthInput label="Email" placeholder="Enter your email" value={email} onChangeText={setEmail} />
            <AuthInput
                label="New Password"
                placeholder="Enter new password"
                isPassword
                value={newPassword}
                onChangeText={setNewPassword}
            />
            <AuthInput
                label="Re-enter New Password"
                placeholder="Confirm new password"
                isPassword
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
            />

            <Text style={[styles.disclaimer, { color: currentTheme.subText }]}>
                By resetting password you agreed to our{"\n"}
                <Text style={{ fontWeight: "bold", color: currentTheme.mainText }}>terms and conditions</Text>
            </Text>
            <AuthButton title="Reset password" onPress={handleResetPassword} style={styles.mainBtn} />
        </AuthLayout>
    );
}

const styles = StyleSheet.create({
    disclaimer: { fontSize: 12, textAlign: "center", lineHeight: 18, marginVertical: 12 },
    mainBtn: { marginTop: 10, width: "100%" },
});
