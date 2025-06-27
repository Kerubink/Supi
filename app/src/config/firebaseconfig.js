// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA4N0FcDutJJ7BTuQ8fpuH2SriRZlK7yYc",
  authDomain: "supi-39ab6.firebaseapp.com",
  projectId: "supi-39ab6",
  storageBucket: "supi-39ab6.firebasestorage.app",
  messagingSenderId: "988275275649",
  appId: "1:988275275649:web:718b49fdb0a1b5d2779a80",
  measurementId: "G-DRWDPGBTFW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth };