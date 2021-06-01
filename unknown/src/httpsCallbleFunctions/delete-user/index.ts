import { fireApp } from '../../db';
import { UserRes } from '../add-user';

async function onDeleteUser(givenUid: string, context: any): Promise<UserRes> {
    try {
        const uid = givenUid.toString();
        if(typeof uid !== "string") throw new Error("Wrong uid was passed");
        await fireApp.auth().deleteUser(uid);
        return {
            status: 200,
            message: "User deleted" 
        }
    } catch (error) {
        return{
            status: 500,
            message: error.errorInfo? error.errorInfo.message : error,
            error
        }
    }
}

export{onDeleteUser}