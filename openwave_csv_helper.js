
// OpenWave CSV Helper — adds buttons for template download & CSV import (MIT)
(function(){
  function ui(){
    const sec = document.querySelector('main .card');
    if(!sec) return;
    const wrap = document.createElement('div');
    wrap.style.marginTop='10px';
    wrap.innerHTML = `
      <div style="display:flex;gap:10px;align-items:center">
        <a id="owCsvDl" class="btn" style="text-decoration:none;display:inline-block;padding:8px 10px;border:1px solid #35508d;background:#0b1a3a;border-radius:10px">Download CSV Template</a>
        <input id="owCsvFile" type="file" accept=".csv" style="background:#0a1430;color:#eaf2ff;border:1px solid #2b4a86;border-radius:10px;padding:8px 10px">
        <button id="owCsvImport" class="btn" style="padding:8px 10px;border:1px solid #35508d;background:#0b1a3a;border-radius:10px">Import CSV as Preset</button>
      </div>`;
    sec.appendChild(wrap);
    // template link
    const link = document.getElementById('owCsvDl');
    const template = `index,mode,duration,carrier,beat,waveform,depth,pan,volume,noiseType,rampTo\n0,binaural,600,220,10,sine,0.6,0,0.34,,220|12|0.65|0.36\n1,noise,300,,,,,,0.22,pink,0.2\n`;
    const blob = new Blob([template], {type:'text/csv'});
    link.href = URL.createObjectURL(blob);
    link.download = 'openwave_preset_template.csv';
    // import
    document.getElementById('owCsvImport').onclick = ()=>{
      const f = document.getElementById('owCsvFile').files[0];
      if(!f) return alert('Choose a CSV file first');
      const reader = new FileReader();
      reader.onload = ()=>{
        try{
          const lines = reader.result.split(/\r?\n/).filter(Boolean);
          const header = lines.shift();
          const idx = {}; header.split(',').forEach((h,i)=>idx[h.trim()] = i);
          const segs = lines.map((line)=>{
            const cols = line.split(',');
            const obj = {
              mode: cols[idx.mode] || 'binaural',
              duration: Number(cols[idx.duration]||60),
              carrier: Number(cols[idx.carrier]||220),
              beat: Number(cols[idx.beat]||10),
              waveform: cols[idx.waveform] || 'sine',
              depth: Number(cols[idx.depth]||0.6),
              pan: Number(cols[idx.pan]||0),
              volume: Number(cols[idx.volume]||0.34)
            };
            if(cols[idx.noiseType]){ obj.mode='noise'; obj.noiseType = cols[idx.noiseType]; }
            const rt = (cols[idx.rampTo]||'').trim();
            if(rt) obj.rampTo = rt.split('|').map(Number).filter(v=>!Number.isNaN(v));
            return obj;
          });
          const name = prompt('Name for this CSV preset:', 'CSV Imported Preset');
          if(!name) return;
          const key = 'openwave_presets';
          const all = JSON.parse(localStorage.getItem(key) || '{}');
          all[name] = segs;
          localStorage.setItem(key, JSON.stringify(all));
          if(typeof loadPresetList === 'function') loadPresetList();
          alert('Imported CSV as preset: '+name);
        }catch(e){ alert('Import failed: '+e.message); }
      };
      reader.readAsText(f);
    };
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', ui); else ui();
})();
