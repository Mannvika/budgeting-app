// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdJmQ00ExKlHYN4Tvj0B3H4bc24cnilKU",
  authDomain: "budgeting-app-ae2af.firebaseapp.com",
  projectId: "budgeting-app-ae2af",
  storageBucket: "budgeting-app-ae2af.appspot.com",
  messagingSenderId: "1078283568222",
  appId: "1:1078283568222:web:28c278354dc022fe69a0cf"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth();