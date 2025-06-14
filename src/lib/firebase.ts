
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD195cn_g9FGmxRWvT_lVyRqPaAwjIrPjE",
  authDomain: "campusconnect-52ddf.firebaseapp.com",
  projectId: "campusconnect-52ddf",
  storageBucket: "campusconnect-52ddf.firebasestorage.app",
  messagingSenderId: "722341650610",
  appId: "1:722341650610:web:75dc490f3752fb6d7529ab",
  measurementId: "G-MTYL0TWS9M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export default app;
