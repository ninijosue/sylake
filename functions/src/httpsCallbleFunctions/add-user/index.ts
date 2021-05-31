import { fireApp } from '../../db';

interface UserData {
    email: string;
    password: string;
    names: string;
    phoneNumber: string;
    idNumber: number;
    userName: string;
    location: string;
    permittedRessources: Array<String>;
    creationTime: Date,
    primaryId: String,
    isOwner: boolean;
    sites: Array<string>;

}

export interface UserRes {
    status: number;
    error?: any;
    message: string;
    uid?: string;
}



async function createUser (data: UserData , context: any): Promise<UserRes>{
    try {
        if(!data) throw new Error("userCreationFailled");
        const userCredentials = await fireApp.auth().createUser({
            email: data.email,
            password: data.password,
            phoneNumber: data.phoneNumber,
        })
        if(!userCredentials) throw new Error("userCreationFailled");
        const uid = userCredentials.uid;
       await fireApp.auth().setCustomUserClaims(uid, {
            isOwner: data.isOwner,
            primaryId: data.primaryId,
            sites: data.sites,
            permittedRessources: data.permittedRessources
        });
        await fireApp.auth().generatePasswordResetLink(data.email);
        return{
            status: 200,
            message: "UserCreated successfully",
            uid
        }
    } catch (error) {
        return {
            status: 500,
            message: error.errorInfo? error.errorInfo.message : error,
            error
        }
    }
}

export {createUser};
