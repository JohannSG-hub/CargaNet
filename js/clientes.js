import { auth, db } from "./firebase-config.js";
import { showError, showLoader, hideLoader, showValidationErrors, toast, confirmDelete } from "./ui.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
  deleteDoc,
  doc,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const lista = document.getElementById("lista");

function formatearFecha(fecha) {
  if (!fecha?.toDate) return "-";
  return fecha.toDate().toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" });
}

function obtenerFormulario() {
  return {
    nombre: document.getElementById("nombre").value.trim(),
    dni: document.getElementById("dni").value.trim(),
    telefono: document.getElementById("telefono").value.trim(),
    correo: document.getElementById("correo").value.trim().toLowerCase(),
    direccion: document.getElementById("direccion").value.trim()
  };
}

function limpiarFormulario() {
  ["nombre", "dni", "telefono", "correo", "direccion"].forEach((id) => {
    document.getElementById(id).value = "";
  });
}

async function existeDuplicado(userId, { dni, correo }) {
  const porDni = await getDocs(query(collection(db, "clientes"), where("user_id", "==", userId), where("dni", "==", dni), limit(1)));
  if (!porDni.empty) return "Ya existe un cliente con este DNI.";

  const porCorreo = await getDocs(query(collection(db, "clientes"), where("user_id", "==", userId), where("correo", "==", correo), limit(1)));
  if (!porCorreo.empty) return "Ya existe un cliente con este correo.";

  return null;
}

window.guardarCliente = async function () {
  const user = auth.currentUser;
  if (!user) {
    await showError("Tu sesión expiró. Vuelve a iniciar sesión.");
    window.location.href = "index.html";
    return;
  }

  const data = obtenerFormulario();
  const errores = [];

  if (!data.nombre || !data.dni || !data.telefono || !data.correo || !data.direccion) {
    errores.push("Todos los campos son obligatorios.");
  }
  if (data.dni && !/^\d{8}$/.test(data.dni)) errores.push("El DNI debe tener exactamente 8 dígitos.");
  if (data.telefono && !/^\d{9}$/.test(data.telefono)) errores.push("El teléfono debe tener exactamente 9 dígitos.");
  if (data.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.correo)) errores.push("El correo no tiene formato válido.");

  if (errores.length) {
    await showValidationErrors(errores);
    return;
  }

  showLoader();
  try {
    const duplicado = await existeDuplicado(user.uid, data);
    if (duplicado) {
      await showValidationErrors([duplicado]);
      return;
    }

    await addDoc(collection(db, "clientes"), {
      ...data,
      fecha_registro: serverTimestamp(),
      user_id: user.uid
    });

    limpiarFormulario();
    await cargarClientes();
    await toast("Cliente registrado");
  } catch (error) {
    await showError("No se pudo registrar el cliente.");
  } finally {
    hideLoader();
  }
};

window.eliminarCliente = async function (id) {
  const user = auth.currentUser;
  if (!user) return;

  const confirmado = await confirmDelete("Se eliminará el cliente seleccionado.");
  if (!confirmado) return;

  showLoader();
  try {
    await deleteDoc(doc(db, "clientes", id));
    await cargarClientes();
    await toast("Cliente eliminado", "success");
  } catch (e) {
    await showError("No se pudo eliminar el cliente.");
  } finally {
    hideLoader();
  }
};

async function cargarClientes() {
  const user = auth.currentUser;
  if (!user) return;

  lista.innerHTML = "";

  showLoader();
  try {
    const snap = await getDocs(query(collection(db, "clientes"), where("user_id", "==", user.uid)));
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "", "es"));

    if (!rows.length) {
      lista.innerHTML = '<li class="list-group-item text-muted">No hay clientes registrados.</li>';
      return;
    }

    rows.forEach((d) => {
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
              <button onclick="eliminarCliente('${d.id}')" class="btn btn-sm btn-outline-danger mt-2">Eliminar</button>
            </div>
          </div>
        </li>
      `;
    });
  } finally {
    hideLoader();
  }
}

onAuthStateChanged(auth, (user) => {
  if (!user) return;
  cargarClientes();
});
