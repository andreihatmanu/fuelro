"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { CURRENCIES } from "@/lib/currency";

type CurrencySelectorProps = {
    value: string;
    onChange: (currency: string) => void;
};

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