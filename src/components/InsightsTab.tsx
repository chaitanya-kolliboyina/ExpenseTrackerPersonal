"use client";

import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Filler } from "chart.js";
import { Expense, PeriodType } from "@/types";
import { getCatData, filterByPeriod, fmtFull } from "@/utils/formatters";
import { CATS } from "@/utils/categories";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Filler);

export default function InsightsTab({ expenses, period }: { expenses: Expense[]; period: PeriodType }) {
    const filtered = filterByPeriod(expenses, period);
    const catData = getCatData(filtered, CATS);
    const topCat = catData[0] || null;

    // Compute 6-month historical vector matrix metrics
    const now = new Date();
    const trendLabels: string[] = [];
    const trendValues: number[] = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        trendLabels.push(d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }));
        trendValues.push(0);
    }

    expenses.forEach(e => {
        const d = new Date(e.date);
        const k = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        const idx = trendLabels.indexOf(k);
        if (idx >= 0) trendValues[idx] += e.amount;
    });

    let subData: { name: string; value: number }[] = [];
    if (topCat) {
        const m: Record<string, number> = {};
        filtered.filter(e => e.category === topCat.cat).forEach(e => { m[e.subcategory] = (m[e.subcategory] || 0) + e.amount; });
        subData = Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }

    return (
        <div className="p-3 space-y-3 pb-8">
            {/* Trend Card */}
            <div className="bg-[#16161f] border border-[#252535] rounded-xl p-4">
                <div className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-2">6-Month Trend</div>
                <div className="h-40">
                    <Line
                        data={{
                            labels: trendLabels,
                            datasets: [{ data: trendValues, borderColor: '#6366f1', borderWidth: 2, pointBackgroundColor: '#6366f1', fill: true, backgroundColor: 'rgba(99,102,241,0.05)', tension: 0.3 }]
                        }}
                        options={{ responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false } }, y: { grid: { color: '#1a1a2e' } } } }}
                    />
                </div>
            </div>

            {/* Subcategory breakdown layout wrapper */}
            {topCat && subData.length > 0 && (
                <div className="bg-[#16161f] border border-[#252535] rounded-xl p-4">
                    <div className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-3">{CATS[topCat.cat]?.icon} {CATS[topCat.cat]?.label} — Subcategories</div>
                    <div className="space-y-3">
                        {subData.map(s => (
                            <div key={s.name} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">{s.name}</span>
                                    <span className="font-mono text-gray-200">{fmtFull(s.value)}</span>
                                </div>
                                <div className="h-1.5 w-full bg-[#1e1e2e] rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${(s.value / subData[0].value) * 100}%`, backgroundColor: topCat.color }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}