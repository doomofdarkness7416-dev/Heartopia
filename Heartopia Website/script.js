/* PAGE NAVIGATION */
function showPage(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* HOME SLIDESHOW */
let slideIndex=1;
const slide=document.getElementById("slideImage");
const totalSlides = 10;

function showNextSlide(){
  slideIndex = slideIndex>=totalSlides?1:slideIndex+1;
  slide.style.opacity=0;
  setTimeout(()=>{
    slide.src=`images/image${slideIndex}.jpg`;
    slide.style.opacity=1;
  },300);
}

slide.src=`images/image${slideIndex}.jpg`;
slide.style.opacity=1;
setInterval(showNextSlide,6000);

/* MAP ZOOM + PAN */
let scale=1,posX=0,posY=0,startX,startY,drag=false;
const mapInner=document.getElementById("mapInner");
const mapWrapper=document.getElementById("mapWrapper");

mapWrapper.addEventListener("wheel",e=>{
  e.preventDefault();
  scale+=e.deltaY>0?-0.1:0.1;
  scale=Math.min(Math.max(0.5,scale),3);
  updateMap();
  saveState();
});

mapWrapper.addEventListener("mousedown",e=>{
  drag=true;
  startX=e.clientX-posX;
  startY=e.clientY-posY;
});

window.addEventListener("mouseup",()=>drag=false);
window.addEventListener("mousemove",e=>{
  if(!drag) return;
  posX=e.clientX-startX;
  posY=e.clientY-startY;
  updateMap();
  saveState();
});

function updateMap(){
  mapInner.style.transform=`translate(${posX}px,${posY}px) scale(${scale})`;
}

/* STATE SAVE */
function saveState(){
  localStorage.setItem("map",JSON.stringify({scale,posX,posY}));
}
(function(){
  const s=JSON.parse(localStorage.getItem("map"));
  if(!s) return;
  scale=s.scale; posX=s.posX; posY=s.posY;
  updateMap();
})();

/* SEARCH */
document.getElementById("searchInput").addEventListener("input",e=>{
  const q=e.target.value.toLowerCase();
  document.querySelectorAll(".marker").forEach(m=>{
    m.style.display=m.dataset.name.toLowerCase().includes(q)?"block":"none";
  });
});

/* AUTH (Firebase placeholders) */
function login(){
  document.querySelector(".auth-box").classList.add("hidden");
  document.getElementById("feed").classList.remove("hidden");
  loadFeed();
}
function register(){ login(); }
function loadFeed(){
  const feed=document.getElementById("feed");
  feed.innerHTML=`
    <div class="post">🌸 Welcome to Heartopia Socials</div>
    <div class="post">🍄 Someone found a rare mushroom!</div>
  `;
}

/* EDITOR MODE */
let editorMode=false;
let currentTool=null;
let selectedMarkerType=null;
let selectedMarkerX=0;
let selectedMarkerY=0;

const editorBtn=document.getElementById("editorBtn");
const editorLayout=document.getElementById("editorLayout");
const pencilTool=document.querySelector(".pencil");
const eraserTool=document.querySelector(".eraser");
const markerCircle=document.querySelector(".editor-marker-circle");
const markerGUI=document.getElementById("markerGUI");
const markerNameInput=document.getElementById("markerName");
const markerDescInput=document.getElementById("markerDesc");
const markerImageInput=document.getElementById("markerImage");
const imgError=document.getElementById("imgError");
const submitMarkerBtn=document.getElementById("submitMarker");

editorBtn.addEventListener("click",()=>{
  editorMode=!editorMode;
  editorLayout.classList.toggle("hidden",!editorMode);
  currentTool=null;
  selectedMarkerType=null;
  hideMarkerGUI();
  markerCircle.classList.add("hidden");
});

/* TOOL SELECTION */
pencilTool.addEventListener("click",()=>{
  currentTool="pencil";
  markerCircle.classList.remove("hidden");
});

eraserTool.addEventListener("click",()=>{
  currentTool="eraser";
  markerCircle.classList.add("hidden");
});

/* SELECT MARKER FROM CIRCLE */
document.querySelectorAll(".marker-choice").forEach(el=>{
  el.addEventListener("click",()=>{
    selectedMarkerType=el.dataset.type;
  });
});

/* MARKERS STORAGE */
let markersData = JSON.parse(localStorage.getItem("markers")) || [];
renderMarkers();

/* CLICK ON MAP TO ADD MARKER */
mapWrapper.addEventListener("click", e=>{
  if(!editorMode) return;
  if(currentTool==="pencil" && selectedMarkerType){
    const rect=mapInner.getBoundingClientRect();
    selectedMarkerX = ((e.clientX-rect.left)/rect.width)*100 + "%";
    selectedMarkerY = ((e.clientY-rect.top)/rect.height)*100;
    showMarkerGUI();
  }
});

/* GUI SHOW/HIDE */
function showMarkerGUI(){
  markerNameInput.value="";
  markerDescInput.value="";
  markerImageInput.value="";
  imgError.textContent="";
  markerGUI.classList.add("show");
  markerGUI.classList.remove("hidden");
}

function hideMarkerGUI(){
  markerGUI.classList.remove("show");
  markerGUI.classList.add("hidden");
}

/* SUBMIT MARKER */
submitMarkerBtn.addEventListener("click",()=>{
  const name = markerNameInput.value || selectedMarkerType;
  const desc = markerDescInput.value || "No description.";

  const file = markerImageInput.files[0];
  let imgData = "";

  if(file){
    const img = new Image();
    const reader = new FileReader();
    reader.onload = e=>{
      img.src = e.target.result;
      img.onload = ()=>{
        if(img.width !== img.height){
          imgError.textContent="Send a square image";
          return;
        }
        imgData = e.target.result;
        saveMarker(name,desc,imgData);
      }
    }
    reader.readAsDataURL(file);
  } else {
    saveMarker(name,desc,imgData);
  }
});

function saveMarker(name,desc,imgData){
  const newMarker={
    name:name,
    description:desc,
    type:selectedMarkerType,
    icon:getIcon(selectedMarkerType),
    x:selectedMarkerX,
    y:selectedMarkerY,
    img: imgData
  };
  markersData.push(newMarker);
  localStorage.setItem("markers",JSON.stringify(markersData));
  hideMarkerGUI();
  renderMarkers();
}

/* RENDER MARKERS */
function renderMarkers(){
  mapInner.innerHTML='<img src="images/Heartopia_Map.png" class="map-image">';
  markersData.forEach(m=>{
    const el=document.createElement("div");
    el.className="marker";
    el.dataset.name=m.name;
    el.dataset.desc=m.description;
    el.dataset.img=m.img || "";
    el.style.top=m.y;
    el.style.left=m.x;
    el.textContent=m.icon;

    el.addEventListener("mouseenter",()=>{
      const t=document.createElement("div");
      t.className="tooltip";
      t.textContent=m.name;
      el.appendChild(t);
    });

    el.addEventListener("mouseleave",()=>el.innerHTML=m.icon);

    el.addEventListener("click",()=>{
      if(editorMode && currentTool==="eraser"){
        if(confirm("Are you sure you wanna delete this?")){
          markersData = markersData.filter(mark=>mark!==m);
          localStorage.setItem("markers",JSON.stringify(markersData));
          renderMarkers();
        }
      } else if(!editorMode){
        let info = `${m.name}\n\n${m.description}`;
        if(m.img){
          const imgTag = `<img src="${m.img}" style="width:100px;height:100px;">`;
          alert(info+"\nImage attached (preview not in alert)"); // alert can't show img inline
        } else alert(info);
      }
    });

    mapInner.appendChild(el);
  });
}

/* HELPER ICON */
function getIcon(type){
  switch(type){
    case "truffle": return "🌱";
    case "orange": return "🍊";
    case "apple": return "🍎";
    case "blueberry": return "🫐";
    case "mushroom": return "🍄";
    case "raspberry": return "🍓";
    case "fish": return "🐟";
    case "bird": return "🐦";
    case "insect": return "🦋";
    case "animal": return "🐾";
    default: return "❓";
  }
}

/* CATEGORY TOGGLE */
function toggleCategory(id){
  const cat = document.getElementById(id);
  cat.classList.toggle("hidden");
}

/* SET CURRENT MARKER TYPE FROM SIDEBAR */
function setCurrentMarker(type){
  selectedMarkerType = type;
  currentTool = "pencil";
  markerCircle.classList.remove("hidden");
}
