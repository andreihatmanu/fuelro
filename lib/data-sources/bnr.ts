const BNR_URL = "https://curs.bnr.ro/nbrfxrates.xml";

const SUPPORTED_CURRENCIES = [
  "AED",
  "AUD",
  "BRL",
  "CAD",
  "CHF",
  "CNY",
  "CZK",
  "DKK",
  "EGP",
  "EUR",
  "GBP",
  "HKD",
  "HUF",
  "IDR",
  "ILS",
  "INR",
  "ISK",
  "JPY",
  "KRW",
  "MDL",
  "MXN",
  "MYR",
  "NOK",
  "NZD",
  "PHP",
  "PLN",
  "RSD",
  "RUB",
  "SEK",
  "SGD",
  "THB",
  "TRY",
  "UAH",
  "USD",
  "ZAR",
] as const;

export type Currency =
  (typeof SUPPORTED_CURRENCIES)[number];

export type ExchangeRate = {
  currency: Currency;
  rate: number;
};

export async function getExchangeRates(): Promise<
  ExchangeRate[]
> {
  const response = await fetch(BNR_URL, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `BNR request failed: ${response.status}`,
    );
  }

  const xml = await response.text();

  const rates: ExchangeRate[] = [];

  for (const currency of SUPPORTED_CURRENCIES) {
    const regex = new RegExp(
      `<Rate\\s+currency=["']${currency}["'](?:\\s+multiplier=["'](\\d+)["'])?[^>]*>([\\d.]+)<\\/Rate>`,
    );

    const match = xml.match(regex);

    if (!match) {
      console.warn(
        `BNR rate not found for ${currency}`,
      );
      continue;
    }

    const multiplier = Number(match[1] ?? 1);
    const value = Number(match[2]);

    rates.push({
      currency,
      rate: value / multiplier,
    });
  }

  return rates;
}