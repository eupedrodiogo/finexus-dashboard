
import {
    doc,
    getDoc,
    setDoc,
    onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';

export const saveUserData = async (userId: string, data: any) => {
    try {
        const userDocRef = doc(db, 'users', userId);
        await setDoc(userDocRef, {
            ...data,
            updatedAt: new Date().toISOString()
        }, { merge: true });
    } catch (error) {
        throw error;
    }
};

export const getUserData = async (userId: string) => {
    try {
        const userDocRef = doc(db, 'users', userId);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            return docSnap.data();
        }
        return null;
    } catch (error) {
        throw error;
    }
};

export const subscribeToUserData = (userId: string, callback: (data: any) => void) => {
    const userDocRef = doc(db, 'users', userId);
    return onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
            callback(doc.data());
        }
    });
};
