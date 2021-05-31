import { fireApp } from "../../db";
import { UserRes } from "../add-user";

async function onSetClaims (data: any , context: any): Promise<UserRes>{
    try {
        if(!data) throw new Error("userCreationFailled");
        const claimsData = data;
        delete claimsData.uid;
       await fireApp.auth().setCustomUserClaims(data.uid, claimsData);
        return{
            status: 200,
            message: "Claims setted successfully",
        }
    } catch (error) {
        return {
            status: 500,
            message: "Claims setting failled",
            error
        }
    }
}

export {onSetClaims}