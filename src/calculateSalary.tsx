import { InputType } from './store/types';

export default function(value: number, type: InputType) {
    if (!value) return 0;

    switch (type) {
        case InputType.PerHour:
            return value * 8 * (365.25 - 52);

        case InputType.PerDay:
            return value * (365.25 - 52);

        case InputType.PerMonth:
            return (value * (365.25 - 52)) / 12;

        case InputType.PerYear:
            return value;
    }
}
