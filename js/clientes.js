import { auth, db } from "./firebase-config.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const lista = document.getElementById("lista");

function formatearFecha(fecha) {
  if (!fecha?.toDate) return "-";

  return fecha.toDate().toLocaleString("es-PE", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

window.guardarCliente = async function () {

  const nombre = document.getElementById("nombre").value.trim();
  const dni = document.getElementById("dni").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const direccion = document.getElementById("direccion").value.trim();

  if (!nombre || !dni || !telefono || !correo || !direccion) {
    alert("Completa todos los campos.");
    return;
  }

  if (!/^\d{8}$/.test(dni)) {
    alert("El DNI debe tener exactamente 8 dígitos.");
    return;
  }

  if (!/^\d{9}$/.test(telefono)) {
    alert("El teléfono debe tener exactamente 9 dígitos.");
    return;
  }

  const user = auth.currentUser;

  if (!user) {
    alert("Tu sesión expiró. Vuelve a iniciar sesión.");
    window.location.href = "index.html";
    return;
  }

  await addDoc(collection(db, "clientes"), {
    nombre,
    dni,
    telefono,
    correo,
    direccion,
    fecha_registro: serverTimestamp(),
    user_id: user.uid
  });

  document.getElementById("nombre").value = "";
  document.getElementById("dni").value = "";
  document.getElementById("telefono").value = "";
  document.getElementById("correo").value = "";
  document.getElementById("direccion").value = "";

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
      <li class="list-group-item">
        <div class="d-flex justify-content-between align-items-start gap-3">
          <div>
            <strong>${d.nombre ?? "-"}</strong>
            <div class="small text-muted">DNI: ${d.dni ?? "-"} · Tel: ${d.telefono ?? "-"}</div>
            <div class="small">${d.correo ?? "-"}</div>
            <div class="small text-muted">${d.direccion ?? "-"}</div>
          </div>
          <div class="text-end small text-muted">
            <div>Registro: ${formatearFecha(d.fecha_registro)}</div>
            <div>Usuario: ${d.user_id ?? "-"}</div>
          </div>
        </div>
      </li>
    `;
  });
}

cargarClientes();
