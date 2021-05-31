import * as functions from 'firebase-functions';
import { fireDB } from '../../db';
export const onExpenseCreation = functions.firestore
.document("owner/{ownerId}/sites/{site}/expenses/{docId}")
.onCreate(async(snap, context)=>{
    const params = context.params;
    const ownerId = params.ownerId;
    const site = params.site;
    const value = snap.data();
    const price = Number(value.price);
    const expenseCategory = value.expenseCategory;
    const year = value.year;
    const month = value.month;
    const currentStockOperatingAccountRef = fireDB.collection('owner')
      .doc(`${ownerId}/sites/${site}/operatingAccount/${year}/months/${month}`);
    try {
        const getOperatingBeforeSnap = (await currentStockOperatingAccountRef.get()).data();
        if(getOperatingBeforeSnap && getOperatingBeforeSnap.expenses){
            const expensesOperatingAccount = getOperatingBeforeSnap.expenses;
            if(expensesOperatingAccount[expenseCategory]){
                const specifiedExpense = Number(expensesOperatingAccount[expenseCategory]);
                const updatedAmmount = specifiedExpense + Number(price);
                await currentStockOperatingAccountRef.update({
                    ... getOperatingBeforeSnap,
                    expenses:{
                        ...expensesOperatingAccount,
                    [expenseCategory] : updatedAmmount
                    }
                })  
            }
            else{
                await currentStockOperatingAccountRef.update({
                    ...getOperatingBeforeSnap,
                    expenses:{
                        ...expensesOperatingAccount,
                    [expenseCategory] : price
                    }
                }) 
            }           
        }
        else{
            await currentStockOperatingAccountRef.set({
                expenses: {[expenseCategory] : Number(price)}
            }) 
        }
    } catch (error) {
        throw new Error(error)
    }
});

export const onDeleteExpense = functions.firestore
.document("owner/{ownerId}/sites/{site}/expenses/{docId}")
.onDelete(async(snap, context)=>{
    const params = context.params;
    const ownerId = params.ownerId;
    const site = params.site;
    const value = snap.data();
    const price = value.price;
    const expenseCategory = value.expenseCategory;
    const year = value.year;
    const month = value.month;
    const currentStockOperatingAccountRef = fireDB.collection('owner')
      .doc(`${ownerId}/sites/${site}/operatingAccount/${year}/months/${month}`);
    try {
        const getOperatingBeforeSnap = (await currentStockOperatingAccountRef.get()).data();
        if(getOperatingBeforeSnap && getOperatingBeforeSnap.expenses ){
            const expensesOperatingAccount = getOperatingBeforeSnap.expenses;
            const specifiedExpense = Number(expensesOperatingAccount[expenseCategory]);
            const updatedAmmount = specifiedExpense - Number(price);
            await currentStockOperatingAccountRef.update({
                expenses: {
                    ...expensesOperatingAccount,
                [expenseCategory] : updatedAmmount
                }
            })            
        }
    } catch (error) {
        throw new Error(error)
    }
});


export const onUpdateExpense = functions.firestore
.document("owner/{ownerId}/sites/{site}/expenses/{docId}")
.onUpdate(async (snap, context)=>{
    const params = context.params;
    const ownerId = params.ownerId;
    const site = params.site;
    const previousValue = snap.before.data();
    const newValue = snap.after.data();
    const previousPrice = Number(previousValue.price);
    const newPrice = Number(newValue.price);
    const previousExpenseCategory = previousValue.expenseCategory;
    const newExpenseCategory = newValue.expenseCategory;
    const year = previousValue.year;
    const month = previousValue.month;
    const currentStockOperatingAccountRef = fireDB.collection('owner')
      .doc(`${ownerId}/sites/${site}/operatingAccount/${year}/months/${month}`);
      try {
        const operatingBeforeSnap = (await currentStockOperatingAccountRef.get()).data();
        if(operatingBeforeSnap && operatingBeforeSnap.expenses){
            
            
            const operatingAccountExpense = operatingBeforeSnap.expenses;
            if(previousExpenseCategory == newExpenseCategory){
                const previewExpenseAmount = Number(operatingAccountExpense[previousExpenseCategory]) - previousPrice;
                const newExpenseBalance = previewExpenseAmount + newPrice;
                
                const expenses = {
                    ...operatingAccountExpense,
                    [previousExpenseCategory]: newExpenseBalance
                };
                await currentStockOperatingAccountRef.update({expenses});
            }
        }
    } catch (error) {
        throw new Error(error)
    }
})



