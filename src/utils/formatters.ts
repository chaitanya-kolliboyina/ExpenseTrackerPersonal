import { Expense, PeriodType } from "@/types";

export function fmt(n: number) {
    if (n >= 1e5) return '₹' + (n / 1e5).toFixed(1) + 'L';
    if (n >= 1e3) return '₹' + (n / 1e3).toFixed(1) + 'K';
    return '₹' + Math.round(n).toLocaleString('en-IN');
}

export function fmtFull(n: number) {
    return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export function fmtDate(s: string) {
    return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
}

export function filterByPeriod(arr: Expense[], p: PeriodType) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return arr.filter(e => {
        const d = new Date(e.date);
        if (p === 'daily') return d >= today;
        if (p === 'weekly') return d >= new Date(today.getTime() - 6 * 864e5);
        if (p === 'monthly') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        if (p === 'quarterly') return d >= new Date(today.getTime() - 89 * 864e5);
        if (p === 'halfyearly') return d >= new Date(today.getTime() - 179 * 864e5);
        if (p === 'annual') return d.getFullYear() === now.getFullYear();
        return true;
    });
}

export function getCatData(arr: Expense[], CATS: any) {
    const m: Record<string, number> = {};
    arr.forEach(e => { m[e.category] = (m[e.category] || 0) + e.amount; });
    return Object.entries(m)
        .map(([c, v]) => ({ name: CATS[c]?.label || c, value: v, color: CATS[c]?.color || '#888', cat: c }))
        .sort((a, b) => b.value - a.value);
}