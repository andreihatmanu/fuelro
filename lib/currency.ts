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