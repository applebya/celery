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

// Grab initialState from persistedState in localStorage if exists
// TODO: Watch window.onfocus/onblur to keep things current, mark store with uniqueID (new Date())
const initialState: State = window.localStorage.getItem('persistedState')
    ? JSON.parse(window.localStorage.getItem('persistedState') || '{}')
    : {
          salaries: {
              [generateId()]: {
                  name: `Company${nameIndex}`,
                  hourlyRate: '',
                  salary: 0
              }
          }
      };

const reduceState = (state: State, action: Action) => {
    const { type, payload } = action;

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
                        ...state.salaries[payload.id],
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
                    [payload.id]: {
                        ...state.salaries[payload.id],
                        name: payload.data
                    }
                }
            };

        default:
            return state;
    }
};

const reducer: React.Reducer<State, Action> = (
    state = initialState,
    action
) => {
    const newState = reduceState(state, action);

    localStorage.setItem('persistedState', JSON.stringify(newState));

    return newState;
};

export const calculateSalary = (hourlyRate: number) => {
    if (!hourlyRate) return 0;

    // Every day in the year, minus weekends
    return hourlyRate * 8 * (365.25 - 52 * 2);
};

const useStore = () =>
    useReducer<React.Reducer<State, Action>>(reducer, initialState);

export default useStore;
