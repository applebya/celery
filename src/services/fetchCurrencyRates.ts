import { Dispatch, ActionType } from '../store/types';
import { CurrencyType } from './types';
import querystring from 'querystring';

const API_URI = 'https://api.exchangeratesapi.io/latest';

export async function fetchCurrencyRates(
    base: CurrencyType,
    dispatch: Dispatch
) {
    try {
        const request = await fetch(
            `${API_URI}?${querystring.stringify({ base })}`
        );
        const data = await request.json();

        dispatch({
            type: ActionType.SetCurrencies,
            payload: { data }
        });
    } catch (err) {
        // dispatch error
        console.error(err);
    }
}
