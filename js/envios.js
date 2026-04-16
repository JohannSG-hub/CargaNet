import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const colAlmacen = document.getElementById("almacen");
const colTransito = document.getElementById("transito");
const colEntregado = document.getElementById("entregado");


// CREAR ENVÍO
window.crearEnvio = async function () {
  const cliente = document.getElementById("cliente").value;
  const descripcion = document.getElementById("descripcion").value;

  await addDoc(collection(db, "envios"), {
    cliente,
    descripcion,
    estado: "almacen"
  });

  location.reload();
};


// CARGAR ENVÍOS
async function cargarEnvios() {

  colAlmacen.innerHTML = "";
  colTransito.innerHTML = "";
  colEntregado.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "envios"));

  querySnapshot.forEach((docu) => {
    const data = docu.data();

    const card = document.createElement("div");
    card.className = "card p-2 mb-2 card-envio shadow-sm";

    card.innerHTML = `
      <strong>${data.cliente}</strong><br>
      <small>${data.descripcion}</small><br>
      <button class="btn btn-sm btn-primary mt-2" onclick="cambiarEstado('${docu.id}', '${data.estado}')">
        Avanzar
      </button>
    `;

    if (data.estado === "almacen") {
      colAlmacen.appendChild(card);
    } else if (data.estado === "transito") {
      colTransito.appendChild(card);
    } else {
      colEntregado.appendChild(card);
    }

  });
}


// CAMBIAR ESTADO
window.cambiarEstado = async function (id, estadoActual) {

  let nuevoEstado = "";

  if (estadoActual === "almacen") nuevoEstado = "transito";
  else if (estadoActual === "transito") nuevoEstado = "entregado";
  else return;

  await updateDoc(doc(db, "envios", id), {
    estado: nuevoEstado
  });

  cargarEnvios();
};


// INIT
cargarEnvios();