import Toast from "../../components/toast";
import { AppFirestore } from "../../db";
import { getCurrentDate, getCurrentMonth, getCurrentYear } from "../../helper/utils";

export default class StockModel {
    static async getAllGoodsInStock(primaryId, site) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);
        try {
            const purchasesDoc = await root.collection("stock").get();
            const products = [];
            for (const doc of purchasesDoc.docs) {
                const data = doc.data();
                const productDocsMatch = await root.collection("products").where("productName", "==", data.productName).get();
                if (productDocsMatch.size == 1) {
                    const unitPrice = productDocsMatch.docs[0].data().unitPrice;
                    let quantity = 0;
                    const getProductGroupsDocs = (await doc.ref.collection("groups").get()).docs;
                    for (const groupDoc of getProductGroupsDocs) {
                        const groupData = groupDoc.data();
                        quantity += Number(groupData.quantity)
                    }
                    if (unitPrice) {
                        const price = Number(quantity) * Number(unitPrice);
                        const product = {
                            ...data,
                            ref: doc.ref,
                            unitPrice,
                            price,
                            quantity
                        }

                        products.push(product);
                    }

                }

            }
            return products;
        }
        catch (e) {
            return []
        }
    }


    static async addNewProductInStock(product, uid, primaryId, user, site) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);
        const stockCollection = root.collection("stock");
        if (!product || !uid) return {
            status: 500,
            message: `Fail to save purchased ${products.length == 1 ? "products" : "product"}.`
        }
        try {
           
                const productId = product.productId;
                const amount = product.amount;
                let quantity = Number(product.quantity);
                const purchaseAmount = Number(product.amount);
                const purchaseUnitPrice = Number((purchaseAmount / quantity).toFixed(2));
                delete product.currentQuantity;
                const productDataDoc = await root.collection("products").doc(`${productId}`).get();
                if (productDataDoc.exists) {
                    const productData = productDataDoc.data();
                    const productName = productData.productName.toLowerCase();
                    const productUnitPrice = productData.unitPrice;
                    const productToAddInFireStock = {
                        productName,
                        creationTime: new Date(),

                    };

                    const productToSaveInLog = {
                        productName,
                        quantity: Number(quantity),
                        creationTime: new Date(),
                        doneBy: uid,
                        productRef: productDataDoc.ref,
                        takenAction: "purchased",
                        unitPrice: productUnitPrice,
                        amount,
                        namesOfWhoCreatedThis: user.names,
                        purchaseUnitPrice: product.purchaseUnitPrice,
                        year: getCurrentYear(),
                        month: getCurrentMonth(),
                        creationDate: getCurrentDate(),
                        tx_t: new Date().getTime()
                    }

                    const productInStock = await stockCollection.where("productName", "==", productName).get();
                    if (productInStock.size == 1) {
                        const productInStockDoc = productInStock.docs[0];
                        const getSpecificGroupSnap = await productInStockDoc.ref.collection("groups")
                            .where("purchaseUnitPrice", "==", purchaseUnitPrice).get();
                        if (getSpecificGroupSnap.size == 1) {
                            const groupDoc = getSpecificGroupSnap.docs[0];
                            const oldGroupQuantity = groupDoc.data().quantity;
                            const newGroupQuantity = Number(oldGroupQuantity) + quantity;
                            await groupDoc.ref.update({
                                quantity: newGroupQuantity
                            });
                        }
                        else if (getSpecificGroupSnap.size == 0) {
                            const groupDoc = getSpecificGroupSnap.docs[0];
                            await productInStockDoc.ref.collection("groups").add({
                                quantity,
                                purchaseUnitPrice,
                            });
                        }
                        else throw new Error("failed");
                    }
                    else if (productInStock.size == 0 || !productInStock) {
                        const newStockProductRef = await stockCollection.add(productToAddInFireStock);
                        newStockProductRef.collection("groups").add({
                            quantity,
                            purchaseUnitPrice,
                        })

                    }
                    await root.collection("stockLogs").add(productToSaveInLog);
                
            }

            return {
                status: 200,
                message: `"Product saved succefully.`
            }
        }
        catch (e) {
            console.error(e);
            return {
                status: 500,
                message: `Fail to save purchasedproduct.`
            }
        }

    }

    static async getProductInStock(productName, primaryId, site) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);
        try {
            const snaps = await root.collection("stock").where("productName", "==", productName).get();
            if (snaps.size !== 1) return {};
            return snaps.docs[0].data();
        }
        catch (e) {
            return {};
        }
    }


    static async getProductGroupsInStock(productName, primaryId, site) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);

        try {
            const productInStock = await root.collection("stock")
                .where("productName", "==", productName).get();
            if (productInStock.size !== 1) throw new Error("product not found");
            const groupsSnap = await productInStock.docs[0].ref.collection("groups").get();
            return groupsSnap.docs.map(doc => ({ ...doc.data(), ref: doc.ref }));

        } catch (error) {
            console.error(error);
            return []
        }

    }

    static async getSpecificProductGroup(primaryId, productId, purchaseUnitPrice, site) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);
        const productDataDoc = await root.collection("products").doc(`${productId}`).get();
        
        const productData = productDataDoc.data();
        if(!productData) return undefined;
        const productName = productData.productName;
        try {
            const foundProduct = await root.collection("stock")
                .where("productName", "==", productName).get();
            if (foundProduct.size !== 1) return undefined;
            const foundProductRef = foundProduct.docs[0].ref;
            const foundMatchGroup = await foundProductRef.collection("groups")
                .where("purchaseUnitPrice", "==", purchaseUnitPrice).get();
            if (foundMatchGroup.size !== 1) return undefined;
            return foundMatchGroup.docs[0].data();
        } catch (error) {
            return undefined;
        }

    }

    static async updateStockProduct(data, primaryId) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}`);
        return
        try {
            const productDoc = await root.collection("products").doc(`${data.productId}`).get();
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
                updatedTime: new Date()
            }
            await root.collection("stock").doc(`${productId}`).update(dataForFire);

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

    static async deleteProductFromStock(products) {
        try {
            for (const product of products) {
                await product.ref.delete();
            }

            return {
                status: 200,
                message: `Purchased ${products.length == 1 ? "product" : "products"} deleted.`
            }
        }
        catch (e) {
            console.error(e);
            return {
                status: 500,
                message: `Deletion fail.`
            }
        }
    }


    /**
     * 
     * @param {[{productName: String,unitPrice: number, quantity: number}]} products 
     */
    static async removeProductFromStock(products, primaryId) {
        const unDoneProducts = [];
        const root = AppFirestore.collection("owner").doc(`${primaryId}`);
        const stockCollection = root.collection("stock");
        try {
            for (const product of products) {
                const productId = product.productId;
                const quantity = product.quantity;

                const productDataDoc = await root.collection("products").doc(`${productId}`).get();
                if (productDataDoc.exists) {
                    const productData = productDataDoc.data();
                    const productName = productData.productName;
                    const dataForFire = {
                        productName,
                        quantity: Number(quantity),
                        doneBy: product.uid,
                        unitPrice: Number(productData.unitPrice),
                        creationTime: new Date()
                    };

                    const productInStock = await stockCollection.where("productName", "==", productName).get();
                    if (productInStock.size == 1) {
                        const productInStockDoc = productInStock.docs[0];
                        const productInStockId = productInStockDoc.ref.id;
                        const oldQuantity = (productInStockDoc.data()).quantity;
                        if (Number(oldQuantity) >= Number(quantity)) {
                            const newQuantity = Number(oldQuantity) - Number(quantity);
                            await stockCollection.doc(`${productInStockId}`).update({ quantity: newQuantity });
                            await root.collection("stockLogs").add(dataForFire);
                        }
                        else Toast.create(`${productName.toUpperCase()} didn't saved because the quantity demanded is more than the quantity in stock.`, {errorMessage: true});
                        
                    }
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
}