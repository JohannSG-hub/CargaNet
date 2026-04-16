import { db } from "./firebase-config.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let datos = [];

async function cargar() {

  const snap = await getDocs(collection(db, "envios"));
  const tabla = document.getElementById("tabla");

  tabla.innerHTML = "";

  snap.forEach(doc => {
    const d = doc.data();
    datos.push(d);

    tabla.innerHTML += `
      <tr>
        <td>${d.cliente_nombre}</td>
        <td>${d.descripcion}</td>
        <td>${d.estado}</td>
      </tr>
    `;
  });

  new Chart(document.getElementById("grafico"), {
    type: "pie",
    data: {
      labels: ["Almacén","Transito","Entregado"],
      datasets: [{
        data: [
          datos.filter(d=>d.estado==="almacen").length,
          datos.filter(d=>d.estado==="transito").length,
          datos.filter(d=>d.estado==="entregado").length
        ]
      }]
    }
  });
}

window.exportExcel = () => {
  const ws = XLSX.utils.json_to_sheet(datos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reporte");
  XLSX.writeFile(wb, "reporte.xlsx");
};

window.exportPDF = () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 10;

  datos.forEach(d => {
    doc.text(`${d.cliente_nombre} - ${d.estado}`, 10, y);
    y += 10;
  });

  doc.save("reporte.pdf");
};

cargar();