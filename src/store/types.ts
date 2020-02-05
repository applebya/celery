import { DeepReadonly } from 'ts-essentials';

// Deeply immutable state
export type State = DeepReadonly<{
    timestamp: number;
    min: number;
    desired: number;
    celeries: {
        [x: string]: Celery;
    };
}>;

export type Celery = {
    name: string;
    input: {
        value: number;
        type: InputType;
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
    SetName = 'setName',
    SetMin = 'setMin',
    SetDesired = 'setDesired',
    SetStore = 'setStore',
    ResetStore = 'resetStore'
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
