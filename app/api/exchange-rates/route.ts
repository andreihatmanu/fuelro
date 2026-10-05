import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const rates = await db.exchangeRate.findMany({
      orderBy: {
        currency: "asc",
      },
    });

    return NextResponse.json(rates);
  } catch (error) {
    console.error("Failed to fetch exchange rates:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch exchange rates",
      },
      {
        status: 500,
      },
    );
  }
}