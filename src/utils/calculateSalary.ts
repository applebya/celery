import { MeasurementType } from '../store/types';

interface CalculateSalaryProps {
    value: number | null;
    valueType: MeasurementType;
    factor?: number;
    hoursInDay: number;
    daysInWeek: number;
    vacationDays: number;
    holidayDays: number;
    fullTime: boolean;
    outputType?: MeasurementType;
}

// TODO: Test this util

/** Returns a yearly salary given the input type */
export default function({
    value,
    valueType,
    factor,
    hoursInDay,
    daysInWeek,
    vacationDays,
    holidayDays,
    fullTime,
    outputType = MeasurementType.PerYear
}: CalculateSalaryProps): number {
    if (!value) return 0;

    // TODO: Fix to number only
    if (typeof value === 'string') {
        value = Number(value);
    }

    if (factor) {
        value = value / factor;
    }

    let workingDaysInYear = 52 * daysInWeek;

    if (fullTime) {
        // You get paid days off!
        workingDaysInYear = Math.max(
            workingDaysInYear - vacationDays - holidayDays,
            0
        );
    }

    const workingDaysInMonth = workingDaysInYear / 12;

    switch (valueType) {
        case MeasurementType.PerHour:
            switch (outputType) {
                case MeasurementType.PerDay:
                    return value * hoursInDay;

                case MeasurementType.PerMonth:
                    return value * hoursInDay * workingDaysInMonth;

                case MeasurementType.PerYear:
                    return value * hoursInDay * workingDaysInMonth * 12;

                default:
                    return value;
            }

        case MeasurementType.PerDay:
            switch (outputType) {
                case MeasurementType.PerHour:
                    return value / hoursInDay;

                case MeasurementType.PerMonth:
                    return value * workingDaysInMonth;

                case MeasurementType.PerYear:
                    return value * workingDaysInMonth * 12;

                default:
                    return value;
            }

        case MeasurementType.PerMonth:
            switch (outputType) {
                case MeasurementType.PerHour:
                    return value / workingDaysInMonth / hoursInDay;

                case MeasurementType.PerDay:
                    return value / workingDaysInMonth;

                case MeasurementType.PerYear:
                    return value * 12;

                default:
                    return value;
            }

        case MeasurementType.PerYear:
            switch (outputType) {
                case MeasurementType.PerHour:
                    return value / 12 / workingDaysInMonth / hoursInDay;

                case MeasurementType.PerDay:
                    return value / 12 / workingDaysInMonth;

                case MeasurementType.PerMonth:
                    return value / 12;

                default:
                    return value;
            }

        default:
            return value;
    }
}
