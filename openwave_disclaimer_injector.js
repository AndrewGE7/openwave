
// OpenWave Disclaimer Injector v2 — dismissible + localized (MIT)
(function(){'use strict';
  const I18N = {"en":{"bar":"OpenWave is a comfort/relaxation tool, not a medical device. No health claims.","details":"Details","dismiss":"Dismiss","dontShowAgain":"Don\u2019t show again","title":"Disclaimer","full":"OpenWave and its associated presets are provided for general comfort, relaxation, and focus support.\n\nThey are NOT medical devices and are NOT intended to diagnose, treat, cure, or prevent any disease.\n\nThe creators and contributors make no claims of medical or health efficacy. Use is at your own discretion. If you have medical concerns, consult a qualified health professional.\n\nOpenWave is an independent project and is not affiliated with or endorsed by Brainwave Generator, Noromaa Solutions, or any other third party.","language":"Language"},"es":{"bar":"OpenWave es una herramienta de confort/relajaci\u00f3n, no un dispositivo m\u00e9dico. No se hacen reclamos de salud.","details":"Detalles","dismiss":"Cerrar","dontShowAgain":"No mostrar de nuevo","title":"Descargo de responsabilidad","full":"OpenWave y sus presets asociados se proporcionan para confort general, relajaci\u00f3n y apoyo a la concentraci\u00f3n.\n\nNO son dispositivos m\u00e9dicos y NO est\u00e1n destinados a diagnosticar, tratar, curar o prevenir ninguna enfermedad.\n\nLos creadores y colaboradores no hacen reclamos de eficacia m\u00e9dica o de salud. \u00daselo a su discreci\u00f3n. Si tiene preocupaciones m\u00e9dicas, consulte a un profesional de la salud calificado.\n\nOpenWave es un proyecto independiente y no est\u00e1 afiliado ni respaldado por Brainwave Generator, Noromaa Solutions u otro tercero.","language":"Idioma"}};
  const LS_KEY_DISMISS = 'openwave_disc_dismissed';
  const LS_KEY_LANG = 'openwave_lang';

  function getLang(){ 
    const saved = localStorage.getItem(LS_KEY_LANG);
    if(saved && I18N[saved]) return saved;
    const nav = (navigator.language||'en').slice(0,2).toLowerCase();
    return I18N[nav] ? nav : 'en';
  }
  function t(key){
    const lang = getLang();
    return (I18N[lang] && I18N[lang][key]) || (I18N.en && I18N.en[key]) || key;
  }

  function mount(){
    if(localStorage.getItem(LS_KEY_DISMISS)==='1') return; // permanently dismissed

    // footer bar
    const bar = document.createElement('div');
    bar.id='ow-disc-bar';
    bar.style.position='fixed'; bar.style.left='0'; bar.style.right='0'; bar.style.bottom='0';
    bar.style.background='rgba(10,20,48,0.95)'; bar.style.borderTop='1px solid #244060';
    bar.style.color='var(--muted)'; bar.style.padding='8px 12px'; bar.style.font='12px/1.3 system-ui';
    bar.style.zIndex='99996'; bar.style.display='flex'; bar.style.flexWrap='wrap'; bar.style.gap='8px'; bar.style.alignItems='center';

    const msg = document.createElement('span'); msg.textContent = t('bar');

    const link = document.createElement('a');
    link.href='#'; link.textContent=t('details');
    link.style.color='#8ecbff'; link.onclick = (e)=>{ e.preventDefault(); showModal(); };

    const space = document.createElement('span'); space.style.flex='1';

    const cbLabel = document.createElement('label'); cbLabel.style.display='flex'; cbLabel.style.alignItems='center'; cbLabel.style.gap='6px';
    const cb = document.createElement('input'); cb.type='checkbox'; cb.id='ow-disc-dont-show';
    const cbTxt = document.createElement('span'); cbTxt.textContent = t('dontShowAgain');
    cbLabel.appendChild(cb); cbLabel.appendChild(cbTxt);

    const btn = document.createElement('button');
    btn.className='btn'; btn.textContent=t('dismiss');
    btn.style.padding='6px 10px'; btn.onclick = ()=>{ if(cb.checked) localStorage.setItem(LS_KEY_DISMISS,'1'); bar.remove(); };

    const langSel = document.createElement('select');
    langSel.style.background='#0a1430'; langSel.style.color='var(--ink)'; langSel.style.border='1px solid #2b4a86'; langSel.style.borderRadius='8px';
    for(const code of Object.keys(I18N)){ const o=document.createElement('option'); o.value=code; o.textContent=code.toUpperCase(); langSel.appendChild(o); }
    langSel.value = getLang();
    const langLbl = document.createElement('span'); langLbl.textContent = t('language')+': ';
    const langWrap = document.createElement('span'); langWrap.style.display='flex'; langWrap.style.alignItems='center'; langWrap.style.gap='6px';
    langWrap.appendChild(langLbl); langWrap.appendChild(langSel);
    langSel.onchange = ()=>{ localStorage.setItem(LS_KEY_LANG, langSel.value); // redraw text
      msg.textContent = t('bar'); cbTxt.textContent = t('dontShowAgain'); btn.textContent = t('dismiss');
    };

    bar.appendChild(msg);
    bar.appendChild(link);
    bar.appendChild(space);
    bar.appendChild(langWrap);
    bar.appendChild(cbLabel);
    bar.appendChild(btn);
    document.body.appendChild(bar);
  }

  function showModal(){
    const overlay = document.createElement('div');
    overlay.style.position='fixed'; overlay.style.inset='0'; overlay.style.background='#0009';
    overlay.style.display='flex'; overlay.style.alignItems='center'; overlay.style.justifyContent='center';
    overlay.style.zIndex='99997';
    const card = document.createElement('div');
    card.style.width='min(720px,92vw)'; card.style.background='#0b1420'; card.style.border='1px solid #244060';
    card.style.borderRadius='16px'; card.style.padding='16px'; card.style.color='#eaf2ff';
    const h = document.createElement('div'); h.textContent=t('title'); h.style.font='700 18px system-ui';
    const p = document.createElement('pre'); p.textContent = t('full'); p.style.whiteSpace='pre-wrap'; p.style.color='#cfe3ff';
    const close = document.createElement('button'); close.textContent=t('dismiss'); close.className='btn'; close.style.marginTop='10px'; close.onclick = ()=> overlay.remove();
    card.appendChild(h); card.appendChild(p); card.appendChild(close);
    overlay.appendChild(card); document.body.appendChild(overlay);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
