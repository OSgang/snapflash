import { useState } from "react";
import { Text, StyleSheet, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/theme";
import AuthInput from "@/components/AuthInput";
import AuthButton from "@/components/AuthButton";
import AuthLayout from "@/components/AuthLayout";

export default function SignUpScreen() {
    const router = useRouter();
    const currentTheme = Colors[useColorScheme() ?? "light"];
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSignUp = () => {
        console.log("Đăng ký tài khoản:", email);
        router.replace("/(tabs)");
    };

    return (
        <AuthLayout title="Sign up">
            <AuthInput label="Email" placeholder="Enter your email..." value={email} onChangeText={setEmail} />
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
                <Text style={{ fontWeight: "bold" }}>terms and conditions</Text>
            </Text>

            <AuthButton title="Sign up" onPress={handleSignUp} style={styles.mainBtn} />
        </AuthLayout>
    );
}

const styles = StyleSheet.create({
    disclaimer: { fontSize: 12, textAlign: "center", lineHeight: 18, marginVertical: 12 },
    mainBtn: { marginTop: 10, width: "100%" },
});
