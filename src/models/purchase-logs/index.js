import { AppFirestore } from "../../db";

export default class PurchaseLogsModel {
    static async getPurchaseLogs(primaryId, productName, site, date) {
        const logs = [];
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);
        let logsSnaps;
        try {
            if (!date) throw new Error("data is not defined");
            const from = date.from;
            const to = date.to;
            console.log(productName);
            if (productName) logsSnaps = await root.collection("stockLogs")
                .where("productName", "==", productName)
                .where("tx_t", ">", from)
                .where("tx_t", "<", to) 
                .get();
            else logsSnaps = await root.collection("stockLogs")
                .where("tx_t", ">", from)
                .where("tx_t", "<", to)
                .get();
            for (const doc of logsSnaps.docs) {
                const data = doc.data();
                const productId = doc.ref.id;
                const log = {
                    ...data,
                    productId,
                    ref: doc.ref,
                };
                logs.push(log)
            }
            return logs.sort((a, b) => b.tx_t - a.tx_t);
        } catch (error) {
            return []
        }
    }

    static async getSpecificProductNameInStock(primaryId, productId, siteName) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}`);
        let productName;
        try {
            productName = (await root.collection("sites").doc(`${siteName}`).collection("stock").doc(`${productId}`).get()).data().productName;
            return productName
        } catch (error) {
            return undefined
        }
    }

    static async updatePurchasedProduct(data, primaryId, site) {
        try {
            const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);
            const getProductInStock = await root.collection("stock").where("productName", "==", data.productName).get();
            if (getProductInStock.size !== 1) return {
                status: 404,
                message: "Product not found"
            };

            const productRefInStock = getProductInStock.docs[0].ref;
            const groupPurchaseUnitPricePrev = Number((Number(data.previewAmount) / Number(data.previewQuantity)).toFixed(2));
            const purchaseUnitPrice = Number((Number(data.amount) / Number(data.quantity)).toFixed(2));
            await productRefInStock.update({ productName: data.productName });
            const foundGroup = await productRefInStock.collection("groups")
                .where("purchaseUnitPrice", "==", groupPurchaseUnitPricePrev).get();
            if (foundGroup.size !== 1) return {
                status: 404,
                message: "Product not found"
            };

            const currentFoundQuantity = Number(foundGroup.docs[0].data().quantity);
            if (currentFoundQuantity < Number(data.quantity)) return {
                status: 500,
                message: `Operation failled because the quantity in stock which is (${data.quantity.toLocaleString()}) is less than the quantity of the product.`
            };
            const restoreProductInStock = currentFoundQuantity - Number(data.quantity);
            await foundGroup.docs[0].ref.update({
                quantity: restoreProductInStock,
            });
            if (groupPurchaseUnitPricePrev == purchaseUnitPrice) {
                await foundGroup.docs[0].ref.update({
                    quantity: Number(data.quantity),

                })
            }
            else {
                const secondFoundGroup = await productRefInStock.collection("groups")
                    .where("purchaseUnitPrice", "==", purchaseUnitPrice).get();
                if (secondFoundGroup.size == 1) {
                    secondFoundGroup.docs[0].ref.update({ quantity: Number(data.quantity) });
                }
                else if (secondFoundGroup.size == 0) {
                    await productRefInStock.collection("groups").add({
                        quantity: Number(data.quantity),
                        purchaseUnitPrice
                    });
                }
                else {
                    return {
                        status: 500,
                        message: "Product update fail"
                    };
                }
            }

            await data.productRef.update({
                quantity: data.quantity,
                productName: data.productName,
                amount: data.amount,
                purchaseUnitPrice
            })

            return {
                status: 200,
                message: "Product updated succefully"
            };

        } catch (error) {
            console.error(error);
            return {
                status: 500,
                message: "Product update fail"
            };
        }
    }

    static async deletePurchasedProduct(data, primaryId, site) {
        console.log(site);
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);
        try {
                if (data.takenAction !== "purchased") return {
                    status: 500,
                    message: "Product can not be deleted"
                }

                const getProductInStock = await root.collection("stock").where("productName", "==", data.productName).get();
                console.log(getProductInStock.size, data.productName);
                if (getProductInStock.size !== 1)  throw new Error("failled");
                const productRefInStock = getProductInStock.docs[0].ref;
                const purchaseUnitPrice = Number((Number(data.amount) / Number(data.quantity)).toFixed(2));
                const foundGroup = await productRefInStock.collection("groups")
                    .where("purchaseUnitPrice", "==", purchaseUnitPrice).get();

                if (foundGroup.size !== 1) throw new Error("group not found");

                const currentFoundQuantity = Number(foundGroup.docs[0].data().quantity);
                if (currentFoundQuantity < Number(data.quantity))  throw new Error("currentFoundQuantity is less thant the actual quantity");
                const deleteProductInStock = currentFoundQuantity - Number(data.quantity);
                foundGroup.docs[0].ref.update({ quantity: deleteProductInStock })
                await data.ref.delete();

            return {
                status: 200,
                message: "Product deleted succefully"
            };

        } catch (error) {
            console.error(error);
            return {
                status: 500,
                message: "Product deletion fail"
            };
        }
    }
}