// // src/firebase/firebase-config.js
// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";

// // Firebase configuration object
// const firebaseConfig = {
//   apiKey: "AIzaSyDvY8e01Rd4f_aTgWKzy1cdlZKAzh-3a4E",
//   authDomain: "plateform-manager.firebaseapp.com",
//   projectId: "plateform-manager",
//   storageBucket: "plateform-manager.appspot.com", // Fixed storageBucket URL typo
//   messagingSenderId: "419178257035",
//   appId: "1:419178257035:web:b619ad85d6165e7b20528e",
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// // Initialize Firebase Auth
// const auth = getAuth(app);

// // Enable appVerificationDisabledForTesting for development only
// if (process.env.NODE_ENV === "development") {
//   auth.settings.appVerificationDisabledForTesting = true;
// }

// export { auth };


// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };