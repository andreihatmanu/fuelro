export type ExchangeRate = {
    currency: string;
    rate: number;
};

export function convertFromRon(
    priceRon: number,
    currency: string,
    rates: ExchangeRate[],
) {
    if (currency === "RON") {
        return priceRon;
    }

    const rate = rates.find(
        (item) => item.currency === currency,
    );

    if (!rate) {
        return priceRon;
    }

    return priceRon / rate.rate;
}

export function formatCurrency(
    value: number,
    currency: string,
) {
    return new Intl.NumberFormat("ro-RO", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

export const CURRENCIES = [
    { code: "RON", name: "Leu românesc", symbol: "lei" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "USD", name: "Dolar american", symbol: "$" },
    { code: "GBP", name: "Liră sterlină", symbol: "£" },
    { code: "CHF", name: "Franc elvețian", symbol: "CHF" },
    { code: "PLN", name: "Zlot polonez", symbol: "zł" },
    { code: "HUF", name: "Forint maghiar", symbol: "Ft" },
    { code: "CZK", name: "Coroană cehă", symbol: "Kč" },
    { code: "SEK", name: "Coroană suedeză", symbol: "kr" },
    { code: "NOK", name: "Coroană norvegiană", symbol: "kr" },
    { code: "DKK", name: "Coroană daneză", symbol: "kr" },
    { code: "CAD", name: "Dolar canadian", symbol: "$" },
    { code: "AUD", name: "Dolar australian", symbol: "$" },
    { code: "JPY", name: "Yen japonez", symbol: "¥" },
] as const;

export function getCurrencySymbol(currency: string): string {
    const found = CURRENCIES.find(
        (item) => item.code === currency,
    );

    return found?.symbol ?? currency;
}