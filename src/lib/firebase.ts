import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyC0ogr_tk42tM6-C0b48lrGjEARHeHcozo",
  authDomain: "gen-lang-client-0652215019.firebaseapp.com",
  projectId: "gen-lang-client-0652215019",
  storageBucket: "gen-lang-client-0652215019.firebasestorage.app",
  messagingSenderId: "579989525125",
  appId: "1:579989525125:web:2eb18488a13ea5f2a54fec",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-auracommerce-5bdc2db8-73bd-4619-a64e-cb1dc6f1b635");
export const storage = getStorage(app);
