export const formatTimeAgo = (dateString: string): string => {
    if (!dateString) return "Just now";

    const now = new Date();
    const past = new Date(dateString);
    const elapsed = now.getTime() - past.getTime();

    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    if (elapsed < msPerMinute) {
        return "Just now";
    } else if (elapsed < msPerHour) {
        const minutes = Math.round(elapsed / msPerMinute);
        return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    } else if (elapsed < msPerDay) {
        const hours = Math.round(elapsed / msPerHour);
        return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    } else if (elapsed < msPerMonth) {
        const days = Math.round(elapsed / msPerDay);
        return `${days} ${days === 1 ? "day" : "days"} ago`;
    } else if (elapsed < msPerYear) {
        const months = Math.round(elapsed / msPerMonth);
        return `${months} ${months === 1 ? "month" : "months"} ago`;
    } else {
        const years = Math.round(elapsed / msPerYear);
        return `${years} ${years === 1 ? "year" : "years"} ago`;
    }
};