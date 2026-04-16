import { db } from "./firebase-config.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const lista = document.getElementById("lista");

window.guardarCliente = async function () {

  const nombre = document.getElementById("nombre").value.trim();
  const dni = document.getElementById("dni").value.trim();

  if (!nombre || !dni) {
    alert("Completa todos los campos.");
    return;
  }

  await addDoc(collection(db, "clientes"), {
    nombre,
    dni
  });

  document.getElementById("nombre").value = "";
  document.getElementById("dni").value = "";

  await cargarClientes();
};

async function cargarClientes() {

  lista.innerHTML = "";

  const snap = await getDocs(query(collection(db, "clientes"), orderBy("nombre")));

  if (snap.empty) {
    lista.innerHTML = '<li class="list-group-item text-muted">No hay clientes registrados.</li>';
    return;
  }

  snap.forEach(doc => {
    const d = doc.data();

    lista.innerHTML += `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <span><strong>${d.nombre}</strong></span>
        <span class="text-muted">DNI: ${d.dni}</span>
      </li>
    `;
  });
}

cargarClientes();
