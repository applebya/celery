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
    defaults: {
        fullTime: Commitment;
        partTime: Commitment;
    };
}>;

export type Celery = {
    name: string;
    input: {
        value: number;
        type: InputType;
        currency: CurrencyType | null;
    };
    // TODO: Consolidate with Commitment type
    commitment: {
        fullTime: boolean;
        hoursInDay: number | null;
        daysInWeek: number | null;
        vacationDays: number | null;
        holidayDays: number | null;
    };
};

export type Currencies = {
    base: CurrencyType;
    date?: string;
    rates?: {
        [x: string]: CurrencyType;
    };
};

export type Commitment = {
    hoursInDay: number;
    daysInWeek: number;
    vacationDays: number;
    holidayDays: number;
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
    SetCommitmentValue = 'setCommitmentValue',
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
// TODO: Maybe a type for every ActionType... IS better?
export type Action = {
    type: ActionType;
    payload?: {
        id?: string;
        fieldName?: string;
        data?: any;
    };
    meta?: any;
};
