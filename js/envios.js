import { db } from "./firebase-config.js";
import { auth } from "./firebase-config.js";

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  getDoc,
  doc,
  query,
  orderBy,
  Timestamp,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

function toTimestamp(dateValue) {
  if (!dateValue) return null;
  return Timestamp.fromDate(new Date(`${dateValue}T00:00:00`));
}

async function generarCodigoEnvio() {
  const snap = await getDocs(collection(db, "envios"));
  let maxCodigo = 0;

  snap.forEach((d) => {
    const codigo = d.data().codigo || "";
    const match = codigo.match(/^CN-(\d+)$/);
    if (!match) return;

    const numero = Number(match[1]);
    if (Number.isFinite(numero) && numero > maxCodigo) {
      maxCodigo = numero;
    }
  });

  return `CN-${String(maxCodigo + 1).padStart(4, "0")}`;
}

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

  const user = auth.currentUser;
  const clienteId = select.value;
  const clienteNombre = select.selectedOptions[0]?.text;
  const descripcion = document.getElementById("descripcion").value.trim();
  const destinatarioNombre = document.getElementById("destinatarioNombre").value.trim();
  const destinatarioTelefono = document.getElementById("destinatarioTelefono").value.trim();
  const destinatarioDireccion = document.getElementById("destinatarioDireccion").value.trim();
  const peso = Number(document.getElementById("peso").value);
  const precio = Number(document.getElementById("precio").value);
  const fechaEnvio = document.getElementById("fechaEnvio").value;
  const fechaEntrega = document.getElementById("fechaEntrega").value;

  if (!user) {
    alert("Tu sesión no está activa. Vuelve a iniciar sesión.");
    return;
  }

  if (
    !clienteId ||
    !descripcion ||
    !destinatarioNombre ||
    !destinatarioTelefono ||
    !destinatarioDireccion ||
    !fechaEnvio ||
    !fechaEntrega ||
    Number.isNaN(peso) ||
    Number.isNaN(precio)
  ) {
    alert("Completa todos los campos del envío.");
    return;
  }

  const codigo = await generarCodigoEnvio();
  const fechaCreacion = Timestamp.now();

  await addDoc(collection(db, "envios"), {
    codigo,
    cliente_id: clienteId,
    cliente_nombre: clienteNombre,
    descripcion,
    destinatario: {
      nombre: destinatarioNombre,
      telefono: destinatarioTelefono,
      direccion: destinatarioDireccion
    },
    peso,
    precio,
    fecha_envio: toTimestamp(fechaEnvio),
    fecha_entrega: toTimestamp(fechaEntrega),
    user_id: user.uid,
    estado: "almacen",
    fecha: fechaCreacion,
    historial: [
      {
        estado: "almacen",
        fecha: fechaCreacion
      }
    ]
  });

  document.getElementById("descripcion").value = "";
  document.getElementById("destinatarioNombre").value = "";
  document.getElementById("destinatarioTelefono").value = "";
  document.getElementById("destinatarioDireccion").value = "";
  document.getElementById("peso").value = "";
  document.getElementById("precio").value = "";
  document.getElementById("fechaEnvio").value = "";
  document.getElementById("fechaEntrega").value = "";

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
      : `<button onclick="mover('${docu.id}')" class="btn btn-sm btn-outline-dark mt-2 w-100">Avanzar estado</button>`;

    const card = `
      <div class="shipment-card mb-2">
        <div><strong>Código:</strong> ${d.codigo || "Sin código"}</div>
        <strong>${d.cliente_nombre}</strong>
        <p class="mb-1"><strong>Estado actual:</strong> ${d.estado}</p>
        <p class="mb-1 text-muted">${d.descripcion}</p>
        ${btn}
      </div>
    `;

    if (d.estado === "almacen") alm.innerHTML += card;
    else if (d.estado === "transito") tra.innerHTML += card;
    else ent.innerHTML += card;
  });
}

window.mover = async function (id) {
  const envioRef = doc(db, "envios", id);
  const envioSnap = await getDoc(envioRef);
  if (!envioSnap.exists()) return;

  const estado = envioSnap.data().estado;
  let nuevo = "";

  if (estado === "almacen") nuevo = "transito";
  else if (estado === "transito") nuevo = "entregado";

  if (!nuevo) return;

  await updateDoc(envioRef, {
    estado: nuevo,
    historial: arrayUnion({
      estado: nuevo,
      fecha: Timestamp.now()
    })
  });

  await cargarEnvios();
};

cargarClientes();
cargarEnvios();
