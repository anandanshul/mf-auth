import {FirebaseApp, getApp, getApps, initializeApp} from "@firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCnEUnD4vgRS9gNu8iAEw0lNxTTc_94Bg4",
  authDomain: "fir-mfa-e8bd4.firebaseapp.com",
  projectId: "fir-mfa-e8bd4",
  storageBucket: "fir-mfa-e8bd4.firebasestorage.app",
  messagingSenderId: "576561087289",
  appId: "1:576561087289:web:74053cc66472b4f121dee8"
};

let app: FirebaseApp;

if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
}else {
    app = getApp();
}

export default app