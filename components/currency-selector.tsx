"use client";

type CurrencySelectorProps = {
  value: string;
  onChange: (currency: string) => void;
};

const CURRENCIES = [
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

export function CurrencySelector({
  value,
  onChange,
}: CurrencySelectorProps) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-lg border bg-white px-3 py-2 text-sm shadow-sm"
    >
      {CURRENCIES.map((currency) => (
        <option key={currency.code} value={currency.code}>
          {currency.code} ({currency.symbol})
        </option>
      ))}
    </select>
  );
}