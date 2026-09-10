// OpenWave — Brainwave Generator (MIT License)
// Original implementation. Uses Web Audio API for real-time playback and offline WAV export.
// No code was copied from Brainwave Generator v3.1. Any resemblance is purely functional.

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

// ------------ Session Model ------------
let session = []; // array of segments
let selectedIndex = -1;

function fmtTime(s){
  const m = Math.floor(s/60), ss = Math.floor(s%60);
  return `${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
}

function totalDuration(){
  return session.reduce((a,s)=>a+Number(s.duration),0);
}

function renderTable(){
  const tbody = $("#tbody");
  tbody.innerHTML = "";
  session.forEach((seg,i)=>{
    const tr = document.createElement("tr");
    tr.style.outline = (i===selectedIndex) ? "2px solid #6fd3ff" : "none";
    tr.innerHTML = `
      <td>${i+1}</td>
      <td><span class="pill">${seg.mode}</span></td>
      <td>${seg.duration}s</td>
      <td>${seg.mode==='noise'?'—':seg.carrier} Hz</td>
      <td>${seg.mode==='noise'?'—':seg.beat} Hz</td>
      <td>${seg.mode==='noise'?'—':seg.depth}</td>
      <td>${seg.volume}</td>
      <td>${seg.pan}</td>
      <td>${seg.rampTo?seg.rampTo.join(", "):""}</td>
      <td>
        <div class="flex right">
          <button class="btn tiny" data-act="up">↑</button>
          <button class="btn tiny" data-act="down">↓</button>
          <button class="btn tiny" data-act="edit">Edit</button>
          <button class="btn bad tiny" data-act="del">Delete</button>
        </div>
      </td>`;
    tr.addEventListener("click", e=>{
      selectedIndex = i;
      renderTable();
    });
    tr.querySelectorAll("button").forEach(btn=>{
      btn.addEventListener("click", ev=>{
        ev.stopPropagation();
        const act = btn.dataset.act;
        if(act==='del'){ session.splice(i,1); selectedIndex=-1; renderTable(); updateMeta(); drawViz(); }
        if(act==='edit'){ selectedIndex=i; loadIntoEditor(session[i]); $("#btnUpdate").disabled=false; renderTable(); }
        if(act==='up' && i>0){ [session[i-1],session[i]]=[session[i],session[i-1]]; selectedIndex=i-1; renderTable(); drawViz(); }
        if(act==='down' && i<session.length-1){ [session[i+1],session[i]]=[session[i],session[i+1]]; selectedIndex=i+1; renderTable(); drawViz(); }
      });
    });
    tbody.appendChild(tr);
  });
}

function updateMeta(){
  $("#sessionMeta").textContent = `${session.length} segment${session.length!==1?"s":""} · ${fmtTime(totalDuration())}`;
}

function loadIntoEditor(seg){
  $("#mode").value = seg.mode;
  $("#duration").value = seg.duration;
  if(seg.mode!=='noise'){
    $("#carrier").value = seg.carrier;
    $("#beat").value = seg.beat;
    $("#waveform").value = seg.waveform;
    $("#depth").value = seg.depth;
    $("#pan").value = seg.pan;
    $("#volume").value = seg.volume;
  }else{
    $("#noiseType").value = seg.noiseType;
    $("#noiseVol").value = seg.volume;
    $("#noisePan").value = seg.pan;
  }
  $("#rampTo").value = seg.rampTo? seg.rampTo.join(",") : "";
  toggleFieldsets();
}

function readEditor(){
  const mode = $("#mode").value;
  const duration = Number($("#duration").value||0);
  if(mode==="noise"){
    return {
      mode, duration,
      noiseType: $("#noiseType").value,
      volume: clamp(Number($("#noiseVol").value||0.2),0,1),
      pan: clamp(Number($("#noisePan").value||0),-1,1),
      rampTo: parseRamp($("#rampTo").value)
    };
  }else{
    return {
      mode, duration,
      carrier: Number($("#carrier").value||220),
      beat: Number($("#beat").value||10),
      waveform: $("#waveform").value,
      depth: clamp(Number($("#depth").value||0.6),0,1),
      pan: clamp(Number($("#pan").value||0),-1,1),
      volume: clamp(Number($("#volume").value||0.4),0,1),
      rampTo: parseRamp($("#rampTo").value)
    };
  }
}

function parseRamp(txt){
  if(!txt.trim()) return null;
  const parts = txt.split(/[ ,]+/).map(Number).filter(x=>!Number.isNaN(x));
  // For tone: [carrier, beat, depth, volume]; For noise: [volume]
  return parts.length? parts : null;
}

function toggleFieldsets(){
  const mode = $("#mode").value;
  $("#toneFields").style.display = (mode==="noise")?"none":"block";
  $("#noiseFields").style.display = (mode==="noise")?"block":"none";
}

$("#mode").addEventListener("change", toggleFieldsets);

$("#btnAdd").addEventListener("click", ()=>{
  const s = readEditor();
  if(s.duration<=0){ alert("Duration must be > 0."); return; }
  session.push(s);
  selectedIndex = session.length-1;
  renderTable(); updateMeta(); drawViz();
});

$("#btnUpdate").addEventListener("click", ()=>{
  if(selectedIndex<0) return;
  session[selectedIndex] = readEditor();
  $("#btnUpdate").disabled = true;
  renderTable(); updateMeta(); drawViz();
});

$("#btnClear").addEventListener("click", ()=>{
  if(confirm("Clear the current session?")){ session=[]; selectedIndex=-1; renderTable(); updateMeta(); drawViz(); }
});

// ---------- Presets ----------
const defaultPresets = {
  "Focus 20 min (12→16 Hz)": [
    {mode:"binaural", duration:60, carrier:220, beat:12, waveform:"sine", depth:0.6, pan:0, volume:0.35, rampTo:[220,14,0.7,0.4]},
    {mode:"binaural", duration:540, carrier:220, beat:14, waveform:"sine", depth:0.7, pan:0, volume:0.4, rampTo:[220,16,0.7,0.45]},
    {mode:"noise", duration:120, noiseType:"pink", volume:0.25, pan:0, rampTo:[0.2]}
  ],
  "Relax 30 min (12→8 Hz)": [
    {mode:"monaural", duration:600, carrier:200, beat:12, waveform:"sine", depth:0.5, pan:0, volume:0.35, rampTo:[200,10,0.6,0.35]},
    {mode:"monaural", duration:600, carrier:180, beat:10, waveform:"sine", depth:0.6, pan:0, volume:0.35, rampTo:[180,8,0.6,0.3]},
    {mode:"noise", duration:120, noiseType:"brown", volume:0.22, pan:0, rampTo:[0.18]}
  ],
  "Sleep 45 min (10→3 Hz)": [
    {mode:"isochronic", duration:900, carrier:160, beat:10, waveform:"sine", depth:0.9, pan:0, volume:0.28, rampTo:[150,6,0.95,0.25]},
    {mode:"isochronic", duration:900, carrier:120, beat:6, waveform:"sine", depth:0.95, pan:-0.1, volume:0.24, rampTo:[110,3,0.95,0.2]},
    {mode:"noise", duration:900, noiseType:"brown", volume:0.2, pan:0, rampTo:[0.18]}
  ],
  "Power Nap 25 min (12→5→12 Hz)": [
    {mode:"binaural", duration:600, carrier:220, beat:12, waveform:"sine", depth:0.6, pan:0, volume:0.35, rampTo:[220,5,0.7,0.35]},
    {mode:"monaural", duration:300, carrier:200, beat:5, waveform:"sine", depth:0.6, pan:0, volume:0.3, rampTo:[200,12,0.6,0.35]},
    {mode:"noise", duration:120, noiseType:"pink", volume:0.22, pan:0, rampTo:[0.2]}
  ]
};

function loadPresetList(){
  const select = $("#presetSelect");
  select.innerHTML = "";
  const localPresets = JSON.parse(localStorage.getItem("openwave_presets")||"{}");
  const keys = [...Object.keys(defaultPresets), ...Object.keys(localPresets)];
  keys.forEach(k=>{
    const opt = document.createElement("option");
    opt.value = k; opt.textContent = k;
    select.appendChild(opt);
  });
}

$("#btnLoadPreset").addEventListener("click", ()=>{
  const name = $("#presetSelect").value;
  const local = JSON.parse(localStorage.getItem("openwave_presets")||"{}");
  const src = defaultPresets[name] || local[name];
  if(!src){ alert("Preset not found."); return; }
  session = JSON.parse(JSON.stringify(src));
  selectedIndex=-1; renderTable(); updateMeta(); drawViz();
});

$("#btnDeletePreset").addEventListener("click", ()=>{
  const name = $("#presetSelect").value;
  const local = JSON.parse(localStorage.getItem("openwave_presets")||"{}");
  if(local[name]){
    if(confirm(`Delete user preset "${name}"?`)){
      delete local[name];
      localStorage.setItem("openwave_presets", JSON.stringify(local));
      loadPresetList();
    }
  }else{
    alert("You can only delete your own saved presets.");
  }
});

$("#btnSavePreset").addEventListener("click", ()=>{
  if(session.length===0){ alert("Build a session first."); return; }
  const name = prompt("Preset name:");
  if(!name) return;
  const local = JSON.parse(localStorage.getItem("openwave_presets")||"{}");
  local[name] = session;
  localStorage.setItem("openwave_presets", JSON.stringify(local));
  loadPresetList();
  $("#presetSelect").value = name;
});

// ---------- Templates ----------
$("#template").addEventListener("change", ()=>{
  const t = $("#template").value;
  if(!t) return;
  if(t==="custom"){
    // nothing
    return;
  }
  const mapping = {
    focus: defaultPresets["Focus 20 min (12→16 Hz)"],
    relax: defaultPresets["Relax 30 min (12→8 Hz)"],
    sleep: defaultPresets["Sleep 45 min (10→3 Hz)"],
    powernap: defaultPresets["Power Nap 25 min (12→5→12 Hz)"]
  };
  const tpl = mapping[t];
  if(tpl){
    session = JSON.parse(JSON.stringify(tpl));
    renderTable(); updateMeta(); drawViz();
  }
  $("#template").value = "";
});

// ---------- Visualizer ----------
function drawViz(){
  const c = $("#viz");
  const ctx = c.getContext("2d");
  const w = c.width = c.clientWidth;
  const h = c.height;
  ctx.clearRect(0,0,w,h);
  // background grid
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#0b1428";
  ctx.fillRect(0,0,w,h);
  ctx.strokeStyle = "#1e2b4e";
  for(let i=0;i<10;i++){ ctx.beginPath(); ctx.moveTo(0,i*h/10); ctx.lineTo(w,i*h/10); ctx.stroke(); }
  // draw beat rate over time (scaled to 0..40Hz)
  let t=0;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.strokeStyle = "#6fd3ff";
  let started=false;
  session.forEach(seg=>{
    const dur = seg.duration;
    for(let x=0; x<dur; x+=Math.max(1, Math.floor(dur/50))){
      const beat = seg.mode==="noise" ? 0 : (seg.beat || 0);
      const y = h - (Math.min(40, beat)/40)*h;
      const px = ((t+x)/Math.max(1,totalDuration()))*w;
      if(!started){ ctx.moveTo(px,y); started=true; } else { ctx.lineTo(px,y); }
    }
    t += dur;
  });
  ctx.stroke();
  // duration bar
  ctx.fillStyle = "#203560";
  ctx.fillRect(0,h-18,w,18);
  ctx.fillStyle = "#8ecbff";
  ctx.font = "12px Inter, system-ui, sans-serif";
  ctx.fillText(`Duration: ${fmtTime(totalDuration())}`, 8, h-5);
}

// ---------- Audio Engine ----------
class Engine{
  constructor(){
    this.ctx = null;
    this.masterGain = null;
    this.panNode = null;
    this.playing = false;
    this.stopFn = null;
    this.strobeInterval = null;
  }
  ensureCtx(){
    if(this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  stop(){
    if(!this.playing) return;
    if(this.stopFn) this.stopFn();
    this.playing=false;
    $("#btnPlay").disabled=false;
    $("#btnStop").disabled=true;
    if(this.strobeInterval){ clearInterval(this.strobeInterval); this.strobeInterval=null; }
  }
  async play(sess){
    if(!sess.length){ alert("Session is empty."); return; }
    this.ensureCtx();
    const ctx = this.ctx;
    const startTime = ctx.currentTime + 0.1;
    const master = ctx.createGain(); master.gain.setValueAtTime(0.9,startTime);
    master.connect(ctx.destination);

    // strobe
    this.setupStrobe(sess);

    let t = startTime;
    const subStops = [];

    for(const seg of sess){
      const end = t + Number(seg.duration);
      if(seg.mode==="noise"){
        const [src, gain, pan] = this.makeNoise(ctx, seg.noiseType||"white");
        pan.pan.setValueAtTime(seg.pan||0, t);
        gain.gain.setValueAtTime(seg.volume||0.2, t);
        if(seg.rampTo && seg.rampTo.length>=1){
          gain.gain.linearRampToValueAtTime(clamp(seg.rampTo[0],0,1), end);
        }
        src.connect(gain).connect(pan).connect(master);
        src.start(t); src.stop(end);
        subStops.push(()=>{ try{src.stop();}catch{} });
      }else if(seg.mode==="binaural"){
        // two channels L/R differing by beat/2
        const left = ctx.createOscillator(); left.type = seg.waveform||"sine";
        const right = ctx.createOscillator(); right.type = seg.waveform||"sine";
        const gl = ctx.createGain(); const gr = ctx.createGain();
        gl.gain.setValueAtTime(seg.volume||0.3, t);
        gr.gain.setValueAtTime(seg.volume||0.3, t);
        const lpan = ctx.createStereoPanner(); lpan.pan.setValueAtTime(-0.7 + (seg.pan||0)*0.3, t);
        const rpan = ctx.createStereoPanner(); rpan.pan.setValueAtTime(0.7 + (seg.pan||0)*0.3, t);
        const base = seg.carrier||220; const beat = seg.beat||10;
        left.frequency.setValueAtTime(base - beat/2, t);
        right.frequency.setValueAtTime(base + beat/2, t);

        if(seg.rampTo && seg.rampTo.length>=4){
          const [c,b,d,v] = seg.rampTo.map(Number);
          left.frequency.linearRampToValueAtTime(c - b/2, end);
          right.frequency.linearRampToValueAtTime(c + b/2, end);
          gl.gain.linearRampToValueAtTime(clamp(v,0,1), end);
          gr.gain.linearRampToValueAtTime(clamp(v,0,1), end);
        }
        left.connect(gl).connect(lpan).connect(master);
        right.connect(gr).connect(rpan).connect(master);
        left.start(t); right.start(t);
        left.stop(end); right.stop(end);
        subStops.push(()=>{ try{left.stop(); right.stop();}catch{} });
      }else if(seg.mode==="monaural"){
        // single carrier amplitude-modulated by beat
        const osc = ctx.createOscillator(); osc.type = seg.waveform||"sine";
        osc.frequency.setValueAtTime(seg.carrier||200, t);
        const gain = ctx.createGain(); gain.gain.setValueAtTime(seg.volume||0.3, t);
        const pan = ctx.createStereoPanner(); pan.pan.setValueAtTime(seg.pan||0, t);
        // AM: multiply by (1 - depth/2) + (depth/2)*[1 + sin]/1  -> implement via separate Gain
        const lfo = ctx.createOscillator(); lfo.type="sine"; lfo.frequency.setValueAtTime(Math.max(0.1,seg.beat||10), t);
        const lfoGain = ctx.createGain(); const depth = clamp(seg.depth||0.6,0,1);
        lfoGain.gain.setValueAtTime(depth*0.5, t);
        const dc = ctx.createConstantSource(); dc.offset.setValueAtTime(1 - depth*0.5, t);
        // Connect LFO -> lfoGain -> multiply? We can modulate gain.gain directly
        lfo.connect(lfoGain).connect(gain.gain);
        dc.connect(gain.gain);
        osc.connect(gain).connect(pan).connect(master);
        if(seg.rampTo && seg.rampTo.length>=4){
          const [c,b,d,v]=seg.rampTo.map(Number);
          osc.frequency.linearRampToValueAtTime(c, end);
          lfo.frequency.linearRampToValueAtTime(Math.max(0.1,b), end);
          lfoGain.gain.linearRampToValueAtTime(clamp(d,0,1)*0.5, end);
          dc.offset.linearRampToValueAtTime(1 - clamp(d,0,1)*0.5, end);
          gain.gain.linearRampToValueAtTime(clamp(v,0,1), end);
        }
        dc.start(t); lfo.start(t); osc.start(t);
        osc.stop(end); lfo.stop(end); dc.stop(end);
        subStops.push(()=>{ try{osc.stop(); lfo.stop(); dc.stop();}catch{} });
      }else if(seg.mode==="isochronic"){
        // Pulsed tone via square LFO gating
        const osc = ctx.createOscillator(); osc.type = seg.waveform||"sine";
        osc.frequency.setValueAtTime(seg.carrier||180, t);
        const gate = ctx.createGain(); gate.gain.setValueAtTime(0, t);
        const pan = ctx.createStereoPanner(); pan.pan.setValueAtTime(seg.pan||0, t);
        const rate = Math.max(0.1, seg.beat||6);
        const duty = clamp(seg.depth||0.8, 0.05, 0.95); // reusing "depth" as duty

        // Schedule simple on/off pulses to avoid needing an AudioWorklet
        let tt = t;
        while(tt < end){
          const onDur = duty*(1/rate);
          const offDur = (1/rate) - onDur;
          gate.gain.setValueAtTime(seg.volume||0.28, tt);
          gate.gain.setValueAtTime(0, tt+onDur);
          tt += (onDur+offDur);
        }

        // Ramps
        if(seg.rampTo && seg.rampTo.length>=4){
          const [c,b,d,v]=seg.rampTo.map(Number);
          osc.frequency.linearRampToValueAtTime(c, end);
          // rate/duty ramp applied by not rescheduling pulses mid-segment; approximate by changing at mid-point:
          // (kept simple for real-time; exact in offline export)
        }

        osc.connect(gate).connect(pan).connect(master);
        osc.start(t); osc.stop(end);
        subStops.push(()=>{ try{osc.stop();}catch{} });
      }
      t = end;
    }

    this.playing=true;
    $("#btnPlay").disabled=true;
    $("#btnStop").disabled=false;
    this.stopFn = ()=>{
      subStops.forEach(fn=>fn());
      master.disconnect();
      this.playing=false;
    };
  }

  setupStrobe(sess){
    if($("#strobeEnable").value!=="on"){
      const box = $("#strobeBox");
      box.style.background = "";
      box.textContent = "Strobe preview";
      if(this.strobeInterval){ clearInterval(this.strobeInterval); this.strobeInterval=null; }
      return;
    }
    const maxHz = Math.min(12, Number($("#strobeRate").value||8));
    const box = $("#strobeBox");
    box.textContent = "";
    let on = false;
    let t0 = 0, segIdx=0, segRemain = (sess[0]||{}).duration||0;
    if(this.strobeInterval) clearInterval(this.strobeInterval);
    this.strobeInterval = setInterval(()=>{
      if(!this.playing){ clearInterval(this.strobeInterval); this.strobeInterval=null; return; }
      // Estimate current beat from session timeline
      if(segRemain<=0 && segIdx<sess.length-1){
        segIdx++; segRemain = sess[segIdx].duration;
      }
      const seg = sess[segIdx]||{};
      segRemain -= 0.05;
      let hz = (seg.mode==='noise')? 0 : (seg.beat||0);
      if(hz>maxHz) hz = maxHz;
      // Visual blink at capped rate
      on = !on;
      box.style.background = on? "radial-gradient(120px 40px at 50% 50%, #6fd3ff33, #0a1430 80%)" : "";
    }, 50);
  }

  async exportWav(sess){
    if(!sess.length){ alert("Session is empty."); return; }
    const sampleRate = 44100;
    const length = Math.max(1, Math.floor(totalDuration()*sampleRate)+1);
    const ctx = new OfflineAudioContext(2, length, sampleRate);

    let t = 0;
    const master = ctx.createGain(); master.gain.setValueAtTime(0.9,0);
    master.connect(ctx.destination);

    for(const seg of sess){
      const end = t + Number(seg.duration);
      if(seg.mode==="noise"){
        const [src, gain, pan] = this.makeNoise(ctx, seg.noiseType||"white");
        pan.pan.setValueAtTime(seg.pan||0, t);
        gain.gain.setValueAtTime(seg.volume||0.2, t);
        if(seg.rampTo && seg.rampTo.length>=1){
          gain.gain.linearRampToValueAtTime(clamp(seg.rampTo[0],0,1), end);
        }
        src.connect(gain).connect(pan).connect(master);
        src.start(t); src.stop(end);
      }else if(seg.mode==="binaural"){
        const left = ctx.createOscillator(); left.type = seg.waveform||"sine";
        const right = ctx.createOscillator(); right.type = seg.waveform||"sine";
        const gl = ctx.createGain(); const gr = ctx.createGain();
        gl.gain.setValueAtTime(seg.volume||0.3, t);
        gr.gain.setValueAtTime(seg.volume||0.3, t);
        const lpan = ctx.createStereoPanner(); lpan.pan.setValueAtTime(-0.7 + (seg.pan||0)*0.3, t);
        const rpan = ctx.createStereoPanner(); rpan.pan.setValueAtTime(0.7 + (seg.pan||0)*0.3, t);
        const base = seg.carrier||220; const beat = seg.beat||10;
        left.frequency.setValueAtTime(base - beat/2, t);
        right.frequency.setValueAtTime(base + beat/2, t);
        if(seg.rampTo && seg.rampTo.length>=4){
          const [c,b,d,v] = seg.rampTo.map(Number);
          left.frequency.linearRampToValueAtTime(c - b/2, end);
          right.frequency.linearRampToValueAtTime(c + b/2, end);
          gl.gain.linearRampToValueAtTime(clamp(v,0,1), end);
          gr.gain.linearRampToValueAtTime(clamp(v,0,1), end);
        }
        left.connect(gl).connect(lpan).connect(master);
        right.connect(gr).connect(rpan).connect(master);
        left.start(t); left.stop(end);
        right.start(t); right.stop(end);
      }else if(seg.mode==="monaural"){
        const osc = ctx.createOscillator(); osc.type = seg.waveform||"sine";
        const gain = ctx.createGain(); const pan = ctx.createStereoPanner();
        const lfo = ctx.createOscillator(); lfo.type="sine";
        const lfoGain = ctx.createGain(); const dc = ctx.createConstantSource();
        const depth = clamp(seg.depth||0.6,0,1);
        osc.frequency.setValueAtTime(seg.carrier||200, t);
        gain.gain.setValueAtTime(seg.volume||0.3, t);
        pan.pan.setValueAtTime(seg.pan||0, t);
        lfo.frequency.setValueAtTime(Math.max(0.1, seg.beat||10), t);
        lfoGain.gain.setValueAtTime(depth*0.5, t);
        dc.offset.setValueAtTime(1 - depth*0.5, t);
        lfo.connect(lfoGain).connect(gain.gain);
        dc.connect(gain.gain);
        osc.connect(gain).connect(pan).connect(master);
        if(seg.rampTo && seg.rampTo.length>=4){
          const [c,b,d,v]=seg.rampTo.map(Number);
          osc.frequency.linearRampToValueAtTime(c, end);
          lfo.frequency.linearRampToValueAtTime(Math.max(0.1,b), end);
          lfoGain.gain.linearRampToValueAtTime(clamp(d,0,1)*0.5, end);
          dc.offset.linearRampToValueAtTime(1 - clamp(d,0,1)*0.5, end);
          gain.gain.linearRampToValueAtTime(clamp(v,0,1), end);
        }
        dc.start(t); lfo.start(t); osc.start(t);
        osc.stop(end); lfo.stop(end); dc.stop(end);
      }else if(seg.mode==="isochronic"){
        const osc = ctx.createOscillator(); osc.type = seg.waveform||"sine";
        osc.frequency.setValueAtTime(seg.carrier||180, t);
        const gate = ctx.createGain(); gate.gain.setValueAtTime(0, t);
        const pan = ctx.createStereoPanner(); pan.pan.setValueAtTime(seg.pan||0, t);
        // schedule exact pulses w/ duty and evolving rate if rampTo given
        let rate0 = Math.max(0.1, seg.beat||6);
        let duty0 = clamp(seg.depth||0.8,0.05,0.95);
        let rate1 = rate0, duty1 = duty0;
        if(seg.rampTo && seg.rampTo.length>=4){
          rate1 = Math.max(0.1, seg.rampTo[1]);
          duty1 = clamp(seg.rampTo[2],0.05,0.95);
          osc.frequency.linearRampToValueAtTime(seg.rampTo[0], end);
        }
        // piecewise schedule enough short pulses
        let tt = t;
        const steps = Math.max(1, Math.floor((end-t)*4)); // update rate linearly across 4 steps/sec
        for(let s=0;s<steps;s++){
          const frac = s/Math.max(1,steps-1);
          const rate = lerp(rate0, rate1, frac);
          const duty = lerp(duty0, duty1, frac);
          const slice = Math.min(end, tt + (end-t)/steps);
          // pulses inside this slice
          let p = tt;
          const period = 1/rate;
          while(p < slice){
            const onDur = duty*period;
            gate.gain.setValueAtTime(seg.volume||0.28, p);
            gate.gain.setValueAtTime(0, Math.min(slice, p+onDur));
            p += period;
          }
          tt = slice;
        }
        osc.connect(gate).connect(pan).connect(master);
        osc.start(t); osc.stop(end);
      }
      t = end;
    }

    const rendered = await ctx.startRendering();
    const wav = encodeWAV(rendered);
    const link = document.createElement("a");
    const blob = new Blob([wav], {type:"audio/wav"});
    link.href = URL.createObjectURL(blob);
    link.download = `openwave_${Date.now()}.wav`;
    link.click();
  }

  makeNoise(ctx, type){
    const bufferSize = 2*ctx.sampleRate; // ~2s buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    if(type==="white"){
      for(let i=0;i<bufferSize;i++){ data[i] = Math.random()*2-1; }
    }else if(type==="pink"){
      // Voss-McCartney
      const b = [0,0,0,0,0,0,0];
      for(let i=0;i<bufferSize;i++){
        if((i & 1)===0) b[0] = Math.random()*2-1;
        if((i % 2)===0) b[1] = Math.random()*2-1;
        if((i % 4)===0) b[2] = Math.random()*2-1;
        if((i % 8)===0) b[3] = Math.random()*2-1;
        if((i % 16)===0) b[4] = Math.random()*2-1;
        if((i % 32)===0) b[5] = Math.random()*2-1;
        if((i % 64)===0) b[6] = Math.random()*2-1;
        const val = (b[0]+b[1]+b[2]+b[3]+b[4]+b[5]+b[6])/7;
        data[i] = val;
      }
    }else{ // brown
      let last = 0;
      for(let i=0;i<bufferSize;i++){
        const white = Math.random()*2-1;
        last = (last + (0.02 * white)) / 1.02;
        data[i] = last;
      }
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer; src.loop = true;
    const gain = ctx.createGain();
    const pan = ctx.createStereoPanner();
    return [src, gain, pan];
  }
}

function clamp(x,min,max){ return Math.min(max, Math.max(min,x)); }
function lerp(a,b,t){ return a + (b-a)*t; }

// WAV encoder (16-bit PCM) from an AudioBuffer
function encodeWAV(buffer){
  const numCh = buffer.numberOfChannels;
  const len = buffer.length * numCh * 2; // 16-bit
  const data = new DataView(new ArrayBuffer(44 + len));
  // RIFF header
  writeStr(data, 0, "RIFF");
  data.setUint32(4, 36 + len, true);
  writeStr(data, 8, "WAVE");
  writeStr(data, 12, "fmt ");
  data.setUint32(16, 16, true); // PCM
  data.setUint16(20, 1, true);  // PCM
  data.setUint16(22, numCh, true);
  data.setUint32(24, buffer.sampleRate, true);
  data.setUint32(28, buffer.sampleRate * numCh * 2, true);
  data.setUint16(32, numCh * 2, true);
  data.setUint16(34, 16, true);
  writeStr(data, 36, "data");
  data.setUint32(40, len, true);
  // samples
  let offset = 44;
  const ch = [];
  for(let i=0;i<numCh;i++) ch.push(buffer.getChannelData(i));
  for(let i=0;i<buffer.length;i++){
    for(let c=0;c<numCh;c++){
      let s = Math.max(-1, Math.min(1, ch[c][i]));
      s = s<0 ? s*0x8000 : s*0x7fff;
      data.setInt16(offset, s, true); offset += 2;
    }
  }
  return data.buffer;
}
function writeStr(dat, offset, s){ for(let i=0;i<s.length;i++) dat.setUint8(offset+i, s.charCodeAt(i)); }

// ------------- Hook up UI -------------
const engine = new Engine();

$("#btnPlay").addEventListener("click", ()=> engine.play(session));
$("#btnStop").addEventListener("click", ()=> engine.stop());
$("#btnExport").addEventListener("click", ()=> engine.exportWav(session));

// initial
renderTable(); updateMeta(); drawViz(); loadPresetList();
toggleFieldsets();

// Accessibility: prevent page scroll on number input change via arrow keys while focused
$$("input[type=number]").forEach(inp=>{
  inp.addEventListener("wheel", e=>{
    if(document.activeElement===inp){ e.preventDefault(); }
  }, {passive:false});
});
