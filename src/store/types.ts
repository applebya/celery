import { DeepReadonly } from 'ts-essentials';
import { CurrencyType } from '../services/types';

// Deeply immutable state
export type State = DeepReadonly<{
    timestamp: number;
    min: number;
    desired: number;
    celeries: {
        [x: string]: Celery;
    };
    currencies: Currencies;
}>;

export type Celery = {
    name: string;
    input: {
        value: number;
        type: InputType;
        currency: CurrencyType | null;
    };
};

export type Currencies = {
    base: CurrencyType;
    rates?: {
        [x: string]: CurrencyType;
    };
};

export enum InputType {
    PerHour = '/hour',
    PerDay = '/day',
    PerMonth = '/month',
    PerYear = '/year'
}

export enum ActionType {
    AddCelery = 'addCelery',
    RemoveCelery = 'removeCelery',
    SetInputValue = 'setInputValue',
    SetInputType = 'setInputType',
    SetInputCurrency = 'setInputCurrency',
    SetName = 'setName',
    SetMin = 'setMin',
    SetDesired = 'setDesired',
    SetStore = 'setStore',
    ResetStore = 'resetStore',
    SetCurrencies = 'setCurrencies',
    SetBaseCurrency = 'setBaseCurrency'
}

export type Dispatch = React.Dispatch<Action>;

// Loose typing, to avoid creating a type for every ActionType
export type Action = {
    type: ActionType;
    payload?: {
        id?: string;
        data?: any;
    };
    meta?: any;
};
