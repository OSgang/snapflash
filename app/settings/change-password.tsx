import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    useColorScheme,
    Modal
} from "react-native";

import { useRouter } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import MainLayout from "@/components/MainLayout";
import { Colors } from "@/constants/theme";
import { AuthService } from "@/services/AuthService"; 

// ==========================================
// ĐÃ SỬA: ĐƯA PASSWORD INPUT RA NGOÀI COMPONENT CHÍNH
// ==========================================
const PasswordInput = ({
    label,
    value,
    onChangeText,
    showPassword,
    setShowPassword,
    placeholder,
}: any) => {
    // Đem hook useColorScheme vào đây để nó tự lấy theme
    const currentTheme = Colors[useColorScheme() ?? "light"];

    return (
        <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: currentTheme.subText }]}>
                {label}
            </Text>

            <View
                style={[
                    styles.inputContainer,
                    {
                        backgroundColor: currentTheme.white,
                        borderColor: currentTheme.border,
                    },
                ]}
            >
                <Feather
                    name="lock"
                    size={20}
                    color={currentTheme.subText}
                    style={styles.inputIcon}
                />

                <TextInput
                    style={[styles.input, { color: currentTheme.mainText }]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={currentTheme.subText}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                />

                <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.4}
                >
                    <Feather
                        name={showPassword ? "eye" : "eye-off"}
                        size={20}
                        color={currentTheme.subText}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};
// ==========================================

export default function ChangePasswordScreen() {
    const router = useRouter();
    const currentTheme = Colors[useColorScheme() ?? "light"];

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [isAlertVisible, setIsAlertVisible] = useState(false);
    const [alertContent, setAlertContent] = useState<{title: string; message: string; onOk?: () => void}>({ title: "", message: "" });

    const showAlert = (title: string, message: string, onOk?: () => void) => {
        setAlertContent({ title, message, onOk });
        setIsAlertVisible(true);
    };

    const handleUpdatePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            showAlert("Thiếu thông tin", "Vui lòng điền đầy đủ các trường để tiếp tục.");
            return;
        }

        if (newPassword !== confirmPassword) {
            showAlert("Mật khẩu không khớp", "Mật khẩu xác nhận không trùng với mật khẩu mới. Vui lòng thử lại.");
            return;
        }

        try {
            setIsLoading(true);
            await AuthService.changePassword(currentPassword, newPassword);
            showAlert("Thành công", "Mật khẩu của bạn đã được cập nhật thành công!", () => {
                router.back();
            });
        } catch (error: any) {
            showAlert("Đổi mật khẩu thất bại", String(error));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MainLayout>
            {/* Các phần UI bên dưới của bạn giữ nguyên, không cần thay đổi gì cả */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backBtn}
                    activeOpacity={0.4}
                >
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={currentTheme.mainText}
                    />
                </TouchableOpacity>

                <Text
                    style={[
                        styles.headerTitle,
                        { color: currentTheme.mainText },
                    ]}
                >
                    Change Password
                </Text>

                <View style={{ width: 24 }} />
            </View>

            <KeyboardAwareScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                enableOnAndroid={true}
                enableAutomaticScroll={true}
                extraScrollHeight={120}
                extraHeight={120}
                keyboardOpeningTime={0}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                <View style={styles.infoBox}>
                    <Feather
                        name="shield"
                        size={40}
                        color={currentTheme.primary}
                        style={styles.infoIcon}
                    />

                    <Text
                        style={[
                            styles.infoText,
                            { color: currentTheme.subText },
                        ]}
                    >
                        Your new password must be at least 8 characters long
                        and include a mix of letters and numbers.
                    </Text>
                </View>

                <View style={styles.formSection}>
                    {/* BÂY GIỜ CHÚNG TA TÁI SỬ DỤNG PASSWORD INPUT Ở ĐÂY BÌNH THƯỜNG */}
                    <PasswordInput
                        label="Current Password"
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        showPassword={showCurrent}
                        setShowPassword={setShowCurrent}
                        placeholder="Enter current password"
                    />

                    <PasswordInput
                        label="New Password"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        showPassword={showNew}
                        setShowPassword={setShowNew}
                        placeholder="Enter new password"
                    />

                    <PasswordInput
                        label="Confirm New Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        showPassword={showConfirm}
                        setShowPassword={setShowConfirm}
                        placeholder="Confirm new password"
                    />
                </View>

                <TouchableOpacity
                    style={[
                        styles.saveBtn,
                        { 
                            backgroundColor: currentTheme.primary,
                            opacity: isLoading ? 0.7 : 1 
                        },
                    ]}
                    onPress={handleUpdatePassword}
                    activeOpacity={0.4}
                    disabled={isLoading}
                >
                    <Text style={styles.saveBtnText}>
                        {isLoading ? "Updating..." : "Update Password"}
                    </Text>
                </TouchableOpacity>
            </KeyboardAwareScrollView>

            <Modal
                visible={isAlertVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsAlertVisible(false)}
            >
                <View style={styles.alertOverlay}>
                    <View style={[styles.alertBox, { backgroundColor: currentTheme.white }]}>
                        <View style={[styles.alertIconBg, { backgroundColor: "rgba(255, 45, 85, 0.1)" }]}>
                            <Feather name="alert-circle" size={32} color="#FF2D55" />
                        </View>
                        
                        <Text style={[styles.alertTitle, { color: currentTheme.mainText }]}>
                            {alertContent.title}
                        </Text>
                        
                        <Text style={[styles.alertMessage, { color: currentTheme.subText }]}>
                            {alertContent.message}
                        </Text>
                        
                        <TouchableOpacity 
                            style={[styles.alertBtn, { backgroundColor: currentTheme.primary }]} 
                            onPress={() => {
                                setIsAlertVisible(false);
                                if (alertContent.onOk) {
                                    alertContent.onOk();
                                }
                            }}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.alertBtnText}>Got it</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </MainLayout>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
    },
    scrollContent: {
        paddingBottom: 40,
    },
    infoBox: {
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 30,
        marginTop: 10,
    },
    infoIcon: {
        marginBottom: 15,
        opacity: 0.8,
    },
    infoText: {
        textAlign: "center",
        fontSize: 14,
        lineHeight: 20,
    },
    formSection: {
        gap: 20,
    },
    inputGroup: {
        marginBottom: 5,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        height: "100%",
    },
    saveBtn: {
        height: 56,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 40,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    saveBtnText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    
    alertOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    alertBox: {
        width: "85%",
        borderRadius: 24,
        padding: 24,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    alertIconBg: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    alertTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 8,
        textAlign: "center",
    },
    alertMessage: {
        fontSize: 15,
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 22,
    },
    alertBtn: {
        width: "100%",
        height: 50,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    alertBtnText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
    },
});