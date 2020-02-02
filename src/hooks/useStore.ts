import { useReducer } from 'react';
import { v4 as generateId } from 'uuid';

export enum ActionType {
    AddSalary = 'addSalary',
    RemoveSalary = 'removeSalary',
    SetHourlyRate = 'setHourlyRate',
    SetName = 'setName',
    SetMin = 'setMin',
    SetMax = 'setMax',
    SetStore = 'setStore'
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
    timestamp: number;
    prevTimestamp?: number;
    initTimestamp: number;
    min: number;
    max: number;
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

const newSalary = () => ({
    [generateId()]: {
        name: `Company${nameIndex}`,
        hourlyRate: '',
        salary: 0
    }
});

// Grab initialState from persistedStore in localStorage if exists
// TODO: Persisted chrome store? navigator.storage.persist().then(granted => {...
// TODO: Watch window.onfocus/onblur to keep things current, mark store with uniqueID (new Date())
const defaultState = {
    min: 0,
    max: 75000, // TODO: Come up with better default, or have UX step to ask
    salaries: newSalary(),
    timestamp: +new Date(),
    initTimestamp: +new Date()
};

const PERSISTED_STORE_NAME = 'persistedStore';

const persistedStore = window.localStorage.getItem(PERSISTED_STORE_NAME);

const initialState: State = persistedStore
    ? JSON.parse(persistedStore || '{}')
    : defaultState;

const reduceStore = (state: State, action: Action) => {
    const { type, payload } = action;

    switch (type) {
        case ActionType.AddSalary:
            nameIndex++;

            return {
                ...state,
                salaries: {
                    ...state.salaries,
                    ...newSalary()
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

        case ActionType.SetStore:
            return payload;

        default:
            return state;
    }
};

const reducer: React.Reducer<State, Action> = (
    state = initialState,
    action
) => {
    // Middleware to timestamp this (and prev) version of the store
    state = {
        ...state,
        timestamp: +new Date(),
        ...(state.timestamp ? { prevTimestamp: state.timestamp } : {})
    };

    // Reduce data
    state = reduceStore(state, action);

    // Persist new state to localStorage
    if ('localStorage' in window) {
        localStorage.setItem(PERSISTED_STORE_NAME, JSON.stringify(state));
    }

    return state;
};

export const calculateSalary = (hourlyRate: number) => {
    if (!hourlyRate) return 0;

    // Every day in the year, minus weekends
    return hourlyRate * 8 * (365.25 - 52 * 2);
};

const useStore = () =>
    useReducer<React.Reducer<State, Action>>(reducer, initialState);

export default useStore;
