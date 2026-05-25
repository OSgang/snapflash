import { useState, useCallback } from "react";
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity, Linking, Modal, TextInput, DeviceEventEmitter } from "react-native";
import { MaterialCommunityIcons, Feather, Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { useRouter, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import MainLayout from "@/components/MainLayout";
import { AuthService } from "@/services/AuthService";
import * as SecureStore from "expo-secure-store";

type ThemePref = "light" | "dark" | "auto";

export default function SettingsScreen() {
    const systemScheme = useColorScheme() ?? "light";
    const router = useRouter();

    const [themePreference, setThemePreference] = useState<ThemePref>("auto");
    const [activeMode, setActiveMode] = useState<"light" | "dark">("light");

    const [dailyGoal, setDailyGoal] = useState("20");
    const [username, setUsername] = useState("Đậu Minh Khôi");
    const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
    const [tempGoal, setTempGoal] = useState("");

    useFocusEffect(
        useCallback(() => {
            const loadSettings = async () => {
                try {
                    const storedGoal = await SecureStore.getItemAsync("dailyGoal");
                    const storedTheme = ((await SecureStore.getItemAsync("themePreference")) as ThemePref) || "auto";
                    const storedUsername = await SecureStore.getItemAsync("username");

                    if (storedGoal) setDailyGoal(storedGoal);
                    setThemePreference(storedTheme);
                    setActiveMode(storedTheme === "auto" ? systemScheme : storedTheme);
                    if (storedUsername) setUsername(storedUsername);
                } catch (error) {
                    console.log("Error loading config:", error);
                }
            };
            loadSettings();
        }, [systemScheme]),
    );

    const handleThemeChange = async (mode: ThemePref) => {
        setThemePreference(mode);
        setActiveMode(mode === "auto" ? systemScheme : mode);
        try {
            await SecureStore.setItemAsync("themePreference", mode);
            DeviceEventEmitter.emit("themeChanged", mode);
        } catch (error) {
            console.log("Error saving theme preference:", error);
        }
    };

    const currentTheme = Colors[activeMode];

    const openWikiLink = () => {
        Linking.openURL("https://github.com/OSgang/snapflash/wiki");
    };

    const handleOpenGoalModal = () => {
        setTempGoal(dailyGoal);
        setIsGoalModalVisible(true);
    };

    const handleSaveGoal = async () => {
        if (tempGoal.trim() !== "") {
            setDailyGoal(tempGoal);
            try {
                await SecureStore.setItemAsync("dailyGoal", tempGoal.trim());
            } catch (error) {
                console.log("Lỗi lưu mục tiêu hằng ngày:", error);
            }
        }
        setIsGoalModalVisible(false);
    };

    const handleLogout = async () => {
        try {
            await AuthService.logout();
        } catch (error) {
            console.error("Error in LOGOUT:", error);
        } finally {
            await SecureStore.deleteItemAsync("username");
            router.replace("/login");
        }
    };

    const SettingGroup = ({ title, children }: any) => (
        <View style={styles.groupContainer}>
            <Text style={[styles.groupTitle, { color: currentTheme.subText }]}>{title}</Text>
            <View
                style={[styles.groupBlock, { backgroundColor: currentTheme.white, borderColor: currentTheme.border }]}
            >
                {children}
            </View>
        </View>
    );

    const SettingItem = ({
        icon,
        iconBgColor,
        title,
        rightComponent,
        onPress,
        showBorder = true,
        isExternal = false,
    }: any) => (
        <TouchableOpacity
            style={[styles.menuItem, showBorder && { borderBottomWidth: 1, borderBottomColor: currentTheme.border }]}
            onPress={onPress}
            activeOpacity={onPress ? 0.4 : 1}
        >
            <View style={styles.menuLeft}>
                <View style={[styles.iconWrapper, { backgroundColor: iconBgColor }]}>{icon}</View>
                <Text style={[styles.menuText, { color: currentTheme.mainText }]}>{title}</Text>
            </View>
            {rightComponent ||
                (isExternal ? (
                    <Feather name="arrow-up-right" size={20} color={currentTheme.subText} />
                ) : (
                    <MaterialCommunityIcons name="chevron-right" size={24} color={currentTheme.subText} />
                ))}
        </TouchableOpacity>
    );

    return (
        <MainLayout>
            <Text style={[styles.headerTitle, { color: currentTheme.mainText }]}>Settings</Text>

            <TouchableOpacity
                style={[styles.profileCard, { backgroundColor: currentTheme.white, borderColor: currentTheme.border }]}
                onPress={() => router.push("/settings/edit-profile")}
                activeOpacity={0.4}
            >
                <LinearGradient colors={["#2B78FF", "#5AB0FF"]} style={styles.avatar}>
                    <Text style={styles.avatarText}>{username.charAt(0).toUpperCase()}</Text>
                </LinearGradient>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.profileName, { color: currentTheme.mainText }]}>{username}</Text>
                    <Text style={[styles.profileEmail, { color: currentTheme.subText }]}>Active Account</Text>
                </View>
                <View style={styles.editProfileBtn}>
                    <Feather name="edit-3" size={18} color={currentTheme.primary} />
                </View>
            </TouchableOpacity>

            <SettingGroup title="STUDY PREFERENCES">
                <SettingItem
                    title="Daily Goal"
                    icon={<Ionicons name="flag-outline" size={20} color="#FF9800" />}
                    iconBgColor="#FFF3E0"
                    rightComponent={
                        <Text style={{ color: currentTheme.subText, fontWeight: "600" }}>{dailyGoal} words</Text>
                    }
                    onPress={handleOpenGoalModal}
                />
                <SettingItem
                    title="Voice & Speech"
                    icon={<Feather name="mic" size={20} color="#E91E63" />}
                    iconBgColor="#FCE4EC"
                    onPress={() => router.push("/settings/voice-speech")}
                />
            </SettingGroup>

            <SettingGroup title="GENERAL">
                <View style={[styles.menuItem, { borderBottomWidth: 1, borderBottomColor: currentTheme.border }]}>
                    <View style={styles.menuLeft}>
                        <View style={[styles.iconWrapper, { backgroundColor: "#F2F2F7" }]}>
                            <Ionicons name="moon-outline" size={20} color="#5E5CE6" />
                        </View>
                        <Text style={[styles.menuText, { color: currentTheme.mainText }]}>Dark Mode</Text>
                    </View>
                    <View style={[styles.segmentedControl, { backgroundColor: currentTheme.border + "40" }]}>
                        {(["light", "dark", "auto"] as const).map((mode) => (
                            <TouchableOpacity
                                key={mode}
                                style={[
                                    styles.segmentedButton,
                                    themePreference === mode && { backgroundColor: currentTheme.white, elevation: 2 },
                                ]}
                                onPress={() => handleThemeChange(mode)}
                            >
                                <Text
                                    style={[
                                        styles.segmentedText,
                                        {
                                            color:
                                                themePreference === mode ? currentTheme.primary : currentTheme.subText,
                                            fontWeight: themePreference === mode ? "bold" : "500",
                                        },
                                    ]}
                                >
                                    {mode === "light" ? "Light" : mode === "dark" ? "Dark" : "Auto"}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <SettingItem
                    title="App Language"
                    icon={<Ionicons name="language-outline" size={20} color="#009688" />}
                    iconBgColor="#E0F2F1"
                    rightComponent={<Text style={{ color: currentTheme.subText }}>English</Text>}
                    onPress={() => {}}
                />
                <SettingItem
                    title="Notification Settings"
                    icon={<Feather name="bell" size={20} color="#FF2D55" />}
                    iconBgColor="#FFE5EB"
                    onPress={() => router.push("/settings/notifications")}
                />
                <SettingItem
                    title="Change Password"
                    icon={<Feather name="lock" size={20} color="#007AFF" />}
                    iconBgColor="#E5F1FF"
                    onPress={() => router.push("/settings/change-password")}
                    showBorder={false}
                />
            </SettingGroup>

            <SettingGroup title="ACCOUNT & PRIVACY">
                <SettingItem
                    title="Privacy Policy"
                    icon={<Feather name="shield" size={20} color="#673AB7" />}
                    iconBgColor="#F3E5F5"
                    onPress={openWikiLink}
                />
                <SettingItem
                    title="Terms of Service"
                    icon={<Feather name="file-text" size={20} color="#607D8B" />}
                    iconBgColor="#ECEFF1"
                    onPress={openWikiLink}
                    showBorder={false}
                />
            </SettingGroup>

            <View style={styles.logoutContainer}>
                <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: "#FFE5EB" }]} onPress={handleLogout}>
                    <Feather name="log-out" size={20} color="#FF2D55" />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
                <View style={styles.footerInfo}>
                    <Text style={styles.appVersion}>SnapFlash v1.0.0</Text>
                    <Text style={styles.copyrightText}>Copyright © 2026 OS Gang Team.</Text>
                </View>
            </View>

            <Modal visible={isGoalModalVisible} transparent={true} animationType="fade">
                <View style={styles.alertOverlay}>
                    <View style={[styles.alertBox, { backgroundColor: currentTheme.white }]}>
                        <Text style={[styles.alertTitle, { color: currentTheme.mainText }]}>Set Daily Goal</Text>
                        <TextInput
                            style={[
                                styles.goalInput,
                                {
                                    color: currentTheme.mainText,
                                    borderColor: currentTheme.border,
                                    backgroundColor: currentTheme.background,
                                },
                            ]}
                            value={tempGoal}
                            onChangeText={setTempGoal}
                            keyboardType="numeric"
                            maxLength={3}
                            textAlign="center"
                        />
                        <View style={styles.alertBtnRow}>
                            <TouchableOpacity
                                style={[styles.alertBtn, { backgroundColor: currentTheme.background }]}
                                onPress={() => setIsGoalModalVisible(false)}
                            >
                                <Text style={{ color: currentTheme.subText }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.alertBtn, { backgroundColor: currentTheme.primary }]}
                                onPress={handleSaveGoal}
                            >
                                <Text style={{ color: "#FFF" }}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </MainLayout>
    );
}

const styles = StyleSheet.create({
    headerTitle: { fontSize: 36, fontWeight: "900", marginBottom: 25 },
    profileCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderWidth: 1,
        borderRadius: 20,
        marginBottom: 30,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    avatarText: { color: "#FFF", fontSize: 24, fontWeight: "bold" },
    profileName: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
    profileEmail: { fontSize: 13 },
    editProfileBtn: { padding: 8, backgroundColor: "rgba(43, 120, 255, 0.1)", borderRadius: 12 },
    groupContainer: { marginBottom: 25 },
    groupTitle: { fontSize: 13, fontWeight: "700", marginLeft: 15, marginBottom: 8, letterSpacing: 0.5 },
    groupBlock: { borderWidth: 1, borderRadius: 20, overflow: "hidden" },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    menuLeft: { flexDirection: "row", alignItems: "center" },
    iconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },
    menuText: { fontSize: 16, fontWeight: "500" },
    logoutContainer: { marginTop: 10, alignItems: "center" },
    logoutBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        paddingVertical: 16,
        borderRadius: 16,
        gap: 10,
        marginBottom: 25,
    },
    logoutText: { color: "#FF2D55", fontSize: 16, fontWeight: "bold" },
    footerInfo: { alignItems: "center", gap: 4 },
    appVersion: { fontSize: 13, color: "#666", fontWeight: "700" },
    copyrightText: { fontSize: 11, color: "#999" },
    alertOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.4)", justifyContent: "center", alignItems: "center" },
    alertBox: { width: "85%", borderRadius: 24, padding: 24, alignItems: "center" },
    alertTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
    goalInput: { width: "100%", height: 50, borderWidth: 1, borderRadius: 12, fontSize: 18, marginBottom: 20 },
    alertBtnRow: { flexDirection: "row", gap: 12, width: "100%" },
    alertBtn: { flex: 1, height: 46, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    segmentedControl: { flexDirection: "row", padding: 2, borderRadius: 10, width: 180 },
    segmentedButton: { flex: 1, paddingVertical: 6, alignItems: "center", borderRadius: 8 },
    segmentedText: { fontSize: 12 },
});
