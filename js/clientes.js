import { db } from "./firebase-config.js";
import { collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const lista = document.getElementById("lista");

window.guardarCliente = async function () {
  const nombre = document.getElementById("nombre").value;
  const dni = document.getElementById("dni").value;

  await addDoc(collection(db, "clientes"), {
    nombre,
    dni
  });

  cargarClientes();
};

async function cargarClientes() {
  lista.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "clientes"));

  querySnapshot.forEach((docu) => {
    const data = docu.data();

    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between";

    li.innerHTML = `
      ${data.nombre} - ${data.dni}
      <button class="btn btn-danger btn-sm" onclick="eliminar('${docu.id}')">X</button>
    `;

    lista.appendChild(li);
  });
}

window.eliminar = async function (id) {
  await deleteDoc(doc(db, "clientes", id));
  cargarClientes();
};

cargarClientes();