"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function getExpenses() {
    const data = await prisma.expense.findMany({
        orderBy: { date: "desc" },
    });
    return data.map(e => ({
        ...e,
        date: e.date.toISOString().split('T')[0],
    }));
}

export async function addExpense(formData: {
    amount: number;
    description: string;
    category: string;
    subcategory: string;
    date: string;
    note?: string;
}) {
    await prisma.expense.create({
        data: {
            amount: formData.amount,
            description: formData.description,
            category: formData.category,
            subcategory: formData.subcategory,
            date: new Date(formData.date),
            note: formData.note || null,
        },
    });
    revalidatePath("/");
}

export async function deleteExpense(id: string) {
    await prisma.expense.delete({ where: { id } });
    revalidatePath("/");
}