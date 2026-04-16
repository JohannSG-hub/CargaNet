import { db } from "./firebase-config.js";
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const lista = document.getElementById("lista");

window.guardarCliente = async function () {
  const nombre = document.getElementById("nombre").value;
  const dni = document.getElementById("dni").value;

  await addDoc(collection(db, "clientes"), { nombre, dni });

  cargar();
};

async function cargar() {
  lista.innerHTML = "";
  const data = await getDocs(collection(db, "clientes"));
  data.forEach(doc => {
    lista.innerHTML += `<li>${doc.data().nombre}</li>`;
  });
}

cargar();