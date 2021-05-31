import { AppFirestore } from "../../db";

export default class NotificationModel {
    static async getLoansNotifications(primaryId, site) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);
        const loanToNotify = [];
        const currentTime = new Date().getTime();
        try {
            const foundLoansSnaps = await root.collection("loans")
                .where("isPaied", "==", false).get();
                
            foundLoansSnaps.docs.forEach(snap => {
                const data = snap.data();
                if(data.deadlineTimestamp.seconds < currentTime){
                    const notification = {
                        ...data,
                        ref: snap.ref,
                        message: `The loan deadline given to ${data.customerNames.toUpperCase()} had expired.`,
                        route: `/loans/${snap.id}`
                    };
                    loanToNotify.push(notification); 
                }
                
            });
            return loanToNotify;
        } catch (error) {
            return [];
        }

    }

    static async getStockNotification(primaryId, site) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}/sites/${site}`);
        const productToNotify = [];
        try {
            const products = (await root.collection("products").get())
                .docs.map(doc => ({ ...doc.data(), ref: doc.ref }));
            const productsInStock = (await root.collection("stock").get()).docs
                .map(doc => ({ ...doc.data(), ref: doc.ref }));

            products.forEach(pro => {
                productsInStock.forEach(proInStock => {
                    if (pro.productName === proInStock.productName) {
                        if(proInStock.quantity <= pro.notifyMeWhenRemain){
                            const notification = {
                                ...proInStock,
                                ref: proInStock.ref,
                                message: `${proInStock.productName.toUpperCase()} is near to be finnished. Please purchase it!`,
                                route: "/stock"
                            };
                            productToNotify.push(notification);
                        }
                    }
                })
            })
            return productToNotify;
        } catch (error) {
            return [];
        }

    }


}