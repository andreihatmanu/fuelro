import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "FuelRO",
    description:
        "Compară prețurile carburanților din România.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ro">
            <body>{children}</body>
        </html>
    );
}