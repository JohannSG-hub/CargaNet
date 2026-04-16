import { db } from "./firebase-config.js";

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function cargarClientes() {
  const snap = await getDocs(query(collection(db, "clientes"), orderBy("nombre")));
  const select = document.getElementById("clienteSelect");

  select.innerHTML = '<option value="">Selecciona un cliente</option>';

  snap.forEach(d => {
    select.innerHTML += `<option value="${d.id}">${d.data().nombre}</option>`;
  });
}

window.crearEnvio = async function () {

  const select = document.getElementById("clienteSelect");

  const clienteId = select.value;
  const clienteNombre = select.selectedOptions[0]?.text;
  const descripcion = document.getElementById("descripcion").value.trim();

  if (!clienteId || !descripcion) {
    alert("Selecciona un cliente y escribe una descripción.");
    return;
  }

  await addDoc(collection(db, "envios"), {
    cliente_id: clienteId,
    cliente_nombre: clienteNombre,
    descripcion,
    estado: "almacen",
    fecha: new Date()
  });

  document.getElementById("descripcion").value = "";

  await cargarEnvios();
};

async function cargarEnvios() {

  const alm = document.getElementById("almacen");
  const tra = document.getElementById("transito");
  const ent = document.getElementById("entregado");

  alm.innerHTML = "";
  tra.innerHTML = "";
  ent.innerHTML = "";

  const snap = await getDocs(query(collection(db, "envios"), orderBy("fecha", "desc")));

  if (snap.empty) {
    alm.innerHTML = '<p class="text-muted">Sin envíos en almacén.</p>';
    tra.innerHTML = '<p class="text-muted">Sin envíos en tránsito.</p>';
    ent.innerHTML = '<p class="text-muted">Sin envíos entregados.</p>';
    return;
  }

  snap.forEach(docu => {
    const d = docu.data();

    const btn = d.estado === "entregado"
      ? ""
      : `<button onclick="mover('${docu.id}','${d.estado}')" class="btn btn-sm btn-outline-dark mt-2 w-100">Avanzar estado</button>`;

    const card = `
      <div class="shipment-card mb-2">
        <strong>${d.cliente_nombre}</strong>
        <p class="mb-1 text-muted">${d.descripcion}</p>
        ${btn}
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

  if (!nuevo) return;

  await updateDoc(doc(db, "envios", id), { estado: nuevo });

  await cargarEnvios();
};

cargarClientes();
cargarEnvios();
