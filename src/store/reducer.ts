import { v4 as generateId } from 'uuid';
import { Celery, State, InputType, ActionType, Action } from './types';

let nameIndex = 1;

const newCelery = () => ({
    [generateId()]: {
        name: `Company${nameIndex}`,
        input: {
            value: 0,
            type: InputType.PerYear
        }
    } as Celery
});

// Grab initialState from persistedStore in localStorage (if exists)
const defaultState: State = {
    min: 0,
    max: 75000,
    celeries: newCelery(),
    timestamp: +new Date()
};

const PERSISTED_STORE_NAME = 'persistedStore';

const persistedStore = window.localStorage.getItem(PERSISTED_STORE_NAME);

export const initialState: State = persistedStore
    ? JSON.parse(persistedStore || '{}')
    : defaultState;

const reduceStore = (state: State, action: Action): State => {
    const { type } = action;

    if (action.payload) {
        const { payload } = action;

        if (payload.id) {
            switch (type) {
                case ActionType.RemoveCelery:
                    nameIndex++;

                    const { [payload.id]: _, ...celeries } = state.celeries;

                    return {
                        ...state,
                        celeries
                    };

                case ActionType.SetInputValue:
                    // Enforce numericality
                    if (
                        payload.data.length &&
                        Number.isNaN(Number(payload.data))
                    ) {
                        return state;
                    }

                    return {
                        ...state,
                        celeries: {
                            ...state.celeries,
                            [payload.id]: {
                                ...state.celeries[payload.id],
                                input: {
                                    ...state.celeries[payload.id].input,
                                    value: payload.data
                                }
                                // Type-checking doesn't work here for some reason?
                            }
                        }
                    };

                case ActionType.SetInputType:
                    console.log(
                        'state.celeries[payload.id]',
                        state.celeries[payload.id]
                    );
                    console.log('payload.data', payload.data);
                    return {
                        ...state,
                        celeries: {
                            ...state.celeries,
                            [payload.id]: {
                                ...state.celeries[payload.id],
                                input: {
                                    ...state.celeries[payload.id].input,
                                    type: payload.data
                                }
                                // Type-checking doesn't work here for some reason?
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
            }
        } else if (payload.data) {
            switch (type) {
                case ActionType.SetStore:
                    console.log('going to set store', payload.data);
                    return payload.data;

                case ActionType.SetMin:
                    return {
                        ...state,
                        min: payload.data
                    };

                case ActionType.SetMax:
                    return {
                        ...state,
                        max: payload.data
                    };
            }
        }
    }

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

        default:
            return state;
    }
};

const reducer = (state: State, action: Action): State => {
    // Timestamp this new version of the state
    state = {
        ...state,
        timestamp: +new Date()
    };

    console.log('action', action);

    // Reduce state with dispatched action
    state = reduceStore(state, action);

    console.log('reducedState', state);

    // Persist new state to localStorage
    if ('localStorage' in window) {
        localStorage.setItem(PERSISTED_STORE_NAME, JSON.stringify(state));
    }

    return state;
};

export default reducer;
