(() => {
  const key = "arcade-v3";
  const menu = document.getElementById("main-menu");
  const search = document.getElementById("arcade-search");
  const favoritesOnly = document.getElementById("arcade-only-faves");
  const recent = document.getElementById("arcade-recent");
  const total = document.getElementById("arcade-visible-count");
  const toast = document.getElementById("arcade-toast");
  const empty = document.getElementById("arcade-empty");
  const buttons = [...menu.querySelectorAll(".menu-grid .btn-menu")];
  const stored = (suffix,fallback) => {
    try {const x=JSON.parse(localStorage.getItem(key+suffix));return Array.isArray(x)?x:fallback;} catch {return fallback;}
  };
  let history = stored("-recent",[]).filter(x=>typeof x==="string").slice(0,12);
  let favorites = stored("-favorites",[]).filter(x=>typeof x==="string");
  const gameList = buttons.map(btn => {
    const onclick=btn.getAttribute("onclick")||"";
    const id=(onclick.match(/GameApp\.switch\(['"]([^'"]+)['"]\)/)||[])[1];
    return {id,name:btn.textContent.trim(),button:btn};
  }).filter(x=>x.id);
  const classes = {
    tictactoe:"Strategi",ulartangga:"Klasik",ular:"Klasik",pingpong:"Aksi",
    pukultikus:"Refleks",cocokkartu:"Logika",suitjari:"Klasik",tebakangka:"Logika",
    sapuranjau:"Strategi",ingatpola:"Logika",tebakwarna:"Logika",tangkapapel:"Refleks",
    flappyburung:"Refleks",dinolari:"Aksi",balapmobil:"Aksi",pantulbata:"Aksi",
    tembakpesawat:"Aksi",tembaktarget:"Refleks",balapklik:"Refleks",
    slotmesin:"Klasik",puzzle:"Logika"
  };
  let category = "Semua";
  let timer;
  function status(message) {
    clearTimeout(timer);
    toast.textContent=message;
    toast.classList.add("on");
    timer=setTimeout(()=>toast.classList.remove("on"),2600);
  }
  function persist() {
    try {localStorage.setItem(key+"-recent",JSON.stringify(history));localStorage.setItem(key+"-favorites",JSON.stringify(favorites));} catch {}
  }
  function play(id) {
    if (!gameList.some(x=>x.id===id)) return;
    if (typeof GameApp === "undefined") return;
    history=[id,...history.filter(x=>x!==id)].slice(0,12);
    persist();
    updateRecent();
    window.history.replaceState(null,"","#play="+encodeURIComponent(id));
    GameApp.switch(id);
    const element=document.getElementById(id);
    if(element)element.setAttribute("aria-label","Sedang bermain: "+gameList.find(x=>x.id===id).name);
  }
  function updateRecent() {
    recent.replaceChildren();
    for (const id of history.slice(0,4)) {
      const game = gameList.find(x=>x.id===id);
      if (!game) continue;
      const button=document.createElement("button");
      button.type="button";
      button.className="arcade-recent-button";
      button.textContent=game.name;
      button.addEventListener("click",()=>play(game.id));
      recent.append(button);
    }
    if(!recent.children.length)recent.textContent="Belum ada riwayat permainan";
  }
  function applyFilter() {
    const q=search.value.trim().toLocaleLowerCase("id-ID");
    let count=0;
    for (const game of gameList) {
      const allow=(category==="Semua"||classes[game.id]===category) &&
        (!favoritesOnly.checked||favorites.includes(game.id)) &&
        (!q||game.name.toLocaleLowerCase("id-ID").includes(q));
      game.button.parentElement.hidden=!allow;
      if(allow)count++;
    }
    total.textContent=String(count);
    empty.hidden=count>0;
  }
  function categories() {
    const holder=document.getElementById("arcade-categories");
    ["Semua","Klasik","Strategi","Logika","Refleks","Aksi"].forEach(name=>{
      const b=document.createElement("button");
      b.type="button";
      b.className="arcade-chip";
      b.textContent=name;
      b.setAttribute("aria-pressed",String(name===category));
      b.onclick=()=>{category=name;for(const el of holder.children)el.setAttribute("aria-pressed",String(el===b));applyFilter();};
      holder.append(b);
    });
  }
  for (const game of gameList) {
    const slot=document.createElement("div");
    slot.className="arcade-game-tile";
    game.button.parentNode.insertBefore(slot,game.button);
    slot.append(game.button);
    const fave=document.createElement("button");
    fave.type="button";
    fave.className="arcade-fave";
    fave.setAttribute("aria-label","Favoritkan "+game.name);
    fave.title="Tambah/hapus favorit";
    fave.setAttribute("aria-pressed",String(favorites.includes(game.id)));
    fave.textContent=favorites.includes(game.id)?"★":"☆";
    fave.onclick=()=>{const yes=favorites.includes(game.id);favorites=yes?favorites.filter(x=>x!==game.id):[...favorites,game.id];fave.setAttribute("aria-pressed",String(!yes));fave.textContent=yes?"☆":"★";persist();applyFilter();status(yes?"Dihapus dari favorit.":"Disimpan sebagai favorit.");};
    slot.append(fave);
    game.button.removeAttribute("onclick");
    game.button.onclick=()=>play(game.id);
    const label=document.createElement("small");
    label.className="arcade-genre";
    label.textContent=classes[game.id]||"Arcade";
    slot.append(label);
  }
  categories();
  applyFilter();
  updateRecent();
  search.addEventListener("input",applyFilter);
  favoritesOnly.addEventListener("change",applyFilter);
  document.getElementById("arcade-random").onclick=()=>play(gameList[Math.floor(Math.random()*gameList.length)].id);
  document.getElementById("arcade-last").onclick=()=>history.length?play(history[0]):status("Belum ada permainan terakhir.");
  document.getElementById("arcade-fullscreen").onclick=async()=>{
    try {if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}
    catch{status("Mode layar penuh tidak tersedia.");}
  };
  document.getElementById("arcade-share").onclick=async()=>{
    const link=location.href.split("#")[0]+"#play="+encodeURIComponent(history[0]||"tictactoe");
    try {await navigator.clipboard.writeText(link);status("Link permainan disalin.");}
    catch{status("Salin link membutuhkan HTTPS.");}
  };
  const sound=document.getElementById("arcade-motion");
  let reduced=localStorage.getItem(key+"-reduce")==="1";
  function setReduced(){document.documentElement.dataset.arcadeMotion=reduced?"reduce":"full";sound.setAttribute("aria-pressed",String(reduced));sound.textContent=reduced?"Animasi minimal ✓":"Animasi normal";}
  sound.onclick=()=>{reduced=!reduced;localStorage.setItem(key+"-reduce",reduced?"1":"0");setReduced();};
  setReduced();
  document.addEventListener("keydown",e=>{
    const tag=document.activeElement?.tagName;
    if(e.key==="/"&&!["INPUT","TEXTAREA","SELECT"].includes(tag)){e.preventDefault();GameApp.switch("main-menu");search.focus();}
    if(e.key==="Escape"&&document.activeElement===search){search.value="";applyFilter();search.blur();}
    if(e.altKey&&e.key.toLowerCase()==="m"){e.preventDefault();GameApp.switch("main-menu");window.history.replaceState(null,"",location.pathname+location.search);}
  });
  const oldSwitch=GameApp.switch.bind(GameApp);
  GameApp.switch=function(id){const result=oldSwitch(id);if(id==="main-menu"){window.history.replaceState(null,"",location.pathname+location.search);search.focus({preventScroll:true});}return result;};
  const goFromHash=()=>{const match=location.hash.match(/^#play=([a-z0-9_-]+)$/i);if(match)play(match[1]);};
  if(location.hash.startsWith("#play="))goFromHash();
  document.querySelectorAll("button").forEach(btn=>{if(!btn.type)btn.type="button";});
  menu.setAttribute("aria-label","Daftar permainan Arcade Collection");
})();