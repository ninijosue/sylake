import { AppDB, AppFirestore } from "../../db";
import { currentMonth, getCurrentDate, getCurrentMonth, getCurrentYear } from "../../helper/utils";

export default class SalesModel {
    static async getAllSales(primaryId, site, date) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);
        try {
            if (!date) throw new Error("data is not defined");
            const from = date.from;
            const to = date.to;
            const salesDoc = await root.collection("sales")
                .where("tx_t", ">=", from)
                .where("tx_t", "<=", to)
                .get();
            const products = [];
            salesDoc.docs.forEach(doc => {
                const data = doc.data();
                const price = Number(data.quantity) * Number(data.unitPrice);
                const product = {
                    ...data,
                    ref: doc.ref,
                    price,
                }
                products.push(product);
            })
            return products.sort((a, b) => b.tx_t - a.tx_t);
        }
        catch (e) {
            return []
        }
    }

    /**
     * 
     * @param {[{productName: String,unitPrice: number, quantity: number}]} products 
     */
    static async addSoldProducts(products, primaryId, user, site) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);
        try {
            for (const product of products) {
                const productId = product.productId;
                const quantity = product.quantity;
                const amount = product.amount;
                const productDataDoc = await root.collection("products").doc(`${productId}`).get();
                let unitPrice = 0;
                if (!amount || isNaN(amount)) {
                    unitPrice = (productDataDoc.data()).unitPrice;
                }
                else {
                    const amountToNumber = Number(amount);
                    unitPrice = amountToNumber / quantity;
                }


                if (productDataDoc.exists) {
                    const productData = productDataDoc.data();
                    const productName = productData.productName;
                    const dataForFire = {
                        productName,
                        quantity: Number(quantity),
                        doneBy: product.uid,
                        unitPrice: Number(unitPrice),
                        creationTime: new Date(),
                        takenAction: "sold",
                        namesOfWhoCreatedThis: user.names,
                        year: getCurrentYear(),
                        month: getCurrentMonth(),
                        creationDate: getCurrentDate(),
                        currentStock: "sugarStock1",
                        purchaseUnitPrice: product.purchaseUnitPrice,
                        tx_t: new Date().getTime()
                    };
                    const manualId = Math.floor((Math.random() * 857905975704795794) + 324);
                    await root.collection("sales").doc(`${manualId}`).set(dataForFire);

                }
            }
            return {
                status: 200,
                message: `${products.length == 1 ? "Product" : "Products"} saved successfully.`
            }
        } catch (error) {
            console.error(error);
            return {
                status: 500,
                message: `Fail to Save products ${products.length == 1 ? "Product" : "Products"}`
            }
        }

    }



    /**
     * 
     * @param {[{productName: String,unitPrice: number, quantity: number}]} products 
     */
    static async addSoldProductsWhenProductsDefineIsCustomProductRoleNotBoth(products, primaryId, user, site) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);
        try {
            for (const product of products) {
                const productId = product.productId;
                const quantity = product.quantity;
                const productDataDoc = await root.collection("products").doc(`${productId}`).get();
                let unitPrice = 0;
                if (!amount || isNaN(amount)) {
                    unitPrice = (productDataDoc.data()).unitPrice;
                }
                else {
                    const amountToNumber = Number(amount);
                    unitPrice = amountToNumber / quantity;
                }

                if (productDataDoc.exists) {
                    const productData = productDataDoc.data();
                    const productName = productData.productName;
                    const dataForFire = {
                        productName,
                        quantity: Number(quantity),
                        doneBy: product.uid,
                        unitPrice: Number(unitPrice),
                        creationTime: new Date(),
                        namesOfWhoCreatedThis: user.names,
                        year: getCurrentYear(),
                        month: getCurrentMonth(),
                        creationDate: getCurrentDate(),
                        tx_t: new Date().getTime()
                    };
                    await root.collection("sales").add(dataForFire);
                }
            }
            return {
                status: 200,
                message: `${products.length == 1 ? "Product" : "Products"} saved successfully.`
            }
        } catch (error) {
            return {
                status: 500,
                message: `Fail to Save products ${products.length == 1 ? "Product" : "Products"}`
            }
        }

    }

    /**
     * 
     * @param {String} uid 
     */
    static async getAllUserDoneSales(uid, primaryId) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}`);
        if (!uid || uid == "") return [];
        try {
            const salesDoc = await root.collection("sales")
                .orderBy("creationTime", "desc")
                .where("doneBy", "==", uid).get();
            const products = [];
            salesDoc.docs.forEach(doc => {
                const data = doc.data();
                const price = Number(data.quantity) * Number(data.unitPrice);
                const product = {
                    ...data,
                    ref: doc.ref,
                    price
                }

                products.push(product);
            })
            return products;
        }
        catch (e) {
            return []
        }

    }

    static async updateSoldProduct(data, productId, primaryId, initialQuantity, user, site) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);
        try {
            const quantity = Number(data.quantity);
            const saleRef = data.ref;
            delete data.ref;
            const productData = (await root.collection("products").doc(`${data.productId}`).get()).data();

            const getPrevProductInStock = await root.collection("stock").where("productName", "==", data.prevProductName).get();
            const getCurrentProductInStock = await root.collection("stock").where("productName", "==", productData.productName).get()
            if (getCurrentProductInStock.size !== 1) return {
                status: 500,
                message: "product not found in stock."
            };

            const prevProductInStockRef = getPrevProductInStock.docs[0].ref;
            const currentproductRefInStock = getCurrentProductInStock.docs[0].ref;
            const foundPrevSpecificGroup = await prevProductInStockRef.collection("groups")
                .where("purchaseUnitPrice", "==", data.prevPurchaseUnitPrice).get();

            if (foundPrevSpecificGroup.size !== 1) throw new Error("Previous product group quantity not found");

            if (user.productsDefine == "default" || productRole == "both") {
                const foundPrevSpecificGroupDoc = foundPrevSpecificGroup.docs[0];
                const foundPrevProductGroupData = foundPrevSpecificGroupDoc.data();
                if (!foundPrevProductGroupData) throw new Error("Previous product group not found");
                const stockPrevQuantity = foundPrevProductGroupData.quantity ? foundPrevProductGroupData.quantity : 0;
                const productQuantityBefore = Number(stockPrevQuantity) + Number(initialQuantity);

                const foundCurrentSpecificGroup = await currentproductRefInStock.collection("groups")
                    .where("purchaseUnitPrice", "==", data.purchaseUnitPrice).get();
                if (foundCurrentSpecificGroup.size !== 1) throw new Error("Current product group quantity not found");
                const currentStockGroupDoc = foundCurrentSpecificGroup.docs[0];
                const currentStockGroupData = currentStockGroupDoc.data();
                if (!currentStockGroupData) throw new Error("Current product group not found");
                const stockCurrentQuantity = currentStockGroupData.quantity ? currentStockGroupData.quantity : 0;
                if (stockCurrentQuantity < quantity) return {
                    status: 500,
                    message: "The quantity is more than the actual quantity in stock."
                };

                const currentProductQuantity = productQuantityBefore - quantity;
                const dataForFireSale = data;
                delete dataForFireSale.prevPurchaseUnitPrice;
                delete dataForFireSale.prevProductName;

                await foundPrevSpecificGroupDoc.ref.update({ quantity: productQuantityBefore });
                await currentStockGroupDoc.ref.update({ quantity: currentProductQuantity });
                await saleRef.update({ ...data, unitPrice: data.unitPrice });
            }
            else {
                const dataForSale = {
                    ...data,
                    updatedTime: new Date(),
                    unitPrice: data.unitPrice
                }
                delete dataForSale.prevPurchaseUnitPrice;
                delete dataForSale.prevProductName;
                await saleRef.update(dataForSale);
                await root.collection("users").doc(`${data.updatedBy}`).collection("logs").add({
                    ...dataForSale,
                    initialQuantity
                });

            }
            // else {

            //     if (user.productsDefine == "default" || productRole == "both") {

            //         const productQuantityBefore = Number(initialQuantity);
            //         if (productQuantityBefore < quantity) return {
            //             status: 500,
            //             message: "The quantity is more than the actual quantity in stock."
            //         };
            //         const currentProductQuantity = productQuantityBefore - quantity;
            //         const productCreatedSnap = await root.collection("stock").add({
            //             productName: data.productName,
            //             creationTime: new Date()
            //         });
            //         const createdProductSnapId = productCreatedSnap.id;
            //         await root.collection("stock").doc(`${createdProductSnapId}`).collection("groups").add({
            //             quantity: currentProductQuantity,
            //             purchaseUnitPrice: data.purchaseUnitPrice
            //         });
            //         const dataForSale = {
            //             ...data,
            //             updatedTime: new Date(),
            //             unitPrice: data.unitPrice
            //         }
            //         await saleRef.update(dataForSale);
            //         await root.collection("users").doc(`${data.updatedBy}`).collection("logs").add({
            //             ...dataForSale,
            //             initialQuantity
            //         });

            //     }
            //     else {
            //         const dataForSale = {
            //             ...data,
            //             updatedTime: new Date()
            //         }
            //         await saleRef.update(dataForSale);
            //         await root.collection("users").doc(`${data.updatedBy}`).collection("logs").add({
            //             ...dataForSale,
            //             initialQuantity
            //         });
            //     }

            // }
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

    static async deleteProduct(product, primaryId, site) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);
        const dataToUpdateInStock = {...product};
        delete dataToUpdateInStock.ref;
        try {
            const productQuantity = Number(product.quantity);
            const productName = product.productName;
            const prodQuantity = product.quantity;
            const purchaseUnitPrice = product.purchaseUnitPrice

            const specificProductSnap = await root.collection("products").where("productName", "==", productName).get();
            if (specificProductSnap.size == 1) {

                const productDefine = (specificProductSnap.docs[0].data()).productRole;
                if (productDefine == "both") {
                    const currentProductInStockSnaps = await root.collection("stock").where("productName", "==", productName).get();
                    if (currentProductInStockSnaps.size == 1) {
                        const stockSpecificProductRef = currentProductInStockSnaps.docs[0].ref;
                        const productGroupInStock = await stockSpecificProductRef.collection("groups")
                            .where("purchaseUnitPrice", "==", Number(purchaseUnitPrice)).get();
                        if (productGroupInStock.size == 1) {
                            const groupRef = productGroupInStock.docs[0].ref;
                            const groupCurrentQuantityStock = (productGroupInStock.docs[0].data()).quantity;
                            const quantityRemain = Number(groupCurrentQuantityStock) + productQuantity;
                            await groupRef.update({ quantity: quantityRemain });
                        }
                        else {
                            await stockSpecificProductRef.collection("groups").add({
                                purchaseUnitPrice,
                                quantity: prodQuantity
                            });
                            await root.collection("stockLogs").add({
                                ...dataToUpdateInStock,
                                takenAction: "restored"
                            });
                        }
                    }
                    else {
                        const productDoc = await root.collection("stock").add({
                            creationTime: new Date(),
                            tx_t: new Date().getTime(),
                            productName
                        });
                        await productDoc.collection("groups").add({
                            purchaseUnitPrice,
                            quantity: prodQuantity
                        });
                        await root.collection("stockLogs").add({
                            ...dataToUpdateInStock,
                            takenAction: "restored"
                        });
                    }
                    await root.collection("stockLogs").doc(`${product.ref.id}`).delete();
                    await product.ref.delete();
                    
                }
                else if (productDefine == "product for sale") await product.ref.delete();
            }



            return {
                status: 200,
                message: `Product deleted successfully`
            }
        } catch (error) {
            console.error(error);
            return {
                status: 500,
                message: `Product deletion failled`
            }
        }
    }

}