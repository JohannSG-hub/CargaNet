import { db } from "./firebase-config.js";
import { collection, addDoc, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

window.crearEnvio = async function () {
  const cliente = document.getElementById("cliente").value;
  const descripcion = document.getElementById("descripcion").value;

  await addDoc(collection(db, "envios"), {
    cliente,
    descripcion,
    estado: "almacen"
  });

  cargar();
};

async function cargar() {
  const alm = document.getElementById("almacen");
  const tra = document.getElementById("transito");
  const ent = document.getElementById("entregado");

  alm.innerHTML = "";
  tra.innerHTML = "";
  ent.innerHTML = "";

  const data = await getDocs(collection(db, "envios"));

  data.forEach(docu => {
    const d = docu.data();

    const btn = `<button onclick="mover('${docu.id}','${d.estado}')">Mover</button>`;

    if(d.estado=="almacen") alm.innerHTML += `<div>${d.cliente} ${btn}</div>`;
    else if(d.estado=="transito") tra.innerHTML += `<div>${d.cliente} ${btn}</div>`;
    else ent.innerHTML += `<div>${d.cliente}</div>`;
  });
}

window.mover = async function(id, estado){
  let nuevo = estado=="almacen" ? "transito" : "entregado";

  await updateDoc(doc(db,"envios",id),{estado:nuevo});
  cargar();
};

cargar();