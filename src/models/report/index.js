import { AppFirestore } from "../../db";

export default class ReportModel {
    static async getOperatingAccount(primaryId, site, year) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);
        const months = [];
        const report = [];
        try {
            const optAccountsnap = await root.collection("operatingAccount").doc(`${year}`).collection("months").get();
            optAccountsnap.docs.forEach(doc => {
                const id = doc.ref.id;
                const fireData = doc.data();
                const salesAmount = fireData.salesAmount || 0;
                const stockAmount = fireData.stockAmount || 0;
                const creditAmount = fireData.creditAmount || 0;
                const paidCredit = fireData.paidCredit || 0;
                const remainCreditAmount =  creditAmount - paidCredit;
                const totalOfCreditAmount = creditAmount + paidCredit;
                const grossProfit = (Number(salesAmount) + Number(totalOfCreditAmount)) - (Number(stockAmount));
                months.push(id);
                let expensesAmount = 0;
                const expenses = fireData.expenses;
                if (expenses) {
                    for (const exp in expenses) {
                        const amount = Number(expenses[exp]);
                        expensesAmount = + amount;
                    }
                }
                const netProfit = grossProfit - expensesAmount;
                const data = {
                    ...fireData,
                    remainCreditAmount,
                    ref: doc.ref,
                    grossProfit,
                    netProfit
                };
                report.push(data);
            });
            return {
                status: 200,
                data: { months, report }
            }
        } catch (error) {
            console.error(error);
            return {
                status: 500,
                data: undefined
            }
        }
    }

    static async getOperatingAccountYears(primaryId, site) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);
        try {
            const snap = await root.collection("operatingAccount").get();
            return snap.docs.map(doc => {
                return {
                    ref: doc.ref,
                    ...doc.data(),
                }
            });
        } catch (error) {
            console.error(error);
            return [];
        }
    }


    static async getStockCurrentAccount(primaryId, site, date) {

        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);
        const productsData = new Map();
        try {
            if (!date) throw new Error("data is not defined");
            const from = date.from;
            const to = date.to;
            const snap = await root.collection("stockLogs")
                .where("tx_t", ">=", from)
                .where("tx_t", "<=", to)
                .get();
            for(const doc of snap.docs){
                const data = doc.data();
                const productName = data.productName;
                if(productsData.has(productName)){
                    const productData = productsData.get(productName);
                    const profitFromMap = Number(productData.profit);

                    const purchaseAmountFromMap = Number(productData.purchaseAmount);
                    const purchaseAmountFromFire = Number(data.quantity) * Number(data.purchaseUnitPrice);
                    const purchaseAmount = purchaseAmountFromMap + purchaseAmountFromFire;
                    productData.purchaseAmount = purchaseAmount;

                    const salesAmountFromMap = Number(productData.salesAmount);
                    const soldAmount = Number(data.quantity) * Number(data.unitPrice)
                    const salesAmount = soldAmount + salesAmountFromMap;
                    productData.salesAmount = salesAmount;

                    const quantityFromFire = Number(data.quantity);
                    const quantityFromMap = Number(productData.quantity);
                    const quantity = quantityFromFire + quantityFromMap;
                    productData.quantity = quantity;

                    const singleProfit = soldAmount - purchaseAmountFromFire;
                    const profit = profitFromMap + singleProfit;
                    productData.profit = profit;

                    productsData.set(productName, productData);
                }
                else{
                    const quantity = Number(data.quantity);
                    const purchaseAmount = quantity * Number(data.purchaseUnitPrice);
                    const salesAmount = quantity * Number(data.unitPrice);
                    const profit = salesAmount - purchaseAmount;
                    const dataForMap = {
                        productName: data.productName,
                        quantity: quantity,
                        purchaseAmount,
                        salesAmount,
                        profit
                    }
                    productsData.set(productName, dataForMap);
                }
            }
            const finalProductsData =  Array.from(productsData.values()).sort((a,b)=> b.tx_t - a.tx_t);
            return finalProductsData;
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    static async getSalesCurrentAccount(primaryId, site, date) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);
        const productsData = new Map();
        try {
            if (!date) throw new Error("data is not defined");
            const from = date.from;
            const to = date.to;
            const snap = await root.collection("sales")
                .where("tx_t", ">=", from)
                .where("tx_t", "<=", to)
                .get();
            for(const doc of snap.docs){
                const data = doc.data();
                const productName = data.productName;
                if(productsData.has(productName)){
                    const productData = productsData.get(productName);
                    const purchaseAmountFromMap = Number(productData.purchaseAmount);

                    const purchaseAmountFromFire = Number(data.quantity) * Number(data.purchaseUnitPrice);
                    const purchaseAmount = purchaseAmountFromMap + purchaseAmountFromFire;
                    productData.purchaseAmount = purchaseAmount;

                    const salesAmountFromMap = Number(productData.salesAmount);
                    const amount = Number(data.quantity) * Number(data.unitPrice);
                    const salesAmount = amount + salesAmountFromMap;
                    productData.salesAmount = salesAmount;

                   const quantityFromFire = Number(data.quantity);
                    const quantityFromMap = Number(productData.quantity);
                    const quantity = quantityFromFire + quantityFromMap;
                    productData.quantity = quantity;

                    const profitFromMap = productData.profit;
                    const singleProfit = amount - purchaseAmountFromFire;
                    const profit = profitFromMap + singleProfit;
                    productData.profit = profit;

                    productsData.set(productName, productData);
                }
                else{
                    const quantity = Number(data.quantity);
                    const purchaseAmount = Number(data.quantity) * Number(data.purchaseUnitPrice);
                    const salesAmount = quantity * Number(data.unitPrice);
                    const profit = salesAmount - purchaseAmount;
                    const dataForMap = {
                        productName: data.productName,
                        quantity,
                        unitPrice: data.unitPrice,
                        purchaseUnitPrice: data.purchaseUnitPrice,
                        purchaseAmount,
                        salesAmount,
                        profit
                    }
                    productsData.set(productName, dataForMap);
                }
            }
            return Array.from(productsData.values()).sort((a,b)=> b.tx_t - a.tx_t);
        } catch (error) {
            console.error(error);
            return [];
        }
    }
}