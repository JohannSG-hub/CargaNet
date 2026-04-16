import { db, auth } from "./firebase-config.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

window.logout = () => signOut(auth);

async function cargarDashboard() {

  const clientes = await getDocs(collection(db, "clientes"));
  document.getElementById("clientes").innerText = clientes.size;

  const envios = await getDocs(collection(db, "envios"));

  let almacen = 0, transito = 0, entregado = 0;

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
      labels: ["Almacén","Transito","Entregado"],
      datasets: [{
        data: [almacen, transito, entregado]
      }]
    }
  });
}

cargarDashboard();