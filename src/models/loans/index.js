import { AppFirestore } from "../../db";
import { getCurrentDate, getCurrentMonth, getCurrentYear, getRandomString } from "../../helper/utils";

export default class LoansModel {


    /**
     * 
     * @param {[{productName: String,unitPrice: number, quantity: number}]} products 
     * @param {string} primaryId
     */
    static async addNewLoanWhenDefinedAsDefault(products, primaryId, loanDetails, user, site) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);
        const currentTime = new Date();
        const docId = `${currentTime.getTime()}`;
        try {
            const initialDetails = {
                ...loanDetails,
                creationTime: currentTime,
                paiedAmount: 0,
                creditAmount: 0,
                year: getCurrentYear(),
                month: getCurrentMonth(),
                creationDate: getCurrentDate(),
            }

            await root.collection("loans").doc(`${docId}`).set(initialDetails);
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
                        creationTime: currentTime,
                        takenAction: "loan",
                        namesOfWhoCreatedThis: user.names,
                        year: getCurrentYear(),
                        month: getCurrentMonth(),
                        creationDate: getCurrentDate(),
                        purchaseUnitPrice: product.purchaseUnitPrice
                    };
                    const manualId = Math.floor((Math.random() * 857905975704795794) + 324);
                    // const currentProductInStockSnaps = await stockCollection.where("productName", "==", productName).get();
                    // if (currentProductInStockSnaps.size == 1) {
                    //     const stockSpecificProductRef = currentProductInStockSnaps.docs[0].ref;
                    //     const productGroupInStock = await stockSpecificProductRef.collection("groups")
                    //         .where("purchaseUnitPrice", "==", Number(product.purchaseUnitPrice)).get();
                    //     if(productGroupInStock.size == 1){
                    //         const groupInStockDoc = productGroupInStock.docs[0];
                    //         const groupStockQuantity =  (groupInStockDoc.data()).quantity;
                    //         const updatedgroupStockQuantity = Number(groupStockQuantity) + quantity;
                    //         await groupStockQuantity
                    //     }
                    // }
                    // if (productInStock.size == 1) {
                    //     const productInStockDoc = productInStock.docs[0];
                    //     const productInStockId = productInStockDoc.ref.id;
                    //     const oldQuantity = (productInStockDoc.data()).quantity;
                    //     if (Number(oldQuantity) >= Number(quantity)) {
                    //         const newQuantity = Number(oldQuantity) - Number(quantity);
                    //         await stockCollection.doc(`${productInStockId}`).update({ quantity: newQuantity });

                    //     }
                    //         // await root.collection("stockLogs").doc(`${manualId}`).set({ ...dataForFire, notEditable: true });
                    // }
                    await root.collection("loans").doc(`${docId}`).collection("products").doc(`${manualId}`).set(dataForFire);

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
    static async addNewLoanWhenProductsDefineIsCustomProductRoleNotBoth(products, primaryId, loanDetails, user, site) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);

        const docId = `${new Date().getTime()}`;
        try {
            await root.collection("loans").doc(`${docId}`).set({ loanDetails, paiedAmount: 0 });
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
                        creationTime: new Date(),
                        takenAction: "loan",
                        namesOfWhoCreatedThis: user.names,
                        year: getCurrentYear(),
                        month: getCurrentMonth(),
                        creationDate: getCurrentDate()
                    };
                    await root.collection("loans").doc(`${docId}`).collection("products").add(dataForFire);
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

    static async getAllCustomersLoans(primaryId, site) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);
        const loans = [];
        try {
            const loansSnaps = await root.collection("loans").orderBy("creationTime", "desc").get()
            for (const doc of loansSnaps.docs) {
                const totalAmount = 0;
                const productsSnaps = await doc.ref.collection("products").get();
                for (const productDoc of productsSnaps.docs) {
                    const productData = productDoc.data();
                    let productPrice = 0;
                    const productUnitPrice = Number(productData.unitPrice);
                    const productQuantity = Number(productData.quantity);
                    if (!isNaN(productUnitPrice) && !isNaN(productQuantity))
                        productPrice = productUnitPrice * productQuantity;
                    totalAmount += productPrice;
                }
                const finalData = doc.data();
                const remaingAmount = Number(totalAmount) - Number(finalData.paiedAmount);
                const isPaied = !!(remaingAmount == 0);
                const loanData = {
                    ...finalData,
                    isPaied,
                    ref: doc.ref, totalAmount
                };
                loans.push(loanData);
            }

            return loans;
        } catch (error) {
            return []
        }
    }

    /**
     * 
     * @param {[]} loans 
     */
    static async deleteLoans(primaryId, loans, site) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);
        try {
            for (const loan of loans) {
                const productsSnaps = await loan.ref.collection("products").get();
                for (const doc of productsSnaps.docs) {
                    const product = doc.data();
                    const specificProductSnap = await root.collection("products").where("productName", "==", product.productName).get();
                    if (specificProductSnap.size == 1) {
                        const productDefine = (specificProductSnap.docs[0].data()).productRole;
                        if (productDefine == "both") {
                            const currentProductInStockSnaps = await root.collection("stock").where("productName", "==", product.productName).get();
                            if (currentProductInStockSnaps.size == 1) {
                                const stockGroupProduct = await currentProductInStockSnaps.docs[0].ref.collection("groups")
                                    .where("purchaseUnitPrice", "==", product.purchaseUnitPrice).get();
                                if (stockGroupProduct.size == 1) {
                                    const stockGroupProductDoc = stockGroupProduct.docs[0];
                                    const stockGroupProductData = stockGroupProductDoc.data();

                                    let stockQuantity = 0;
                                    if (stockGroupProductData && stockGroupProductData.quantity)
                                        stockQuantity = stockGroupProductData.quantity;
                                    const stockStateBefore = Number(stockQuantity) + Number(product.quantity);

                                    await stockGroupProductDoc.ref.update({ quantity: stockStateBefore });
                                    await root.collection("stockLogs").doc(`${doc.ref.id}`).delete();


                                }
                            }
                            await doc.ref.delete();

                        }
                        else if (productDefine == "product for sale") await doc.ref.delete();
                    }

                }
                // await loan.ref.delete()
            }
            return {
                status: 200,
                message: `${loans.length == 1 ? "Loan" : "Loans"} deleted successfully`
            }
        } catch (error) {
            return {
                status: 500,
                message: `${loans.length == 1 ? "Loan" : "Loans"} deletion fail`
            }
        }
    }

    static async getLoanDetail(primaryId, loanId, site) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);
        try {
            const doc = await root.collection("loans").doc(`${loanId}`).get();
            if (doc.exists) return {
                ...doc.data(),
                ref: doc.ref
            };
            else return {};
        } catch (error) {
            return {}
        }
    }

    static async getSpesificLoanproducts(primaryId, loanId, site) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);
        try {
            const productsRef = root.collection("loans").doc(`${loanId}`).collection("products");
            const productsSnaps = await productsRef.get();
            return productsSnaps.docs.map(doc => {
                const data = doc.data();
                const price = Number(data.quantity) * Number(data.unitPrice);
                return ({
                    ...data,
                    ref: doc.ref,
                    price
                });
            });
        } catch (error) {
            return [];
        }
    }


    static async updateLoanDetails(docRef, data) {
        try {
            await docRef.update(data);
            return {
                status: 200,
                message: "Loan info updated successfully"
            }
        } catch (error) {
            return {
                status: 500,
                message: "Loan update failled"
            }
        }
    }

    static async updateLoanProduct(primaryId, data, rowData, site) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);
        const productName = data.productName.toLowerCase();
        const quantity = Number(data.quantity);
        const purchaseUnitPrice = data.purchaseUnitPrice;
        try {
            const productsSnaps = await root.collection("products").where("productName", "==", productName).get();
            if (productsSnaps.size !== 1) return {
                status: 500,
                message: "Product not found"
            };
            const productInfo = productsSnaps.docs[0].data();
            if (productInfo.productRole == "both") {
                const foundProductSnapInStock = await root.collection("stock").where("productName", "==", rowData.productName).get();
                if (foundProductSnapInStock.size !== 1) return {
                    status: 500,
                    message: "Product not found"
                };

                const currentProductInStockSnaps = await foundProductSnapInStock.docs[0].ref.collection("groups")
                    .where("purchaseUnitPrice", "==", purchaseUnitPrice).get();
                if (currentProductInStockSnaps.size !== 1) return {
                    status: 500,
                    message: "Product not found"
                };
                const currentProductInStockData = currentProductInStockSnaps.docs[0].data();
                if (currentProductInStockData.quantity < quantity) return {
                    status: 500,
                    message: "Quantity requested is more than the quantity in stock"
                };
                await rowData.ref.update({
                    productName: productName,
                    quantity,
                    unitPrice: productInfo.unitPrice
                });
            }
            else {
                await rowData.ref.update({
                    productName: data.productName,
                    quantity,
                    unitPrice: productInfo.unitPrice
                })
            }
            return {
                status: 200,
                message: "Product updated successfully"
            }
        } catch (error) {
            console.error(error)
            return {
                status: 500,
                message: "Product update failled"
            }
        }
    }

    static async deleteLoanProducts(primaryId, products, site) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);
        try {
            for (const product of products) {
                const specificProductSnap = await root.collection("products").where("productName", "==", product.productName).get();
                if (specificProductSnap.size == 1) {
                    await product.ref.delete();

                }
                else return {
                    status: 500,
                    message: `${product.productName.toUpperCase()} can not be deleted! because it was not found in the list of products.`
                }
            }

            return {
                status: 200,
                message: `${products.length == 1 ? "Product" : "Products"} deleted successfully`
            }
        } catch (error) {
            return {
                status: 500,
                message: `${products.length == 1 ? "Product" : "Products"} deletion failled`
            }
        }
    }

    static async deleteOneLoan(primaryId, loanId, site) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);
        await root.collection("loans").doc(`${loanId}`).delete()
    }

    static async addPaymentOfLoan(docRef, data) {
        try {
            await docRef.update({ ...data });
            return {
                status: 200,
                message: "Payment registered successfully"
            }
        } catch (error) {
            return {
                status: 500,
                message: "Payment failled"
            }
        }
    }
}