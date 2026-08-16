
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { firebaseConfig } from "./firebaseConfig";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, { ignoreUndefinedProperties: true });
export const googleProvider = new GoogleAuthProvider();

export default app;
