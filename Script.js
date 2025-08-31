// ========== Helpers ==========
const $  = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

const src   = $('#src'),
      list  = $('#list'),
      countEl = $('#count'),
      filterEl = $('#filter'),
      optK = $('#optKashida'),
      optT = $('#optTashkeel'),
      optD1 = $('#optDecor1'),
      optD2 = $('#optDecor2'),
      loadingIndicator = $('#loadingIndicator'),
      scrollTopBtn = $('#scrollTop'),
      toast = $('#toast');

// ======== أنماط متاحة ========
const STYLES = [
  {id:'plain',    name:'عادي (بدون تغيير)', fn:(t)=>t, category: 'all'},
  {id:'bold',     name:'سميك Bold',          fn:(t)=>mapByOffset(t,0x1D400,0x1D41A,0x1D7CE), category: 'latin'},
  {id:'italic',   name:'مائل Italic',        fn:(t)=>mapByOffset(t,0x1D434,0x1D44E,null), category: 'latin'},
  {id:'boldit',   name:'سميك مائل',          fn:(t)=>mapByOffset(t,0x1D468,0x1D482,null), category: 'latin'},
  {id:'sansb',    name:'Sans عريض',          fn:(t)=>mapByOffset(t,0x1D5D4,0x1D5EE,0x1D7EC), category: 'latin'},
  {id:'mono',     name:'Monospace',          fn:(t)=>mapByOffset(t,0x1D670,0x1D68A,0x1D7F6), category: 'latin'},
  {id:'script',   name:'Script مزخرف',       fn:mapScript, category: 'latin'},
  {id:'frak',     name:'Fraktur',            fn:mapFraktur, category: 'latin'},
  {id:'ds',       name:'Double-Struck',      fn:mapDouble, category: 'latin'},
  {id:'circ',     name:'حروف داخل دوائر',    fn:mapCircled, category: 'decorative'},
  {id:'sup',      name:'Superscript',        fn:mapSup, category: 'decorative'},
  {id:'sc',       name:'Small-Caps',         fn:mapSmallCaps, category: 'latin'},
  {id:'flip',     name:'مقلوب',             fn:mapUpside, category: 'decorative'},
  // Arabic
  {id:'kashida',  name:'عربي — تطويل',      fn:applyKashida, category: 'arabic'},
  {id:'tashkeel', name:'عربي — تشكيل',      fn:applyTashkeelLight, category: 'arabic'},
];

// ========== وظائف مساعدة ==========
function showToast(msg,type='success'){
  toast.textContent = msg;
  toast.className = `toast ${type} visible`;
  setTimeout(()=> toast.classList.remove('visible'),2000);
}

function copyText(txt){
  if(navigator.clipboard){
    navigator.clipboard.writeText(txt);
    return true;
  } else {
    const ta=document.createElement('textarea');
    ta.value=txt; document.body.appendChild(ta);
    ta.select(); document.execCommand('copy'); ta.remove();
    return true;
  }
}

function showLoading(show){
  loadingIndicator.classList.toggle('visible', show);
}

// Debounce
function debounce(fn,delay){
  let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args),delay); }
}

// ========== Conversion Functions ==========
function mapByOffset(t, offA, offa, off0){
  const LAT_A=65,LAT_Z=90,lat_a=97,lat_z=122,D0=48,D9=57;
  const out=[];
  for(const ch of t){
    const c=ch.codePointAt(0);
    if(c>=LAT_A&&c<=LAT_Z&&offA) out.push(String.fromCodePoint(offA+(c-LAT_A)));
    else if(c>=lat_a&&c<=lat_z&&offa) out.push(String.fromCodePoint(offa+(c-lat_a)));
    else if(c>=D0&&c<=D9&&off0) out.push(String.fromCodePoint(off0+(c-D0)));
    else out.push(ch);
  }
  return out.join('');
}

function mapScript(t){
  let s=mapByOffset(t,0x1D49C,0x1D4B6,null);
  return s;
}
function mapFraktur(t){ return mapByOffset(t,0x1D504,0x1D51E,null); }
function mapDouble(t){ return mapByOffset(t,0x1D538,0x1D552,0x1D7D8); }
function mapCircled(t){
  const LAT_A=65,LAT_Z=90,lat_a=97,lat_z=122,D0=48;
  const out=[];
  for(const ch of t){
    const c=ch.codePointAt(0);
    if(c>=LAT_A&&c<=LAT_Z) out.push(String.fromCodePoint(0x24B6+(c-LAT_A)));
    else if(c>=lat_a&&c<=lat_z) out.push(String.fromCodePoint(0x24D0+(c-lat_a)));
    else if(!isNaN(ch)) out.push(String.fromCodePoint(0x2460+parseInt(ch)-1));
    else out.push(ch);
  }
  return out.join('');
}
function mapSup(t){
  const sup={'1':'¹','2':'²','3':'³','0':'⁰'};
  return [...t].map(ch=>sup[ch]||ch).join('');
}
function mapSmallCaps(t){
  const map={'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'s','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
  return [...t].map(ch=>map[ch.toLowerCase()]||ch).join('');
}
function mapUpside(t){
  return [...t].reverse().join('');
}

// Arabic Helpers
function applyKashida(t){
  return t.replace(/([اأإآبتثجحخسشصضطظعغفقكلمنهىي])/g,'$1ـ');
}
function applyTashkeelLight(t){
  const T=['َ','ُ','ِ','ً','ٌ','ٍ']; let i=0;
  return [...t].map(ch=>(/[ء-ي]/.test(ch)?ch+T[i++%T.length]:ch)).join('');
}

// ========== Rendering ==========
function makeItem(style,value){
  const div=document.createElement('div');
  div.className='item';
  div.dataset.category=style.category;
  div.innerHTML=`
    <div class="head">
      <div class="name">${style.name}</div>
      <button class="btn btn-copy">نسخ</button>
    </div>
    <div class="out">${value||'—'}</div>
  `;
  const btn=div.querySelector('.btn-copy');
  btn.onclick=()=>{ if(copyText(value)){showToast('تم النسخ ✅');} };
  return div;
}

function genAll(){
  showLoading(true);
  const txt=src.value||'';
  const filter=(filterEl.value||'').toLowerCase();
  const res=[];
  for(const s of STYLES){
    let v=s.fn(txt);
    if(optK.checked && s.id==='kashida') v=applyKashida(txt);
    if(optT.checked && s.id==='tashkeel') v=applyTashkeelLight(txt);
    if(optD1.checked) v='•✧• '+v+' •✧•';
    if(optD2.checked) v='⌯⟡⌯ '+v+' ⌯⟡⌯';
    if(filter && !s.name.toLowerCase().includes(filter)) continue;
    res.push({style:s,text:v});
  }
  list.innerHTML='';
  res.forEach(r=>list.appendChild(makeItem(r.style,r.text)));
  countEl.textContent=res.length+' نتيجة';
  showLoading(false);
}

// ========== Events ==========
function initEvents(){
  const debounced=debounce(genAll,200);
  src.addEventListener('input',debounced);
  filterEl.addEventListener('input',debounced);
  optK.addEventListener('change',debounced);
  optT.addEventListener('change',debounced);
  optD1.addEventListener('change',debounced);
  optD2.addEventListener('change',debounced);

  $('#btnCopyAll').onclick=()=>{
    const texts=[...list.querySelectorAll('.out')].map(d=>d.textContent).join('\n');
    copyText(texts)&&showToast('تم نسخ الكل ✅');
  };
  $('#btnClear').onclick=()=>{src.value='';genAll();};
  $('#btnSample').onclick=()=>{src.value='نص تجريبي Test';genAll();};

  $$('.filter-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      $$('.filter-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const f=btn.dataset.filter;
      $$('.item').forEach(it=>{
        it.style.display=(f==='all'||it.dataset.category===f)?'block':'none';
      });
    });
  });

  scrollTopBtn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  window.addEventListener('scroll',()=>{scrollTopBtn.classList.toggle('visible',window.pageYOffset>300);});
}

// ========== Init ==========
document.addEventListener('DOMContentLoaded',()=>{
  initEvents();
  genAll();
});
