
// OpenWave Theme Switcher — drop-in (MIT)
(function(){
  function addSwitcher(){
    const head = document.querySelector('head');
    if(!head) return;
    let link = document.getElementById('ow-theme-link');
    if(!link){
      link = document.createElement('link');
      link.id = 'ow-theme-link';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    let box = document.getElementById('ow-theme-box');
    if(!box){
      box = document.createElement('div');
      box.id = 'ow-theme-box';
      box.style.position='fixed'; box.style.right='18px'; box.style.top='18px';
      box.style.background='var(--panel)'; box.style.border='1px solid #244060'; box.style.borderRadius='12px';
      box.style.padding='6px 8px'; box.style.zIndex='99997'; box.style.color='var(--ink)';
      box.style.font='600 12px/1 system-ui';
      box.innerHTML = '<span style="margin-right:6px;color:var(--muted)">Theme</span>';
      const sel = document.createElement('select');
      sel.style.background='#0a1430'; sel.style.color='var(--ink)'; sel.style.border='1px solid #2b4a86'; sel.style.borderRadius='8px';
      ['midnight','ocean','sunset','forest'].forEach(n=>{
        const o=document.createElement('option'); o.value=n; o.textContent=n; sel.appendChild(o);
      });
      const current = localStorage.getItem('openwave_theme') || 'midnight';
      sel.value = current;
      link.href = current + '.css';
      sel.onchange = ()=>{ localStorage.setItem('openwave_theme', sel.value); link.href = sel.value + '.css'; };
      box.appendChild(sel);
      document.body.appendChild(box);
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', addSwitcher); else addSwitcher();
})();
