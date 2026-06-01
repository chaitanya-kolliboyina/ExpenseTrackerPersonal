import type { Metadata } from "next";
import "./global.css";

export const metadata: Metadata = {
    title: "ExpenseIQ",
    description: "Smart Expense Tracker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            </head>
            <body className="bg-[#0d0d14] text-[#e2e8f0] antialiased select-none min-h-[100vh] min-h-[100dvh] h-[100vh] h-[100dvh] flex flex-col overflow-hidden max-w-[520px] mx-auto">
                {children}
            </body>
        </html>
    );
}