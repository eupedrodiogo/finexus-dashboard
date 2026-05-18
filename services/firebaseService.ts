
import {
    doc,
    getDoc,
    setDoc,
    onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';

export const saveUserData = async (userId: string, data: any, merge: boolean = true) => {
    try {
        console.log(`[FirebaseService] 📤 Iniciando salvamento para: ${userId} (merge: ${merge})`);
        const userDocRef = doc(db, 'users', userId);
        
        const payloadString = JSON.stringify(data);
        const payloadSizeKB = Math.round(payloadString.length / 1024);
        console.log(`[FirebaseService] 📦 Tamanho do payload: ~${payloadSizeKB}KB`);

        if (payloadSizeKB > 800) {
            console.warn("[FirebaseService] ⚠️ AVISO: Payload aproximando-se do limite de 1MB do Firestore!");
        }

        // 'data' já deve conter 'updatedAt' vindo do App.tsx
        await setDoc(userDocRef, data, { merge });
        
        console.log("[FirebaseService] ✅ Dados salvos com sucesso no Firestore.");
    } catch (error) {
        console.error("[FirebaseService] ❌ Erro crítico ao salvar no Firestore:", error);
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

export const subscribeToUserData = (userId: string, callback: (doc: any) => void) => {
    const userDocRef = doc(db, 'users', userId);
    return onSnapshot(userDocRef, (doc) => {
        callback(doc);
    });
};
