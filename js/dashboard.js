import { db } from "./firebase-config.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function cargarDashboard() {

  const clientes = await getDocs(collection(db, "clientes"));
  document.getElementById("clientes").innerText = clientes.size;

  const envios = await getDocs(collection(db, "envios"));

  let almacen = 0;
  let transito = 0;
  let entregado = 0;

  envios.forEach(doc => {
    const d = doc.data();

    if (d.estado === "almacen") almacen++;
    if (d.estado === "transito") transito++;
    if (d.estado === "entregado") entregado++;
  });

  document.getElementById("transito").innerText = transito;
  document.getElementById("entregado").innerText = entregado;

  new Chart(document.getElementById("graficoEstados"), {
    type: "bar",
    data: {
      labels: ["Almacén", "Tránsito", "Entregado"],
      datasets: [{
        label: "Cantidad de envíos",
        backgroundColor: ["#1d4ed8", "#f59e0b", "#16a34a"],
        data: [almacen, transito, entregado]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

cargarDashboard();
