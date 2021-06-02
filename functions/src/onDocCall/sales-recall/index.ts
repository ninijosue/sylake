import * as functions from 'firebase-functions'
import { fireDB } from '../../db'
export const saleOnWriteRecall = functions.firestore
  .document('owner/{ownerId}/sites/{site}/sales/{docId}')
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
      docIdRoot,
      tx_t: newValue.tx_t
    }
    try {
      const product = await fireDB.collection("owner").doc(`${ownerId}/sites/${site}`).collection("products").where("productName", "==", productName).get();
      if (product.size !== 1) return;
      const currentStockOperatingAccountRef = fireDB.collection('owner').doc(`${ownerId}/sites/${site}/operatingAccount/${newValue.year}/months/${newValue.month}`);
      const operatingAccountData = (await currentStockOperatingAccountRef.get()).data();
      let salesAmountOfOperatingAmount: number;
      let stockAmountOfOperatingAmount: number;


      if (operatingAccountData) {
        if (operatingAccountData.salesAmount) salesAmountOfOperatingAmount = Number(operatingAccountData.salesAmount);
        else salesAmountOfOperatingAmount = 0;
        if (operatingAccountData.stockAmount) stockAmountOfOperatingAmount = Number(operatingAccountData.stockAmount);
        else stockAmountOfOperatingAmount = 0;
      }
      else {
        stockAmountOfOperatingAmount = 0;
        salesAmountOfOperatingAmount = 0;
      }

      const salesAmount = salesAmountOfOperatingAmount + (quantity * unitPrice);
      const stockAmount = stockAmountOfOperatingAmount - (quantity * purchaseUnitPrice);
      
      const productRole = product.docs[0].data().productRole;
      if (!productRole) return;
      if (productRole == "both") {
        const productInStock = await fireDB
          .collection('owner').doc(`${ownerId}/sites/${site}`).collection('stock')
          .where('productName', '==', productName).get();

        if (productInStock.size == 1) {
          const productInStockDoc = productInStock.docs[0];
          const groupInStockProduct = await productInStockDoc.ref.collection("groups")
            .where("purchaseUnitPrice", "==", purchaseUnitPrice).get();
          const productInStockGroupQuantity = groupInStockProduct.docs[0].data().quantity;


          const productInStockRef = groupInStockProduct.docs[0].ref;
          const oldQuantity: number = productInStockGroupQuantity;
          const newQuantity = Number(oldQuantity) - Number(quantity);

          await productInStockRef.update({ quantity: newQuantity });
          await fireDB.collection('owner').doc(`${ownerId}`).collection('sites').doc(`${site}`)
            .collection('stockLogs').add(dataForSalesFire);
        }
      }
      
      await currentStockOperatingAccountRef.update({stockAmount, salesAmount });
    } catch (error) {
      throw new Error(error);
    }
  });

// on update

export const saleOnUpdateRecall = functions.firestore
  .document('owner/{ownerId}/sites/{site}/sales/{docId}')
  .onUpdate(async (change, context) => {
    const params = context.params;
    const ownerId: string = params.ownerId;
    const site = params.site;
    const previousValue = change.before.data();
    const newValue = change.after.data();
    const quantityBefore = Number(previousValue.quantity);
    const unitPriceSoldBefore = Number(previousValue.unitPrice);
    const purchaseUnitPrice = Number(previousValue.purchaseUnitPrice);
    const quantityAfter = Number(newValue.quantity);
    const newProductName = newValue.productName;
    const unitPriceSoldAfter = Number(newValue.unitPrice);
    const currentStockOperatingAccountRef = fireDB.collection('owner')
      .doc(`${ownerId}/sites/${site}/operatingAccount/${previousValue.year}/months/${previousValue.month}`);
    const productsRef = fireDB.collection('owner').doc(`${ownerId}/sites/${site}`).collection("products");
    try {
      const getOperatingBeforeSnap = (await currentStockOperatingAccountRef.get()).data();
      const foundProductsSnap = await productsRef.where("productName", "==", newProductName).get();
      if (foundProductsSnap.size !== 1) throw new Error("product not found");
      const foundProduct = foundProductsSnap.docs[0].data();
      if (getOperatingBeforeSnap) {
        if (foundProduct.productRole == "both") {
          const sockOperatingAccountAmountBefore = Number(getOperatingBeforeSnap.stockAmount);
          const purchaseAmountBefore = quantityBefore * purchaseUnitPrice;
          const purchaseAmountAfter = quantityAfter * purchaseUnitPrice;
          const stockAmount = (sockOperatingAccountAmountBefore - purchaseAmountBefore) + purchaseAmountAfter;

          await currentStockOperatingAccountRef.update({ stockAmount });
        }
        const salesOperatingAccountAmountBefore = Number(getOperatingBeforeSnap.salesAmount);
        const saleAmountBefore = quantityBefore * unitPriceSoldBefore;
        const saleAmountAfter = quantityAfter * unitPriceSoldAfter;
        const salesAmount = (salesOperatingAccountAmountBefore - saleAmountBefore) + saleAmountAfter;
        await currentStockOperatingAccountRef.update({ salesAmount });
      }
    }
    catch (e) {
      throw new Error(e);

    }

  }
  )

export const saleOnDeleteRecall = functions.firestore
  .document('owner/{ownerId}/sites/{site}/sales/{docId}')
  .onDelete(async (snap, context) => {
    const params = context.params;
    const ownerId: string = params.ownerId;
    const site = params.site;
    const deletedValue = snap.data();
    const currentStockOperatingAccountRef = fireDB.collection('owner')
      .doc(`${ownerId}/sites/${site}/operatingAccount/${deletedValue.year}/months/${deletedValue.month}`);
    const quantity = Number(deletedValue.quantity);
    const purchaseUnitPrice = Number(deletedValue.purchaseUnitPrice);
    const unitPrice = Number(deletedValue.unitPrice);
    const deletedSalesAmount = quantity * unitPrice;
    const productsRef = fireDB.collection('owner').doc(`${ownerId}/sites/${site}`).collection("products");


    try {
      const foundProductsSnap = await productsRef.where("productName", "==", deletedValue.productName).get();
      if (foundProductsSnap.size !== 1) throw new Error("product not found");
      const foundProduct = foundProductsSnap.docs[0].data();

      const stockStatusOperatingAccountData = (await currentStockOperatingAccountRef.get()).data();

      if (stockStatusOperatingAccountData) {
        
        if (foundProduct.productRole == "both") {
          
          const deletedPurchaseAmount = quantity * purchaseUnitPrice;
          const stockStatusOperatingAccountStock = stockStatusOperatingAccountData.stockAmount;
          const stockAmount = Number(stockStatusOperatingAccountStock) + deletedPurchaseAmount;
          await currentStockOperatingAccountRef.update({ stockAmount });
        }
        const stockStatusOperatingAccountSales = stockStatusOperatingAccountData.salesAmount;
        const salesAmount = Number(stockStatusOperatingAccountSales) - deletedSalesAmount;

        await currentStockOperatingAccountRef.update({ salesAmount });
      }

    } catch (error) {
      throw new Error(error);

    }


  })
