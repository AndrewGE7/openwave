
// OpenWave Preset Notes Plugin — injects notes panel under the preset selector (MIT)
(function(){'use strict';
  const NOTES = {"Resilience \u2014 Ground & Calm (Alpha\u2192Theta 20m)":"General Wellness \u00b7 ~20 min. Use anytime for gentle mood/attention support. Keep volume modest.","Resilience \u2014 Focus Shield (SMR\u2192Low Beta 25m)":"Work / Focus \u00b7 ~25 min. Use during focused tasks at moderate volume. Consider Pomodoro cycles (focus/break).","Resilience \u2014 Calm Alert (Mid\u2011Alpha 15m)":"General Wellness \u00b7 ~15 min. Use anytime for gentle mood/attention support. Keep volume modest.","Resilience \u2014 Sleep Restore (Alpha\u2192Delta 45m)":"Night / Sleep \u00b7 ~45 min. Use in a dark, quiet room. Keep volume low and avoid strobe. You can let it run while drifting off.","Resilience \u2014 Breath Coherence Coach (0.1\u202fHz Pacer 12m)":"Breath / HRV \u00b7 ~12 min. Breathe 5\u20136 breaths/min. Sit comfortably, eyes open or closed, no strobe.","Resilience \u2014 7.8\u202fHz Relaxer (30m)":"Relaxation \u00b7 ~30 min. Use for gentle unwinding or nature\u2011walk pacing. Low volume works best.","Resilience \u2014 Noise Mask: Pink 40m":"Masking \u00b7 ~40 min. Pick a comfortable noise floor that masks without overwhelming. Long durations are okay.","Resilience \u2014 Noise Mask: Brown 60m":"Masking \u00b7 ~60 min. Pick a comfortable noise floor that masks without overwhelming. Long durations are okay.","Resilience \u2014 Brain\u2011Fog Reset (Theta\u2192Alpha 10m)":"General Wellness \u00b7 ~10 min. Use anytime for gentle mood/attention support. Keep volume modest.","Resilience \u2014 Jetlag Smoother (Alpha\u2192SMR 30m)":"General Wellness \u00b7 ~30 min. Use anytime for gentle mood/attention support. Keep volume modest.","Resilience \u2014 Focus Sprint (15\u219218\u202fHz 10m)":"Work / Focus \u00b7 ~6 min. Use during focused tasks at moderate volume. Consider Pomodoro cycles (focus/break).","Resilience \u2014 Gentle Wake (8\u219212\u202fHz 15m)":"General Wellness \u00b7 ~15 min. Use anytime for gentle mood/attention support. Keep volume modest.","Protocol \u2014 Work Shift Cycle (90m)":"Work / Focus \u00b7 ~60 min. Use during focused tasks at moderate volume. Consider Pomodoro cycles (focus/break).","Protocol \u2014 Commute RF Mask (40m)":"Travel / Transit \u00b7 ~22 min. Use with safe listening volume; be aware of your surroundings. Pink noise helps mask ambient sound.","Protocol \u2014 Post-Exposure Downshift (30m)":"Recovery / Wind\u2011down \u00b7 ~25 min. Use after intense environments to ease down. Dim lights, slow breathing.","Protocol \u2014 Sleep Entry Low\u2011EMF (60m)":"Night / Sleep \u00b7 ~45 min. Use in a dark, quiet room. Keep volume low and avoid strobe. You can let it run while drifting off.","Protocol \u2014 Night Tinnitus Mask (120m)":"Night / Sleep \u00b7 ~120 min. Use in a dark, quiet room. Keep volume low and avoid strobe. You can let it run while drifting off.","Protocol \u2014 Breath Coherence (0.1 Hz, 10m)":"Breath / HRV \u00b7 ~10 min. Breathe 5\u20136 breaths/min. Sit comfortably, eyes open or closed, no strobe.","Protocol \u2014 Focus in Shielded Room (SMR 50m)":"Work / Focus \u00b7 ~20 min. Use during focused tasks at moderate volume. Consider Pomodoro cycles (focus/break).","Protocol \u2014 Tension Ease (Gentle 20m)":"General Wellness \u00b7 ~20 min. Use anytime for gentle mood/attention support. Keep volume modest.","Protocol \u2014 Airport/Transit Mask (45m)":"Travel / Transit \u00b7 ~35 min. Use with safe listening volume; be aware of your surroundings. Pink noise helps mask ambient sound.","Protocol \u2014 Deep Restore (90m)":"Night / Sleep \u00b7 ~90 min. Use in a dark, quiet room. Keep volume low and avoid strobe. You can let it run while drifting off.","Protocol \u2014 7.83 Hz Center (30m)":"Relaxation \u00b7 ~30 min. Use for gentle unwinding or nature\u2011walk pacing. Low volume works best.","Protocol \u2014 Pomodoro Focus (25m)":"Work / Focus \u00b7 ~20 min. Use during focused tasks at moderate volume. Consider Pomodoro cycles (focus/break).","Protocol \u2014 Pomodoro Break (5m)":"Work / Focus \u00b7 ~5 min. Use during focused tasks at moderate volume. Consider Pomodoro cycles (focus/break).","Protocol \u2014 Survey Mode Mask (30m)":"Masking \u00b7 ~30 min. Pick a comfortable noise floor that masks without overwhelming. Long durations are okay."};
  function ensurePanel(){
    const anchor = document.querySelector('#presetSelect');
    if(!anchor) return;
    let panel = document.getElementById('ow-notes-panel');
    if(!panel){
      panel = document.createElement('div');
      panel.id = 'ow-notes-panel';
      panel.style.marginTop = '8px';
      panel.style.padding = '10px';
      panel.style.border = '1px solid #244060';
      panel.style.borderRadius = '12px';
      panel.style.background = '#0b1420';
      panel.style.color = '#9fb3d1';
      anchor.parentElement.parentElement.appendChild(panel);
    }
    updatePanel();
  }
  function updatePanel(){
    const sel = document.querySelector('#presetSelect');
    if(!sel) return;
    const name = sel.value;
    const msg = NOTES[name] || 'No notes available for this preset.';
    const panel = document.getElementById('ow-notes-panel');
    if(panel) panel.textContent = msg;
  }
  function hook(){
    const sel = document.querySelector('#presetSelect');
    if(!sel) return;
    sel.addEventListener('change', updatePanel);
    ensurePanel();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', hook); else hook();
  // If OpenWave reloads the list dynamically:
  window.addEventListener('focus', ()=>setTimeout(updatePanel, 200));
})();
