import * as functions from 'firebase-functions';
import { fireDB } from '../../db';
export const loanOnWriteRecall = functions.firestore
  .document('owner/{ownerId}/sites/{site}/loans/{docId}/products/{productId}')
  .onCreate(async (snap, context) => {
    const newValue = snap.data()
    const params = context.params;
    const docIdRoot: string = params.docId;
    const ownerId: string = params.ownerId;
    const productName: string = newValue.productName;
    const quantity = Number(newValue.quantity);
    const site = params.site;
    const unitPrice = Number(newValue.unitPrice);
    const purchaseUnitPrice = Number(newValue.purchaseUnitPrice);
    const dataForSalesFire = {
      creationTime: newValue.creationTime,
      doneBy: newValue.doneBy,
      creationDate: newValue.creationDate,
      year: newValue.year,
      month: newValue.month,
      productName: newValue.productName,
      unitPrice,
      quantity,
      purchaseUnitPrice,
      takenAction: newValue.takenAction,
      namesOfWhoCreatedThis: newValue.namesOfWhoCreatedThis,
      docIdRoot
    }
    try {
      const product = await fireDB.collection("owner").doc(`${ownerId}/sites/${site}`).collection("products").where("productName", "==", productName).get();
      if (product.size !== 1) throw new Error("product not found");
      const currentStockOperatingAccountRef = fireDB.collection('owner').doc(`${ownerId}/sites/${site}/operatingAccount/${newValue.year}/months/${newValue.month}`);
      const operatingAccountData = (await currentStockOperatingAccountRef.get()).data();
      let creditAmountOfOperatingAmount: number = 0;
      let stockAmountOfOperatingAmount: number = 0;

      if (operatingAccountData && operatingAccountData.creditAmount) creditAmountOfOperatingAmount = Number(operatingAccountData.creditAmount);
      if (operatingAccountData && operatingAccountData.stockAmount) {
        stockAmountOfOperatingAmount = Number(operatingAccountData.stockAmount);
      }
      else {

      }
      const creditAmount = creditAmountOfOperatingAmount + (quantity * unitPrice);
      const stockAmount = stockAmountOfOperatingAmount - (quantity * purchaseUnitPrice);

      const productRole = product.docs[0].data().productRole;
      if (!productRole) throw new Error("product role is undefined");

      if (productRole == "both") {
        const productInStock = await fireDB
          .collection('owner').doc(`${ownerId}/sites/${site}`).collection('stock')
          .where('productName', '==', productName).get();

        if (productInStock.size == 1) {

          const productInStockDoc = productInStock.docs[0];
          const groupInStockProduct = await productInStockDoc.ref.collection("groups")
            .where("purchaseUnitPrice", "==", purchaseUnitPrice).get();
          if (groupInStockProduct.docs[0].exists) {
            const productInStockGroupQuantity = groupInStockProduct.docs[0].data().quantity;
            const productInStockRef = groupInStockProduct.docs[0].ref;
            const oldQuantity: number = productInStockGroupQuantity;
            const newQuantity = Number(oldQuantity) - Number(quantity);
            await productInStockRef.update({ quantity: newQuantity });
          }
        }
      }
      await fireDB.collection('owner').doc(`${ownerId}`).collection('sites').doc(`${site}`)
        .collection('stockLogs').add(dataForSalesFire);
      await currentStockOperatingAccountRef.set({ creditAmount, stockAmount }, { merge: true });
      await fireDB.collection("owner").doc(`${ownerId}/sites/${site}/loans/${docIdRoot}`).update({ creditAmount });

    } catch (error) {
      throw new Error(error);
    }
  });


export const onLoanUpdateRecall = functions.firestore
  .document("owner/{ownerId}/sites/{site}/loans/{docId}/products/{productId}")
  .onUpdate(async (change, context) => {
    const params = context.params;
    const ownerId: string = params.ownerId;
    const site = params.site;
    const docIdRoot = params.docId;
    const previousValue = change.before.data();
    const newValue = change.after.data();
    const quantityBefore = Number(previousValue.quantity);
    const newProductName = newValue.productName;
    const unitPriceSoldBefore = Number(previousValue.unitPrice);
    const purchaseUnitPrice = Number(previousValue.purchaseUnitPrice);
    const quantityAfter = Number(newValue.quantity);
    const unitPriceAfter = Number(newValue.unitPrice);
    const currentStockOperatingAccountRef = fireDB.collection('owner')
      .doc(`${ownerId}/sites/${site}/operatingAccount/${previousValue.year}/months/${previousValue.month}`);
    const productsRef = fireDB.collection('owner').doc(`${ownerId}/sites/${site}`).collection("products");
    try {
      const foundProductsSnap = await productsRef.where("productName", "==", newProductName).get();
      if (foundProductsSnap.size !== 1) throw new Error("product not found");
      const foundProduct = foundProductsSnap.docs[0].data();
      const getOperatingBeforeSnap = (await currentStockOperatingAccountRef.get()).data();
      if (getOperatingBeforeSnap) {
        if (foundProduct.productRole == "both") {
          const sockOperatingAccountAmountBefore = Number(getOperatingBeforeSnap.stockAmount);
          const purchaseAmountBefore = quantityBefore * purchaseUnitPrice;
          const purchaseAmountAfter = quantityAfter * purchaseUnitPrice;
          const stockAmount = (sockOperatingAccountAmountBefore - purchaseAmountBefore) + purchaseAmountAfter;
          await currentStockOperatingAccountRef.update({ stockAmount });
        }
        const loansOperatingAccountAmountBefore = Number(getOperatingBeforeSnap.creditAmount);
        const creditAmountBefore = quantityBefore * unitPriceSoldBefore;
        const creditAmountAfter = quantityAfter * unitPriceAfter;
        const creditAmount = (loansOperatingAccountAmountBefore - creditAmountBefore) + creditAmountAfter;

        await currentStockOperatingAccountRef.update({ creditAmount });
        await fireDB.collection("owner").doc(`${ownerId}/sites/${site}/loans/${docIdRoot}`).update({ creditAmount });

      }
    }
    catch (e) {
      throw new Error(e)
    }
  });

export const onCreditUpdatedRecall = functions.firestore
  .document("owner/{ownerId}/sites/{site}/loans/{docId}")
  .onUpdate(async (change, context) => {
    const params = context.params;
    const ownerId: string = params.ownerId;
    const site = params.site;
    const previousValue = change.before.data();
    const newValue = change.after.data();
    const paiedAmountBefore = Number(previousValue.paiedAmount);
    const paiedAmountAfter = Number(newValue.paiedAmount);
    const currentStockOperatingAccountRef = fireDB.collection('owner')
      .doc(`${ownerId}/sites/${site}/operatingAccount/${previousValue.year}/months/${previousValue.month}`);
    try {
      const getOperatingBeforeSnap = (await currentStockOperatingAccountRef.get()).data();
      if (getOperatingBeforeSnap)
        if (getOperatingBeforeSnap.paidCredit) {
          const paidCreditOperatingAccount = Number(getOperatingBeforeSnap.paidCredit);
          const paidCreaditAmountBefore = paidCreditOperatingAccount - paiedAmountBefore;
          const paidCreaditAmountAfter = paidCreaditAmountBefore + paiedAmountAfter;
          await currentStockOperatingAccountRef.update({ paidCredit: paidCreaditAmountAfter });
        } else await currentStockOperatingAccountRef.set({ paidCredit: paiedAmountAfter }, {merge: true});
      else await currentStockOperatingAccountRef.set({ paidCredit: paiedAmountAfter }, {merge: true})
    } catch (error) {
      throw new Error(error);
    }
  });


  export const onCreditDeleteRecall = functions.firestore
  .document("owner/{ownerId}/sites/{site}/loans/{docId}")
  .onDelete(async (handler, context) => {
    const params = context.params;
    const ownerId: string = params.ownerId;
    const site = params.site;
    const data = handler.data();
    const paiedAmount = Number(data.paiedAmount);
    const currentStockOperatingAccountRef = fireDB.collection('owner')
      .doc(`${ownerId}/sites/${site}/operatingAccount/${data.year}/months/${data.month}`);
    try {
      const getOperatingBeforeSnap = (await currentStockOperatingAccountRef.get()).data();
      if (getOperatingBeforeSnap)
        if (getOperatingBeforeSnap.paidCredit) {
          const paidCreditOperatingAccount = Number(getOperatingBeforeSnap.paidCredit);
          const paidCredit = paidCreditOperatingAccount - paiedAmount;
          await currentStockOperatingAccountRef.set({ paidCredit }, {merge: true});
        }
    } catch (error) {
      throw new Error(error);
    }
  });

export const onLoanDeleteRecallProduct = functions.firestore
  .document("owner/{ownerId}/sites/{site}/loans/{docId}/products/{productId}")
  .onDelete(async (snap, context) => {
    const params = context.params;
    const docIdRoot = params.docId;
    const ownerId: string = params.ownerId;
    const site = params.site;
    const productId = params.productId;
    const deletedValue = snap.data();
    const currentStockOperatingAccountRef = fireDB.collection('owner')
      .doc(`${ownerId}/sites/${site}/operatingAccount/${deletedValue.year}/months/${deletedValue.month}`);
    const productsRef = fireDB.collection('owner').doc(`${ownerId}/sites/${site}`).collection("products");
    const quantity = Number(deletedValue.quantity);
    const purchaseUnitPrice = Number(deletedValue.purchaseUnitPrice);
    const unitPrice = Number(deletedValue.unitPrice);
    const deletedCreditAmount = quantity * unitPrice;
    const productLogRef = fireDB.collection("owner").doc(`${ownerId}/sites/${site}/stockLogs/${productId}`);

    const stockStatusOperatingAccountData = (await currentStockOperatingAccountRef.get()).data();

    if (stockStatusOperatingAccountData) {
      try {
        const foundProductsSnap = await productsRef.where("productName", "==", deletedValue.productName).get();
        if (foundProductsSnap.size !== 1) throw new Error("product not found");
        const foundProduct = foundProductsSnap.docs[0].data();
        if (foundProduct.productRole == "both") {
          const deletedPurchaseAmount = quantity * purchaseUnitPrice;
          const stockStatusOperatingAccountStock = stockStatusOperatingAccountData.stockAmount;
          const stockAmount = Number(stockStatusOperatingAccountStock) - deletedPurchaseAmount;
          await currentStockOperatingAccountRef.update({ stockAmount });
        }

        const stockStatusOperatingAccountLoans = stockStatusOperatingAccountData.creditAmount;
        const creditAmount = Number(stockStatusOperatingAccountLoans) - deletedCreditAmount;

        await productLogRef.delete();
        await currentStockOperatingAccountRef.update({ creditAmount });
        await fireDB.collection("owner").doc(`${ownerId}/sites/${site}/loans/${docIdRoot}`).update({ creditAmount });


      } catch (error) {
        throw new Error(error);
      }
    }
  })