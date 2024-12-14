/** @format */

export function processValue(value: string): string {
    const int = Number.parseInt(value);
    const decimal = Number.parseFloat(value);
    return Number.isNaN(int) && Number.isNaN(decimal) ? `'${value}'` : value;
}
