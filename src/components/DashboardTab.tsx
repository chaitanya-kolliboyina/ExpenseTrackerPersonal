"use client";

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
import { Expense, PeriodType } from "@/types";
import { fmt, fmtFull, fmtDate, filterByPeriod, getCatData } from "@/utils/formatters";
import { CATS } from "@/utils/categories";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function DashboardTab({ expenses, period }: { expenses: Expense[]; period: PeriodType }) {
    const filtered = filterByPeriod(expenses, period);
    const total = filtered.reduce((s, e) => s + e.amount, 0);
    const catData = getCatData(filtered, CATS);

    const days = { daily: 1, weekly: 7, monthly: 30, quarterly: 90, halfyearly: 180, annual: 365 }[period] || 30;
    const avgPerDay = filtered.length ? total / days : 0;
    const topCat = catData[0] || null;

    const tooltipCfg = {
        backgroundColor: '#1e1e2e',
        borderColor: '#3a3a52',
        borderWidth: 1,
        callbacks: { label: (ctx: any) => ` ${fmtFull(ctx.raw)}` }
    };

    return (
        <div className="p-3 space-y-3 pb-8">
            {/* Total Card */}
            <div className="bg-gradient-to-br from-[#1e1b4b] to-[#16161f] border border-[#312e81] rounded-xl p-4">
                <div className="text-gray-400 text-xs mb-1">Total Expenses</div>
                <div className="text-3xl font-mono font-bold text-white tracking-tight">{fmtFull(total)}</div>
                <div className="text-gray-500 text-[11px] mt-1">{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#16161f] border border-[#252535] border-t-2 border-t-[#818cf8] rounded-xl p-2">
                    <div className="text-gray-500 text-[10px] mb-1">Avg / day</div>
                    <div className="font-mono font-bold text-lg text-[#818cf8]">{fmt(avgPerDay)}</div>
                </div>
                <div className="bg-[#16161f] border border-[#252535] border-t-2 border-t-[#38bdf8] rounded-xl p-2">
                    <div className="text-gray-500 text-[10px] mb-1">Count</div>
                    <div className="font-mono font-bold text-lg text-[#38bdf8]">{filtered.length}</div>
                </div>
                <div className="bg-[#16161f] border border-[#252535] border-t-2 rounded-xl p-2" style={{ borderTopColor: topCat ? topCat.color : '#888' }}>
                    <div className="text-gray-500 text-[10px] mb-1">Top Cat</div>
                    <div className="text-lg" style={{ color: topCat ? topCat.color : '#888' }}>{topCat ? CATS[topCat.cat]?.icon : '—'}</div>
                    <div className="text-gray-400 text-[10px] truncate">{topCat ? CATS[topCat.cat]?.label : 'None'}</div>
                </div>
            </div>

            {/* Donut Chart */}
            {catData.length > 0 && (
                <div className="bg-[#16161f] border border-[#252535] rounded-xl p-4">
                    <div className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-3">Distribution</div>
                    <div className="h-44 relative flex justify-center">
                        <Doughnut
                            data={{
                                labels: catData.map(c => c.name),
                                datasets: [{ data: catData.map(c => c.value), backgroundColor: catData.map(c => c.color), borderColor: '#0d0d14', borderWidth: 2 }]
                            }}
                            options={{ responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false }, tooltip: tooltipCfg } }}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-3">
                        {catData.slice(0, 6).map(e => (
                            <div key={e.cat} className="flex items-center text-xs justify-between">
                                <div className="flex items-center space-x-1.5 truncate">
                                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: e.color }}></span>
                                    <span className="text-gray-400 truncate">{e.name}</span>
                                </div>
                                <span className="font-mono text-gray-200 pl-1">{fmt(e.value)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent List */}
            {filtered.length > 0 && (
                <div className="bg-[#16161f] border border-[#252535] rounded-xl p-4">
                    <div className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-3">Recent Items</div>
                    <div className="space-y-2">
                        {filtered.slice(0, 5).map(e => (
                            <div key={e.id} className="flex items-center justify-between py-1.5 border-b border-[#1a1a2e] last:border-none">
                                <div className="flex items-center space-x-3 truncate">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ background: `${CATS[e.category]?.color || '#888'}22` }}>
                                        {CATS[e.category]?.icon || '💸'}
                                    </div>
                                    <div className="truncate">
                                        <div className="text-xs font-semibold text-gray-200 truncate">{e.description}</div>
                                        <div className="text-[10px] text-gray-500">{e.subcategory} · {fmtDate(e.date)}</div>
                                    </div>
                                </div>
                                <div className="font-mono font-bold text-sm text-gray-200">₹{e.amount.toLocaleString('en-IN')}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {filtered.length === 0 && (
                <div className="text-center text-gray-500 py-12 text-sm">
                    <div className="text-4xl mb-2">🧾</div>No tracked data for this filter period.
                </div>
            )}
        </div>
    );
}