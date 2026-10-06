"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  useLocale,
} from "next-intl";

import {
  usePathname,
  useRouter,
} from "@/i18n/navigation";

const languages = [
  {
    code: "ro",
    label: "Română",
    short: "RO",
  },
  {
    code: "en",
    label: "English",
    short: "EN",
  },
] as const;

export function LanguageSelector() {
  const locale = useLocale();

  const router = useRouter();
  const pathname = usePathname();

  function handleChange(
    nextLocale: string,
  ) {
    router.replace(pathname, {
      locale: nextLocale,
    });
  }

  return (
    <Select
      value={locale}
      onValueChange={(value) => {
        if (
          typeof value === "string"
        ) {
          handleChange(value);
        }
      }}
    >
      <SelectTrigger className="h-9 w-[70px] bg-white text-sm font-medium">
        <SelectValue />
      </SelectTrigger>

      <SelectContent>
        {languages.map(
          (language) => (
            <SelectItem
              key={language.code}
              value={language.code}
            >
              <span className="font-medium">
                {language.short}
              </span>
            </SelectItem>
          ),
        )}
      </SelectContent>
    </Select>
  );
}