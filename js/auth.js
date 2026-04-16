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
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
      alert("Ingresa correo y contraseña.");
      return;
    }

    await signInWithEmailAndPassword(auth, email, password);

    window.location.href = "dashboard.html";
  } catch (e) {
    alert("No fue posible iniciar sesión. Verifica tus datos.");
  }
};

window.registrar = async function () {
  try {
    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("registroEmail").value.trim();
    const password = document.getElementById("registroPassword").value;

    if (!nombre || !email || !password) {
      alert("Completa todos los campos.");
      return;
    }

    const user = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "usuarios", user.user.uid), {
      nombre,
      email,
      rol: "admin"
    });

    alert("Cuenta creada correctamente. Ya puedes iniciar sesión.");
  } catch (e) {
    alert("No fue posible registrar la cuenta.");
  }
};
