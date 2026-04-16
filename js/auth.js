import { auth, db } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { setDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

window.login = async function () {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  await signInWithEmailAndPassword(auth, email, password);
  window.location.href = "dashboard.html";
};

window.registrar = async function () {
  const nombre = document.getElementById("nombre").value;
  const email = document.getElementById("registroEmail").value;
  const password = document.getElementById("registroPassword").value;

  const user = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "usuarios", user.user.uid), {
    nombre,
    email
  });

  alert("Registrado");
};