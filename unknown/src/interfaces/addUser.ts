
// import *as functions from "firebase-functions";
export interface AddUser{
    email: string;
    password: string;
}

export interface UserCreationReturn{
    status: number;
    message: string
}

// export declare function createUser(data: AddUser, context: functions.https.CallableContext): Promise<UserCreationReturn>;
