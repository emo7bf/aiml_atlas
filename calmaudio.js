// Shared calm-audio engine: campy voice + generative harp/classical music, for every deck.
// Skips pages that ship their own audio room (Still Waters). Exposed as window.CalmAudio.
(function () {
  if (document.getElementById("audiofab")) return;   // page has a bespoke audio room already

  const css = `
    #audiofab { position:fixed; bottom:1rem; right:1.2rem; z-index:120; font-family:"Segoe UI",sans-serif; }
    #audiofab .fabbtn { background:#f4f3eced; color:#2a2d33; border:1px solid #b9b5a4; border-radius:4px;
      padding:.45rem .9rem; font-size:.9rem; cursor:pointer; }
    #audiofab .fabbtn:hover { background:#fffef8; }
    #audiofab .fabpanel { display:none; position:absolute; bottom:2.8rem; right:0; width:272px; background:#f7f6f0fa;
      border:1px solid #b9b5a4; border-radius:4px; padding:.9rem 1rem; box-shadow:0 10px 34px #00000030; }
    #audiofab.open .fabpanel { display:block; }
    #audiofab .arow { display:flex; align-items:center; justify-content:space-between; margin:.45rem 0; font-size:.9rem; color:#2a2d33; }
    #audiofab .toggle { cursor:pointer; border:1px solid #b9b5a4; border-radius:3px; padding:.12rem .6rem; background:#fff; }
    #audiofab .toggle.on { background:#0d9488; color:#fff; border-color:#0d9488; }
    #audiofab .readbtn { cursor:pointer; border:1px solid #b9b5a4; border-radius:3px; padding:.2rem .7rem; background:#fff; width:100%; }
    #audiofab .readbtn:hover { border-color:#0d9488; color:#0d9488; }
    #audiofab .asmall { font-size:.72rem; color:#6d6a5c; margin-top:.4rem; line-height:1.4; }`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  const Voice = {
    on: false, rate: .95, chosen: "",
    speak(txt) {
      if (!this.on || !window.speechSynthesis || !txt) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(txt.trim().slice(0, 2400));
      u.rate = this.rate; u.pitch = 1.0;
      const vs = speechSynthesis.getVoices();
      u.voice = vs.find(v => v.name === this.chosen)
             || vs.find(v => /en/i.test(v.lang) && /aria|jenny|natural|libby|sonia|zira|female/i.test(v.name))
             || vs.find(v => /^en/i.test(v.lang)) || null;
      speechSynthesis.speak(u);
    },
    stop() { window.speechSynthesis && speechSynthesis.cancel(); },
    readActiveNotes() {
      const n = document.querySelector(".notes.active-note") || document.querySelector(".notes");
      if (n) this.speak(n.textContent);
      else this.speak("This page has no speaker notes, but I'm happy you asked.");
    },
  };

  const Music = {
    ctx: null, gain: null, timer: null, style: "harp", on: false, vol: .45, barIdx: 0,
    ensure() {
      if (!this.ctx) { this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.gain = this.ctx.createGain(); this.gain.connect(this.ctx.destination); }
      this.gain.gain.value = this.vol * .5;
    },
    start() { this.ensure(); if (this.ctx.state === "suspended") this.ctx.resume(); this.on = true; this.loop(); },
    stop() { this.on = false; clearTimeout(this.timer); },
    pluck(f, t, dur, v, wave = "triangle", cutoff = 2200) {
      const c = this.ctx, o = c.createOscillator(), g = c.createGain(), fl = c.createBiquadFilter();
      o.type = wave; o.frequency.value = f;
      fl.type = "lowpass"; fl.frequency.value = cutoff; fl.Q.value = .5;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.2 * v, t + .012);
      g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(fl); fl.connect(g); g.connect(this.gain); o.start(t); o.stop(t + dur + .1);
    },
    drone(f, t, dur, v) {              // slow-breathing sine pair (ocean swells)
      const c = this.ctx;
      [f, f * 1.003].forEach(fr => {   // slight detune = gentle beating, like water
        const o = c.createOscillator(), g = c.createGain();
        o.type = "sine"; o.frequency.value = fr;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(.09 * v, t + dur * .4);   // long swell in
        g.gain.linearRampToValueAtTime(.0001, t + dur);          // long ebb out
        o.connect(g); g.connect(this.gain); o.start(t); o.stop(t + dur + .1);
      });
    },
    loop() {
      if (!this.on) return;
      const t = this.ctx.currentTime + .08;
      const PATS = {
        harp: { bar: 2.7, dur: 1.9, wave: "triangle", cutoff: 2200,
          prog: [[261.6,329.6,392,523.3,659.3],[220,329.6,440,523.3,659.3],[174.6,261.6,349.2,440,523.3],[196,293.7,392,493.9,587.3]],
          offs: [0,.38,.64,1.02,1.36,1.7,2.02,2.34] },
        classical: { bar: 3.6, dur: 2.6, wave: "triangle", cutoff: 2200,
          prog: [[261.6,329.6,392,523.3],[246.9,293.7,392,493.9],[220,261.6,329.6,440],[174.6,220,261.6,349.2],[196,246.9,293.7,392]],
          offs: [0,.45,.9,1.35,1.8,2.25,2.7,3.15] },
        musicbox: { bar: 3.2, dur: 1.1, wave: "sine", cutoff: 4200, up: 2,
          prog: [[523.3,659.3,784,1046.5],[440,523.3,659.3,880],[392,493.9,587.3,784],[523.3,659.3,784,1046.5]],
          offs: [0,.55,1.05,1.65,2.2,2.7] },
        nocturne: { bar: 4.4, dur: 3.4, wave: "triangle", cutoff: 1600,
          prog: [[220,261.6,329.6,440],[174.6,220,261.6,349.2],[164.8,196,246.9,329.6],[196,246.9,293.7,392],[220,261.6,329.6,440]],
          offs: [0,.62,1.25,1.9,2.55,3.2,3.8] },
        ocean: { bar: 7.5, drone: true,
          prog: [[130.8,196,261.6],[110,164.8,220],[146.8,220,293.7],[98,146.8,196]] },
      };
      const PAT = PATS[this.style] || PATS.harp;
      const chord = PAT.prog[this.barIdx++ % PAT.prog.length];
      if (PAT.drone) {                 // ocean: overlapping swells, no plucks at all
        chord.forEach((f, k) => this.drone(f, t + k * 1.1, PAT.bar + 2.2, 1 - k * .18));
        this.pluck(chord[2] * 2, t + 3.4, 2.6, .25, "sine", 1200);   // a distant bell on the swell
      } else {
        PAT.offs.forEach((o, k) =>
          this.pluck(chord[k % chord.length] * (k >= chord.length ? (PAT.up || 2) : 1), t + o, PAT.dur, .95 - k * .07, PAT.wave, PAT.cutoff));
      }
      this.timer = setTimeout(() => this.loop(), PAT.bar * 1000);
    },
  };

  const fab = document.createElement("div");
  fab.id = "audiofab";
  fab.innerHTML = `<button class="fabbtn">🎛 audio</button>
    <div class="fabpanel">
      <div class="arow"><span>🗣 Voice</span><span class="toggle" id="caVoice">off</span></div>
      <div class="arow"><span>Narrator</span><select id="caWho" style="max-width:150px"><option value="">auto (nicest English)</option></select></div>
      <div class="arow"><span>Read speed</span><input type="range" id="caRate" min="70" max="125" value="95" style="width:110px"></div>
      <div class="arow"><button class="readbtn" id="caRead">▶ read this slide's speaker notes</button></div>
      <div class="arow"><span>🎶 Music</span><span class="toggle" id="caMusic">off</span></div>
      <div class="arow"><span>Style</span><select id="caStyle">
        <option value="harp">Harps & calypso sway</option><option value="classical">Classical</option>
        <option value="musicbox">Music box</option><option value="nocturne">Nocturne (minor, slow)</option>
        <option value="ocean">Ocean swells (drones)</option></select></div>
      <div class="arow"><span>Volume</span><input type="range" id="caVol" min="0" max="100" value="45" style="width:110px"></div>
      <div class="asmall">Generated live — no files, no percussion. Voice reads the hidden speaker notes (N also shows them).</div>
    </div>`;
  document.body.appendChild(fab);

  fab.addEventListener("click", e => { e.stopPropagation(); if (e.target.closest(".fabbtn")) fab.classList.toggle("open"); });
  document.addEventListener("click", () => fab.classList.remove("open"));
  const tv = fab.querySelector("#caVoice"), tm = fab.querySelector("#caMusic");
  tv.addEventListener("click", () => { tv.classList.toggle("on"); tv.textContent = tv.classList.contains("on") ? "on" : "off";
    Voice.on = tv.classList.contains("on");
    Voice.on ? Voice.speak("Voice on. Press the read button any time, and I'll read the current slide's notes.") : Voice.stop(); });
  tm.addEventListener("click", () => { tm.classList.toggle("on"); tm.textContent = tm.classList.contains("on") ? "on" : "off";
    tm.classList.contains("on") ? Music.start() : Music.stop(); });
  fab.querySelector("#caRead").addEventListener("click", () => { if (!Voice.on) { tv.click(); } Voice.readActiveNotes(); });
  fab.querySelector("#caRate").addEventListener("input", e => Voice.rate = e.target.value / 100);
  const whoSel = fab.querySelector("#caWho");
  function fillVoices() {
    const vs = (window.speechSynthesis ? speechSynthesis.getVoices() : []).filter(v => /^en/i.test(v.lang));
    whoSel.innerHTML = '<option value="">auto (nicest English)</option>' +
      vs.map(v => `<option value="${v.name}">${v.name.replace(/Microsoft |Google /,"")}</option>`).join("");
    whoSel.value = Voice.chosen;
  }
  fillVoices();
  if (window.speechSynthesis) speechSynthesis.onvoiceschanged = fillVoices;
  whoSel.addEventListener("change", e => { Voice.chosen = e.target.value;
    Voice.on && Voice.speak("Hello — this is how I sound."); });
  fab.querySelector("#caStyle").addEventListener("change", e => Music.style = e.target.value);
  fab.querySelector("#caVol").addEventListener("input", e => { Music.vol = e.target.value / 100; if (Music.gain) Music.gain.gain.value = Music.vol * .5; });

  window.CalmAudio = { Voice, Music };
})();
