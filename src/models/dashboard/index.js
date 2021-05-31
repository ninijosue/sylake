import { AppFirestore } from "../../db";

export default class DashboardModel {

    static async chartData(primaryId) {
        const label = [];
        const salesQantity = [];
        const root = AppFirestore.collection("owner").doc(`${primaryId}`);
        const sales = (await (root.collection("sales").get())).docs.map(d => d.data());
        for (const sold of sales) {
            label.push("");
            salesQantity.push(sold.quantity);
        }
        return {
            label,
            salesQantity
        }
    }

    static async expensesChart(primaryId) {
        const label = [];
        const expensesPrices = [];
        const root = AppFirestore.collection("owner").doc(`${primaryId}`);
        const expenses = (await (root.collection("expenses").get())).docs.map(d => d.data());
        for (const expense of expenses) {
            label.push("");
            expensesPrices.push(expense.price);
        }
        return {
            label,
            expensesPrices
        }
    }

    static async purchasesChart(primaryId) {
        const label = [];
        const purchasesQuantities = [];
        const root = AppFirestore.collection("owner").doc(`${primaryId}`);
        const purchases = (await (root.collection("stockLogs").get())).docs.map(d => d.data());
        for (const pur of purchases) {
            label.push("");
            purchasesQuantities.push(pur.quantity);
        }
        return {
            label,
            purchasesQuantities
        }
    }

    static async loanChart(primaryId) {
        const label = [];
        const loansTotal = [];
        const root = AppFirestore.collection("owner").doc(`${primaryId}`);
        const loans = (await (root.collection("loans").get())).docs.map(d => ({ ...(d.data()), ref: d.ref }));
        for (const loan of loans) {
            label.push("");
            let productPriceTotal = 0;
            const docs = (await loan.ref.collection("products").get()).docs;
            for (const doc of docs) {
                const data = doc.data();
                let quantity = Number(data.quantity);
                if (isNaN(quantity)) quantity = 0;
                productPriceTotal = +  (quantity * Number(data.unitPrice));
            }
            loansTotal.push(productPriceTotal);
        }
        return {
            label,
            loansTotal
        }
    }

    static async getListOfVilnirableState(primaryId) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}`);
        try {
            const foundSnaps = await root.collection("stock").where("quantity", "<=", 50).get();
            const products = []
            foundSnaps.docs.forEach(doc => {
                const data = doc.data();
                let danger = false;
                if (data.quantity <= 10) danger = true;
                const singleProduct = {
                    ...data,
                    ref: doc.ref,
                    danger
                }
                products.push(singleProduct);
            });
            return products;
        } catch (error) {
            return [];
        }
    }
    static async getListOfMostVilnirableState(primaryId) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}`);
        try {
            const foundSnaps = await root.collection("stock").where("quantity", "<=", 10).get();
            foundSnaps.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    ref: doc.ref
                }
            })
        } catch (error) {
            return [];
        }
    }

    static async getTotalAmountOfAllSales(primaryId) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}`);
        try {
            let total = 0;
            const salesSnap = await root.collection("sales").get();
            salesSnap.docs.forEach(doc => {
                const quantity = doc.data().quantity;
                const price = doc.data().unitPrice;
                if (!quantity) return;
                total += Number(quantity) * Number(price);
            });
            return total;
        } catch (error) {
            return 0;
        }
    }

    static async getTotalAmountOfAllExpenses(primaryId) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}`);
        try {
            let total = 0;
            const salesSnap = await root.collection("expenses").get();
            salesSnap.docs.forEach(doc => {
                const price = doc.data().price;
                if (!price) return;
                total += Number(price);
            });
            return total;
        } catch (error) {
            return 0;
        }
    }

    static async getTotalAmountOfAllProductsInStock(primaryId) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}`);
        let total = 0;
        try {
            // const producdtsSnaps = await root.collection("products").get();
            // const allProductsData = producdtsSnaps.docs.map(doc => doc.data());
            const productsSnapsInStock = await root.collection("stockLogs")
                .where("takenAction", "==", "purchased").get();
            // const allProductsDataInStock = productsSnapsInStock.docs.map(doc => doc.data());
            for (const doc of productsSnapsInStock.docs) {
                const data = doc.data();
                // for (const productDataInStock of allProductsDataInStock) {
                //     if (productData.productName == productDataInStock.productName) {
                //         const productTotalAmount = Number(productDataInStock.quantity) * Number(productData.unitPrice);
                //         total += productTotalAmount;
                //     }
                // }
                let amount = Number(data.amount);
                if (isNaN(amount)) amount = 0;
                total = + amount;
            }
            return total;
        } catch (error) {
            console.error(error);
            return 0;
        }
    }
}