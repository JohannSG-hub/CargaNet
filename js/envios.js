import { db } from "./firebase-config.js";

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function cargarClientes() {
  const snap = await getDocs(collection(db, "clientes"));
  const select = document.getElementById("clienteSelect");

  snap.forEach(d => {
    select.innerHTML += `<option value="${d.id}">${d.data().nombre}</option>`;
  });
}

window.crearEnvio = async function () {

  const select = document.getElementById("clienteSelect");

  const clienteId = select.value;
  const clienteNombre = select.selectedOptions[0].text;
  const descripcion = document.getElementById("descripcion").value;

  await addDoc(collection(db, "envios"), {
    cliente_id: clienteId,
    cliente_nombre: clienteNombre,
    descripcion,
    estado: "almacen",
    fecha: new Date()
  });

  cargarEnvios();
};

async function cargarEnvios() {

  const alm = document.getElementById("almacen");
  const tra = document.getElementById("transito");
  const ent = document.getElementById("entregado");

  alm.innerHTML = "";
  tra.innerHTML = "";
  ent.innerHTML = "";

  const snap = await getDocs(collection(db, "envios"));

  snap.forEach(docu => {
    const d = docu.data();

    const card = `
      <div class="card p-2 mb-2">
        <strong>${d.cliente_nombre}</strong><br>
        ${d.descripcion}
        <button onclick="mover('${docu.id}','${d.estado}')" class="btn btn-sm btn-dark mt-1">
          Avanzar
        </button>
      </div>
    `;

    if (d.estado === "almacen") alm.innerHTML += card;
    else if (d.estado === "transito") tra.innerHTML += card;
    else ent.innerHTML += card;
  });
}

window.mover = async function (id, estado) {

  let nuevo = "";

  if (estado === "almacen") nuevo = "transito";
  else if (estado === "transito") nuevo = "entregado";

  await updateDoc(doc(db, "envios", id), { estado: nuevo });

  cargarEnvios();
};

cargarClientes();
cargarEnvios();