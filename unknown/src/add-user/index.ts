import { fireApp } from "../db";
import { AddUser} from "../interfaces/addUser";
import *as funcitions from "firebase-functions";

async function createUser(data:AddUser){
    try {
        if(!data.email || !data.password) {
            new funcitions.https.HttpsError("invalid-argument", "email not found");
            return {
                status: 500,
                message: "email is undefined"
            }
        }
        if(!data.password) {
            new funcitions.https.HttpsError("invalid-argument", "email not found");
            return {
                status: 500,
                message: "password is undefined"
            }
        }
     await fireApp.auth().createUser(data);
    //  createUserWithEmailAndPassword(data.email, data.password);
     return {
         status: 200,
         message: "Created"
     }
    } catch (error) {
     new funcitions.https.HttpsError(error, "email not found")
     return {
            status: 500,
            message: "failled"
        }

    }
}

{createUser}