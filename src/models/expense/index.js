import { AppFirestore } from "../../db";
import { getCurrentDate, getCurrentMonth, getCurrentYear } from "../../helper/utils";

export default class ExpenseModel {
    static async getAllExpenses(primaryId, site) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);
        try {
            const purchasesDoc = await root.collection("expenses").get();
            const expenses = [];
            purchasesDoc.docs.forEach(doc => {
                const expense = {
                    ...doc.data(),
                    ref: doc.ref
                }

                expenses.push(expense);
            })
            return expenses;
        }
        catch (e) {
            return []
        }
    }



    static async addNewExpense(data, primaryId, site) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);
        try {
            if(!data.expenseCategory) throw new Error("no expense category found!");
            const dataForFire = {
                ...data,
                year: getCurrentYear(),
                month: getCurrentMonth(),
                creationDate: getCurrentDate()
            }
            await root.collection("expenses").add(dataForFire);
            return {
                status: 200,
                message: "Expense well registered"
            }
        }
        catch (e) {
            return {
                status: 500,
                message: "Fail to register expense."
            }
        }
    }

    static async updateExpense(data) {
        const ref = data.ref;
        const dataForFire = { ...data };
        delete dataForFire.ref;
        try {
            await ref.update(dataForFire);
            return {
                status: 200,
                message: "Expense updated"
            }
        }
        catch (e) {
            return {
                status: 500,
                message: "Fail to update expense."
            }
        }
    }

    static async deleteExpense(expenses, primaryId) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}`);
        try {
            for (const expense of expenses) {
                await expense.ref.delete();
            }

            return {
                status: 200,
                message: `${expenses.length == 1 ? "Expense" : "Expenses"} deleted.`
            }
        }
        catch (e) {
            return {
                status: 500,
                message: `Deletion fail.`
            }
        }
    }

    static async getExpenseCategories(primaryId, site) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);
        try {
            const categoriesSnap = await root.collection("expenseCategories").get();
            return categoriesSnap.docs.map(doc => ({ ...doc.data(), ref: doc.ref }))
        }
        catch (e) {
            return []
        }
    }

    static async addNewCategory(data, primaryId, site) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);
        try {
            if(!primaryId) throw new Error("Main ID not found!");
            await root.collection("expenseCategories").add(data);
            return {
                status: 200,
                message: "Category added successfully"
            }
        }
        catch (e) {
            return {
                status: 500,
                message: "Fail to add category ."
            }
        }
    }

    static async updateExpenseCategory(data) {
        const ref = data.ref;
        const dataForFire = data;
        delete dataForFire.ref;
        try {
            await ref.update(dataForFire);
            return {
                status: 200,
                message: "Category updated successfully"
            }
        }
        catch (e) {
            return {
                status: 500,
                message: "Fail to update category ."
            }
        }
    }

    static async deleteExpenseCategories(categories) {
        try {
            for (const category of categories) {
                await category.ref.delete();
            }

            return {
                status: 200,
                message: `${categories.length == 1 ? "Category" : "Categories"} deleted.`
            }
        }
        catch (e) {
            return {
                status: 500,
                message: `Deletion fail.`
            }
        }
    }
}