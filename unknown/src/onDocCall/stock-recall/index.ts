import * as functions from 'firebase-functions';

export const onStockProductGroupUpdateRecall = functions.firestore
  .document('owner/{ownerId}/sites/{site}/stock/{docId}/groups/{groupId}')
  .onUpdate(async (change, context) => {
      const dataAfter = change.after.data();
    const quantity = dataAfter.quantity;
    if(quantity == 0) await change.after.ref.delete();
  });