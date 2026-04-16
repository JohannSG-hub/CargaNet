import { db } from "./firebase-config.js";

import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let datos = [];
let grafico = null;

async function cargar() {

  const snap = await getDocs(query(collection(db, "envios"), orderBy("fecha", "desc")));
  const tabla = document.getElementById("tabla");

  datos = [];
  tabla.innerHTML = "";

  snap.forEach(doc => {
    const d = doc.data();
    datos.push(d);

    tabla.innerHTML += `
      <tr>
        <td>${d.cliente_nombre}</td>
        <td>${d.descripcion}</td>
        <td class="text-capitalize">${d.estado}</td>
      </tr>
    `;
  });

  if (!datos.length) {
    tabla.innerHTML = '<tr><td colspan="3" class="text-muted">No hay datos para mostrar.</td></tr>';
  }

  if (grafico) {
    grafico.destroy();
  }

  grafico = new Chart(document.getElementById("grafico"), {
    type: "pie",
    data: {
      labels: ["Almacén", "Tránsito", "Entregado"],
      datasets: [{
        backgroundColor: ["#1d4ed8", "#f59e0b", "#16a34a"],
        data: [
          datos.filter(d => d.estado === "almacen").length,
          datos.filter(d => d.estado === "transito").length,
          datos.filter(d => d.estado === "entregado").length
        ]
      }]
    }
  });
}

window.exportExcel = () => {
  if (!datos.length) {
    alert("No hay datos para exportar.");
    return;
  }

  const ws = XLSX.utils.json_to_sheet(datos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reporte");
  XLSX.writeFile(wb, "reporte-envios.xlsx");
};

window.exportPDF = () => {
  if (!datos.length) {
    alert("No hay datos para exportar.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text("Reporte de envíos", 10, 12);

  let y = 24;

  datos.forEach(d => {
    doc.setFontSize(10);
    doc.text(`${d.cliente_nombre} | ${d.descripcion} | ${d.estado}`, 10, y);
    y += 8;

    if (y > 280) {
      doc.addPage();
      y = 15;
    }
  });

  doc.save("reporte-envios.pdf");
};

cargar();
