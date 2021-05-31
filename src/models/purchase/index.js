import { AppFirestore } from "../../db";
import { getCurrentDate, getCurrentMonth, getCurrentYear } from "../../helper/utils";

export default class PurchaseModel {
    static async getAllPurchases() {
        try {
            const purchasesDoc = await AppFirestore.collection("purchases").get();
            const products = [];
            purchasesDoc.docs.forEach(doc => {
                const product = {
                    ...doc.data(),
                    productRef: doc.ref
                };

                products.push(product);
            })
            return products;
        }
        catch (e) {
            return []
        }
    }


    static async addNewPurchase(data) {
        try {
            const productDoc = await AppFirestore.collection("products_to_purchase").doc(`${data.productId}`).get();

            if (!productDoc.exists) return {
                status: 500,
                message: "Product does not exist."
            };
            const product = productDoc.data();
            const price = Number(product.unitPrice) * Number(data.quantity);
            const dataForFire = {
                productName: product.productName,
                quantity: data.quantity,
                productId: data.productId,
                unitPrice: product.unitPrice,
                price,
                createdBy: data.createdBy,
                creationTime: new Date(),
                year: getCurrentYear(),
                month: getCurrentMonth(),
                creationDate: getCurrentDate()
            }

            await AppFirestore.collection("purchases").add(dataForFire);
            
            return {
                status: 200,
                message: "Product perchased well saved."
            }
        }
        catch (e) {
            return {
                status: 500,
                message: "Fail to save purchased product."
            }
        }

    }

    static async updatePurchasedProduct(data) {
        try {
            const productDoc = await AppFirestore.collection("products_to_purchase").doc(`${data.productId}`).get();
            const productId = data.purchasedProductId;
            if (!productDoc.exists) return {
                status: 500,
                message: "Product does not exist."
            };
            const product = productDoc.data();
            const price = Number(product.unitPrice) * Number(data.quantity);
            const dataForFire = {
                productName: product.productName,
                quantity: data.quantity,
                unitPrice: product.unitPrice,
                price,
                createdBy: data.createdBy,
                creationTime: new Date()
            }

            await AppFirestore.collection("purchases").doc(`${productId}`).update(dataForFire);

            return {
                status: 200,
                message: "Product updated."
            }
        }
        catch (e) {
            console.error(e);
            return {
                status: 500,
                message: "Fail to update product."
            }
        }
    }

    static async deleteProduct(products) {
        try {
            for (const product of products) {
                const docId = product.productRef.id;
                await AppFirestore.collection("purchases").doc(`${docId}`).delete();
            }

            return {
                status: 200,
                message: `Purchased ${products.length == 1 ? "product" : "products"} deleted.`
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