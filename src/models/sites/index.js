import { AppFirestore } from "../../db";

export default class SiteModel{
    static async getSites(primaryId) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}`);
        try {
            const categoriesSnap = await root.collection("sites").get();
            return categoriesSnap.docs.map(doc => ({ ...doc.data(), ref: doc.ref }))
        }
        catch (e) {
            return []
        }
    }

    static async getArrayOfSitesOnly(primaryId) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}`);
        try {
            const categoriesSnap = await root.collection("sites").get();
            return categoriesSnap.docs.map(doc => doc.data().siteName)
        }
        catch (e) {
            return [];
        }
    }

    static async addNewSite(data, primaryId) {
        const root = AppFirestore.collection("owner").doc(`${primaryId}`);
        console.log(data);
        try {
            if(!primaryId) throw new Error("Main ID not found!");
            await root.collection("sites").doc(`${data.siteName}`).set(data);
            return {
                status: 200,
                message: "Site added successfully"
            }
        }
        catch (e) {
            console.error(e);
            return {
                status: 500,
                message: "Fail to add site ."
            }
        }
    }

    static async updateSite(data) {
        const ref = data.ref;
        const dataForFire = data;
        delete dataForFire.ref;
        try {
            await ref.update(dataForFire);
            return {
                status: 200,
                message: "Site updated successfully"
            }
        }
        catch (e) {
            return {
                status: 500,
                message: "Fail to update site ."
            }
        }
    }

    static async deleteSite(sites) {
        try {
            for (const site of sites) {
                await site.ref.delete();
            }

            return {
                status: 200,
                message: `${sites.length == 1 ? "Site" : "Sites"} deleted.`
            }
        }
        catch (e) {
            return {
                status: 500,
                message: `Deletion fail.`
            }
        }
    }
}