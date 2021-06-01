import * as fireFuctions from "firebase-functions";

import {onAddPurchaseRecall, onUpdatePurchaseRecall, onDeletePurchaseRecall} from './onDocCall/purchase-recall/index';
import {saleOnWriteRecall, saleOnUpdateRecall, saleOnDeleteRecall} from './onDocCall/sales-recall';
import {onDeleteExpense, onExpenseCreation, onUpdateExpense} from './onDocCall/expense-recall';
import {
    loanOnWriteRecall, 
    onCreditUpdatedRecall, 
    onLoanDeleteRecallProduct, 
    onLoanUpdateRecall, 
    onCreditDeleteRecall
} from './onDocCall/loan-recall';
import { createUser } from "./httpsCallbleFunctions/add-user";
import { onDeleteUser } from "./httpsCallbleFunctions/delete-user";
import { onSetClaims } from "./httpsCallbleFunctions/user-claims-udpdate";
import { onStockProductGroupUpdateRecall } from './onDocCall/stock-recall/index';

//other func initialization
const userCreation = fireFuctions.https.onCall(createUser);
const deleteUser = fireFuctions.https.onCall(onDeleteUser);
const setClaims = fireFuctions.https.onCall(onSetClaims);

export{
    //purchase
    onUpdatePurchaseRecall, 
    onAddPurchaseRecall, 
    onDeletePurchaseRecall,
    //sale
    saleOnWriteRecall, 
    saleOnUpdateRecall, 
    saleOnDeleteRecall,
    //expense
    onDeleteExpense, 
    onExpenseCreation, 
    onUpdateExpense,
    //credit
    loanOnWriteRecall, 
    onLoanDeleteRecallProduct, 
    onLoanUpdateRecall,
    onCreditUpdatedRecall,
    onCreditDeleteRecall,
    // user
    userCreation,
    deleteUser,
    //stock
    onStockProductGroupUpdateRecall,
    //other
    setClaims
}

