
import firebase from "firebase/app";
import 'firebase/firestore';
import 'firebase/functions';
import 'firebase/storage';
import 'firebase/auth';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBSlochE6v3ljjzkhxzzI-yJuDaX4s2DEk",
  authDomain: "sylake-b9510.firebaseapp.com",
  projectId: "sylake-b9510",
  storageBucket: "sylake-b9510.appspot.com",
  messagingSenderId: "230639730649",
  appId: "1:230639730649:web:277521c6e20e8c3fe6e3c8",
  measurementId: "G-ZQN45JCE4X"
};

const PRODUCTION = false;

const AppDB = firebase.initializeApp(firebaseConfig);

const AppFirestore = AppDB.firestore();
if (!PRODUCTION) {
  AppDB.auth().useEmulator("http://localhost:9099");
  AppDB.functions().useEmulator("localhost", 5001)
  AppFirestore.settings({
    host: "localhost:8081",
    ssl: false
  })
}

export { AppFirestore, AppDB };