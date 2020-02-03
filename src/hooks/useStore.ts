import { useReducer } from 'react';
import { v4 as generateId } from 'uuid';

export enum ActionType {
    AddCelery = 'addCelery',
    RemoveCelery = 'removeCelery',
    SetInputValue = 'setInputValue',
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

export interface Celery {
    name: string;
    input: {
        value: number;
        type: '/hour' | '/day' | '/week' | '/year';
        mask: string;
    };
}

export interface State {
    timestamp: number;
    min: number;
    max: number;
    celeries: {
        [x: string]: Celery;
    };
}

export interface Action {
    type: ActionType;
    payload?: any;
    id?: string;
}

let nameIndex = 1;

const newCelery = () => ({
    [generateId()]: {
        name: `Company${nameIndex}`,
        input: {
            value: 0,
            type: '/year',
            mask: '0123'
        }
    } as Celery
});

// Grab initialState from persistedStore in localStorage if exists
// TODO: Persisted chrome store? navigator.storage.persist().then(granted => {...
// TODO: Watch window.onfocus/onblur to keep things current, mark store with uniqueID (new Date())
const defaultState = {
    min: 0,
    max: 75000, // TODO: Come up with better default, or have UX step to ask
    celeries: { ...newCelery() },
    timestamp: +new Date()
};

const PERSISTED_STORE_NAME = 'persistedStore';

const persistedStore = window.localStorage.getItem(PERSISTED_STORE_NAME);

const initialState: State = persistedStore
    ? JSON.parse(persistedStore || '{}')
    : defaultState;

const reduceStore = (state: State, action: Action) => {
    const { type, payload } = action;

    switch (type) {
        case ActionType.AddCelery:
            nameIndex++;

            return {
                ...state,
                celeries: {
                    ...state.celeries,
                    ...newCelery()
                }
            };

        case ActionType.RemoveCelery:
            nameIndex++;

            const { [payload.id]: _, ...celeries } = state.celeries;

            return {
                ...state,
                celeries
            };

        case ActionType.SetInputValue:
            // Enforce numericality
            const input = payload.data;
            if (input.length && Number.isNaN(Number(input))) {
                return state;
            }

            return {
                ...state,
                celeries: {
                    ...state.celeries,
                    [payload.id]: {
                        ...state.celeries[payload.id]
                    }
                }
            };

        case ActionType.SetName:
            return {
                ...state,
                celeries: {
                    ...state.celeries,
                    [payload.id]: {
                        ...state.celeries[payload.id],
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
    // Middleware to timestamp this version of the state
    state = {
        ...state,
        timestamp: +new Date()
    };

    // Reduce state with dispatched action
    state = reduceStore(state, action);

    // Persist new state to localStorage
    if ('localStorage' in window) {
        localStorage.setItem(PERSISTED_STORE_NAME, JSON.stringify(state));
    }

    return state;
};

const useStore = () =>
    useReducer<React.Reducer<State, Action>>(reducer, initialState);

export default useStore;
