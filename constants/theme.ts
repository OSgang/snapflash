import { Platform } from "react-native";

const snapFlashColors = {
    primary: "#5B6CFF",
    heading: "#4A30B9",
    customIcon: "#2863D2",
    mainText: "#1A0E4F",
    subText: "#7C89AB",
    customBackground: "#E4EBF7",
    border: "#CAD6E8",
    mainTextTail: "#4A30B9",
    lightButton: "#92CEFF",
    white: "#FFFFFF",
    statBlue: "#7DA0FA",
    statOrange: "#FA9A7A",
    tagBlueBg: "#D6E8FF",
    tagBlueText: "#2B78FF",
    tagRedBg: "#FFD9D9",
    tagRedText: "#FF4D4D",
    tagGreenBg: "#E2FFD9",
    tagGreenText: "#4CAF50",
};

const tintColorLight = snapFlashColors.primary;
const tintColorDark = snapFlashColors.lightButton;

export const Colors = {
    light: {
        ...snapFlashColors,

        text: snapFlashColors.mainText,
        background: snapFlashColors.customBackground,
        tint: tintColorLight,
        icon: snapFlashColors.customIcon,
        tabIconDefault: snapFlashColors.subText,
        tabIconSelected: tintColorLight,
    },
    dark: {
        ...snapFlashColors,
        text: "#ECEDEE",
        background: "#151718",
        tint: tintColorDark,
        icon: "#9BA1A6",
        tabIconDefault: "#9BA1A6",
        tabIconSelected: tintColorDark,

        primary: snapFlashColors.primary,
        heading: "#A3B2FF",
        customIcon: "#6E8EFF",
        mainText: "#ECEDEE",
        subText: "#9BA1A6",
        customBackground: "#151718",
        border: "#333333",
        mainTextTail: "#A3B2FF",
        lightButton: "#2A3C5A",
        white: "#000000",
    },
};

export const SIZES = {
    h1: 28,
    h2: 24,
    body1: 16,
    body2: 14,
    radius: 12,
};

export const Fonts = Platform.select({
    ios: {
        sans: "system-ui",
        serif: "ui-serif",
        rounded: "ui-rounded",
        mono: "ui-monospace",
    },
    default: {
        sans: "normal",
        serif: "serif",
        rounded: "normal",
        mono: "monospace",
    },
    web: {
        sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        serif: "Georgia, 'Times New Roman', serif",
        rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
        mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    },
});
