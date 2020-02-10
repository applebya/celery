/** Formats number for contracted money display ($/K/M), with 1 decimal place */
export default function calculateSalary(value: number): string {
    if (value >= 1000000) {
        return `${format(value / 1000000)}M`;
    } else if (value >= 1000) {
        return `${format(value / 1000)}K`;
    } else {
        return `$${format(value)}`;
    }
}

/** Limit to 1 decimal place, or 3 total digits */
function format(value: number) {
    let stringValue: string = value.toFixed(1);

    if (Number(stringValue[stringValue.length - 1]) === 0) {
        value = Math.floor(value);
    } else if (stringValue.length > 3) {
        value = Number(value.toFixed(0));
    } else {
        value = Number(stringValue);
    }

    return value;
}
