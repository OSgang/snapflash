import { useState, useEffect } from "react";
import { Text, StyleSheet, useColorScheme, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/theme";
import AuthInput from "@/components/AuthInput";
import AuthButton from "@/components/AuthButton";
import AuthLayout from "@/components/AuthLayout";
import { AuthService } from "@/services/AuthService";
import * as SecureStore from "expo-secure-store";

export default function SignUpScreen() {
    const router = useRouter();
    const systemScheme = useColorScheme() ?? "light";
    const [activeMode, setActiveMode] = useState<"light" | "dark">("light");

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isLoading, setIsLoading] = useState(false);

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
    }, [systemScheme]);

    const currentTheme = Colors[activeMode];

    const handleSignUp = async () => {
        const Email = email.trim();
        const Username = username.trim();
        const Password = password.trim();
        const ConfirmPassword = confirmPassword.trim();

        if (!Email || !Username || !Password || !ConfirmPassword) {
            Alert.alert("Error", "Please fill in all required fields.");
            return;
        }

        if (Password !== ConfirmPassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }

        try {
            setIsLoading(true);
            await AuthService.register(Email, Username, Password);
            Alert.alert("Thành công", "Đăng ký tài khoản mới thành công!", [
                { text: "Đăng nhập ngay", onPress: () => router.replace("/login") },
            ]);
        } catch (error: any) {
            Alert.alert("Đăng ký thất bại", String(error));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout title="Create Account">
            <AuthInput label="Email" placeholder="Enter your email..." value={email} onChangeText={setEmail} />

            <AuthInput
                label="Username"
                placeholder="Enter your username..."
                value={username}
                onChangeText={setUsername}
            />

            <AuthInput
                label="Password"
                placeholder="Enter your password..."
                isPassword
                value={password}
                onChangeText={setPassword}
            />
            <AuthInput
                label="Re-enter Password"
                placeholder="Re-enter your password..."
                isPassword
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />

            <Text style={[styles.disclaimer, { color: currentTheme.subText }]}>
                By creating account you agree to our{"\n"}
                <Text style={{ fontWeight: "bold", color: currentTheme.mainText }}>terms and conditions</Text>
            </Text>

            <AuthButton
                title={isLoading ? "Loading..." : "Sign up"}
                onPress={handleSignUp}
                style={styles.mainBtn}
                // disabled={isLoading}
            />
        </AuthLayout>
    );
}

const styles = StyleSheet.create({
    disclaimer: { fontSize: 12, textAlign: "center", lineHeight: 18, marginVertical: 12 },
    mainBtn: { marginTop: 10, width: "100%" },
});
