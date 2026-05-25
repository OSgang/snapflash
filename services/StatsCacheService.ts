import * as SecureStore from "expo-secure-store";

const STATS_KEY = "user_activity_stats";

export interface ActivityStats {
    streak: number;
    accuracy: number;
    timeSpentMins: number;
    snapCreated: number;
    wordsStudiedToday: number;
    lastStudyDate: string;
}

const defaultStats: ActivityStats = {
    streak: 0,
    accuracy: 100,
    timeSpentMins: 0,
    snapCreated: 0,
    wordsStudiedToday: 0,
    lastStudyDate: new Date().toISOString().split("T")[0],
};

export const StatsCacheService = {
    getStats: async (): Promise<ActivityStats> => {
        try {
            const data = await SecureStore.getItemAsync(STATS_KEY);
            if (data) {
                const parsed: ActivityStats = JSON.parse(data);

                const today = new Date().toISOString().split("T")[0];
                if (parsed.lastStudyDate !== today) {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayStr = yesterday.toISOString().split("T")[0];

                    if (parsed.lastStudyDate !== yesterdayStr) {
                        parsed.streak = 0;
                    }

                    parsed.timeSpentMins = 0;
                    parsed.wordsStudiedToday = 0;
                    parsed.snapCreated = 0;
                    parsed.lastStudyDate = today;

                    await StatsCacheService.saveStats(parsed);
                }
                return parsed;
            }
            return defaultStats;
        } catch (error) {
            console.log("Error in cache stats:", error);
            return defaultStats;
        }
    },

    saveStats: async (stats: ActivityStats) => {
        try {
            await SecureStore.setItemAsync(STATS_KEY, JSON.stringify(stats));
        } catch (error) {
            console.log("Lỗi lưu cache stats:", error);
        }
    },

    addStudyTime: async (mins: number, wordsCount: number, correctAnswers: number = 0) => {
        const stats = await StatsCacheService.getStats();
        stats.timeSpentMins += mins;
        stats.wordsStudiedToday += wordsCount;

        if (wordsCount > 0) {
            const newAccuracy = Math.round((correctAnswers / wordsCount) * 100);
            stats.accuracy = Math.round((stats.accuracy + newAccuracy) / 2);
        }

        if (stats.wordsStudiedToday === wordsCount && stats.streak === 0) {
            stats.streak = 1;
        } else if (stats.wordsStudiedToday === wordsCount && stats.streak > 0) {
            stats.streak += 1;
        }

        await StatsCacheService.saveStats(stats);
    },

    incrementSnap: async () => {
        const stats = await StatsCacheService.getStats();
        stats.snapCreated += 1;
        await StatsCacheService.saveStats(stats);
    },
};
