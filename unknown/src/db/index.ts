
import  * as admin from "firebase-admin";

const fireApp = admin.initializeApp();
const fireDB = fireApp.firestore();

export {fireApp};
export {fireDB};
