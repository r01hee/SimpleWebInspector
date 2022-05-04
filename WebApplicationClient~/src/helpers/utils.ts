
export function filterFloat(value: string): number {
    if (/^(-|\+)?[0-9]+(\.[0-9]+)?$/.test(value)) {
        return Number(value)
    }
    return NaN;
}