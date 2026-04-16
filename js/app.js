import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


// PROTEGER RUTA
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  }
});


// LOGOUT
window.logout = function () {
  signOut(auth);
};


// CARGAR DATOS
async function cargarDashboard() {

  // CLIENTES
  const clientesSnap = await getDocs(collection(db, "clientes"));
  document.getElementById("totalClientes").innerText = clientesSnap.size;


  // ENVÍOS
  const enviosSnap = await getDocs(collection(db, "envios"));

  let transito = 0;
  let entregado = 0;

  enviosSnap.forEach(doc => {
    const data = doc.data();

    if (data.estado === "transito") transito++;
    if (data.estado === "entregado") entregado++;
  });

  document.getElementById("totalTransito").innerText = transito;
  document.getElementById("totalEntregado").innerText = entregado;
}


// INIT
cargarDashboard();