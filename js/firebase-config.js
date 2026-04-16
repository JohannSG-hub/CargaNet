import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDO4qFl6TQYloc5WKanrYHwhIlsSAGoB88",
  authDomain: "carganet-168ef.firebaseapp.com",
  projectId: "carganet-168ef",
  storageBucket: "carganet-168ef.firebasestorage.app",
  messagingSenderId: "793126749293",
  appId: "1:793126749293:web:123be05caaa9f61afa2b64"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);