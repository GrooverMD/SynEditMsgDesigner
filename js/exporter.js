/*
================================================================================
  SynGen .msg Designer  |  js/exporter.js
  Copyright (c) 2026 Mark Stephen Day. All Rights Reserved.
  PROPRIETARY AND CONFIDENTIAL — unauthorised copying strictly prohibited.
================================================================================
*/
'use strict'

/* ── Preview modal, clipboard, download & toast ──────────────────────────── */

function colourMsg(text){
  return text.split('\n').map(line=>{
    if(line==='|><|') return `<span class="t-delim">${esc(line)}</span>`
    if(/^(TOKENTYPES|KEYS |CHARS|ENCLOSEDBY|SAMPLESOURCE|IdentStart)/.test(line)) return `<span class="t-kw">${esc(line)}</span>`
    if(/^\s/.test(line)&&line.trim()) return `<span class="t-body">${esc(line)}</span>`
    if(/^(BeginProc|EndProc)/.test(line)) return `<span class="t-body">${esc(line)}</span>`
    return `<span class="t-val">${esc(line)}</span>`
  }).join('\n')
}

// Store generated text at module scope so buttons can access it
let _previewText = ''

function showPreview(){
  if(!LANE_CFG.some(l=>doc[l.id].length>0)){alert('Add some sections first.');return}
  _previewText=generateMsg()
  const app=document.getElementById('app')
  app.style.position='relative'
  const bg=document.createElement('div')
  bg.className='modal-wrap'
  bg.innerHTML=`<div class="modal">
    <div class="modal-hd">
      <h3>Generated .msg output</h3>
      <span class="modal-cl" onclick="this.closest('.modal-wrap').remove()"><i class="ti ti-x"></i></span>
    </div>
    <div class="modal-body">
      <pre class="msg-pre" id="msg-pre-out">${colourMsg(_previewText)}</pre>
      <div class="modal-btns">
        <button class="tbtn" id="btn-copy" onclick="doCopy()"><i class="ti ti-copy"></i>Copy to clipboard</button>
        <button class="tbtn" id="btn-dl"   onclick="doDownload()"><i class="ti ti-download"></i>Save .msg file</button>
      </div>
    </div>
  </div>`
  bg.addEventListener('click',e=>{if(e.target===bg)bg.remove()})
  app.appendChild(bg)
}

function doCopy(){
  const btn=document.getElementById('btn-copy')
  // Use modern clipboard API; fall back to execCommand
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(_previewText).then(()=>{
      btn.innerHTML='<i class="ti ti-check"></i> Copied!'
      setTimeout(()=>{btn.innerHTML='<i class="ti ti-copy"></i> Copy to clipboard'},2000)
    }).catch(()=>copyFallback(btn))
  } else {
    copyFallback(btn)
  }
}

function copyFallback(btn){
  const ta=document.createElement('textarea')
  ta.value=_previewText
  ta.style.cssText='position:fixed;top:-9999px;left:-9999px'
  document.body.appendChild(ta)
  ta.select()
  try{
    document.execCommand('copy')
    if(btn){btn.innerHTML='<i class="ti ti-check"></i> Copied!';setTimeout(()=>{btn.innerHTML='<i class="ti ti-copy"></i> Copy to clipboard'},2000)}
  }catch(e){alert('Copy failed — please select the text manually.')}
  document.body.removeChild(ta)
}

function doDownload(){
  const hdr=doc.header[0]
  const core=hdr?buildClassName(hdr.classCore||'Custom').core:'Highlighter'
  const filename=core+'.msg'
  try{
    const blob=new Blob([_previewText],{type:'text/plain;charset=utf-8'})
    const url=URL.createObjectURL(blob)
    const a=document.createElement('a')
    a.href=url; a.download=filename; a.style.display='none'
    document.body.appendChild(a)
    a.click()
    setTimeout(()=>{URL.revokeObjectURL(url);document.body.removeChild(a)},1000)
  }catch(e){
    alert('Download not supported in this browser. Use Copy to clipboard instead.')
  }
}

/* ════════════════════════════════════════════════════════════════════════════
   VALIDATE — collects errors per lane, highlights problem lanes & cards
   ════════════════════════════════════════════════════════════════════════════ */

// laneErrors: { laneId: [ {msg, cardId?} ] }
function showToast(msg, isErr=false) {
  let t = document.getElementById('syngen-toast')
  if (!t) { t = document.createElement('div'); t.id = 'syngen-toast'; document.body.appendChild(t) }
  t.textContent = msg
  t.style.cssText = [
    'position:fixed', 'bottom:24px', 'left:50%',
    'transform:translateX(-50%) translateY(20px)',
    'background:' + (isErr ? 'var(--d-bg)' : 'var(--s1)'),
    'color:'       + (isErr ? 'var(--d)'    : 'var(--t0)'),
    'border:1px solid ' + (isErr ? 'var(--d)' : 'var(--s5)'),
    'border-radius:var(--r2)', 'padding:10px 22px',
    'font-size:12px', 'font-family:var(--sans)', 'z-index:999',
    'box-shadow:0 8px 32px rgba(0,0,0,.5)',
    'opacity:0', 'transition:all .3s', 'white-space:nowrap',
    'max-width:90vw', 'text-align:center',
  ].join(';')
  requestAnimationFrame(() => {
    t.style.opacity    = '1'
    t.style.transform  = 'translateX(-50%) translateY(0)'
    setTimeout(() => {
      t.style.opacity   = '0'
      t.style.transform = 'translateX(-50%) translateY(20px)'
    }, 3800)
  })
}



/* ════════════════════════════════════════════════════════════════════════════
   .MSG FILE ROUND-TRIP LOADER
   Opens a .msg file previously saved by SynGen and restores the full
   document state — all lanes and cards — so editing can continue.

   The .msg format (as generated by generateMsg()):
     Line 1: ClassName  (e.g. TSynAsmSyn)
     Line 2: TokenPrefix  (e.g. tk)
     Line 3: IdentStart … :: … ::
     |><|
     TOKENTYPES
     TokenName [StyleExpr]
     …
     |><|
     KEYS GroupName
     word
     …
     |><|
     CHARS
     charspec:: ProcName
     BeginProc
       …
     EndProc
     |><|
     ENCLOSEDBY
     TokenType,RuleName,OpenSeq,CloseSeq[,MultiLine]
     …
     |><|
     SAMPLESOURCE
     …source lines…
     |><|
   ════════════════════════════════════════════════════════════════════════════ */


