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
    ratingTypes: {
        [x: string]: string;
    };
    // TODO:
    // settings: {
    //     commitmentType: CommitmentType,
    //     multipleCurrencies: boolean;
    // };
}>;

export type Celery = {
    name: string;
    input: {
        value: number | null;
        type: MeasurementType;
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
    ratings: {
        [x: string]: number;
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

export enum MeasurementType {
    PerHour = '/hour',
    PerDay = '/day',
    PerMonth = '/month',
    PerYear = '/year'
}

// TODO: Change to A_B case
export enum ActionType {
    AddCelery = 'addCelery',
    RemoveCelery = 'removeCelery',
    SetInputValue = 'setInputValue',
    SetInputMeasurement = 'setInputMeasurement',
    SetInputCurrency = 'setInputCurrency',
    SetCommitmentValue = 'setCommitmentValue',
    SetRating = 'setRating',
    SetRatingTypeName = 'setRatingTypeName',
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
        subID?: string;
        data?: any;
    };
    meta?: any;
};
