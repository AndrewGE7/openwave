
// OpenWave Preset Descriptions Enhancer — adds short descriptions to dropdown + tooltips (MIT)
(function(){'use strict';
  const DESCS = {"Resilience \u2014 Ground & Calm (Alpha\u2192Theta 20m)":"General \u2022 ~20m \u2022 Binaural/Monaural/Noise","Resilience \u2014 Focus Shield (SMR\u2192Low Beta 25m)":"Focus / Work \u2022 ~25m \u2022 Binaural/Monaural/Noise","Resilience \u2014 Calm Alert (Mid\u2011Alpha 15m)":"General \u2022 ~15m \u2022 Monaural/Noise","Resilience \u2014 Sleep Restore (Alpha\u2192Delta 45m)":"Sleep / Night \u2022 ~45m \u2022 Isochronic/Noise","Resilience \u2014 Breath Coherence Coach (0.1\u202fHz Pacer 12m)":"Breath / HRV \u2022 ~12m \u2022 Isochronic/Noise","Resilience \u2014 7.8\u202fHz Relaxer (30m)":"Relax / Balance \u2022 ~30m \u2022 Binaural/Noise","Resilience \u2014 Noise Mask: Pink 40m":"Masking \u2022 ~40m \u2022 Noise","Resilience \u2014 Noise Mask: Brown 60m":"Masking \u2022 ~60m \u2022 Noise","Resilience \u2014 Brain\u2011Fog Reset (Theta\u2192Alpha 10m)":"General \u2022 ~10m \u2022 Isochronic/Monaural","Resilience \u2014 Jetlag Smoother (Alpha\u2192SMR 30m)":"General \u2022 ~30m \u2022 Binaural/Monaural/Noise","Resilience \u2014 Focus Sprint (15\u219218\u202fHz 10m)":"Focus / Work \u2022 ~6m \u2022 Monaural/Noise","Resilience \u2014 Gentle Wake (8\u219212\u202fHz 15m)":"General \u2022 ~15m \u2022 Binaural/Noise","Protocol \u2014 Work Shift Cycle (90m)":"Focus / Work \u2022 ~60m \u2022 Binaural/Monaural/Noise","Protocol \u2014 Commute RF Mask (40m)":"Transit / Masking \u2022 ~22m \u2022 Binaural/Noise","Protocol \u2014 Post-Exposure Downshift (30m)":"Wind-down / Recovery \u2022 ~25m \u2022 Isochronic/Monaural/Noise","Protocol \u2014 Sleep Entry Low\u2011EMF (60m)":"Sleep / Night \u2022 ~45m \u2022 Isochronic/Noise","Protocol \u2014 Night Tinnitus Mask (120m)":"Sleep / Night \u2022 ~120m \u2022 Noise","Protocol \u2014 Breath Coherence (0.1 Hz, 10m)":"Breath / HRV \u2022 ~10m \u2022 Isochronic","Protocol \u2014 Focus in Shielded Room (SMR 50m)":"Focus / Work \u2022 ~20m \u2022 Binaural/Noise","Protocol \u2014 Tension Ease (Gentle 20m)":"General \u2022 ~20m \u2022 Monaural/Noise","Protocol \u2014 Airport/Transit Mask (45m)":"Transit / Masking \u2022 ~35m \u2022 Binaural/Noise","Protocol \u2014 Deep Restore (90m)":"Sleep / Night \u2022 ~90m \u2022 Isochronic/Noise","Protocol \u2014 7.83 Hz Center (30m)":"Relax / Balance \u2022 ~30m \u2022 Binaural/Noise","Protocol \u2014 Pomodoro Focus (25m)":"Focus / Work \u2022 ~20m \u2022 Monaural","Protocol \u2014 Pomodoro Break (5m)":"Focus / Work \u2022 ~5m \u2022 Binaural/Noise","Protocol \u2014 Survey Mode Mask (30m)":"Masking \u2022 ~30m \u2022 Noise"};
  function apply(){
    const sel = document.getElementById('presetSelect');
    if(!sel) return;
    Array.from(sel.options).forEach(opt=>{
      const name = opt.value;
      const d = DESCS[name];
      if(!d) return;
      // Tooltip
      opt.title = d;
      // Label augmentation (non-destructive; preserve original once)
      if(!opt.dataset.orig){
        opt.dataset.orig = opt.textContent;
      }
      const base = opt.dataset.orig;
      // Keep it readable: show a bullet + concise 1-liner
      opt.textContent = base + ' — ' + d;
    });
  }
  function hook(){
    apply();
    const sel = document.getElementById('presetSelect');
    if(sel) sel.addEventListener('change', apply);
    // re-apply after preset list reloads
    if(typeof window.loadPresetList === 'function'){
      const orig = window.loadPresetList;
      window.loadPresetList = function(){ orig(); setTimeout(apply, 50); };
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', hook); else hook();
})();
