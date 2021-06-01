import * as functions from 'firebase-functions';
import { fireDB } from '../../db';

export const onAddPurchaseRecall = functions.firestore
  .document('owner/{ownerId}/sites/{site}/stockLogs/{docId}').onCreate(
    async (snap: FirebaseFirestore.DocumentSnapshot, context: functions.EventContext) => {

      const params = context.params;
      const ownerId = params.ownerId;
      const site = params.site;
      const value = snap.data() as any;
      const price = Number(value.quantity) * Number(value.purchaseUnitPrice);
      const year = value.year;
      const month = value.month;
      const takenAction = value.takenAction;
      if(takenAction == "sold" || takenAction == "loan") return;
      const currentStockOperatingAccountRef = fireDB.collection('owner')
        .doc(`${ownerId}/sites/${site}/operatingAccount/${year}/months/${month}`);
      try {
        const getOperatingBeforeSnap = (await currentStockOperatingAccountRef.get()).data();
        if (getOperatingBeforeSnap) {
          if (getOperatingBeforeSnap.stockAmount) {
            const sockOperatingAccountAmount = Number(getOperatingBeforeSnap.stockAmount);
            const stockAmount = Number(sockOperatingAccountAmount) + Number(price);
            await currentStockOperatingAccountRef.update({ stockAmount });
          }
          else await currentStockOperatingAccountRef.set({ ...getOperatingBeforeSnap, stockAmount: price });

        }
        else await currentStockOperatingAccountRef.set({ stockAmount: price });
      } catch (error) {

        throw new Error(error);
      }

    });

export const onUpdatePurchaseRecall = functions.firestore
  .document('owner/{ownerId}/sites/{site}/stockLogs/{docId}')
  .onUpdate(async (change, context) => {
    const params = context.params;
    const ownerId = params.ownerId;
    const site = params.site;
    const newValue = change.after.data();
    const previousValue = change.before.data();
    const previousQuantity = Number(previousValue.quantity);
    const year = previousValue.year;
    const month = previousValue.month;
    const previousPurchaseUnitprice = Number(previousValue.purchaseUnitPrice);
    const currentStockOperatingAccountRef = fireDB.collection('owner')
      .doc(`${ownerId}/sites/${site}/operatingAccount/${year}/months/${month}`);
    const previousStockAmount = previousQuantity * previousPurchaseUnitprice;
    const newQuantity = Number(newValue.quantity);
    const newPurchaseUnitprice = Number(newValue.purchaseUnitPrice);
    const newStockAmount = newQuantity * newPurchaseUnitprice;
    try {
      const getOperatingBeforeSnap = (await currentStockOperatingAccountRef.get()).data();
      if (getOperatingBeforeSnap && getOperatingBeforeSnap.stockAmount) {
        const sockOperatingAccountAmount = Number(getOperatingBeforeSnap.stockAmount);
        
        const previousStockAmountStatus = sockOperatingAccountAmount - previousStockAmount;
        const stockAmount = previousStockAmountStatus + newStockAmount;        
        
        await currentStockOperatingAccountRef.update({ stockAmount });
      }
    } catch (error) {
      throw new Error(error);
    }

  });


export const onDeletePurchaseRecall = functions.firestore
  .document('owner/{ownerId}/sites/{site}/stockLogs/{docId}')
  .onDelete(async (snap, context) => {
    const params = context.params;
    const ownerId = params.ownerId;
    const site = params.site;
    const value = snap.data();
    const year = value.year;
    const month = value.month;
    const purchaseUnitPrice = Number(value.purchaseUnitPrice);
    const quantity = Number(value.quantity);
    const takenAction = value.takenAction;
      if(takenAction == "sold" || takenAction == "loan") return;
    const currentStockOperatingAccountRef = fireDB.collection('owner')
      .doc(`${ownerId}/sites/${site}/operatingAccount/${year}/months/${month}`);
    const deleteAmount = quantity * purchaseUnitPrice;
    
    try {
      const getOperatingBeforeSnap = (await currentStockOperatingAccountRef.get()).data();
      if (getOperatingBeforeSnap && getOperatingBeforeSnap.stockAmount) {
        const sockOperatingAccountAmount = Number(getOperatingBeforeSnap.stockAmount);
        const stockAmount = sockOperatingAccountAmount - deleteAmount;
        await currentStockOperatingAccountRef.update({ stockAmount });
      }
    } catch (error) {
      throw new Error(error);
    }
  })
