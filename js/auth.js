import { auth, db } from "./firebase-config.js";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

window.login = async function () {
  try {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    await signInWithEmailAndPassword(auth, email, password);

    window.location.href = "dashboard.html";
  } catch (e) {
    alert(e.message);
  }
};

window.registrar = async function () {
  try {
    const nombre = document.getElementById("nombre").value;
    const email = document.getElementById("registroEmail").value;
    const password = document.getElementById("registroPassword").value;

    const user = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "usuarios", user.user.uid), {
      nombre,
      email,
      rol: "admin"
    });

    alert("Cuenta creada");
  } catch (e) {
    alert(e.message);
  }
};