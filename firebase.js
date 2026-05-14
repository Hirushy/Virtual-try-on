import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBVaX6NTMiy7VXqBX6ox-EnQVVW8WL4PAE",
    authDomain: "final-123-87848.firebaseapp.com",
    databaseURL: "https://final-123-87848-default-rtdb.firebaseio.com",
    projectId: "final-123-87848",
    storageBucket: "final-123-87848.firebasestorage.app",
    messagingSenderId: "273007258520",
    appId: "1:273007258520:web:1b6e6c616a3ec65db819ed",
    measurementId: "G-WVQZGEFGDL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services to use in your pages
export const db = getFirestore(app);
export const auth = getAuth(app);