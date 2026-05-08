import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    useColorScheme,
    Modal,
    FlatList,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import MainLayout from "@/components/MainLayout";
import { Colors } from "@/constants/theme";

const CAMBRIDGE_LEVELS = [
    { id: "none", label: "Not Assessed", icon: "help-circle", color: "#9E9E9E" },
    { id: "a1", label: "A1 (Beginner)", icon: "star", color: "#FF9800" },
    { id: "a2", label: "A2 (Elementary)", icon: "navigation", color: "#4CAF50" },
    { id: "b1", label: "B1 (Intermediate)", icon: "trending-up", color: "#03A9F4" },
    { id: "b2", label: "B2 (Upper Intermediate)", icon: "book-open", color: "#2196F3" },
    { id: "c1", label: "C1 (Advanced)", icon: "award", color: "#9C27B0" },
    { id: "c2", label: "C2 (Proficient)", icon: "zap", color: "#E91E63" },
];

export default function EditProfileScreen() {
    const router = useRouter();
    const currentTheme = Colors[useColorScheme() ?? "light"];

    const [name, setName] = useState("Đậu Minh Khôi");
    const [email, setEmail] = useState("khoidau@gmail.com");
    const [level, setLevel] = useState(CAMBRIDGE_LEVELS[0]);
    const [isLevelModalVisible, setIsLevelModalVisible] = useState(false);

    const handleSave = () => {
        console.log("Saving changes:", {
            name,
            email,
            level: level.label,
        });

        router.back();
    };

    const InputField = ({
        label,
        value,
        onChangeText,
        icon,
        placeholder,
        keyboardType = "default",
    }: any) => (
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
                    name={icon}
                    size={20}
                    color={currentTheme.subText}
                    style={styles.inputIcon}
                />

                <TextInput
                    style={[
                        styles.input,
                        { color: currentTheme.mainText },
                    ]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={currentTheme.subText}
                    keyboardType={keyboardType}
                    autoCapitalize={
                        keyboardType === "email-address"
                            ? "none"
                            : "words"
                    }
                />
            </View>
        </View>
    );

    const SelectField = ({
        label,
        value,
        icon,
        onPress,
    }: any) => (
        <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: currentTheme.subText }]}>
                {label}
            </Text>

            <TouchableOpacity
                style={[
                    styles.inputContainer,
                    {
                        backgroundColor: currentTheme.white,
                        borderColor: currentTheme.border,
                    },
                ]}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <Feather
                    name={icon}
                    size={20}
                    color={currentTheme.subText}
                    style={styles.inputIcon}
                />

                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                    }}
                >
                    <Text
                        style={{
                            fontSize: 16,
                            color: currentTheme.mainText,
                        }}
                    >
                        {value}
                    </Text>
                </View>

                <Feather
                    name="chevron-down"
                    size={20}
                    color={currentTheme.subText}
                />
            </TouchableOpacity>
        </View>
    );

    return (
        <MainLayout>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backBtn}
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
                        Edit Profile
                    </Text>

                    <View style={{ width: 24 }} />
                </View>

                <KeyboardAwareScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    enableOnAndroid
                    extraScrollHeight={40}
                    extraHeight={120}
                    keyboardOpeningTime={0}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    {/* Avatar */}
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarWrapper}>
                            <LinearGradient
                                colors={["#2B78FF", "#5AB0FF"]}
                                style={styles.avatar}
                            >
                                <Text style={styles.avatarText}>K</Text>
                            </LinearGradient>

                            <TouchableOpacity
                                style={[
                                    styles.cameraBadge,
                                    {
                                        backgroundColor:
                                            currentTheme.primary,
                                        borderColor:
                                            currentTheme.background,
                                    },
                                ]}
                            >
                                <Feather
                                    name="camera"
                                    size={14}
                                    color="#FFF"
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity>
                            <Text
                                style={[
                                    styles.changePhotoText,
                                    { color: currentTheme.primary },
                                ]}
                            >
                                Change Profile Photo
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Form */}
                    <View style={styles.formSection}>
                        <InputField
                            label="Full Name"
                            value={name}
                            onChangeText={setName}
                            icon="user"
                            placeholder="Enter your full name"
                        />

                        <InputField
                            label="Email Address"
                            value={email}
                            onChangeText={setEmail}
                            icon="mail"
                            placeholder="Enter your email"
                            keyboardType="email-address"
                        />

                        <SelectField
                            label="Proficiency Level"
                            value={level.label}
                            icon="award"
                            onPress={() =>
                                setIsLevelModalVisible(true)
                            }
                        />
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                        style={[
                            styles.saveBtn,
                            {
                                backgroundColor:
                                    currentTheme.primary,
                            },
                        ]}
                        onPress={handleSave}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.saveBtnText}>
                            Save Changes
                        </Text>
                    </TouchableOpacity>
                </KeyboardAwareScrollView>

                {/* Modal */}
                <Modal
                    visible={isLevelModalVisible}
                    transparent
                    animationType="slide"
                    onRequestClose={() =>
                        setIsLevelModalVisible(false)
                    }
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() =>
                            setIsLevelModalVisible(false)
                        }
                    >
                        <View
                            style={[
                                styles.modalContent,
                                {
                                    backgroundColor:
                                        currentTheme.background,
                                },
                            ]}
                        >
                            <View style={styles.modalHeader}>
                                <Text
                                    style={[
                                        styles.modalTitle,
                                        {
                                            color:
                                                currentTheme.mainText,
                                        },
                                    ]}
                                >
                                    Select Proficiency Level
                                </Text>

                                <TouchableOpacity
                                    onPress={() =>
                                        setIsLevelModalVisible(
                                            false
                                        )
                                    }
                                >
                                    <Ionicons
                                        name="close"
                                        size={24}
                                        color={
                                            currentTheme.subText
                                        }
                                    />
                                </TouchableOpacity>
                            </View>

                            <FlatList
                                data={CAMBRIDGE_LEVELS}
                                keyExtractor={(item) => item.id}
                                bounces={false}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.levelOption,
                                            {
                                                borderBottomColor:
                                                    currentTheme.border,
                                            },
                                            level.id === item.id && {
                                                backgroundColor: `${item.color}15`,
                                            },
                                        ]}
                                        onPress={() => {
                                            setLevel(item);
                                            setIsLevelModalVisible(
                                                false
                                            );
                                        }}
                                    >
                                        <View
                                            style={
                                                styles.levelLeft
                                            }
                                        >
                                            <View
                                                style={[
                                                    styles.levelIconWrapper,
                                                    {
                                                        backgroundColor: `${item.color}20`,
                                                    },
                                                ]}
                                            >
                                                <Feather
                                                    name={
                                                        item.icon as any
                                                    }
                                                    size={18}
                                                    color={
                                                        item.color
                                                    }
                                                />
                                            </View>

                                            <Text
                                                style={[
                                                    styles.levelOptionText,
                                                    {
                                                        color:
                                                            level.id ===
                                                            item.id
                                                                ? item.color
                                                                : currentTheme.mainText,
                                                    },
                                                    level.id ===
                                                        item.id && {
                                                        fontWeight:
                                                            "bold",
                                                    },
                                                ]}
                                            >
                                                {item.label}
                                            </Text>
                                        </View>

                                        {level.id === item.id && (
                                            <Feather
                                                name="check"
                                                size={20}
                                                color={item.color}
                                            />
                                        )}
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </TouchableOpacity>
                </Modal>
            </KeyboardAvoidingView>
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
        flexGrow: 1,
        paddingBottom: 24,
    },

    avatarSection: {
        width: "100%",
        alignItems: "center",
        marginBottom: 35,
    },

    avatarWrapper: {
        position: "relative",
        marginBottom: 12,
    },

    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",

        elevation: 3,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },

    avatarText: {
        color: "#FFF",
        fontSize: 40,
        fontWeight: "bold",
    },

    cameraBadge: {
        position: "absolute",
        bottom: 0,
        right: 0,

        width: 32,
        height: 32,
        borderRadius: 16,

        justifyContent: "center",
        alignItems: "center",

        borderWidth: 3,
    },

    changePhotoText: {
        fontSize: 15,
        fontWeight: "600",
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
    },

    saveBtn: {
        height: 56,
        borderRadius: 16,

        justifyContent: "center",
        alignItems: "center",

        marginTop: 28,
        marginBottom: 12,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,

        elevation: 4,
    },

    saveBtnText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },

    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,

        paddingTop: 20,
        paddingBottom: 40,

        maxHeight: "75%",
    },

    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",

        paddingHorizontal: 20,
        marginBottom: 15,
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },

    levelOption: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",

        paddingVertical: 14,
        paddingHorizontal: 20,

        borderBottomWidth: 1,
    },

    levelLeft: {
        flexDirection: "row",
        alignItems: "center",
    },

    levelIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 10,

        justifyContent: "center",
        alignItems: "center",

        marginRight: 12,
    },

    levelOptionText: {
        fontSize: 16,
    },
});