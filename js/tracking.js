import { db } from "./firebase-config.js";

import {
  collection,
  getDocs,
  query,
  where,
  limit,
  documentId
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

function formatearEstado(estado) {
  if (!estado) return "Sin estado";
  return estado.charAt(0).toUpperCase() + estado.slice(1);
}

function formatearFecha(fechaValor) {
  if (!fechaValor) return "Fecha no disponible";

  const fecha = typeof fechaValor.toDate === "function" ? fechaValor.toDate() : new Date(fechaValor);

  if (Number.isNaN(fecha.getTime())) return "Fecha no disponible";

  return fecha.toLocaleString("es-PE", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function obtenerHistorial(envio) {
  if (Array.isArray(envio.historial_estados) && envio.historial_estados.length > 0) {
    return [...envio.historial_estados].sort((a, b) => {
      const fechaA = a?.fecha?.toDate ? a.fecha.toDate().getTime() : new Date(a?.fecha || 0).getTime();
      const fechaB = b?.fecha?.toDate ? b.fecha.toDate().getTime() : new Date(b?.fecha || 0).getTime();
      return fechaA - fechaB;
    });
  }

  return [{ estado: envio.estado, fecha: envio.fecha }];
}

window.buscarEnvio = async function () {
  const codigoInput = document.getElementById("codigoBusqueda");
  const resultado = document.getElementById("resultadoTracking");
  const codigo = codigoInput.value.trim().toUpperCase();

  if (!codigo) {
    resultado.innerHTML = '<p class="text-danger mb-0">Ingresa un código de envío válido.</p>';
    return;
  }

  resultado.innerHTML = '<p class="text-muted mb-0">Buscando envío...</p>';

  let consulta = query(
    collection(db, "envios"),
    where("codigo", "==", codigo),
    limit(1)
  );

  let snap = await getDocs(consulta);

  if (snap.empty) {
    consulta = query(
      collection(db, "envios"),
      where(documentId(), "==", codigo),
      limit(1)
    );
    snap = await getDocs(consulta);
  }

  if (snap.empty) {
    resultado.innerHTML = `<p class="text-danger mb-0">No se encontró un envío con el código <strong>${codigo}</strong>.</p>`;
    return;
  }

  const envio = snap.docs[0].data();
  const historial = obtenerHistorial(envio);

  const timeline = historial.map(item => `
    <li class="timeline-item">
      <span class="timeline-dot"></span>
      <div>
        <div class="fw-semibold">${formatearEstado(item.estado)}</div>
        <small class="text-muted">${formatearFecha(item.fecha)}</small>
      </div>
    </li>
  `).join("");

  resultado.innerHTML = `
    <div class="d-flex flex-column gap-3">
      <div><span class="text-muted">Código:</span> <strong>${envio.codigo || codigo}</strong></div>
      <div><span class="text-muted">Cliente:</span> <strong>${envio.cliente_nombre || "No registrado"}</strong></div>
      <div><span class="text-muted">Destinatario:</span> <strong>${envio.destinatario || "No registrado"}</strong></div>
      <div><span class="text-muted">Estado actual:</span> <strong>${formatearEstado(envio.estado)}</strong></div>
      <div>
        <h6 class="mb-2">Historial de estados</h6>
        <ul class="timeline mb-0">
          ${timeline}
        </ul>
      </div>
    </div>
  `;
};
