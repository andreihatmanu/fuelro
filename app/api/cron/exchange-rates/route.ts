import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getExchangeRates } from "@/lib/data-sources/bnr";

export async function GET() {
  try {
    const rates = await getExchangeRates();

    const today = new Date();

    const date = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    for (const rate of rates) {
      await db.exchangeRate.upsert({
        where: {
          currency_date: {
            currency: rate.currency,
            date,
          },
        },
        update: {
          rate: rate.rate,
        },
        create: {
          currency: rate.currency,
          rate: rate.rate,
          date,
        },
      });
    }

    return NextResponse.json({
      success: true,
      imported: rates.length,
    });
  } catch (error) {
    console.error("Exchange rate cron failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Exchange rate update failed",
      },
      {
        status: 500,
      },
    );
  }
}