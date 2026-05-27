/*
================================================================================
  SynGen .msg Designer  |  js/app.js
  Copyright (c) 2026 Mark Stephen Day. All Rights Reserved.
  PROPRIETARY AND CONFIDENTIAL — unauthorised copying strictly prohibited.
================================================================================
*/
'use strict'

const LANE_CFG = [
  { id:'header',     label:'Header',        ico:'ti-file-text', color:'var(--lh)', type:'header',    multi:false, autoGen:false },
  { id:'tokentype',  label:'Token types',   ico:'ti-tag',       color:'var(--lt)', type:'tokentype', multi:true,  autoGen:false },
  { id:'keygroup',   label:'Key groups',    ico:'ti-list',      color:'var(--lk)', type:'keygroup',  multi:true,  autoGen:false },
  { id:'chars',      label:'Char rules',    ico:'ti-braces',    color:'var(--lc)', type:'charrule',  multi:false, autoGen:true  },
  { id:'enclosedby', label:'Enclosed by',   ico:'ti-brackets',  color:'var(--le)', type:'enclosure', multi:true,  autoGen:false },
  { id:'sample',     label:'Sample source', ico:'ti-code',      color:'var(--ls)', type:'sample',    multi:false, autoGen:false },
]

/* ════════════════════════════════════════════════════════════════════════════
   NAMED DELPHI COLOURS
   ════════════════════════════════════════════════════════════════════════════ */

/* ── Colour editor UI helpers ───────────────────────────────────────────── */
function ceApply(id,slot,hex){
  const c=findCard(id); if(!c) return
  const fmt=c[slot+'Fmt']||'named'
  c[slot]=hexToColourStr(hex,fmt)
  // live swatch
  const swatch=document.getElementById(`ce-prev-${id}-${slot}`)
  if(swatch){ swatch.style.background=hex; swatch.querySelector('input').value=hex }
  // hex label on bar
  const hexLbl=document.getElementById(`ce-hex-${id}-${slot}`)
  if(hexLbl) hexLbl.textContent=hex.toUpperCase()
  // RGB sliders
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16)
  setSlider(id,slot,'r',r); setSlider(id,slot,'g',g); setSlider(id,slot,'b',b)
  // named grid active state
  document.querySelectorAll(`.ce-named-swatch[data-ce="${id}-${slot}"]`).forEach(el=>{
    el.classList.toggle('active', el.dataset.hex===hex.toLowerCase())
  })
  // output
  const out=document.getElementById(`ce-out-${id}-${slot}`)
  if(out) out.textContent=c[slot]
  render()
  refreshTokenPreview()
}

function setSlider(id,slot,ch,val){
  const el=document.getElementById(`ce-sl-${id}-${slot}-${ch}`)
  const vl=document.getElementById(`ce-sv-${id}-${slot}-${ch}`)
  if(el){el.value=val;updateSliderBg(el,ch)}
  if(vl) vl.textContent=val
}

function updateSliderBg(slider,ch){
  const v=parseInt(slider.value)
  const r=ch==='r'?v:0, g=ch==='g'?v:0, b=ch==='b'?v:0
  const a=`rgb(${r},${g},${b})`, bk=ch==='r'?'#000,#f00':ch==='g'?'#000,#0f0':'#000,#00f'
  slider.style.background=`linear-gradient(to right,${bk})`
}

/* Called from the native colour picker (swatch) */
function onCePick(id,slot,hex){
  ceApply(id,slot,hex)
}

/* Called from RGB sliders */
function onCeSlider(id,slot){
  const r=parseInt(document.getElementById(`ce-sl-${id}-${slot}-r`).value)
  const g=parseInt(document.getElementById(`ce-sl-${id}-${slot}-g`).value)
  const b=parseInt(document.getElementById(`ce-sl-${id}-${slot}-b`).value)
  const hex='#'+[r,g,b].map(n=>n.toString(16).padStart(2,'0')).join('')
  ceApply(id,slot,hex)
}

/* Called from named colour grid swatches */
function onCeNamed(id,slot,hex){
  ceApply(id,slot,hex)
}

/* Called from format buttons */
function setCeFmt(id,slot,fmt){
  const c=findCard(id); if(!c) return
  c[slot+'Fmt']=fmt
  c[slot]=hexToColourStr(colourToHex(c[slot]),fmt)
  const out=document.getElementById(`ce-out-${id}-${slot}`)
  if(out) out.textContent=c[slot]
  // re-render format buttons
  document.querySelectorAll(`.ce-fmt-btn[data-ce="${id}-${slot}"]`).forEach(el=>{
    el.classList.toggle('on',el.dataset.fmt===fmt)
  })
  render()
  refreshTokenPreview()
}

/* Build the full custom colour editor HTML for one slot */
function colourEditorHtml(cardId,slot,val,fmt,disabled){
  const hex=colourToHex(val)
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16)
  const curStr=val||'clWindowText'
  const dis=disabled?'disabled':''

  const sliderRow=(ch,val,label)=>`
    <div class="ce-slider-row">
      <span class="ce-slider-label" style="color:${ch==='r'?'#f07070':ch==='g'?'#52c98a':'#70a8d8'}">${label}</span>
      <input class="ce-slider" type="range" min="0" max="255" value="${val}"
        id="ce-sl-${cardId}-${slot}-${ch}" ${dis}
        oninput="document.getElementById('ce-sv-${cardId}-${slot}-${ch}').textContent=this.value;onCeSlider(${cardId},'${slot}')">
      <span class="ce-slider-val" id="ce-sv-${cardId}-${slot}-${ch}">${val}</span>
    </div>`

  const fmtBtns=['named','hex','rgb'].map(f=>`
    <button class="ce-fmt-btn${fmt===f?' on':''}" data-ce="${cardId}-${slot}" data-fmt="${f}"
      onclick="setCeFmt(${cardId},'${slot}','${f}')">${f==='named'?'Name':f==='hex'?'$Hex':'RGB()'}</button>`).join('')

  return `<div class="ce-wrap${disabled?' ce-disabled':''}">
    <div class="ce-swatch-bar">
      <div class="ce-swatch-preview" id="ce-prev-${cardId}-${slot}" style="background:${hex}">
        <input type="color" value="${hex}" ${dis} oninput="onCePick(${cardId},'${slot}',this.value)">
      </div>
      <div class="ce-swatch-hex" id="ce-hex-${cardId}-${slot}">${hex.toUpperCase()}</div>
    </div>
    <div class="ce-sliders">
      ${sliderRow('r',r,'R')}
      ${sliderRow('g',g,'G')}
      ${sliderRow('b',b,'B')}
    </div>
    <div class="ce-fmt-row">
      <span style="font-size:10px;color:var(--t2)">Output:</span>
      ${fmtBtns}
      <div class="ce-output-box" id="ce-out-${cardId}-${slot}">${esc(curStr)}</div>
    </div>
  </div>`
}

function onCePick(id, slot, hex) {
  const c=findCard(id); if(!c) return
  const fmt=c[slot+'Fmt']||'named'
  c[slot]=hexToColourStr(hex,fmt)
  const out=document.getElementById(`ce-out-${id}-${slot}`)
  if(out) out.textContent=c[slot]
  // update swatch colour inline
  const wrap=document.querySelector(`#ce-swatch-${id}-${slot}`)
  render()
}



function setCeFmt(id, slot, fmt) {
  const c=findCard(id); if(!c) return
  c[slot+'Fmt']=fmt
  c[slot]=hexToColourStr(colourToHex(c[slot]),fmt)
  render(); renderInsp()
}

/* ════════════════════════════════════════════════════════════════════════════
   AUTO-GENERATE CHAR RULE from Header ident chars
   ════════════════════════════════════════════════════════════════════════════ */
function autoGenCharRule() {
  const hdr = doc.header[0]
  const charset = hdr ? hdr.identStart : "'A'..'Z', 'a'..'z', '_'"
  const body =
    'fTokenID := IdentKind(fLine + Run);\n' +
    'inc(Run, fStringLen);\n' +
    'while IsIdentChar(fLine[Run]) do\n' +
    '  Inc(Run);'
  const existing = doc.chars[0]
  if (existing) {
    existing.charset = charset
    existing.body    = body
  } else {
    doc.chars = [{ id: mkid(), type:'charrule', charset, procName:'Ident', body, readOnly:true }]
  }
}

/* ════════════════════════════════════════════════════════════════════════════
   DOC MODEL
   ════════════════════════════════════════════════════════════════════════════ */
const doc = {}
LANE_CFG.forEach(l => doc[l.id] = [])

let sel=null, dragPalType=null, dragCardId=null, idSeq=0
const mkid=()=>++idSeq

/* ── Class name helpers ── */
function sanitizeIdent(raw) { return raw.replace(/[^A-Za-z0-9_]/g,'') }
function buildClassName(raw) {
  let core=sanitizeIdent(raw).replace(/^TSyn/i,'').replace(/Syn$/i,'')
  if(!core) core='Custom'
  core=core.charAt(0).toUpperCase()+core.slice(1)
  return {full:'TSyn'+core+'Syn', core}
}

/* ── Default card factories ── */
function defCard(type) {
  const id=mkid()
  switch(type){
    case 'header':    return {id,type,classCore:'Custom',prefix:'tk',identStart:"'_', 'a'..'z', 'A'..'Z'",identCont:"'_', '0'..'9', 'a'..'z', 'A'..'Z'"}
    case 'tokentype': return {id,type,name:'NewToken',hasFG:false,fg:'clWindowText',fgFmt:'named',hasBG:false,bg:'clWindow',bgFmt:'named',hasStyle:false,bold:false,italic:false,underline:false,strikeout:false}
    case 'keygroup':  return {id,type,groupName:'keywords',words:[]}
    case 'enclosure': return {id,type,tokenType:'Comment',ruleName:'BraceComment',openSeq:'{',closeSeq:'}',multiLine:true}
    case 'sample':    return {id,type,text:'; sample source\nmov rax, 1\nsyscall'}
  }
}

/* ── Finders ── */
function findCard(id) { for(const l of LANE_CFG){const c=doc[l.id].find(c=>c.id===id);if(c)return c} return null }
function laneIdForCard(id) { for(const l of LANE_CFG){if(doc[l.id].some(c=>c.id===id))return l.id} return null }

function addCard(type, laneId) {
  const lane=LANE_CFG.find(l=>l.id===laneId)
  if(!lane||lane.autoGen) return
  if(!lane.multi&&doc[laneId].length>=1) doc[laneId]=[]
  const c=defCard(type)
  doc[laneId].push(c)
  sel=c.id
  if(type==='header') autoGenCharRule()
  render(); renderInsp()
}

/* ── Preset token type helper ─────────────────────────────────────────────── */
/* Common token types for any language. If the token is Comment or String,     */
/* automatically add a matching Enclosure card.                                 */
function addPresetToken(name, fg, bg, style, bold, italic, underline) {
  // Add the token type card
  const card = defCard('tokentype')
  card.name = name
  if (fg) { card.hasFG = true; card.fg = fg; card.fgFmt = 'named' }
  if (bg) { card.hasBG = true; card.bg = bg; card.bgFmt = 'named' }
  if (bold || italic || underline) {
    card.hasStyle = true
    card.bold = bold; card.italic = italic; card.underline = underline
  }
  doc.tokentype.push(card)
  sel = card.id

  // Auto-add enclosure(s) for Comment and String tokens
  const nameLc = name.toLowerCase()
  if (nameLc === 'comment' || nameLc.includes('comment')) {
    // Add line comment (;) and block comment ({})
    const enc1 = defCard('enclosure')
    enc1.tokenType = name; enc1.ruleName = name + 'Line'
    enc1.openSeq = ';'; enc1.closeSeq = ''; enc1.multiLine = false
    doc.enclosedby.push(enc1)

    const enc2 = defCard('enclosure')
    enc2.tokenType = name; enc2.ruleName = name + 'Block'
    enc2.openSeq = '{'; enc2.closeSeq = '}'; enc2.multiLine = true
    doc.enclosedby.push(enc2)
  }
  if (nameLc === 'doccomment') {
    const enc = defCard('enclosure')
    enc.tokenType = name; enc.ruleName = 'DocCommentBlock'
    enc.openSeq = '/**'; enc.closeSeq = '*/'; enc.multiLine = true
    doc.enclosedby.push(enc)
  }
  if (nameLc === 'string' || nameLc.includes('string')) {
    const enc = defCard('enclosure')
    enc.tokenType = name; enc.ruleName = name + 'DQ'
    enc.openSeq = '"'; enc.closeSeq = '"'; enc.multiLine = false
    doc.enclosedby.push(enc)
  }
  if (nameLc === 'directive' || nameLc.includes('directive')) {
    const enc = defCard('enclosure')
    enc.tokenType = name; enc.ruleName = 'Directive'
    enc.openSeq = '{$'; enc.closeSeq = '}'; enc.multiLine = false
    doc.enclosedby.push(enc)
  }

  render(); renderInsp()
  showToast('Added ' + name + ' token type' +
    (doc.enclosedby.length ? ' + enclosure(s)' : ''))
}

function removeCard(id) {
  const lid=laneIdForCard(id)
  if(lid) doc[lid]=doc[lid].filter(c=>c.id!==id)
  if(sel===id) sel=null
  if(lid==='header'&&doc.chars.length) doc.chars=[]
  render(); renderInsp()
}

function upd(id,k,v) {
  const c=findCard(id); if(!c) return
  c[k]=v
  if(c.type==='header'&&(k==='identStart')) autoGenCharRule()
  render()
}
function tog(id,k) { const c=findCard(id); if(c){c[k]=!c[k];render();renderInsp()} }
function updClassName(id,raw) {
  const c=findCard(id); if(!c) return
  c.classCore=buildClassName(raw).core
  render()
  const el=document.getElementById('cn-core-'+id)
  if(el) el.textContent=c.classCore
}

/* ── Keyword helpers ── */
function rmW(id,i){const c=findCard(id);if(c){c.words.splice(i,1);render();renderInsp()}}
function addW(id){
  const el=document.getElementById('kwi-'+id),c=findCard(id)
  if(!el||!c)return; const w=el.value.trim()
  if(w&&!c.words.includes(w)){c.words.push(w);el.value='';render();renderInsp()}
}
function bulkW(id,v){
  const c=findCard(id);if(!c)return
  v.split('\n').map(s=>s.trim()).filter(s=>s&&!c.words.includes(s)).forEach(s=>c.words.push(s))
  render();renderInsp()
}

function toggleKwEdit(id){
  const edit=document.getElementById('kw-edit-'+id)
  const add=document.getElementById('kw-add-'+id)
  const chips=document.getElementById('kw-chips-'+id)
  if(!edit) return
  const open=edit.style.display==='none'
  edit.style.display=open?'block':'none'
  add.style.display=open?'none':'block'
  chips.style.display=open?'none':'flex'
}

function applyKwEdit(id){
  const c=findCard(id); if(!c) return
  const ta=document.getElementById('kw-ta-'+id); if(!ta) return
  c.words=ta.value.split('\n').map(s=>s.trim()).filter(s=>s)
  render(); renderInsp()
}

function cancelKwEdit(id){
  const edit=document.getElementById('kw-edit-'+id)
  const add=document.getElementById('kw-add-'+id)
  const chips=document.getElementById('kw-chips-'+id)
  if(edit){edit.style.display='none'}
  if(add){add.style.display='block'}
  if(chips){chips.style.display='flex'}
}

/* ════════════════════════════════════════════════════════════════════════════
   CARD HTML
   ════════════════════════════════════════════════════════════════════════════ */
function cardIcon(type){
  return {header:'ti-file-text',tokentype:'ti-tag',keygroup:'ti-list',charrule:'ti-braces',enclosure:'ti-brackets',sample:'ti-code'}[type]||'ti-circle'
}
function cardLabel(c){
  if(c.type==='header')    return buildClassName(c.classCore||'Custom').full
  if(c.type==='tokentype') return c.name
  if(c.type==='keygroup')  return c.groupName
  if(c.type==='charrule')  return 'Ident (auto-generated)'
  if(c.type==='enclosure') return c.ruleName
  if(c.type==='sample')    return 'Sample source'
  return ''
}
function cardBodyHtml(c){
  if(c.type==='header'){
    const {full}=buildClassName(c.classCore||'Custom')
    return `<div class="cr"><span>Class</span><b>${esc(full)}</b></div><div class="cr"><span>Prefix</span><b>${esc(c.prefix)}</b></div>`
  }
  if(c.type==='tokentype'){
    const p=[]
    if(c.hasBG) p.push('BG:'+c.bg)
    if(c.hasFG) p.push('FG:'+c.fg)
    const st=[c.bold&&'B',c.italic&&'I',c.underline&&'U',c.strikeout&&'S'].filter(Boolean)
    if(c.hasStyle&&st.length) p.push('['+st.join('')+']')
    return `<div class="cr">${esc(p.join(' · ')||'default style')}</div>`
  }
  if(c.type==='keygroup'){
    if(!c.words.length) return `<div class="cr" style="opacity:.35;font-style:italic">no keywords yet</div>`
    const prev=c.words.slice(0,6),more=c.words.length-6
    return `<div class="chips">${prev.map(w=>`<span class="chip">${esc(w)}</span>`).join('')}${more>0?`<span class="chip">+${more}</span>`:''}</div>`
  }
  if(c.type==='charrule'){
    return `<div class="cr"><b class="mn">${esc(c.charset)}</b></div><div class="cr" style="opacity:.5;font-style:italic">read-only · auto-generated</div>`
  }
  if(c.type==='enclosure'){
    return `<div class="cr"><span>${esc(c.tokenType)}</span><b class="mn">${esc(c.openSeq)}…${esc(c.closeSeq)}</b><span>${c.multiLine?'multi':'single'}</span></div>`
  }
  if(c.type==='sample'){
    const lines=c.text.split('\n')
    return `<div class="cr mn" style="font-size:10px">${esc(lines.slice(0,2).join(' ↵ '))}${lines.length>2?' …':''}</div>`
  }
  return ''
}
function cardHtml(c,color){
  const body=cardBodyHtml(c)
  const noRm=c.type==='charrule'
  return `<div class="card${c.id===sel?' sel':''}" id="c${c.id}"
    onclick="selectCard(${c.id})" draggable="${noRm?'false':'true'}"
    ondragstart="onCDS(event,${c.id})" ondragover="onCDO(event,${c.id})" ondrop="onCDP(event,${c.id})">
    <div class="card-hd">
      <i class="ti ${cardIcon(c.type)} card-ico" style="color:${color}"></i>
      <span class="card-lbl" title="Double-click to rename"
        ondblclick="event.stopPropagation();startCardRename(event,${c.id})">${esc(cardLabel(c))}</span>
      ${noRm?'<i class="ti ti-lock" style="font-size:11px;color:var(--t2);opacity:.5;flex-shrink:0"></i>':`<span class="card-rm" onclick="event.stopPropagation();removeCard(${c.id})" title="Remove"><i class="ti ti-x"></i></span>`}
    </div>
    ${body?`<div class="card-body">${body}</div>`:''}
  </div>`
}


/* ── In-place card title rename ─────────────────────────────────────────── */
function startCardRename(evt, id) {
  const c = findCard(id); if (!c) return
  const span = evt.target
  const current = cardLabel(c)

  // Replace the span with an input
  const input = document.createElement('input')
  input.className = 'card-lbl-input'
  input.value = current
  span.replaceWith(input)
  input.focus()
  input.select()

  const commit = () => {
    const newVal = input.value.trim()
    if (newVal && newVal !== current) {
      // Apply to the right field for each card type
      if (c.type === 'header')    c.classCore = newVal
      if (c.type === 'tokentype') c.name      = newVal
      if (c.type === 'keygroup')  c.groupName = newVal
      if (c.type === 'charrule')  return  // read-only
      if (c.type === 'enclosure') c.ruleName  = newVal
      if (c.type === 'sample')    return  // fixed label
    }
    render()
    renderInsp()
  }

  input.addEventListener('blur',  commit)
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter')  { e.preventDefault(); input.blur() }
    if (e.key === 'Escape') { input.value = current; input.blur() }
    e.stopPropagation()
  })
  input.addEventListener('click', e => e.stopPropagation())
}

/* ════════════════════════════════════════════════════════════════════════════
   RENDER CANVAS
   ════════════════════════════════════════════════════════════════════════════ */
function render(){
  clearValidationUI()
  // Refresh token type preview after any doc change
  setTimeout(refreshTokenPreview, 0)
  document.getElementById('canvas').innerHTML=LANE_CFG.map(lane=>{
    const cards=doc[lane.id]
    const typeName=lane.label.replace(/s$/,'').toLowerCase()
    const isAutoGen=lane.autoGen
    const hasCards=cards.length>0
    return `<div class="lane">
      <div class="lane-hd${hasCards?' has-cards':''}${isAutoGen?'':''}" id="lhd-${lane.id}"
        ondragover="onHDO(event,'${lane.id}')"
        ondragleave="onHDL('${lane.id}')"
        ondrop="onHDP(event,'${lane.id}')">
        <div class="lane-ico" style="background:${lane.color}1a"><i class="ti ${lane.ico}" style="color:${lane.color}"></i></div>
        <span class="lane-title">${lane.label}</span>
        <span class="lane-badge">${isAutoGen?'auto':''}${!isAutoGen&&hasCards?cards.length+(cards.length===1?' section':' sections'):''}</span>
        ${!isAutoGen&&!hasCards?`<span class="lane-add-hint">← drop here</span>`:''}
      </div>
      <div class="lane-body" id="lb-${lane.id}"
        ondragover="onLDO(event,'${lane.id}')"
        ondragleave="onLDL('${lane.id}')"
        ondrop="onLDP(event,'${lane.id}')">
        ${hasCards
          ? cards.map(c=>cardHtml(c,lane.color)).join('')
          : isAutoGen
            ? `<div class="lane-empty">auto-generated from Header ident start chars</div>`
            : `<div class="lane-empty">drag a ${typeName} section here or drop on the header above</div>`}
      </div>
    </div>`
  }).join('')
}

/* ════════════════════════════════════════════════════════════════════════════
   RENDER INSPECTOR
   ════════════════════════════════════════════════════════════════════════════ */
function selectCard(id){sel=id;render();renderInsp()}

function renderInsp(){
  const insp=document.getElementById('insp')
  const c=sel?findCard(sel):null
  if(!c){
    insp.innerHTML=`<div class="insp-nil"><i class="ti ti-cursor-text"></i><p>Select a section card<br>to edit its properties</p></div>`
    return
  }
  const fld=(label,key,val,mono=false,hint='',ro=false)=>
    `<div class="fg"><div class="fl">${label}</div>
      <input class="fi${mono?' mn':''}${ro?' ':''}" value="${esc(String(val??''))}" ${ro?'readonly':''} oninput="${ro?'':` upd(${c.id},'${key}',this.value)`}">
      ${hint?`<div class="fhint">${hint}</div>`:''}
    </div>`
  const stb=(k,l)=>`<button class="stb${c[k]?' on':''}" onclick="tog(${c.id},'${k}')">${l}</button>`
  let h=''

  if(c.type==='header'){
    const {full,core}=buildClassName(c.classCore||'Custom')
    h=`<div class="isec">Identity</div>
    <div class="fg">
      <div class="fl">Highlighter name</div>
      <input class="fi" value="${esc(c.classCore||'')}" placeholder="e.g. Pascal" oninput="updClassName(${c.id},this.value)">
      <div class="fhint">Type any name — TSyn…Syn is added automatically</div>
      <div class="cn-preview"><span class="cn-fixed">TSyn</span><span class="cn-core" id="cn-core-${c.id}">${esc(core)}</span><span class="cn-fixed">Syn</span></div>
    </div>
    ${fld('Token prefix','prefix',c.prefix,true,'Prefix for TtkTokenKind enum values')}
    <div class="isec" style="margin-top:2px">Identifier characters</div>
    ${fld('Ident start','identStart',c.identStart,true,'Also drives the auto-generated CHARS rule')}
    ${fld('Ident continue','identCont',c.identCont,true)}`
  }

  else if(c.type==='tokentype'){
    // Build preview using sample source (if available) — shows a word matching this token,
    // plus a few keywords from the matching key group so style changes are immediately visible
    const smp = doc.sample[0]
    const previewText = smp ? smp.text : c.name + ' sample ' + c.name
    h=`<div class="isec">Token</div>
    <div class="fg"><div class="fl">Token name</div>
      <input class="fi" value="${esc(c.name)}" oninput="upd(${c.id},'name',this.value)">
      <div class="fhint">Used as the TtkTokenKind enum value name</div>
    </div>
    <div class="isec" style="margin-top:2px">Style</div>
    <div class="fg"><div class="fl">Foreground</div>
      <div class="crow" style="margin-bottom:4px">
        <input type="checkbox" ${c.hasFG?'checked':''} onchange="upd(${c.id},'hasFG',this.checked);renderInsp()">
        <span style="font-size:11px;color:var(--t1)">Enable foreground colour</span>
      </div>
      ${colourEditorHtml(c.id,'fg',c.fg,c.fgFmt||'named',!c.hasFG)}
    </div>
    <div class="fg"><div class="fl">Background</div>
      <div class="crow" style="margin-bottom:4px">
        <input type="checkbox" ${c.hasBG?'checked':''} onchange="upd(${c.id},'hasBG',this.checked);renderInsp()">
        <span style="font-size:11px;color:var(--t1)">Enable background colour</span>
      </div>
      ${colourEditorHtml(c.id,'bg',c.bg,c.bgFmt||'named',!c.hasBG)}
    </div>
    <div class="fg"><div class="fl">Font style</div>
      <div class="crow">
        <input type="checkbox" ${c.hasStyle?'checked':''} onchange="upd(${c.id},'hasStyle',this.checked);renderInsp()">
        <div class="crow">${stb('bold','<b>B</b>')}${stb('italic','<i>I</i>')}${stb('underline','<u>U</u>')}${stb('strikeout','<s>S</s>')}</div>
      </div></div>
    <div class="isec" style="margin-top:2px">Live preview
      <span style="font-size:9px;font-weight:400;color:var(--t2);margin-left:4px;text-transform:none;letter-spacing:0">updates as you edit token style</span>
    </div>
    <div class="sp-preview" id="tt-preview-${c.id}">${highlightSample(previewText)||'<span style="opacity:.3;font-style:italic">add a Sample source section to preview</span>'}</div>`
  }

  else if(c.type==='keygroup'){
    const chips=c.words.map((w,i)=>`<span class="kwc" onclick="rmW(${c.id},${i})" title="click to remove">${esc(w)} ×</span>`).join('')
    h=`<div class="isec">Group</div>
    ${fld('Group name','groupName',c.groupName,false,'Must match a token type name')}
    <div class="isec" style="margin-top:2px">
      Keywords (${c.words.length})
      <button class="stb" style="margin-left:auto;font-size:10px;padding:2px 7px"
        onclick="toggleKwEdit(${c.id})">
        <i class="ti ti-pencil" style="font-size:11px"></i> Edit all
      </button>
    </div>
    <div class="fg">
      <div class="kw-chips" id="kw-chips-${c.id}">${chips||'<span style="font-size:10px;color:var(--t2);font-style:italic">none yet</span>'}</div>
      <div id="kw-edit-${c.id}" style="display:none">
        <textarea class="fi fta mn" style="min-height:120px;margin-bottom:5px"
          id="kw-ta-${c.id}"
          placeholder="one keyword per line…">${esc(c.words.join('\n'))}</textarea>
        <div style="display:flex;gap:5px">
          <button class="addb" style="flex:1" onclick="applyKwEdit(${c.id})"><i class="ti ti-check"></i> Apply</button>
          <button class="addb" onclick="cancelKwEdit(${c.id})">Cancel</button>
        </div>
      </div>
      <div id="kw-add-${c.id}">
        <div class="kwr">
          <input class="fi" id="kwi-${c.id}" placeholder="type keyword…" onkeydown="if(event.key==='Enter')addW(${c.id})">
          <button class="addb" onclick="addW(${c.id})">Add</button>
        </div>
        <textarea class="fi fta" style="margin-top:5px" placeholder="or paste multiple, one per line…"
          oninput="bulkW(${c.id},this.value)" onblur="this.value=''"></textarea>
      </div>
    </div>`
  }

  else if(c.type==='charrule'){
    h=`<div class="isec">Char rule <span style="font-weight:400;font-size:9px;color:var(--a);letter-spacing:.04em">AUTO-GENERATED · READ-ONLY</span></div>
    <div class="fhint" style="margin-bottom:6px">This section is generated automatically from the Header's Ident start chars. Edit the Header to change it.</div>
    ${fld('Character set','charset',c.charset,true,'',true)}
    ${fld('Proc name','procName',c.procName,false,'',true)}
    <div class="fg"><div class="fl">BeginProc body</div>
      <textarea class="fi fta mn" readonly style="min-height:90px;opacity:.55;cursor:default;border-style:dashed">${esc(c.body)}</textarea>
    </div>`
  }

  else if(c.type==='enclosure'){
    h=`<div class="isec">Enclosure</div>
    ${fld('Token type','tokenType',c.tokenType,false,'Must match a token type name')}
    ${fld('Rule name','ruleName',c.ruleName)}
    <div class="isec" style="margin-top:2px">Delimiters</div>
    ${fld('Open sequence','openSeq',c.openSeq,true)}
    ${fld('Close sequence','closeSeq',c.closeSeq,true)}
    <div class="fg"><div class="fl">Multi-line</div>
      <input type="checkbox" ${c.multiLine?'checked':''} onchange="upd(${c.id},'multiLine',this.checked)">
    </div>`
  }

  else if(c.type==='sample'){
    h=`<div class="isec">Sample source</div>
    <div class="fhint" style="margin-bottom:4px">Edit below — the highlighted preview updates live as you type.</div>
    <div class="fg">
      <textarea class="fi fta mn" style="min-height:120px" id="sp-ta-${c.id}"
        oninput="upd(${c.id},'text',this.value);refreshAllTokenPreviews();updSamplePreview(${c.id})">${esc(c.text)}</textarea>
    </div>
    <div class="isec" style="margin-top:2px">Highlighted preview</div>
    <div class="sp-preview" id="sp-preview-${c.id}">${highlightSample(c.text)||'<span style="opacity:.3;font-style:italic">empty</span>'}</div>`
  }

  insp.innerHTML=h
}

/* ════════════════════════════════════════════════════════════════════════════
   DRAG & DROP — palette → lane header (primary) and lane body (fallback)
   ════════════════════════════════════════════════════════════════════════════ */
function canDrop(laneId){
  const lane=LANE_CFG.find(l=>l.id===laneId)
  return lane&&!lane.autoGen&&lane.type===dragPalType&&(lane.multi||doc[laneId].length<1)
}

// Header drop zone
function onHDO(e,lid){
  if(!dragPalType) return
  e.preventDefault()
  const hd=document.getElementById('lhd-'+lid)
  if(!hd) return
  if(canDrop(lid)) hd.classList.add('over')
  else             hd.classList.add('reject')
}
function onHDL(lid){
  const hd=document.getElementById('lhd-'+lid)
  if(hd){hd.classList.remove('over');hd.classList.remove('reject')}
}
function onHDP(e,lid){
  onHDL(lid)
  if(!dragPalType||!canDrop(lid)) return
  e.preventDefault()
  addCard(dragPalType,lid)
  dragPalType=null
}

// Body drop zone (secondary fallback — same logic)
function onLDO(e,lid){
  if(!dragPalType) return
  e.preventDefault()
  const b=document.getElementById('lb-'+lid)
  if(!b) return
  if(canDrop(lid)) b.classList.add('over')
  else             b.classList.add('reject')
}
function onLDL(lid){
  const b=document.getElementById('lb-'+lid)
  if(b){b.classList.remove('over');b.classList.remove('reject')}
}
function onLDP(e,lid){
  onLDL(lid)
  if(!dragPalType||!canDrop(lid)) return
  e.preventDefault()
  addCard(dragPalType,lid)
  dragPalType=null
}

// Card reorder within lane
function onCDS(e,id){dragCardId=id;dragPalType=null;e.stopPropagation()}
function onCDO(e,id){if(!dragCardId)return;e.preventDefault();e.stopPropagation()}
function onCDP(e,targetId){
  e.preventDefault();e.stopPropagation()
  if(!dragCardId||dragCardId===targetId)return
  const srcL=laneIdForCard(dragCardId),tgtL=laneIdForCard(targetId)
  if(srcL===tgtL){
    const arr=doc[srcL]
    const fi=arr.findIndex(c=>c.id===dragCardId),ti=arr.findIndex(c=>c.id===targetId)
    if(fi>=0&&ti>=0){const[m]=arr.splice(fi,1);arr.splice(ti,0,m)}
  }
  dragCardId=null;render()
}

document.getElementById('pal').querySelectorAll('.pc').forEach(el=>{
  el.addEventListener('dragstart',()=>{dragPalType=el.dataset.type;dragCardId=null})
  el.addEventListener('dragend',()=>{dragPalType=null})
})

/* ════════════════════════════════════════════════════════════════════════════
   PANEL RESIZE
   ════════════════════════════════════════════════════════════════════════════ */
function makeResizer(handleId, cssVar, side) {
  const handle = document.getElementById(handleId)
  let startX, startW
  function onMove(e) {
    const x = e.touches ? e.touches[0].clientX : e.clientX
    const dx = x - startX
    const newW = Math.max(120, Math.min(420, startW + (side==='left'?dx:-dx)))
    document.documentElement.style.setProperty(cssVar, newW+'px')
  }
  function onUp() {
    handle.classList.remove('active')
    window.removeEventListener('mousemove',onMove)
    window.removeEventListener('mouseup',onUp)
    window.removeEventListener('touchmove',onMove)
    window.removeEventListener('touchend',onUp)
  }
  handle.addEventListener('mousedown',e=>{
    startX=e.clientX
    startW=parseInt(getComputedStyle(document.documentElement).getPropertyValue(cssVar))||190
    handle.classList.add('active')
    window.addEventListener('mousemove',onMove)
    window.addEventListener('mouseup',onUp)
    e.preventDefault()
  })
  handle.addEventListener('touchstart',e=>{
    startX=e.touches[0].clientX
    startW=parseInt(getComputedStyle(document.documentElement).getPropertyValue(cssVar))||190
    handle.classList.add('active')
    window.addEventListener('touchmove',onMove,{passive:false})
    window.addEventListener('touchend',onUp)
    e.preventDefault()
  },{passive:false})
}
makeResizer('rz-left','--pal-w','left')
makeResizer('rz-right','--insp-w','right')

/* ════════════════════════════════════════════════════════════════════════════
   .MSG GENERATION
   ════════════════════════════════════════════════════════════════════════════ */
let laneErrors = {}

function clearValidationUI() {
  laneErrors = {}
  document.querySelectorAll('.lane.lane-err').forEach(el=>el.classList.remove('lane-err'))
  document.querySelectorAll('.card.card-err').forEach(el=>el.classList.remove('card-err'))
  document.querySelectorAll('.lane-err-list').forEach(el=>el.remove())
  document.querySelectorAll('.lane-err-badge').forEach(el=>el.remove())
}

function addLaneError(laneId, msg, cardId=null) {
  if(!laneErrors[laneId]) laneErrors[laneId]=[]
  laneErrors[laneId].push({msg, cardId})
}

function applyValidationUI() {
  Object.entries(laneErrors).forEach(([laneId, errs])=>{
    // Highlight the lane
    const laneEl = document.querySelector(`[id="lhd-${laneId}"]`)?.closest('.lane')
    if(laneEl) {
      laneEl.classList.add('lane-err')
      // Add error count badge to lane header
      const badge = document.createElement('span')
      badge.className='lane-err-badge'
      badge.textContent = errs.length === 1 ? '1 issue' : errs.length+' issues'
      const hd = laneEl.querySelector('.lane-hd')
      if(hd) hd.appendChild(badge)
      // Inject error list beneath the lane body
      const errList = document.createElement('div')
      errList.className='lane-err-list'
      errList.innerHTML = errs.map(e=>`<div class="lane-err-item">${esc(e.msg)}</div>`).join('')
      laneEl.appendChild(errList)
    }
    // Highlight specific cards
    errs.forEach(e=>{
      if(e.cardId) {
        const cardEl = document.getElementById('c'+e.cardId)
        if(cardEl) cardEl.classList.add('card-err')
      }
    })
  })
}

function doValidate(){
  clearValidationUI()
  const ttNames = doc.tokentype.map(c=>c.name)
  let totalErrs = 0

  // Header lane
  if(!doc.header.length) {
    addLaneError('header','No Header section — class name and prefix will use defaults')
    totalErrs++
  }

  // Token types lane — check for duplicates
  const seen = new Set()
  doc.tokentype.forEach(c=>{
    if(seen.has(c.name)) {
      addLaneError('tokentype',`Duplicate token type name: "${c.name}"`,c.id); totalErrs++
    }
    seen.add(c.name)
    if(!c.name.trim()) {
      addLaneError('tokentype','A token type has an empty name',c.id); totalErrs++
    }
  })

  // Key groups lane
  doc.keygroup.forEach(c=>{
    if(!ttNames.includes(c.groupName)) {
      addLaneError('keygroup',`"${c.groupName}" has no matching token type`,c.id); totalErrs++
    }
    if(!c.words.length) {
      addLaneError('keygroup',`"${c.groupName}" has no keywords`,c.id); totalErrs++
    }
  })

  // Enclosures lane
  doc.enclosedby.forEach(c=>{
    if(!ttNames.includes(c.tokenType)) {
      addLaneError('enclosedby',`"${c.ruleName}" references unknown token type "${c.tokenType}"`,c.id); totalErrs++
    }
    if(!c.openSeq) {
      addLaneError('enclosedby',`"${c.ruleName}" has no open sequence`,c.id); totalErrs++
    }
  })

  // Apply highlights to DOM
  applyValidationUI()

  if(totalErrs === 0) {
    // Flash green on Validate button briefly
    const btn = document.querySelector('.tbtn[onclick="doValidate()"]')
    if(btn){
      const orig = btn.innerHTML
      btn.style.cssText='background:rgba(82,201,138,.15);border-color:rgba(82,201,138,.5);color:#52c98a'
      btn.innerHTML='<i class="ti ti-check"></i> Valid'
      setTimeout(()=>{btn.style.cssText='';btn.innerHTML=orig},2000)
    }
  }
}

/* ════════════════════════════════════════════════════════════════════════════
   CLEAR / LOAD EXAMPLE
   ════════════════════════════════════════════════════════════════════════════ */
function clearAll(){
  if(LANE_CFG.some(l=>doc[l.id].length)&&!confirm('Clear all lanes?'))return
  LANE_CFG.forEach(l=>doc[l.id]=[]); sel=null; render(); renderInsp()
}

function loadExample(){
  if(LANE_CFG.some(l=>doc[l.id].length)&&!confirm('Replace canvas with x86-64 ASM example?'))return
  LANE_CFG.forEach(l=>doc[l.id]=[]); idSeq=0; sel=null
  const put=(lid,type,extra)=>{const c=Object.assign(defCard(type),extra);doc[lid].push(c);return c}

  const hdr=put('header','header',{classCore:'Asm64',prefix:'tk',
    identStart:"'_', 'a'..'z', 'A'..'Z'",identCont:"'_', '0'..'9', 'a'..'z', 'A'..'Z'"})
  autoGenCharRule()

  put('tokentype','tokentype',{name:'Identifier'})
  put('tokentype','tokentype',{name:'Comment',      hasFG:true,fg:'clNavy',  fgFmt:'named',hasStyle:true,italic:true})
  put('tokentype','tokentype',{name:'Space'})
  put('tokentype','tokentype',{name:'String',       hasFG:true,fg:'clRed',   fgFmt:'named'})
  put('tokentype','tokentype',{name:'registers8bit', hasBG:true,bg:'clSilver',bgFmt:'named',hasFG:true,fg:'clBlue',fgFmt:'named',hasStyle:true,underline:true,italic:true})
  put('tokentype','tokentype',{name:'registers16bit',hasBG:true,bg:'clSilver',bgFmt:'named',hasFG:true,fg:'clBlue',fgFmt:'named',hasStyle:true,underline:true,italic:true})
  put('tokentype','tokentype',{name:'registers32bit',hasBG:true,bg:'clSilver',bgFmt:'named',hasFG:true,fg:'clBlue',fgFmt:'named',hasStyle:true,underline:true,italic:true})
  put('tokentype','tokentype',{name:'registers64bit',hasBG:true,bg:'clSilver',bgFmt:'named',hasFG:true,fg:'clBlue',fgFmt:'named',hasStyle:true,underline:true,italic:true})

  put('keygroup','keygroup',{groupName:'registers8bit', words:['ah','al','bh','bl','ch','cl','dh','dl','sil','dil','spl','bpl','r8b','r9b','r10b','r11b','r12b','r13b','r14b','r15b']})
  put('keygroup','keygroup',{groupName:'registers16bit',words:['ax','bx','cx','dx','si','di','sp','bp','r8w','r9w','r10w','r11w','r12w','r13w','r14w','r15w']})
  put('keygroup','keygroup',{groupName:'registers32bit',words:['eax','ebx','ecx','edx','esi','edi','esp','ebp','r8d','r9d','r10d','r11d','r12d','r13d','r14d','r15d']})
  put('keygroup','keygroup',{groupName:'registers64bit',words:['rax','rbx','rcx','rdx','rsi','rdi','rsp','rbp','r8','r9','r10','r11','r12','r13','r14','r15']})

  put('enclosedby','enclosure',{tokenType:'Comment',ruleName:'BraceComment', openSeq:'{', closeSeq:'}', multiLine:true})
  put('enclosedby','enclosure',{tokenType:'Comment',ruleName:'CStyleComment',openSeq:'/*',closeSeq:'*/',multiLine:true})
  put('enclosedby','enclosure',{tokenType:'String', ruleName:'String',       openSeq:'"', closeSeq:'"', multiLine:false})

  put('sample','sample',{text:
    "; Hello World — x86_64 NASM assembly for Linux\n"+
    "section .data\n    msg db 'Hello, World!', 0xa\n    len equ $ - msg\n"+
    "section .text\n    global _start\n_start:\n"+
    "    mov rax, 1\n    mov rdi, 1\n    mov rsi, msg\n    mov rdx, len\n    syscall\n"+
    "    mov rax, 60\n    mov rdi, 0\n    syscall"})

  sel=hdr.id; render(); renderInsp()
}


/* ════════════════════════════════════════════════════════════════════════════
   SAMPLE SOURCE LIVE PREVIEW
   Tokenises the sample text line-by-line using the token types, keyword
   groups, and enclosures defined in the current document, and renders
   syntax-highlighted HTML into the preview pane.
   ════════════════════════════════════════════════════════════════════════════ */

function buildHighlightRules() {
  // Enclosures — split into single-line-open-only (empty close) and normal
  // Sort longest open sequence first so '(*' matches before '('
  const encs = doc.enclosedby
    .filter(c => c.openSeq)
    .map(c => ({
      open:  c.openSeq,
      close: c.closeSeq,          // may be '' for line-to-EOL comments
      eol:   !c.closeSeq,         // true  → consume to end of line
      multi: c.multiLine && !!c.closeSeq,
      type:  c.tokenType
    }))
    .sort((a, b) => b.open.length - a.open.length)

  // Keywords: Map<word_lower → tokenTypeName>
  const kwMap = new Map()
  doc.keygroup.forEach(g => {
    g.words.forEach(w => kwMap.set(w.toLowerCase(), g.groupName))
  })

  // Style map: tokenTypeName → CSS style object
  const styleMap = {}
  doc.tokentype.forEach(c => {
    const s = {}
    if (c.hasFG) s.color      = colourToHex(c.fg)
    if (c.hasBG) s.background = colourToHex(c.bg)
    if (c.hasStyle) {
      if (c.bold)      s.fontWeight     = 'bold'
      if (c.italic)    s.fontStyle      = 'italic'
      if (c.underline) s.textDecoration = 'underline'
      if (c.strikeout) s.textDecoration = (s.textDecoration ? s.textDecoration + ' ' : '') + 'line-through'
    }
    styleMap[c.name] = s
  })

  // Ident char classes from header
  const hdr = doc.header[0]
  const identStartCls = hdr ? charSetToRegexClass(hdr.identStart) : '[A-Za-z_]'
  const identContCls  = hdr ? charSetToRegexClass(hdr.identCont)  : '[A-Za-z0-9_]'

  // Look up which token type names exist (for Number, Symbol etc.)
  const hasType = name => !!styleMap[name]

  // Resolve token type name case-insensitively
  const resolveType = name => {
    if (styleMap[name]) return name
    const lc = name.toLowerCase()
    return Object.keys(styleMap).find(k => k.toLowerCase() === lc) || null
  }

  return { encs, kwMap, styleMap, identStartCls, identContCls, resolveType }
}

// Parse a .msg char set expression like "'_', 'a'..'z', 'A'..'Z'"
// into a regex character class body like "_a-zA-Z"
function charSetToRegexClass(expr) {
  if (!expr) return '[A-Za-z_]'
  let cls = ''
  const rangeRe = /'(.)'\.\.\'(.)'/ 
  const re = /'(.)'\.\.'(.)'/g
  let m, last = 0
  while ((m = re.exec(expr)) !== null) {
    const before = expr.slice(last, m.index)
    ;[...before.matchAll(/'(.)'/g)].forEach(l => { cls += escRegCls(l[1]) })
    cls += escRegCls(m[1]) + '-' + escRegCls(m[2])
    last = m.index + m[0].length
  }
  ;[...expr.slice(last).matchAll(/'(.)'/g)].forEach(l => { cls += escRegCls(l[1]) })
  return cls ? '[' + cls + ']' : '[A-Za-z_]'
}

function escRegCls(ch) {
  return ch.replace(/[\]\^\\-]/g, '\\$&')
}

function styleToAttr(style) {
  if (!style || !Object.keys(style).length) return ''
  return ' style="' + Object.entries(style).map(([k, v]) => {
    return k.replace(/([A-Z])/g, '-$1').toLowerCase() + ':' + v
  }).join(';') + '"'
}

function spanOf(style, text) {
  return `<span${styleToAttr(style)}>${esc(text)}</span>`
}

function highlightSample(text) {
  if (!text) return ''
  const { encs, kwMap, styleMap, identStartCls, identContCls, resolveType } = buildHighlightRules()

  // Build ident regex
  const identRe = new RegExp(identStartCls + identContCls + '*', 'g')

  // Number patterns (checked in order — most specific first)
  //  Pascal hex   $5E  $FFFF
  //  Pascal char  #13  #32
  //  C hex        0x1A  0xFF
  //  Float        1.23  1.23e4  1.23E-4
  //  Integer      123   456
  const numRe = /(\$[0-9A-Fa-f]+|#\d+|0[xX][0-9A-Fa-f]+|\b\d+\.\d+(?:[eE][+-]?\d+)?|\b\d+)/

  // Symbol characters — anything non-alphanumeric, non-space, non-underscore
  // that hasn't been consumed by another rule
  const symChars = new Set('!@#$%^&*()-+=[]{}|\\:;<>,.?/~`\'\"')

  const lines = text.split('\n')
  let inEnc = null   // active multi-line enclosure
  let result = ''

  for (let li = 0; li < lines.length; li++) {
    const line = lines[li]
    let pos = 0, lineOut = ''

    // ── Continue an open multi-line enclosure ──────────────────────────────
    if (inEnc) {
      if (!inEnc.close) {
        // Should not happen — EOL enclosures never carry over
        inEnc = null
      } else {
        const ci = line.indexOf(inEnc.close)
        const st = styleMap[inEnc.type] || {}
        if (ci >= 0) {
          lineOut += spanOf(st, line.slice(0, ci + inEnc.close.length))
          pos = ci + inEnc.close.length
          inEnc = null
        } else {
          lineOut += spanOf(st, line)
          pos = line.length
        }
      }
    }

    // ── Scan rest of line ──────────────────────────────────────────────────
    while (pos < line.length) {

      // 1. Try enclosures (sorted longest-open first)
      let encMatched = false
      for (const enc of encs) {
        if (!line.startsWith(enc.open, pos)) continue
        const st = styleMap[enc.type] || {}

        if (enc.eol) {
          // ── EOL comment: open sequence only, no close — consume to end of line
          lineOut += spanOf(st, line.slice(pos))
          pos = line.length
        } else {
          const ci = line.indexOf(enc.close, pos + enc.open.length)
          if (ci >= 0) {
            // Closed on this line
            lineOut += spanOf(st, line.slice(pos, ci + enc.close.length))
            pos = ci + enc.close.length
          } else if (enc.multi) {
            // Continues to next line
            lineOut += spanOf(st, line.slice(pos))
            pos = line.length
            inEnc = enc
          } else {
            // Single-line enclosure that was not closed — consume to EOL
            lineOut += spanOf(st, line.slice(pos))
            pos = line.length
          }
        }
        encMatched = true
        break
      }
      if (encMatched) continue

      // 2. Number literals: Pascal hex $XX, Pascal char #NN, C hex 0xNN, float, int
      const numType = resolveType('Number')
      if (numType) {
        const numM = numRe.exec(line.slice(pos))
        if (numM && numM.index === 0) {
          lineOut += spanOf(styleMap[numType], numM[0])
          pos += numM[0].length
          continue
        }
      }

      // 3. Identifiers and keywords
      identRe.lastIndex = pos
      const idm = identRe.exec(line)
      if (idm && idm.index === pos) {
        const word   = idm[0]
        const kwType = kwMap.get(word.toLowerCase())
        const tname  = kwType || resolveType('Identifier')
        lineOut += spanOf(tname ? (styleMap[tname] || {}) : {}, word)
        pos += word.length
        continue
      }

      // 4. Whitespace
      if (line[pos] === ' ' || line[pos] === '\t') {
        let end = pos
        while (end < line.length && (line[end] === ' ' || line[end] === '\t')) end++
        const st = styleMap[resolveType('Space') || ''] || {}
        lineOut += spanOf(st, line.slice(pos, end))
        pos = end
        continue
      }

      // 5. Symbols — anything left that's a recognised symbol character
      const symType = resolveType('Symbol')
      if (symType && symChars.has(line[pos])) {
        // Consume a run of symbol chars
        let end = pos
        while (end < line.length && symChars.has(line[end])) end++
        lineOut += spanOf(styleMap[symType], line.slice(pos, end))
        pos = end
        continue
      }

      // 6. Fallthrough — emit as-is
      lineOut += esc(line[pos])
      pos++
    }

    result += lineOut + (li < lines.length - 1 ? '\n' : '')
  }
  return result
}

function updSamplePreview(id) {
  const c = findCard(id); if(!c) return
  const preview = document.getElementById('sp-preview-'+id)
  if(preview) preview.innerHTML = highlightSample(c.text) || '<span style="opacity:.3;font-style:italic">empty</span>'
}

// Refresh the live preview for whichever token type card is currently selected
function refreshTokenPreview() {
  const c = sel ? findCard(sel) : null
  if(!c || c.type !== 'tokentype') return
  const smp = doc.sample[0]
  const previewText = smp ? smp.text : c.name
  const el = document.getElementById('tt-preview-'+c.id)
  if(el) el.innerHTML = highlightSample(previewText) || '<span style="opacity:.3;font-style:italic">add a Sample source section to preview</span>'
}

// Refresh previews in all visible token type inspector panes (called when sample changes)
function refreshAllTokenPreviews() {
  const smp = doc.sample[0]; if(!smp) return
  const text = smp.text
  document.querySelectorAll('[id^="tt-preview-"]').forEach(el => {
    el.innerHTML = highlightSample(text) || '<span style="opacity:.3;font-style:italic">empty</span>'
  })
}

/* ════════════════════════════════════════════════════════════════════════════
   UTILITY
   ════════════════════════════════════════════════════════════════════════════ */
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}


/* ════════════════════════════════════════════════════════════════════════════
   HELP PANEL
   ════════════════════════════════════════════════════════════════════════════ */
function openHelp(){
  document.getElementById('help-panel').classList.add('open')
  document.getElementById('help-scrim').classList.add('open')
}
function closeHelp(){
  document.getElementById('help-panel').classList.remove('open')
  document.getElementById('help-scrim').classList.remove('open')
}

document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    // Close help if open
    if(document.getElementById('help-panel').classList.contains('open')){closeHelp();return}
    // Close any modal
    const modal=document.querySelector('.modal-wrap')
    if(modal){modal.remove();return}
    // Close intro
    const intro=document.getElementById('intro-overlay')
    if(intro){intro.remove();return}
  }
})


/* ════════════════════════════════════════════════════════════════════════════
   SYNEDIT .PAS REVERSE PARSER  (v3)

   Handles two major SynEdit highlighter patterns:

   Pattern A — Dictionary/EnumerateKeywords (e.g. SynHighlighterAsm)
     • Bare string constant:  Mnemonics: string = 'aaa,bbb,...'
     • Constructor call:      EnumerateKeywords(Ord(tkKey), Mnemonics, ...)

   Pattern B — Array constant + hash/func table (e.g. SynHighlighterPas)
     • KeyWords: array[0..N] of string = ('word1','word2',...)
     • Per-keyword Func returns specific TtkTokenKind (tkKey, tkType, ...)

   Extracts:
     Header      class name, token prefix, ident chars from Next dispatch
     TokenTypes  all TtkTokenKind values (minus infrastructure ones)
                 with Foreground/Background/Style from constructor
     KeyGroups   per-type keyword lists from both patterns
     Enclosures  from procedure names + Next char dispatch (#34 #39 ; // { (* )
     Sample      from GetSampleSource string concatenation
   ════════════════════════════════════════════════════════════════════════════ */

/* ── File input wiring ────────────────────────────────────────────────────── */

/* ── Boot ── */
render(); renderInsp()
