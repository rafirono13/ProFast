// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDLdG3JvgYfbO0spJG5LKZ3lZSj1qJfswY',
  authDomain: 'profast-f0b86.firebaseapp.com',
  projectId: 'profast-f0b86',
  storageBucket: 'profast-f0b86.firebasestorage.app',
  messagingSenderId: '836637308786',
  appId: '1:836637308786:web:25ce8d7b74d782f3748feb',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
