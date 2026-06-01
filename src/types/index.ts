export interface Expense {
    id: string;
    amount: number;
    description: string;
    category: string;
    subcategory: string;
    date: string; // ISO String format YYYY-MM-DD
    note?: string | null;
}

export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'halfyearly' | 'annual';
export type TabType = 'dashboard' | 'add' | 'history' | 'insights';