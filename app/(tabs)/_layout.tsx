import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Tabs, useRouter } from "expo-router";
import { AntDesign, Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    interpolateColor,
    interpolate,
    withTiming,
} from "react-native-reanimated";

import { Colors } from "@/constants/theme";

const { width } = Dimensions.get("window");
const TAB_BAR_HEIGHT = 70;
const CONTAINER_HEIGHT = 160;

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
    const currentTheme = Colors["light"];
    const router = useRouter();

    const isExpanded = useSharedValue(0);

    const toggleFab = () => {
        isExpanded.value = withTiming(isExpanded.value === 0 ? 1 : 0, { duration: 200 });
    };

    const mainFabBgStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(isExpanded.value, [0, 1], [currentTheme.primary as string, "#FFFFFF"]),
        transform: [{ scale: interpolate(isExpanded.value, [0, 0.5, 1], [1, 0.9, 1]) }],
    }));

    const plusIconStyle = useAnimatedStyle(() => ({
        opacity: interpolate(isExpanded.value, [0, 1], [1, 0]),
        transform: [{ rotate: `${interpolate(isExpanded.value, [0, 1], [0, 90])}deg` }],
        position: "absolute",
    }));

    const closeIconStyle = useAnimatedStyle(() => ({
        opacity: isExpanded.value,
        transform: [{ rotate: `${interpolate(isExpanded.value, [0, 1], [-90, 0])}deg` }],
        position: "absolute",
    }));

    const leftPopupStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: interpolate(isExpanded.value, [0, 1], [0, -50]) },
            { translateY: interpolate(isExpanded.value, [0, 1], [20, -50]) },
            { scale: isExpanded.value },
        ],
        opacity: isExpanded.value,
        position: "absolute",
    }));

    const rightPopupStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: interpolate(isExpanded.value, [0, 1], [0, 50]) },
            { translateY: interpolate(isExpanded.value, [0, 1], [20, -50]) },
            { scale: isExpanded.value },
        ],
        opacity: isExpanded.value,
        position: "absolute",
    }));

    const center = width / 2;
    const path = `
    M 0 0 
    L ${center - 70} 0 
    C ${center - 40} 0, ${center - 32} 38, ${center} 38 
    C ${center + 32} 38, ${center + 40} 0, ${center + 70} 0 
    L ${width} 0 
    L ${width} ${TAB_BAR_HEIGHT} 
    L 0 ${TAB_BAR_HEIGHT} 
    Z
  `;

    return (
        <View style={styles.container} pointerEvents="box-none">
            <View style={styles.svgWrapper} pointerEvents="none">
                <Svg width={width} height={TAB_BAR_HEIGHT} style={styles.shadow}>
                    <Path d={path} fill="#FFFFFF" stroke={currentTheme.border} strokeWidth={1} />
                </Svg>
            </View>

            <View style={styles.tabsWrapper} pointerEvents="box-none">
                {state.routes.map((route: any, index: number) => {
                    if (route.name === "create-dummy") {
                        return <View key={route.key} style={{ flex: 1 }} pointerEvents="none" />;
                    }

                    const isFocused = state.index === index;
                    const tintColor = isFocused ? currentTheme.primary : "#A0A0A0";

                    const onPress = () => {
                        const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    let icon = null;
                    let label = "";
                    let nudgeStyle = {};
                    if (route.name === "index") {
                        icon = <AntDesign name="home" size={24} color={tintColor} />;
                        label = "Home";
                    } else if (route.name === "collections") {
                        icon = <Ionicons name="flower-outline" size={26} color={tintColor} />;
                        label = "Collections";
                        nudgeStyle = { paddingRight: 15 };
                    } else if (route.name === "insights") {
                        icon = <Feather name="smile" size={24} color={tintColor} />;
                        label = "Insights";
                        nudgeStyle = { paddingLeft: 15 };
                    } else if (route.name === "settings") {
                        icon = <Feather name="settings" size={24} color={tintColor} />;
                        label = "Settings";
                    }

                    return (
                        <TouchableOpacity
                            key={route.key}
                            style={[styles.tabItem, nudgeStyle]}
                            onPress={onPress}
                            activeOpacity={0.7}
                        >
                            {icon}
                            <Text style={[styles.tabLabel, { color: tintColor }]}>{label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View style={styles.fabContainer} pointerEvents="box-none">
                <Animated.View style={leftPopupStyle}>
                    <TouchableOpacity
                        style={[styles.smallFab, { backgroundColor: currentTheme.primary }]}
                        onPress={() => {
                            toggleFab();
                            router.push("/scan");
                        }}
                    >
                        <MaterialCommunityIcons name="line-scan" size={20} color="#FFF" />
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View style={rightPopupStyle}>
                    <TouchableOpacity
                        style={[styles.smallFab, { backgroundColor: currentTheme.primary }]}
                        onPress={() => {
                            toggleFab();
                            console.log("Mở nhập tay (Keyboard)");
                        }}
                    >
                        <MaterialCommunityIcons name="keyboard-outline" size={22} color="#FFF" />
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View style={[styles.mainFab, mainFabBgStyle]}>
                    <TouchableOpacity style={styles.mainFabInner} onPress={toggleFab} activeOpacity={0.8}>
                        <Animated.View style={plusIconStyle}>
                            <AntDesign name="plus" size={22} color="#FFF" />
                        </Animated.View>
                        <Animated.View style={closeIconStyle}>
                            <AntDesign name="close" size={22} color="#000" />
                        </Animated.View>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
};

export default function TabLayout() {
    return (
        <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
            <Tabs.Screen name="index" />
            <Tabs.Screen name="collections" />
            <Tabs.Screen name="create-dummy" />
            <Tabs.Screen name="insights" />
            <Tabs.Screen name="settings" />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    container: { position: "absolute", bottom: 0, width: width, height: CONTAINER_HEIGHT, justifyContent: "flex-end" },
    svgWrapper: { position: "absolute", bottom: 0, width: width, height: TAB_BAR_HEIGHT },
    shadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 5,
    },
    tabsWrapper: { flexDirection: "row", height: TAB_BAR_HEIGHT, paddingHorizontal: 5 },
    tabItem: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 10 },
    tabLabel: { fontSize: 10, fontWeight: "600", marginTop: 4 },

    fabContainer: {
        position: "absolute",
        bottom: 40,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
    },

    mainFab: {
        width: 54,
        height: 54,
        borderRadius: 54,
        elevation: 8,
        shadowColor: "#2B78FF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.05)",
    },
    mainFabInner: { flex: 1, justifyContent: "center", alignItems: "center" },
    smallFab: {
        width: 44,
        height: 44,
        borderRadius: 44,
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
        shadowColor: "#2B78FF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
});
