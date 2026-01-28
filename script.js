function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* SIDEBAR */
function toggleSidebar() {
  const sidebar = document.getElementById("mapSidebar");
  const btn = document.getElementById("toggleMap");

  sidebar.classList.toggle("hidden");

  if (sidebar.classList.contains("hidden")) {
    btn.innerHTML = "▶";
    btn.style.left = "10px";
  } else {
    btn.innerHTML = "◀";
    btn.style.left = "320px";
  }
}

/* FILTERS */
function toggleMarkers(type) {
  document.querySelectorAll("." + type).forEach(m => {
    m.style.display = m.style.display === "none" ? "block" : "none";
  });
  document.getElementById(type + "Btn").classList.toggle("active");
}

/* ZOOM & PAN */
const mapInner = document.getElementById("mapInner");
const mapWrapper = document.getElementById("mapWrapper");

let scale = 1;
let posX = 0;
let posY = 0;
let dragging = false;
let startX, startY;

mapWrapper.addEventListener("wheel", e => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.1 : 0.1;
  scale = Math.min(Math.max(0.5, scale + delta), 3);
  updateTransform();
});

mapWrapper.addEventListener("mousedown", e => {
  dragging = true;
  startX = e.clientX - posX;
  startY = e.clientY - posY;
  mapWrapper.style.cursor = "grabbing";
});

window.addEventListener("mouseup", () => {
  dragging = false;
  mapWrapper.style.cursor = "grab";
});

window.addEventListener("mousemove", e => {
  if (!dragging) return;
  posX = e.clientX - startX;
  posY = e.clientY - startY;
  updateTransform();
});

function updateTransform() {
  mapInner.style.transform =
    `translate(${posX}px, ${posY}px) scale(${scale})`;
}
