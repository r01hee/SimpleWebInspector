import {filterFloat} from '../helpers/utils'

export default class NumberField {
    private _valueStr!: string
    private _value!: number
    private _error!: boolean

    constructor(value: number, error?: boolean);
    constructor(valueStr: string);
    constructor(value?: any, error?: boolean)
    {
        if (typeof value === 'number') {
            this._valueStr = value.toString()
            this._value = value as number;
            this._error = error === undefined ? false : error;
        } else if (typeof value === 'string') {
            this.valueStr = value;
        }
    }

    set valueStr(valueStr: string)
    {
        this._valueStr = valueStr;

        const value = filterFloat(valueStr);
        this._error = isNaN(value)
        if (!this._error) {
            this._value = value
        }
    }

    get valueStr(): string
    {
        return this._valueStr;
    }

    get value(): number
    {
        return this._value;
    }

    get error(): boolean
    {
        return this._error;
    }
}