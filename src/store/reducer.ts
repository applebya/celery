import { v4 as generateId } from 'uuid';
import { Celery, State, InputType, ActionType, Action } from './types';
import { CurrencyType } from '../services/types';

// TODO: Predict from browser location?
const defaultCurrency: CurrencyType = CurrencyType.USD;

const newCelery = ({ currency } = { currency: null }) => ({
    [generateId()]: {
        name: '',
        input: {
            value: 0,
            type: InputType.PerYear,
            currency
        }
    } as Celery
});

// Grab initialState from persistedStore in localStorage (if exists)
const defaultState: State = {
    min: 1,
    desired: 75000,
    celeries: newCelery(),
    timestamp: +new Date(),
    currencies: {
        base: defaultCurrency
    }
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
                    const { [payload.id]: _, ...celeries } = state.celeries;

                    return {
                        ...state,
                        celeries
                    };

                case ActionType.SetInputValue:
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
                            }
                        }
                    };

                case ActionType.SetInputType:
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
                            }
                        }
                    };

                case ActionType.SetInputCurrency:
                    return {
                        ...state,
                        celeries: {
                            ...state.celeries,
                            [payload.id]: {
                                ...state.celeries[payload.id],
                                input: {
                                    ...state.celeries[payload.id].input,
                                    currency: payload.data
                                }
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
                    return payload.data;

                case ActionType.SetCurrencies:
                    return {
                        ...state,
                        currencies: payload.data
                    };

                case ActionType.SetBaseCurrency:
                    const { rates = {} } = state.currencies;

                    const previousBaseCurrency = (rates[
                        state.currencies.base
                    ] as unknown) as number;

                    const newBaseCurrency = (rates[
                        payload.data
                    ] as unknown) as number;

                    // Re-proportion currency rates to new
                    const factor = newBaseCurrency / previousBaseCurrency;

                    const newRates = Object.values(rates).reduce(
                        (acc, val) => ({ ...acc, [val]: Number(val) * factor }),
                        {}
                    );

                    return {
                        ...state,
                        currencies: {
                            ...state.currencies,
                            base: payload.data,
                            rates: newRates
                        }
                    };

                case ActionType.SetMin:
                    return {
                        ...state,
                        min: payload.data
                    };

                case ActionType.SetDesired:
                    return {
                        ...state,
                        desired: payload.data
                    };
            }
        }
    }

    switch (type) {
        case ActionType.AddCelery:
            return {
                ...state,
                celeries: {
                    ...state.celeries,
                    ...newCelery()
                }
            };

        case ActionType.ResetStore:
            if ('localStorage' in window) {
                localStorage.removeItem(PERSISTED_STORE_NAME);
            }

            return defaultState;

        default:
            console.warn(
                `Action ${type} did not alter the state! Are you missing a reducer, my friend?`
            );
            return state;
    }
};

const reducer = (state: State, action: Action): State => {
    // Timestamp this new version of the state
    state = {
        ...state,
        timestamp: +new Date()
    };

    if (process.env.NODE_ENV === 'development') {
        console.log('-----------');
        console.info('action:', action);
    }

    // Reduce state with dispatched action
    state = reduceStore(state, action);

    if (process.env.NODE_ENV === 'development') {
        console.info('state', state);
        console.log('-----------');
    }

    // Persist new state to localStorage
    if ('localStorage' in window) {
        localStorage.setItem(PERSISTED_STORE_NAME, JSON.stringify(state));
    }

    return state;
};

export default reducer;