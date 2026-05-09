import { useState } from "react";
import { Text, StyleSheet, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/theme";
import AuthInput from "@/components/AuthInput";
import AuthButton from "@/components/AuthButton";
import AuthLayout from "@/components/AuthLayout";

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const currentTheme = Colors[useColorScheme() ?? "light"];
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const handleResetPassword = () => {
        console.log("Khôi phục mật khẩu cho:", email);
        router.back();
    };

    return (
        <AuthLayout title="Forgot password ?">
            <AuthInput label="Email" placeholder="Enter your email..." value={email} onChangeText={setEmail} />
            <AuthInput
                label="New Password"
                placeholder="Enter new password..."
                isPassword
                value={newPassword}
                onChangeText={setNewPassword}
            />
            <AuthInput
                label="Re-enter New Password"
                placeholder="Confirm new password..."
                isPassword
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
            />

            <Text style={[styles.disclaimer, { color: currentTheme.subText }]}>
                By resetting password you agree to our{"\n"}
                <Text style={{ fontWeight: "bold" }}>terms and conditions</Text>
            </Text>
            <AuthButton title="Reset password" onPress={handleResetPassword} style={styles.mainBtn} />
        </AuthLayout>
    );
}

const styles = StyleSheet.create({
    disclaimer: { fontSize: 12, textAlign: "center", lineHeight: 18, marginVertical: 12 },
    mainBtn: { marginTop: 10, width: "100%" },
});
