const CocokKartu = {
  deck: [],
  opened: [],
  matched: 0,
  moves: 0,
  locked: false,
  init() {
    GameApp.clr();
    this.opened = [];
    this.matched = 0;
    this.moves = 0;
    this.locked = false;
    const symbols = ["🎮","👾","⭐","🚀","💎","🎲","⚡","🧩"];
    this.deck = [...symbols,...symbols];
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i],this.deck[j]] = [this.deck[j],this.deck[i]];
    }
    const board = document.getElementById("memory-board");
    board.replaceChildren();
    this.deck.forEach((icon,index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "memory-card";
      button.dataset.index = String(index);
      button.setAttribute("aria-label","Kartu tertutup nomor " + (index+1));
      button.textContent = "❔";
      button.addEventListener("click",()=>this.flip(index));
      board.append(button);
    });
    this.write("Cari 8 pasang kartu • 0 langkah");
  },
  write(text) {
    document.getElementById("memory-status").textContent=text;
  },
  flip(index) {
    if (this.locked || GameApp.isPaused || this.opened.includes(index)) return;
    const el = document.querySelector('#memory-board [data-index="' + index + '"]');
    if (!el || el.disabled) return;
    el.classList.add("flipped");
    el.textContent=this.deck[index];
    el.setAttribute("aria-label","Kartu " + this.deck[index]);
    this.opened.push(index);
    if (this.opened.length!==2) return;
    this.moves++;
    const [a,b]=this.opened;
    if (this.deck[a]===this.deck[b]) {
      this.matched++;
      for (const n of [a,b]) {
        const card=document.querySelector('#memory-board [data-index="' + n + '"]');
        card.disabled=true;
        card.setAttribute("aria-label","Pasangan ditemukan: " + this.deck[n]);
      }
      this.opened=[];
      if(this.matched===8) {
        const bestKey="arcade-memory-best";
        const best=Number(localStorage.getItem(bestKey)||0);
        if(!best||this.moves<best)try{localStorage.setItem(bestKey,String(this.moves));}catch{}
        this.write("Selesai! Semua 8 pasangan cocok dalam " + this.moves + " langkah.");
      } else this.write(this.matched + "/8 pasangan • " + this.moves + " langkah");
    } else {
      this.locked=true;
      this.write("Belum cocok • " + this.moves + " langkah");
      const timeout=setTimeout(()=>{
        if(document.getElementById("cocokkartu").style.display==="none") return;
        for(const n of [a,b]) {
          const card=document.querySelector('#memory-board [data-index="' + n + '"]');
          if(card && !card.disabled){card.classList.remove("flipped");card.textContent="❔";card.setAttribute("aria-label","Kartu tertutup nomor "+(n+1));}
        }
        this.opened=[];
        this.locked=false;
      },750);
      GameApp.tos.push(timeout);
    }
  }
};