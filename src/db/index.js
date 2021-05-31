
import firebase from "firebase/app";
import 'firebase/firestore';
import 'firebase/functions';
import 'firebase/storage';
import 'firebase/auth';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
let firebaseConfig = {
    apiKey: "AIzaSyAK73lUPFpB-4JYaIIWy0dMWc472jGyFyI",
    authDomain: "rodney-m-s.firebaseapp.com",
    databaseURL: "https://rodney-m-s.firebaseio.com",
    projectId: "rodney-m-s",
    storageBucket: "rodney-m-s.appspot.com",
    messagingSenderId: "328366471938",
    appId: "1:328366471938:web:a8a960377a79d289db601b",
    measurementId: "G-CD18VPM6QG"
  };

 const PRODUCTION = false;

  const AppDB = firebase.initializeApp(firebaseConfig);

  const AppFirestore = AppDB.firestore();
  if(!PRODUCTION){
    AppDB.auth().useEmulator("http://localhost:9099");
    AppDB.functions().useEmulator("localhost", 5001)
    AppFirestore.settings({
      host: "localhost:3000",
      ssl: false
    })
  }

export {AppFirestore, AppDB};