"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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

const currencyItems = CURRENCIES.map((currency) => ({
    label: currency.code,
    value: currency.code,
}));

export function CurrencySelector({
    value,
    onChange,
}: CurrencySelectorProps) {
    return (
        <Select
            items={currencyItems}
            value={value}
            onValueChange={(nextValue) => {
                if (typeof nextValue === "string") {
                    onChange(nextValue);
                }
            }}
        >
            <SelectTrigger className="h-9 w-[82px] bg-white text-sm font-medium">
                <SelectValue placeholder="RON" />
            </SelectTrigger>

            <SelectContent alignItemWithTrigger={false}>
                {CURRENCIES.map((currency) => (
                    <SelectItem
                        key={currency.code}
                        value={currency.code}
                    >
                        <span className="font-medium">
                            {currency.code} ({currency.symbol})
                        </span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}