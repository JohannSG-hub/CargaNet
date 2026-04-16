import { db } from "./firebase-config.js";

import {
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const lista = document.getElementById("lista");

window.guardarCliente = async function () {

  const nombre = document.getElementById("nombre").value;
  const dni = document.getElementById("dni").value;

  if (!nombre || !dni) {
    alert("Completa los campos");
    return;
  }

  await addDoc(collection(db, "clientes"), {
    nombre,
    dni
  });

  cargarClientes();
};

async function cargarClientes() {

  lista.innerHTML = "";

  const snap = await getDocs(collection(db, "clientes"));

  snap.forEach(doc => {
    const d = doc.data();

    lista.innerHTML += `
      <li class="list-group-item">
        ${d.nombre} - ${d.dni}
      </li>
    `;
  });
}

cargarClientes();