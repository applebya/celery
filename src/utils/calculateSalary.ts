import { InputType } from '../store/types';

/** Returns a yearly salary given the input type */
export default function(value: number | string, type: InputType): number {
    if (!value) return 0;

    if (typeof value === 'string') {
        value = Number(value);
    }

    // TODO: Get these in as variables
    const workingDays = 365.25 - 52;
    const hoursInDay = 8;

    switch (type) {
        case InputType.PerHour:
            return value * hoursInDay * workingDays;

        case InputType.PerDay:
            return value * hoursInDay;

        case InputType.PerMonth:
            return (value * workingDays) / 12;

        case InputType.PerYear:
            return value;
    }
}
