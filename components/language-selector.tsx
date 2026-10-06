"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

const languages = [
    { code: "ro", label: "Română", short: "RO" },
    { code: "en", label: "English", short: "EN" },
    { code: "es", label: "Español", short: "ES" },
    { code: "fr", label: "Français", short: "FR" },
    { code: "de", label: "Deutsch", short: "DE" },
    { code: "it", label: "Italiano", short: "IT" },
] as const;

export function LanguageSelector() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const selectedLanguage =
        languages.find(
            (language) => language.code === locale,
        );

    function handleChange(nextLocale: string) {
        router.replace(pathname, {
            locale: nextLocale,
        });
    }

    return (
        <Select
            value={locale}
            onValueChange={(value) => {
                if (typeof value === "string") {
                    handleChange(value);
                }
            }}
        >
            <SelectTrigger className="h-9 w-[110px] bg-white text-sm font-medium">
                <SelectValue>
                    {selectedLanguage?.label ?? locale}
                </SelectValue>
            </SelectTrigger>

            <SelectContent>
                {languages.map((language) => (
                    <SelectItem
                        key={language.code}
                        value={language.code}
                    >
                        <span className="font-medium">
                            {language.label}
                        </span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}