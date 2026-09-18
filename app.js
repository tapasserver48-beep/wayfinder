/*
 Pathway-first routing model.
 Coordinates are in the supplied 1376x768 site-plan image.
 IMPORTANT: these are manually digitized demo coordinates and should be
 field/CAD-verified before production deployment.
*/
const P={
 // Main pedestrian network
 a:{x:690,y:478}, b:{x:690,y:518}, c:{x:628,y:518}, d:{x:540,y:518},
 e:{x:454,y:518}, f:{x:370,y:518}, g:{x:322,y:500}, h:{x:300,y:445},
 i:{x:285,y:390}, j:{x:300,y:330}, k:{x:335,y:285}, l:{x:390,y:285},
 m:{x:455,y:285}, n:{x:520,y:285}, o:{x:600,y:285}, p:{x:690,y:285},
 q:{x:760,y:285}, r:{x:825,y:285}, s:{x:910,y:285}, t:{x:1005,y:285},
 u:{x:1080,y:285}, v:{x:1165,y:285}, w:{x:1180,y:330},
 x:{x:1180,y:405}, y:{x:1180,y:475}, z:{x:1120,y:475},
 aa:{x:1020,y:475}, ab:{x:920,y:475}, ac:{x:840,y:475},
 ad:{x:760,y:475},
 // south pathway
 ae:{x:1180,y:600}, af:{x:1080,y:600}, ag:{x:970,y:600},
 ah:{x:860,y:600}, ai:{x:760,y:600}, aj:{x:650,y:600},
 ak:{x:540,y:600}, al:{x:430,y:600}, am:{x:350,y:600},
 // villa internal/corridor doors
 v110d:{x:390,y:260}, v120d:{x:475,y:260}, v125d:{x:555,y:260},
 // upper guest wing entrances
 gwest:{x:790,y:270}, geast:{x:1005,y:270},
 // lower guest wing entrances
 gswest:{x:805,y:490}, gseast:{x:1110,y:490},
 // destination entrances
 rec:{x:690,y:455}, rest:{x:835,y:455}, pool:{x:1005,y:455},
 spa:{x:960,y:300}, tennis:{x:1180,y:285}, yoga:{x:1240,y:430},
 boutique:{x:850,y:490}, lobby:{x:705,y:285}
};

// Edges represent ONLY mapped pedestrian/corridor segments.
// Each edge can contain bend points; A* traverses the network, never free-space.
const E=[
["a","b"],["b","c"],["c","d"],["d","e"],["e","f"],["f","g"],["g","h"],["h","i"],["i","j"],["j","k"],["k","l"],["l","m"],["m","n"],["n","o"],["o","p"],
["p","q"],["q","r"],["r","s"],["s","t"],["t","u"],["u","v"],["v","w"],["w","x"],["x","y"],["y","z"],["z","aa"],["aa","ab"],["ab","ac"],["ac","ad"],["ad","a"],
["y","ae"],["ae","af"],["af","ag"],["ag","ah"],["ah","ai"],["ai","aj"],["aj","ak"],["ak","al"],["al","am"],["am","f"],
["v110d","m"],["v120d","n"],["v125d","o"],["gwest","p"],["geast","t"],["gswest","ad"],["gseast","aa"],
["rec","a"],["rec","p"],["rest","ac"],["rest","aa"],["pool","aa"],["spa","t"],["tennis","v"],["yoga","y"],
["boutique","ac"],["lobby","p"]
];

const locations={
 room101:{name:"Purple Villa 101 — door",x:287,y:252,attach:"k",icon:"🚪",kind:"Room door"},
 room105:{name:"Purple Villa 105 — door",x:255,y:320,attach:"j",icon:"🚪",kind:"Room door"},
 villa110:{name:"Villa 110 — door",x:390,y:260,attach:"v110d",icon:"🚪",kind:"Villa door"},
 villa120:{name:"Villa 120 — door",x:475,y:260,attach:"v120d",icon:"🚪",kind:"Villa door"},
 villa125:{name:"Villa 125 — door",x:555,y:260,attach:"v125d",icon:"🚪",kind:"Villa door"},
 guest201:{name:"Guest Room 201 — corridor door",x:795,y:240,attach:"gwest",icon:"🚪",kind:"Room door"},
 guest220:{name:"Guest Room 220 — corridor door",x:1005,y:240,attach:"geast",icon:"🚪",kind:"Room door"},
 guest301:{name:"South Guest Room — corridor door",x:805,y:515,attach:"gswest",icon:"🚪",kind:"Room door"},
 guest320:{name:"South Guest Room — corridor door",x:1110,y:515,attach:"gseast",icon:"🚪",kind:"Room door"},
 reception:{name:"Reception Area",x:P.rec.x,y:P.rec.y,attach:"rec",icon:"⌂",kind:"Destination"},
 restaurant:{name:"Main Restaurant & Bar",x:P.rest.x,y:P.rest.y,attach:"rest",icon:"🍽",kind:"Destination"},
 pool:{name:"Infinity Pool & Deck",x:P.pool.x,y:P.pool.y,attach:"pool",icon:"◉",kind:"Destination"},
 spa:{name:"Spa & Wellness",x:P.spa.x,y:P.spa.y,attach:"spa",icon:"✦",kind:"Destination"},
 tennis:{name:"Tennis Court",x:P.tennis.x,y:P.tennis.y,attach:"tennis",icon:"⚑",kind:"Destination"},
 yoga:{name:"Yoga Pavilion",x:P.yoga.x,y:P.yoga.y,attach:"yoga",icon:"✧",kind:"Destination"},
 boutique:{name:"Boutique",x:P.boutique.x,y:P.boutique.y,attach:"boutique",icon:"◆",kind:"Destination"},
 lobby:{name:"Lobby / Reception",x:P.lobby.x,y:P.lobby.y,attach:"lobby",icon:"⌂",kind:"Destination"}
};

const adjacency={}; E.forEach(([a,b])=>{(adjacency[a]??=[]).push(b);(adjacency[b]??=[]).push(a)});
const $=id=>document.getElementById(id);

function nearestRouteNode(loc){return loc.attach||Object.keys(P).sort((a,b)=>Math.hypot(P[a].x-loc.x,P[a].y-loc.y)-Math.hypot(P[b].x-loc.x,P[b].y-loc.y))[0]}
function edgeCost(a,b){return Math.hypot(P[a].x-P[b].x,P[a].y-P[b].y)}
function astar(start,end){
 const open=[start], g={[start]:0}, f={[start]:edgeCost(start,end)}, prev={};
 while(open.length){
  open.sort((a,b)=>(f[a]??Infinity)-(f[b]??Infinity)); const u=open.shift();
  if(u===end){const out=[];let n=u;while(n){out.unshift(n);n=prev[n]}return out}
  for(const v of adjacency[u]||[]){
   const ng=g[u]+edgeCost(u,v);
   if(ng<(g[v]??Infinity)){prev[v]=u;g[v]=ng;f[v]=ng+edgeCost(v,end);if(!open.includes(v))open.push(v)}
  }
 }
 return null;
}
function buildRoute(fromId,toId){
 const A=locations[fromId],B=locations[toId], an=nearestRouteNode(A),bn=nearestRouteNode(B);
 const nodes=astar(an,bn)||[an,bn];
 return {A,B,an,bn,nodes};
}
function pointsForRoute(r){
 const arr=[];
 if(r.A.x!==P[r.an].x||r.A.y!==P[r.an].y)arr.push(`${r.A.x},${r.A.y}`);
 r.nodes.forEach(n=>arr.push(`${P[n].x},${P[n].y}`));
 if(r.B.x!==P[r.bn].x||r.B.y!==P[r.bn].y)arr.push(`${r.B.x},${r.B.y}`);
 return arr.join(" ");
}
function draw(){
 const r=buildRoute($("from").value,$("to").value);
 const pts=pointsForRoute(r);
 $("routes").innerHTML=`<polyline class="routeHalo" points="${pts}"/><polyline class="routeLine" points="${pts}"/>`;
 $("markers").querySelectorAll(".startMark,.endMark").forEach(e=>e.remove());
 addSpecial("startMark",r.A,`<div class="core"></div><div class="tag">START</div>`);
 addSpecial("endMark",r.B,`<div class="core"></div>`);
 document.querySelectorAll(".marker").forEach(x=>x.classList.toggle("active",x.dataset.id===$("to").value));
 let pixels=0; for(let i=1;i<r.nodes.length;i++)pixels+=edgeCost(r.nodes[i-1],r.nodes[i]);
 const meters=Math.round(Math.max(12,pixels*1.08)+(Math.hypot(r.A.x-P[r.an].x,r.A.y-P[r.an].y)+Math.hypot(r.B.x-P[r.bn].x,r.B.y-P[r.bn].y))*.9);
 $("dist").textContent=meters+" m"; $("time").textContent=Math.max(1,Math.ceil(meters/75))+" min";
 const labels=r.nodes.slice(0,-1).map(n=>n).length;
 $("routeDesc").textContent=`Door → mapped corridor/pathway → destination entrance. ${labels} walkway nodes used. No route segment is allowed to cross restricted areas.`;
 $("result").classList.remove("hidden");
}
function addSpecial(cls,l,html){const e=document.createElement("div");e.className=cls;e.style.left=(l.x/1376*100)+"%";e.style.top=(l.y/768*100)+"%";e.innerHTML=html;$("markers").appendChild(e)}
function populate(){
 const all=Object.entries(locations);
 $("from").innerHTML=all.map(([id,l])=>`<option value="${id}" ${id==="room101"?"selected":""}>${l.name}</option>`).join("");
 $("to").innerHTML=all.filter(([id,l])=>l.kind==="Destination").map(([id,l])=>`<option value="${id}" ${id==="restaurant"?"selected":""}>${l.name}</option>`).join("");
 $("quick").innerHTML=all.map(([id,l])=>`<button data-id="${id}"><b>${l.icon} ${l.name}</b><small>${l.kind}</small></button>`).join("");
 $("quick").querySelectorAll("button").forEach(b=>b.onclick=()=>{ if(locations[b.dataset.id].kind==="Destination")$("to").value=b.dataset.id; else $("from").value=b.dataset.id; draw();});
}
function renderMarkers(){
 $("markers").innerHTML="";
 Object.entries(locations).forEach(([id,l])=>{
  const e=document.createElement("button");e.className="marker";e.dataset.id=id;e.style.left=(l.x/1376*100)+"%";e.style.top=(l.y/768*100)+"%";
  e.innerHTML=`<div class="pin"><span>${l.icon}</span></div><div class="label">${l.name}</div>`;
  e.onclick=()=>{if(l.kind==="Destination")$("to").value=id;else $("from").value=id;draw()};$("markers").appendChild(e);
 });
}
let scale=1,tx=0,ty=0,drag=false,sx=0,sy=0,stx=0,sty=0;
function transform(animated=true){$("stage").style.transition=animated?"transform .22s ease":"none";$("stage").style.transform=`translate(calc(-50% + ${tx}px),calc(-50% + ${ty}px)) scale(${scale})`}
$("go").onclick=draw;
if($("reset"))$("reset").onclick=()=>{scale=1;tx=0;ty=0;transform()};
$("plus").onclick=()=>{scale=Math.min(2.4,scale+.15);transform()};
$("minus").onclick=()=>{scale=Math.max(.7,scale-.15);transform()};
$("viewport").addEventListener("pointerdown",e=>{if(e.target.closest(".marker,.quick"))return;drag=true;sx=e.clientX;sy=e.clientY;stx=tx;sty=ty;$("viewport").classList.add("drag")});
window.addEventListener("pointermove",e=>{if(!drag)return;tx=stx+e.clientX-sx;ty=sty+e.clientY-sy;transform(false)});
window.addEventListener("pointerup",()=>{drag=false;$("viewport").classList.remove("drag")});
populate();renderMarkers();draw();

/* ---------- V3 mobile drawer + QR place deep-link ---------- */
const PLACE_PARAM = new URLSearchParams(location.search).get("place");
const placeNames = {};
Object.entries(locations).forEach(([id,l])=>placeNames[id]=l.name);

function setupV3(){
  const destinationIds = Object.entries(locations).filter(([,l])=>l.kind==="Destination").map(([id])=>id);
  const allIds = Object.keys(locations);

  const qr = document.getElementById("qrPlace");
  qr.innerHTML = destinationIds.map(id=>`<option value="${id}">${locations[id].name}</option>`).join("");

  function guestBaseUrl(){
    return location.href.split("?")[0].split("#")[0];
  }
  function updateQR(){
    const id=qr.value;
    const url=guestBaseUrl()+"?place="+encodeURIComponent(id);
    document.getElementById("qrUrl").textContent=url;
    const box=document.getElementById("qrcode");
    box.innerHTML="";
    if(window.QRCode){
      new QRCode(box,{text:url,width:150,height:150,correctLevel:QRCode.CorrectLevel.M});
    }else{
      box.innerHTML='<div style="font-size:10px;color:#a66;text-align:center">QR library unavailable. Connect to the internet and reload.</div>';
    }
  }
  qr.onchange=updateQR;
  updateQR();

  document.getElementById("copyUrl").onclick=async()=>{
    try{await navigator.clipboard.writeText(document.getElementById("qrUrl").textContent);document.getElementById("copyUrl").textContent="Copied";setTimeout(()=>document.getElementById("copyUrl").textContent="Copy",1200)}catch(e){}
  };
  document.getElementById("downloadQr").onclick=()=>{
    const img=document.querySelector("#qrcode img");
    if(!img)return;
    const a=document.createElement("a");a.href=img.src;a.download="azure-paradise-"+qr.value+"-qr.png";a.click();
  };

  // If the guest arrived from a place QR, make that place the starting point.
  if(PLACE_PARAM && locations[PLACE_PARAM]){
    const l=locations[PLACE_PARAM];
    // Place QR is intended for reception/restaurant/pool/etc., so it can be the start.
    document.getElementById("from").value=PLACE_PARAM;
    const cp=document.getElementById("currentPlace");
    document.getElementById("currentPlaceName").textContent=l.name;
    cp.classList.remove("hidden");
    draw();
  }
  // Mobile sidebar
  const sidebar=document.getElementById("sidebar"), scrim=document.getElementById("scrim");
  function openSide(){sidebar.classList.add("open");scrim.style.display="block"}
  function closeSide(){sidebar.classList.remove("open");scrim.style.display="none"}
  document.getElementById("menuBtn").onclick=openSide;
  document.getElementById("closeSidebar").onclick=closeSide;
  scrim.onclick=closeSide;
  document.getElementById("go").addEventListener("click",()=>{if(innerWidth<=820)closeSide()});

  // Dashboard drawer
  const dash=document.getElementById("dashboard");
  document.getElementById("dashboardBtn").onclick=()=>dash.classList.add("open");
  document.getElementById("closeDash").onclick=()=>dash.classList.remove("open");
}
setupV3();
