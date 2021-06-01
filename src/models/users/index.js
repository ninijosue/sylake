import Toast from "../../components/toast";
import { AppDB, AppFirestore } from "../../db";
import { getRandomString } from "../../helper/utils";

export default class UsersModel {

    static async createAccount(data) {
        if (!data) return;
        delete data.confirmedPassword;
        const email = data.email;
        const password = data.password;
        if (!email | email == "" | !password | password == "") return {
            status: 500,
            message: "Account creation failled"
        }
        try {
            console.log("in");

            const userCreadentials = await AppDB.auth().createUserWithEmailAndPassword(email, password);
            
            if (!userCreadentials) throw new Error("User creation failled.");
            const uid =  userCreadentials.user.uid;
            
            const claimsData = {
                isOwner: true,
                uid
            }

            const httpsCallableForUserClaims = AppDB.functions().httpsCallable("setClaims");
            const claimsRes = (await httpsCallableForUserClaims(claimsData)).data;
            console.log(claimsRes, claimsData);
            if (claimsRes.status !== 200) throw new Error(claimsRes.message);
            const dataForFire = {
                ...data,
                allowed: true,
                isOwner: true,
                users: [],
                moneyDescription: data.moneyDescription
            };
            delete dataForFire.password;
            await AppFirestore.collection("owner").doc(`${uid}`).set(dataForFire);

            return {
                status: 200,
                message: "Account created successfully"
            }

        } catch (error) {
            console.error(error);
            return {
                status: 500,
                message: "Account creation failled. Please try to use an other email and try again."
            }
            t
        }


    }

    static async deleteUser(userData) {
        try {
            const ref = userData.ref;
            const userHttpCall = AppDB.functions().httpsCallable("deleteUser");
            const res = (await userHttpCall(ref.id)).data;
            if (!res) throw new Error("User deletion failled");
            const status = res.status;
            if (status !== 200) return {
                status,
                message: res.message
            };
            await ref.delete();
            return 200
        } catch (error) {
            return 500
        }
    }

    static async login(data) {
        const email = data.email;
        const password = data.password;

        try {
            const userCredential = await AppDB.auth().signInWithEmailAndPassword(email, password);
            const uid = userCredential.user.uid;
            const idTokenId = await AppDB.auth().currentUser.getIdTokenResult();
            const claims = idTokenId.claims;
            if (claims.isOwner) {
                const getOwnerDoc = await AppFirestore.collection("owner").doc(`${uid}`).get();

                const userData = { ...getOwnerDoc.data(), ...userCredential.user };
                return {
                    status: 200,
                    user: userData
                }
            }
            else {
                const primaryId = claims.primaryId;
                if (!primaryId) throw new Error("user not found");
                const subUser = await AppFirestore.collection("owner").doc(`${primaryId}`).get();
                if (!subUser.exists) throw new Error("user not found");
                else {
                    const user = { ...subUser.data(), ...userCredential.user, ...claims };
                    return {
                        status: 200,
                        user
                    }
                }
            }

        } catch (error) {
            await AppDB.auth().signOut();
            return {
                status: 500,
                user: {},
            }
        }
    }

    static async getUser(data) {
        try {
            const reference = data.isOwner
                ? AppFirestore.collection("owner").doc(`${data.uid}`)
                : AppFirestore.collection("owner").doc(`${data.primaryId}`).collection("users").doc(`${data.uid}`);
            const doc = await reference.get();
            const docData = { ...doc.data(), ref: doc.ref };
            return docData;
        } catch (error) {
            Toast.create("User not found!", { errorMessage: true })
            return undefined
        }
    }


    static async createUser(data, owner, uid) {
        try {
            const email = data.email;
            const fakePassword = getRandomString();
            const usersCollectionRef = AppFirestore.collection("owner").doc(`${owner}`).collection("users");
            if (!email) return {
                status: 500,
                message: "Email not found"
            };
            const userHttpCall = AppDB.functions().httpsCallable("userCreation");
            const dataForUserFunction = {
                ...data,
                primaryId: owner,
                password: fakePassword,
                isOwner: false
            }
            const res = (await userHttpCall(dataForUserFunction)).data;
            if (!res) throw new Error("User creation failled");
            const status = res.status;
            if (status !== 200) return {
                status,
                message: res.message
            };
            const uid = res.uid;
            const dataForFire = { ...data, isOwner: false, owner, docId: uid };
            await usersCollectionRef.doc(`${uid}`).set(dataForFire);
            await AppDB.auth().sendPasswordResetEmail(email);
            return {
                status: 200,
                message: "User created successfully"
            };
        } catch (error) {
            return {
                status: 500,
                message: "User creation fail"
            }
        }
    }

    static async updateUser(data, owner, docId) {
        const usersCollectionRef = AppFirestore.collection("owner").doc(`${owner}`).collection("users");
        const claimsSetterHttpCall = AppDB.functions().httpsCallable("setClaims");
        const dataForFire = data;
        try {
            const claimsToSet = {
                permittedRessources: data.permittedRessources,
                sites: data.sites
            }
            await usersCollectionRef.doc(`${docId}`).update(dataForFire);
            await claimsSetterHttpCall(claimsToSet)
            return {
                status: 200,
                message: "User updated successfully"
            }
        } catch (error) {
            return {
                status: 500,
                message: "Failled to send an email"
            }
        }
    }

    static async getAllUsers(ownerId) {
        try {
            const usersSnap = await AppFirestore.collection(`owner`)
                .doc(`${ownerId}`).collection("users").orderBy("names", "asc").get();
            const users = usersSnap.docs.map(doc => ({ ...doc.data(), ref: doc.ref }));
            return users;
        } catch (error) {
            return [];
        }
    }

    static async sendLinkToResetPassword(email) {
        if (!email) return {
            status: 500,
            message: "Can not send an email to reset password."
        }
        try {
            await AppDB.auth().sendPasswordResetEmail(email);
            return {
                status: 200,
                message: "Email sent. Please contact him/her to check his/her email."
            }
        } catch (error) {
            return {
                status: 500,
                message: "Failled to send an email"
            }
        }
    }

    static async getUserInfo(uid, primaryId, isOwner) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}`);
        let userDoc;
        try {
            if (isOwner) {
                userDoc = await AppFirestore.collection("owner").doc(`${uid}`).get();
                if (!userDoc.exists) return {};
            }
            else {
                userDoc = await root.collection("users").doc(uid).get();
                if (!userDoc.exists) return {};
            }
            return userDoc.data();
        } catch (error) {
            return {};
        }
    }
    static async removeRessources(docRef, ressources = []) {
        try {
            await docRef.update({ permittedRessources: ressources });

            return {
                status: 200,
                message: "Permission removed successfully"
            };
        } catch (error) {
            return {
                status: 500,
                message: "Fail to remove perssion on user"
            };
        }

    }
}

