let loaderCounter = 0;

function ensureLoader() {
  let loader = document.getElementById("globalLoader");
  if (loader) return loader;

  loader = document.createElement("div");
  loader.id = "globalLoader";
  loader.className = "global-loader d-none";
  loader.innerHTML = `
    <div class="loader-card">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mb-0">Cargando...</p>
    </div>
  `;
  document.body.appendChild(loader);
  return loader;
}

export function showLoader() {
  loaderCounter += 1;
  const loader = ensureLoader();
  loader.classList.remove("d-none");
}

export function hideLoader() {
  loaderCounter = Math.max(0, loaderCounter - 1);
  if (loaderCounter > 0) return;
  const loader = ensureLoader();
  loader.classList.add("d-none");
}

export function showSuccess(message) {
  return Swal.fire({
    icon: "success",
    title: "Éxito",
    text: message,
    timer: 1800,
    showConfirmButton: false
  });
}

export function showError(message) {
  return Swal.fire({
    icon: "error",
    title: "Error",
    text: message
  });
}

export function showInfo(message) {
  return Swal.fire({
    icon: "info",
    title: "Información",
    text: message
  });
}

export function showValidationErrors(errors = []) {
  return Swal.fire({
    icon: "warning",
    title: "Revisa el formulario",
    html: `<ul class="text-start mb-0">${errors.map(e => `<li>${e}</li>`).join("")}</ul>`
  });
}

export function toast(message, icon = "success") {
  return Swal.fire({
    toast: true,
    position: "top-end",
    icon,
    title: message,
    timer: 2200,
    showConfirmButton: false,
    timerProgressBar: true
  });
}

export async function confirmDelete(text = "Esta acción no se puede deshacer") {
  const result = await Swal.fire({
    title: "¿Eliminar registro?",
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#dc3545"
  });

  return result.isConfirmed;
}
