import { db } from "./firebase-config.js";

import {
  collection,
  getDocs,
  limit,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

function formatearFecha(valor) {
  if (!valor) return "Fecha no disponible";

  const date = typeof valor.toDate === "function" ? valor.toDate() : new Date(valor);

  if (Number.isNaN(date.getTime())) return "Fecha no disponible";

  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function renderTimeline(historial = []) {
  const timelineEl = document.getElementById("trackingTimeline");

  if (!Array.isArray(historial) || historial.length === 0) {
    timelineEl.innerHTML = '<li class="timeline-item"><div class="text-muted">Sin historial registrado.</div></li>';
    return;
  }

  const historialOrdenado = [...historial].sort((a, b) => {
    const fechaA = a?.fecha?.toMillis ? a.fecha.toMillis() : 0;
    const fechaB = b?.fecha?.toMillis ? b.fecha.toMillis() : 0;
    return fechaB - fechaA;
  });

  timelineEl.innerHTML = historialOrdenado
    .map((item) => `
      <li class="timeline-item">
        <div class="timeline-dot"></div>
        <div>
          <div class="fw-semibold text-capitalize">${item.estado || "estado desconocido"}</div>
          <small class="text-muted">${formatearFecha(item.fecha)}</small>
        </div>
      </li>
    `)
    .join("");
}

window.buscarEnvio = async function () {
  const codigoInput = document.getElementById("codigoBusqueda");
  const resultadoEl = document.getElementById("resultadoTracking");
  const vacioEl = document.getElementById("trackingVacio");

  const codigo = codigoInput.value.trim().toUpperCase();

  resultadoEl.classList.add("d-none");
  vacioEl.classList.add("d-none");

  if (!codigo) {
    alert("Ingresa un código de envío.");
    return;
  }

  const envioQuery = query(
    collection(db, "envios"),
    where("codigo", "==", codigo),
    limit(1)
  );

  const snap = await getDocs(envioQuery);

  if (snap.empty) {
    vacioEl.classList.remove("d-none");
    return;
  }

  const envio = snap.docs[0].data();

  document.getElementById("trackingCliente").innerText = envio.cliente_nombre || "Sin cliente";
  document.getElementById("trackingDestinatario").innerText = envio.destinatario?.nombre || "Sin destinatario";

  const estadoEl = document.getElementById("trackingEstado");
  estadoEl.innerText = envio.estado || "sin estado";
  estadoEl.className = "badge text-bg-primary text-capitalize";

  renderTimeline(envio.historial);

  resultadoEl.classList.remove("d-none");
};

const codigoInput = document.getElementById("codigoBusqueda");
if (codigoInput) {
  codigoInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      buscarEnvio();
    }
  });
}
