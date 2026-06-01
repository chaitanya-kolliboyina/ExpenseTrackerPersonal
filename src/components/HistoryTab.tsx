"use client";

import { useState } from "react";
import { Expense } from "@/types";
import { CATS } from "@/utils/categories";
import { fmtDate } from "@/utils/formatters";

export default function HistoryTab({ expenses, onDelete }: { expenses: Expense[]; onDelete: (id: string) => Promise<void> }) {
    const [search, setSearch] = useState("");
    const [filterCat, setFilterCat] = useState("all");
    const [confirmId, setConfirmId] = useState<string | null>(null);

    let arr = [...expenses];
    if (filterCat !== "all") arr = arr.filter(e => e.category === filterCat);
    if (search) arr = arr.filter(e => e.description.toLowerCase().includes(search.toLowerCase()));

    const handleDelClick = (id: string) => {
        if (confirmId === id) {
            onDelete(id);
            setConfirmId(null);
        } else {
            setConfirmId(id);
            setTimeout(() => setConfirmId(null), 3000); // 3 second confirmation grace period
        }
    };

    return (
        <div className="p-3 space-y-3">
            <input type="text" placeholder="🔍 Search description..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-[#16161f] border border-[#252535] rounded-xl p-3 text-sm text-gray-200 outline-none" />

            {/* Horizontally scrolling quick-filter bar */}
            <div className="flex space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
                <button onClick={() => setFilterCat("all")} className={`px-3 py-1 rounded-full text-xs font-medium border shrink-0 ${filterCat === 'all' ? 'bg-indigo-950/40 border-indigo-500 text-indigo-400' : 'bg-[#1a1a2e] border-[#2a2a3d] text-gray-400'}`}>All</button>
                {Object.entries(CATS).map(([k, v]) => (
                    <button key={k} onClick={() => setFilterCat(k)} className={`px-3 py-1 rounded-full text-xs font-medium border shrink-0`} style={filterCat === k ? { backgroundColor: `${v.color}22`, borderColor: v.color, color: v.color } : { backgroundColor: '#1a1a2e', borderColor: '#2a2a3d', color: '#94a3b8' }}>{v.icon} {v.label.split(' ')[0]}</button>
                ))}
            </div>

            <div className="bg-[#16161f] border border-[#252535] rounded-xl p-4">
                <div className="text-gray-500 text-[10px] mb-2">{arr.length} total entries</div>
                <div className="space-y-3">
                    {arr.map(e => (
                        <div key={e.id} className="flex items-center justify-between border-b border-[#1a1a2e] pb-2 last:border-none last:pb-0">
                            <div className="flex items-center space-x-3 truncate">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0" style={{ background: `${CATS[e.category]?.color || '#888'}22` }}>{CATS[e.category]?.icon || '💸'}</div>
                                <div className="truncate">
                                    <div className="text-xs font-semibold text-gray-200 truncate">{e.description}</div>
                                    <div className="text-[10px] text-gray-500 truncate">{CATS[e.category]?.label} · {e.subcategory} · {fmtDate(e.date)}</div>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <div className="font-mono font-bold text-sm text-gray-200">₹{e.amount.toLocaleString('en-IN')}</div>
                                <button onClick={() => handleDelClick(e.id)} className={`text-[10px] mt-0.5 border px-1.5 py-0.5 rounded ${confirmId === e.id ? 'border-rose-500/40 text-rose-400 bg-rose-950/20 font-bold' : 'border-[#2a2a3d] text-gray-500'}`}>{confirmId === e.id ? 'Confirm?' : 'Delete'}</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}