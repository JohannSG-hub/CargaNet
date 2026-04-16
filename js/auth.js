import { auth, db } from "./firebase-config.js";
import { showError, showSuccess, showLoader, hideLoader, showValidationErrors } from "./ui.js";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

function validarRegistro({ nombre, email, password }) {
  const errores = [];
  if (!nombre) errores.push("El nombre es obligatorio.");
  if (!email) errores.push("El correo es obligatorio.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errores.push("El correo no tiene formato válido.");
  if (!password) errores.push("La contraseña es obligatoria.");
  if (password && password.length < 6) errores.push("La contraseña debe tener al menos 6 caracteres.");
  return errores;
}

window.login = async function () {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    await showValidationErrors(["Ingresa correo y contraseña."]);
    return;
  }

  showLoader();
  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html";
  } catch (e) {
    await showError("No fue posible iniciar sesión. Verifica tus datos.");
  } finally {
    hideLoader();
  }
};

window.registrar = async function () {
  const nombre = document.getElementById("nombre").value.trim();
  const email = document.getElementById("registroEmail").value.trim();
  const password = document.getElementById("registroPassword").value;

  const errores = validarRegistro({ nombre, email, password });
  if (errores.length) {
    await showValidationErrors(errores);
    return;
  }

  showLoader();
  try {
    const user = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "usuarios", user.user.uid), {
      nombre,
      email,
      rol: "admin"
    });

    await showSuccess("Cuenta creada correctamente. Ya puedes iniciar sesión.");
  } catch (e) {
    await showError("No fue posible registrar la cuenta.");
  } finally {
    hideLoader();
  }
};
