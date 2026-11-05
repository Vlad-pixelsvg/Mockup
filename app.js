const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];

const demoBooks = [
  {id:"IT\\ICCU\\TO0\\123456",title:"Storia della città di Torino",author:"Giuseppe M. Casalis",pages:248,matched:true,has_mets:true},
  {id:"IT\\ICCU\\TO0\\234567",title:"Memorie e documenti del Piemonte",author:"Carlo Promis",pages:186,matched:true,has_mets:false},
  {id:"IT\\ICCU\\TO0\\345678",title:"Atlante storico del territorio",author:"Archivio Civico",pages:92,matched:true,has_mets:true},
  {id:"MS-001-1890",title:"Lettere e carteggi manoscritti",author:"Fondo Manoscritti",pages:64,matched:false,has_mets:false},
  {id:"IT\\ICCU\\TO0\\456789",title:"Il patrimonio artistico italiano",author:"L. Bianchi",pages:320,matched:true,has_mets:false}
];
const collections = [
  {name:"Fondo Storico Civico",category:"Monografie",count:"1.240 risorse",image:"image-books"},
  {name:"Archivio Manoscritti Digitali",category:"Manoscritti",count:"856 risorse",image:"image-manuscript"},
  {name:"Atlante Storico Torinese",category:"Carte",count:"320 risorse",image:"image-map"},
  {name:"Collezione d'Arte",category:"Arte",count:"672 risorse",image:"image-art"},
  {name:"Fondo Viaggiatori",category:"Periodici",count:"412 risorse",image:"image-manuscript"},
  {name:"Biblioteca di Storia Locale",category:"Monografie",count:"980 risorse",image:"image-books"}
];
let books = [...demoBooks];
let toastTimer;

function toast(message){
  const el=$("#toast"); el.textContent=message; el.classList.add("show");
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove("show"),3000);
}
function showDialog(title,text){
  $("#dialogTitle").textContent=title; $("#dialogText").textContent=text;
  $("#actionDialog").showModal();
}
function statusOf(book){return !book.matched?"missing":book.has_mets?"ok":"todo"}
function statusLabel(book){return ({ok:"METS generato",todo:"Da generare",missing:"Non censito"})[statusOf(book)]}
function renderMets(search=""){
  const term=search.toLocaleLowerCase("it");
  const rows=books.filter(b=>(b.title+" "+b.author+" "+b.id).toLocaleLowerCase("it").includes(term));
  $("#metsTable").innerHTML=rows.map(b=>`<tr>
    <td><strong>${escapeHTML(b.title)}</strong><br><span style="color:#927d87">${escapeHTML(b.author)}</span></td>
    <td><code>${escapeHTML(b.id)}</code></td><td>${b.pages}</td>
    <td><span class="status ${statusOf(b)}">${statusLabel(b)}</span></td>
    <td><button class="table-action" data-book="${escapeHTML(b.id)}">${b.has_mets?"Visualizza":"Gestisci"}</button></td>
  </tr>`).join("") || `<tr><td colspan="5">Nessuna risorsa corrispondente.</td></tr>`;
}
function escapeHTML(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function renderCollections(filter=""){
  const target=$("#allCollections"); if(!target)return;
  const term=filter.toLocaleLowerCase("it");
  target.innerHTML=collections.filter(c=>(c.name+" "+c.category).toLocaleLowerCase("it").includes(term)).map(c=>`
    <article class="collection-card"><div class="collection-image ${c.image}"><span>${c.category}</span></div>
    <div class="collection-info"><h3>${c.name}</h3><p>${c.count}</p></div><button class="round-arrow" aria-label="Apri ${c.name}">→</button></article>`).join("");
}
function navigate(view){
  const target=document.getElementById(view); if(!target)return;
  $$(".view").forEach(v=>v.classList.toggle("active-view",v===target));
  $$(".nav-link").forEach(a=>a.classList.toggle("active",a.dataset.view===view));
  $("#sidebar").classList.remove("open");
  if(view==="mets")renderMets();
  if(view==="collezioni")renderCollections();
  window.scrollTo({top:0,behavior:"smooth"});
}
function updateStats(stats){
  if(stats.books!=null)$("#statResources").textContent=Number(stats.books).toLocaleString("it-IT");
  if(stats.users!=null)$("#statUsers").textContent=Number(stats.users).toLocaleString("it-IT");
  if(stats.collections!=null)$("#statCollections").textContent=Number(stats.collections).toLocaleString("it-IT");
}
async function loadBackend(){
  try{
    const [statsResponse,booksResponse]=await Promise.all([fetch("/api/stats"),fetch("/api/books")]);
    if(!statsResponse.ok||!booksResponse.ok)throw new Error("API non disponibile");
    const stats=await statsResponse.json(); const data=await booksResponse.json();
    books=Array.isArray(data)?data:(data.books||[]);
    updateStats(stats); renderMets();
    toast("Dati aggiornati dal server.");
  }catch(error){
    // La demo resta utilizzabile anche senza backend.
    renderMets();
    console.info("Modalità demo: API non raggiungibile.",error.message);
  }
}
function handleAction(action){
  if(action==="upload"){
    $("#catalogFile").click(); return;
  }
  if(action==="export"){
    const csv=["ID;Titolo;Autore;Pagine;Stato METS",...books.map(b=>[b.id,b.title,b.author,b.pages,statusLabel(b)].map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(";"))].join("\n");
    const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob); const a=document.createElement("a");a.href=url;a.download="registro_biblioteca_digitale.csv";a.click();URL.revokeObjectURL(url);
    toast("Esportazione CSV completata.");return;
  }
}
$$("[data-view]").forEach(el=>el.addEventListener("click",event=>{
  const view=el.dataset.view;if(!view)return;
  event.preventDefault();navigate(view);
}));
$$("[data-action]").forEach(el=>el.addEventListener("click",()=>handleAction(el.dataset.action)));
$$(".help-open").forEach(el=>el.addEventListener("click",()=>showDialog("Assistenza","Il servizio di assistenza può essere collegato al sistema di ticketing della biblioteca.")));
$("#mobileMenu").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
$("#globalSearch").addEventListener("keydown",e=>{if(e.key==="Enter"){navigate("ricerca");$("#advancedSearch").value=e.target.value;runAdvancedSearch();}});
$("#globalSearch").addEventListener("input",e=>{if(e.target.value.length>1){$("#advancedSearch").value=e.target.value;}});
document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();$("#globalSearch").focus();}});
$("#metsSearch").addEventListener("input",e=>renderMets(e.target.value));
$("#collectionSearch").addEventListener("input",e=>renderCollections(e.target.value));
$("#metsTable").addEventListener("click",e=>{
  const button=e.target.closest("[data-book]");if(!button)return;
  const book=books.find(b=>b.id===button.dataset.book);if(!book)return;
  showDialog(book.title,`Identificativo: ${book.id}. Stato: ${statusLabel(book)}. Questa scheda può essere collegata al dettaglio METS e al visualizzatore delle immagini master.`);
});
$("#generateMets").addEventListener("click",async()=>{
  const pending=books.filter(b=>b.matched&&!b.has_mets);
  if(!pending.length){toast("Non ci sono pacchetti METS da generare.");return;}
  try{
    const response=await fetch("/api/mets/generate-missing",{method:"POST"});
    if(!response.ok)throw new Error("Endpoint non disponibile");
    await loadBackend();toast("Richiesta di generazione inviata al server.");
  }catch{
    showDialog("Generazione METS","La demo ha individuato "+pending.length+" risorse da elaborare. Per avviare la generazione reale, collega il pulsante all'endpoint POST /api/mets/generate-missing del backend.");
  }
});
$("#catalogFile").addEventListener("change",e=>{
  const file=e.target.files[0];if(!file)return;
  showDialog("Catalogo selezionato",`Hai selezionato ${file.name}. Per importare realmente il catalogo, collega il caricamento all'endpoint del backend che elabora file MARC, XML o TXT.`);
  e.target.value="";
});
function runAdvancedSearch(){
  const term=$("#advancedSearch").value.trim().toLocaleLowerCase("it");
  const results=books.filter(b=>(b.title+" "+b.author+" "+b.id).toLocaleLowerCase("it").includes(term));
  $("#searchResults").innerHTML=term?(results.length?results.map(b=>`<p><strong>${escapeHTML(b.title)}</strong> — ${escapeHTML(b.author)} · ${b.pages} pagine · ${statusLabel(b)}</p>`).join(""):"<p>Nessuna risorsa trovata.</p>"):"<p>Inserisci un termine per avviare la ricerca.</p>";
}
$("#runSearch").addEventListener("click",runAdvancedSearch);
$("#advancedSearch").addEventListener("keydown",e=>{if(e.key==="Enter")runAdvancedSearch();});
$("#darkToggle").addEventListener("change",e=>{document.body.classList.toggle("dark",e.target.checked);});
$$(".nav-link").forEach(a=>a.addEventListener("click",()=>{}));
renderMets();renderCollections();loadBackend();