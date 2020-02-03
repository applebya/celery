export default function(hourlyRate: number) {
    if (!hourlyRate) return 0;

    // Every day in the year, minus weekends
    return hourlyRate * 8 * (365.25 - 52 * 2);
}
