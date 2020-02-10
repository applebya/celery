import { InputType } from '../store/types';

// TODO: Test this util
interface CalculateSalaryProps {
    value: number | string;
    type: InputType;
    factor?: number;
    hoursInDay: number;
    daysInWeek: number;
    vacationDays: number;
    holidayDays: number;
    fullTime: boolean;
}

/** Returns a yearly salary given the input type */
export default function({
    value,
    type,
    factor,
    hoursInDay,
    daysInWeek,
    vacationDays,
    holidayDays,
    fullTime
}: CalculateSalaryProps): number {
    if (!value) return 0;

    if (typeof value === 'string') {
        value = Number(value);
    }

    if (factor) {
        value = value / factor;
    }

    let workingDays = 52 * daysInWeek;

    if (fullTime) {
        workingDays = workingDays - vacationDays - holidayDays;
    }

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
