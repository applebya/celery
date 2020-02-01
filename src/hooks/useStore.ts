import { useReducer } from 'react';
import { v4 as generateId } from 'uuid';

export enum ActionType {
    AddSalary = 'addSalary',
    RemoveSalary = 'removeSalary',
    SetHourlyRate = 'setHourlyRate',
    SetName = 'setName'
}

export enum StartingUnit {
    PerHour = '/hour',
    PerDay = '/day',
    PerMonth = '/month',
    PerYear = '/year'
}

export interface SalaryState {
    name: string;
    hourlyRate: string;
    salary: number;
}

export interface State {
    salaries: {
        [x: string]: SalaryState;
    };
}

export interface Action {
    type: ActionType;
    payload?: any;
    id?: string;
}

let nameIndex = 1;

const initialState: State = {
    salaries: {
        [generateId()]: {
            name: `Company${nameIndex}`,
            hourlyRate: '',
            salary: 0
        }
    }
};

const reducer: React.Reducer<State, Action> = (
    state = initialState,
    { type, payload }
) => {
    switch (type) {
        case ActionType.AddSalary:
            nameIndex++;

            return {
                ...state,
                salaries: {
                    ...state.salaries,
                    [generateId()]: {
                        name: `Company${nameIndex}`,
                        hourlyRate: '',
                        salary: 0
                    }
                }
            };

        case ActionType.RemoveSalary:
            nameIndex++;

            const { [payload.id]: _, ...salaries } = state.salaries;

            return {
                ...state,
                salaries
            };

        case ActionType.SetHourlyRate:
            // Enforce numericality
            const hourlyRate = payload.data;
            if (hourlyRate.length && Number.isNaN(Number(hourlyRate))) {
                return state;
            }

            return {
                ...state,
                salaries: {
                    ...state.salaries,
                    [payload.id]: {
                        hourlyRate,
                        salary: calculateSalary(Number(hourlyRate))
                    }
                }
            };

        case ActionType.SetName:
            return {
                ...state,
                salaries: {
                    ...state.salaries,
                    [payload.id]: { name: payload.name }
                }
            };

        default:
            return state;
    }
};

export const calculateSalary = (hourlyRate: number) => {
    if (!hourlyRate) return 0;

    // Every day in the year, minus weekends
    return hourlyRate * 8 * (365.25 - 52 * 2);
};

const useStore = () =>
    useReducer<React.Reducer<State, Action>>(reducer, initialState);

export default useStore;
