"use client";

import { useState, useEffect } from "react";
import { Expense, PeriodType, TabType } from "@/types";
import { getExpenses, addExpense, deleteExpense } from "./actions";
import DashboardTab from "@/components/DashboardTab";
import AddTab from "@/components/AddTab";
import HistoryTab from "@/components/HistoryTab";
import InsightsTab from "@/components/InsightsTab";

export default function Home() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [period, setPeriod] = useState<PeriodType>("monthly");
    const [tab, setTab] = useState<TabType>("dashboard");
    const [toast, setToast] = useState("");

    const refreshData = () => {
        getExpenses().then(setExpenses);
    };

    useEffect(() => {
        refreshData();
    }, []);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(""), 2200);
    };

    const handleAddExpense = async (data: any) => {
        await addExpense(data);
        refreshData();
        setTab("dashboard");
    };

    const handleDeleteExpense = async (id: string) => {
        await deleteExpense(id);
        refreshData();
        showToast("Deleted");
    };

    return (
        <>
            {/* Application Top Bar View Frame Context */}
            <div className="bg-[#0d0d14] border-b border-[#1a1a2e] p-3 shrink-0 z-10">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="text-white font-extrabold tracking-tight text-lg">💰 ExpenseIQ</div>
                        <div className="text-gray-500 text-[10px]">Cloud Connected Serverless Matrix</div>
                    </div>
                </div>

                {tab !== "add" && (
                    <div className="flex space-x-1 mt-2 overflow-x-auto no-scrollbar">
                        {(["daily", "weekly", "monthly", "quarterly", "halfyearly", "annual"] as PeriodType[]).map(p => (
                            <button key={p} onClick={() => setPeriod(p)} className={`px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 border ${period === p ? 'bg-indigo-950/40 border-indigo-500 text-indigo-400' : 'bg-[#16161f] border-[#252535] text-gray-500'}`}>
                                {p === 'daily' ? 'Today' : p === 'weekly' ? 'Week' : p === 'monthly' ? 'Month' : p === 'quarterly' ? '3 Mo' : p === 'halfyearly' ? '6 Mo' : 'Year'}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Main Responsive Canvas Scroll Box Container */}
            <div className="flex-1 overflow-y-auto pb-4">
                {tab === "dashboard" && <DashboardTab expenses={expenses} period={period} />}
                {tab === "add" && <AddTab onAdd={handleAddExpense} showToast={showToast} />}
                {tab === "history" && <HistoryTab expenses={expenses} onDelete={handleDeleteExpense} />}
                {tab === "insights" && <InsightsTab expenses={expenses} period={period} />}
            </div>

            {/* Dynamic Mobile View Safe Bottom Toolbar Menu */}
            <div className="flex bg-[#0d0d14] border-t border-[#1a1a2e] shrink-0 pb-safe">
                {(["dashboard", "add", "history", "insights"] as TabType[]).map(t => (
                    <button key={t} onClick={() => setTab(t)} className={`flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-medium ${tab === t ? 'text-[#6366f1]' : 'text-gray-500'}`}>
                        <span className="text-lg">{t === 'dashboard' ? '📊' : t === 'add' ? '➕' : t === 'history' ? '🗓️' : '🔍'}</span>
                        <span className="capitalize mt-0.5">{t}</span>
                    </button>
                ))}
            </div>

            {/* Floating System Status Alert Message Indicator */}
            {toast && (
                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#1e1e2e] border border-[#3a3a52] rounded-full px-4 py-1.5 text-xs text-indigo-300 shadow-2xl z-50 animate-fade-in-up">
                    {toast}
                </div>
            )}
        </>
    );
}