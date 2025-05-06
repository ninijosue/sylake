import { AppFirestore } from "../../db";
import { getCurrentDate } from "../../helper/utils";

export default class ProductModel {

    static async getProducts(primaryId, productRole, site) {
        if (!primaryId || !productRole) return;
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);
        try {
            const productsRef = root.collection("products");
            const productsToSale = [];

            if (productRole && productRole !== "both") {
                const productsToSaleWhenItDefinedAsToSale = await productsRef
                    .where("productRole", "==", productRole).get();
                productsToSaleWhenItDefinedAsToSale.docs.forEach(doc => {
                    const product = {
                        ...doc.data(),
                        ref: doc.ref
                    };
                    productsToSale.push(product);
                });
            }

            const productsToSaleWhenItDefinedAsBoth = await productsRef
                .where("productRole", "==", "both").get();
            productsToSaleWhenItDefinedAsBoth.docs.forEach(doc => {
                const product = {
                    ...doc.data(),
                    ref: doc.ref
                };
                productsToSale.push(product);
            });

            return productsToSale;
        }
        catch (e) {
            return [];
        }
    }

    static async getSingleProduct(primaryId, site,  productId){
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);
        try {
            const doc = await root.collection("products").doc(`${productId}`).get();
            if(doc.exists) return {
                ...doc.data(),
                ref: doc.ref
            }
            else return undefined;
        } catch (error) {
            return undefined;
        }
    }

    static async getProductsWhenDefinedAsCustom(primaryId, siteName) {
        if (!primaryId) return;
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${siteName}`);
        try {
            const productsRef = root.collection("products");
            const productsToSale = [];
            const productsToSaleWhenItDefinedAsToSale = await productsRef
                .where("productRole", "==", "product for sale").get();

            const productsToSaleWhenItDefinedAsBoth = await productsRef
                .where("productRole", "==", "both").get();

            productsToSaleWhenItDefinedAsToSale.docs.forEach(doc => {
                const product = {
                    ...doc.data(),
                    ref: doc.ref
                };
                productsToSale.push(product);
            });

            productsToSaleWhenItDefinedAsBoth.docs.forEach(doc => {
                const product = {
                    ...doc.data(),
                    ref: doc.ref
                };
                productsToSale.push(product);
            });

            return productsToSale;
        }
        catch (e) {

            return [];
        }
    }

    static async getAllProductsOfMine(primaryId, siteName) {
        console.log("here we are", primaryId);
        console.log("siteName", siteName);
        if (!primaryId) return;
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${siteName}`);
        try {

            const productsToSaleDoc = await root.collection("products").get();
            console.log("productsToSaleDoc", productsToSaleDoc.size);
            const productsToSale = [];
            productsToSaleDoc.docs.forEach(doc => {
                const product = {
                    ...doc.data(),
                    ref: doc.ref
                };
                productsToSale.push(product);
            });
            return productsToSale;
        }
        catch (e) {
            console.error(e);
            return [];
        }
    }

    static async addProduct(data, primaryId, site) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);
        try {
            if(!primaryId) throw new Error("Wrong parsed identifier");
            const dataForFire = {
                ...data,
                creationTime: new Date(),
                creationDate: getCurrentDate()
            }

            const productName = data.productName;

            const getSimilarProductNameDocs = await root.collection("products").where("productName", "==", productName).get();
            if (getSimilarProductNameDocs.size !== 0) return {
                status: 400,
                message: "Product already exist"
            }

            await root.collection("products").add(dataForFire);
            return {
                status: 200,
                message: "Product added."
            };
        }
        catch (e) {
            return {
                status: 500,
                message: "Product addition fail."
            };
        }
    }

    static async updateProduct(data) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);
        try {
            if(!primaryId) throw new Error("Wrong parsed identifier");
            const dataForFire = {
                ...data,
                creationTime: new Date()
            }
            delete dataForFire.ref;

            await data.ref.update(dataForFire);

            return {
                status: 200,
                message: "Product updated."
            };
        }
        catch (e) {
            return {
                status: 500,
                message: "Fail to update product."
            };
        }
    }



    static async deleteProducts(products, primaryId) {

        const root = AppFirestore.collection("owner").doc(`${primaryId}`);
        try {
            for (const product of products) {
                await product.ref.delete();
            }

            return {
                status: 200,
                message: `${products.length == 1 ? "Product" : "Products"} deleted.`
            };
        }
        catch (e) {
            return {
                status: 500,
                message: "deletion fail."
            };
        }
    }

    static async getProductQuantityInStock(primaryId, data, site) {
        try {
            const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);
            const productInStock = await root.collection("stock")
                .where("productName", "==", data.productName).get();
            if (productInStock.size !== 1) return undefined;
            const groupSnap = await productInStock.docs[0].ref.collection("groups")
                .where("purchaseUnitPrice", "==", data.purchaseUnitPrice).get()
            if (groupSnap.size !== 1) return undefined;
            return groupSnap.docs[0].data().quantity;
        } catch (error) {
            return undefined;
        }
    }
}