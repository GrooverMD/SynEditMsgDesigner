/*
================================================================================
  SynGen .msg Designer
  app.js

  Copyright (c) 2026 Mark Stephen Day. All Rights Reserved.

  PROPRIETARY AND CONFIDENTIAL

  This source code and all associated files are the exclusive intellectual
  property of Mark Stephen Day and are protected by copyright law.

  UNAUTHORISED USE, REPRODUCTION, OR DISTRIBUTION PROHIBITED.
  No part of this software may be copied, reproduced, modified, merged,
  published, distributed, sublicensed, reverse-engineered, decompiled, or
  transmitted in any form without the express prior written permission of
  Mark Stephen Day.
================================================================================
*/
'use strict'

/* ════════════════════════════════════════════════════════════════════════════
   LANE CONFIG
   Note: charrule is removed from palette — it auto-generates from the header.
   ════════════════════════════════════════════════════════════════════════════ */
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
const DELPHI_COLOURS = {
  clBlack:'#000000',   clMaroon:'#800000', clGreen:'#008000',  clOlive:'#808000',
  clNavy:'#000080',    clPurple:'#800080', clTeal:'#008080',   clGray:'#808080',
  clSilver:'#c0c0c0',  clRed:'#ff0000',   clLime:'#00ff00',   clYellow:'#ffff00',
  clBlue:'#0000ff',    clFuchsia:'#ff00ff',clAqua:'#00ffff',  clWhite:'#ffffff',
  clWindowText:'#000000', clWindow:'#ffffff',
  clBtnFace:'#ece9d8',    clBtnText:'#000000',
  clHighlight:'#316ac5',  clHighlightText:'#ffffff',
  clGrayText:'#808080',   clDefault:'#000000', clNone:'#000000',
}

/* Convert any stored colour value to #rrggbb */
function colourToHex(val) {
  const v=(val||'').trim()
  if(DELPHI_COLOURS[v]) return DELPHI_COLOURS[v]
  const d=v.match(/^\$([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/)
  if(d) return '#'+d[4]+d[3]+d[2]
  const rgb=v.match(/^RGB\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i)
  if(rgb){const h=n=>parseInt(n).toString(16).padStart(2,'0');return '#'+h(rgb[1])+h(rgb[2])+h(rgb[3])}
  if(/^#[0-9A-Fa-f]{6}$/.test(v)) return v
  return '#000000'
}

/* Format a #rrggbb value to the chosen output string */
function hexToColourStr(hex,fmt){
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16)
  const hh=n=>n.toString(16).padStart(2,'0').toUpperCase()
  if(fmt==='hex')  return '$00'+hh(b)+hh(g)+hh(r)
  if(fmt==='rgb')  return `RGB(${r},${g},${b})`
  const found=Object.entries(DELPHI_COLOURS).find(([,v])=>v===hex.toLowerCase())
  return found?found[0]:`RGB(${r},${g},${b})`
}

/* Update stored colour + live editor UI without full re-render */
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
function buildStyleStr(c){
  const p=[]
  if(c.hasBG) p.push('Background='+c.bg)
  if(c.hasFG) p.push('Foreground='+c.fg)
  if(c.hasStyle){
    const st=[c.bold&&'fsBold',c.italic&&'fsItalic',c.underline&&'fsUnderline',c.strikeout&&'fsStrikeOut'].filter(Boolean)
    if(st.length) p.push('Style=['+st.join(', ')+']')
  }
  return p.join('|')
}

function generateMsg(){
  const D='|><|', L=[]
  const hdr=doc.header[0]
  if(hdr){
    const {full}=buildClassName(hdr.classCore||'Custom')
    L.push(full,hdr.prefix,'IdentStart '+hdr.identStart+' :: '+hdr.identCont+'::')
  } else {
    L.push('TSynCustomSyn','tk',"IdentStart '_', 'a'..'z', 'A'..'Z' :: '_', '0'..'9', 'a'..'z', 'A'..'Z'::")
  }
  const tt=doc.tokentype
  if(tt.length){L.push(D,'TOKENTYPES');tt.forEach(c=>{const s=buildStyleStr(c);L.push(s?c.name+' '+s:c.name)})}
  doc.keygroup.forEach(c=>{L.push(D,'KEYS '+c.groupName);c.words.forEach(w=>L.push(w))})
  const cr=doc.chars[0]
  if(cr){L.push(D,'CHARS');L.push(cr.charset+':: '+cr.procName);L.push('BeginProc');cr.body.split('\n').forEach(l=>L.push('  '+l));L.push('EndProc')}
  const enc=doc.enclosedby
  if(enc.length){L.push(D,'ENCLOSEDBY');enc.forEach(c=>L.push([c.tokenType,c.ruleName,c.openSeq,c.closeSeq,c.multiLine?'MultiLine':''].filter(Boolean).join(',')))}
  const smp=doc.sample[0]
  if(smp){L.push(D,'SAMPLESOURCE');smp.text.split('\n').forEach(l=>L.push(l))}
  L.push(D)
  return L.join('\n')
}

/* ════════════════════════════════════════════════════════════════════════════
   PREVIEW MODAL  — clipboard and download fixed
   ════════════════════════════════════════════════════════════════════════════ */
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
function triggerPasOpen() {
  document.getElementById('pas-file-input').click()
}

function onPasFileSelected(evt) {
  const file = evt.target.files[0]; if (!file) return
  // Try UTF-8 first, fall back to latin-1 which covers Windows-1252
  const reader = new FileReader()
  reader.onload = e => {
    try { parsePasFile(e.target.result, file.name) }
    catch(ex) { showToast('Parse error: ' + ex.message, true) }
    evt.target.value = ''
  }
  reader.onerror = () => {
    const r2 = new FileReader()
    r2.onload = e => {
      try { parsePasFile(e.target.result, file.name) }
      catch(ex) { showToast('Parse error: ' + ex.message, true) }
      evt.target.value = ''
    }
    r2.readAsText(file, 'windows-1252')
  }
  // Most modern .pas files are UTF-8; TurboPack SynEdit ones are Windows-1252
  // We read as binary then decode manually to handle both
  const rb = new FileReader()
  rb.onload = eb => {
    const bytes = new Uint8Array(eb.target.result)
    // Check for UTF-8 BOM
    let text
    if (bytes[0]===0xEF && bytes[1]===0xBB && bytes[2]===0xBF) {
      text = new TextDecoder('utf-8').decode(bytes.slice(3))
    } else {
      // Try UTF-8 silently; if it fails use windows-1252
      try {
        text = new TextDecoder('utf-8', {fatal:true}).decode(bytes)
      } catch(_) {
        text = new TextDecoder('windows-1252').decode(bytes)
      }
    }
    try { parsePasFile(text, file.name) }
    catch(ex) { showToast('Parse error: ' + ex.message, true) }
    evt.target.value = ''
  }
  rb.readAsArrayBuffer(file)
}

/* ── Comment stripper ─────────────────────────────────────────────────────── */
function stripPasComments(src) {
  // { ... }  block comments (but NOT {$ directives — we still need to see procedures)
  src = src.replace(/\{[^$}][^}]*\}/g, ' ')
  src = src.replace(/\{[^}]*\}/g, ' ')
  // (* ... *)
  src = src.replace(/\(\*[\s\S]*?\*\)/g, ' ')
  // // line comments
  src = src.replace(/\/\/[^\n]*/g, '')
  return src
}

/* ── Resolve Pascal char constants to real characters ─────────────────────── */
function resolvePasChars(s) {
  return s.replace(/#(\d+)/g, (_, n) => {
    const c = parseInt(n, 10)
    if (c === 13) return '\r'
    if (c === 10) return '\n'
    return String.fromCharCode(c)
  })
}

/* ── Extract all string fragments from a Pascal string expression ─────────── */
// Handles:  'foo' + #13#10 + 'bar'  →  ['foo','\r\n','bar']
function extractStrFragments(expr) {
  // First resolve bare char consts so #13#10 between strings becomes \r\n
  const resolved = resolvePasChars(expr)
  const frags = []
  const re = /'((?:[^']|'')*)'/g
  let m
  while ((m = re.exec(resolved)) !== null)
    frags.push(m[1].replace(/''/g, "'"))
  // Also capture char consts that appear BETWEEN string literals
  // e.g. + #13#10 + (already converted by resolvePasChars above, but we need
  // to handle the non-quoted inter-string chars)
  return frags
}

/* ── Build a sample text from a GetSampleSource result expression ─────────── */
/* Tokeniser approach: treats string literals and char-const runs as separate   */
/* tokens, so #13#10 between strings becomes a real newline and #32 becomes a   */
/* real space — handling both ASM-style and Pascal-style GetSampleSource.       */
function buildSampleText(resultExpr) {
  // Tokenise into string literals OR char-const runs (#13#10 etc.)
  const tokRe = /'((?:[^']|'')*)'|((?:#\d+\s*)+)/g
  let result = '', m
  while ((m = tokRe.exec(resultExpr)) !== null) {
    if (m[1] !== undefined) {
      // String literal — unescape doubled single quotes
      result += m[1].replace(/''/g, "'")
    } else {
      // Char-const run — decode each #NN
      let chars = ''
      const ccRe = /#(\d+)/g; let cc
      while ((cc = ccRe.exec(m[2])) !== null) {
        const code = parseInt(cc[1], 10)
        if      (code === 13) chars += '\r'
        else if (code === 10) chars += '\n'
        else if (code ===  9) chars += '\t'
        else                  chars += String.fromCharCode(code)
      }
      result += chars.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    }
  }
  return result.trim()
}

/* ════════════════════════════════════════════════════════════════════════════
   MAIN PARSER
   ════════════════════════════════════════════════════════════════════════════ */
function parsePasFile(rawSrc, filename) {
  if (LANE_CFG.some(l => doc[l.id].length) &&
      !confirm('Replace current canvas with ' + (filename||'parsed file') + '?')) return

  LANE_CFG.forEach(l => doc[l.id] = [])
  idSeq = 0; sel = null

  const src   = rawSrc.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const clean = stripPasComments(src)

  /* ── 1. Class name ─────────────────────────────────────────────────────── */
  let className = 'TSynCustomSyn'
  const classM  = clean.match(/\b(TSyn\w+(?:Syn|Highlighter))\s*=\s*class\s*\(/i)
  if (classM) className = classM[1]
  let classCore = className
    .replace(/^TSyn/i, '')
    .replace(/(?:Syn|Highlighter)$/i, '')
  if (!classCore) classCore = 'Custom'
  classCore = classCore.charAt(0).toUpperCase() + classCore.slice(1)

  /* ── 2. TtkTokenKind enum ──────────────────────────────────────────────── */
  // Infrastructure tokens we never want as card-level token types
  const INFRA = new Set([
    'null','unknown','number','float','hex','char','symbol','asm',
    'space','direc','directive','whitespace'
  ])

  const rawTks   = []   // [{raw:'tkComment', name:'Comment'}]
  const enumM    = clean.match(/TtkTokenKind\s*=\s*\(([\s\S]*?)\)\s*;/i)
  if (enumM) {
    enumM[1].split(',').forEach(tok => {
      tok = tok.trim().split(/[\s{]/)[0]  // handle inline comments
      if (/^tk\w+$/i.test(tok)) {
        const lc   = tok.slice(2).toLowerCase()
        const name = tok.slice(2,3).toUpperCase() + tok.slice(3)
        rawTks.push({ raw: tok, lc, name, keep: !INFRA.has(lc) })
      }
    })
  }
  if (!rawTks.length) {
    // Fallback: synthesise from fXxxAttri field declarations
    const fieldRe = /f(\w+Attri)\s*:\s*TSynHighlighterAttributes/gi
    let fm
    while ((fm = fieldRe.exec(clean)) !== null) {
      const lc   = fm[1].toLowerCase().replace(/attri$/,'')
      const name = lc.charAt(0).toUpperCase() + lc.slice(1)
      if (!INFRA.has(lc)) rawTks.push({ raw:'tk'+name, lc, name, keep:true })
    }
  }

  /* ── 3. Published property → private field mapping ─────────────────────── */
  // property CommentAttri ... read fCommentAttri
  const propToField = {} // 'commentattri' → 'commentattri' (without leading f)
  const pubRe = /property\s+(\w+Attri)\b[^;]*read\s+f(\w+Attri)/gi
  let pm
  while ((pm = pubRe.exec(clean)) !== null)
    propToField[pm[1].toLowerCase()] = pm[2].toLowerCase()

  /* ── 4. Constructor attribute styles ───────────────────────────────────── */
  // Isolate the constructor body — everything between the outermost begin/end
  let ctorBody = ''
  const ctorStart = clean.search(/constructor\s+\w+\.\s*Create\b/i)
  if (ctorStart >= 0) {
    // Find the "begin" keyword that opens the constructor body
    const afterDecl = clean.slice(ctorStart)
    const beginIdx  = afterDecl.search(/\bbegin\b/i)
    if (beginIdx >= 0) {
      // Walk forward counting begin/end to find the matching end
      let depth = 0, pos = beginIdx, body = afterDecl.slice(beginIdx)
      const tokRe = /\b(begin|end)\b/gi
      let tm
      while ((tm = tokRe.exec(body)) !== null) {
        if (tm[1].toLowerCase() === 'begin') depth++
        else { depth--; if (depth === 0) { ctorBody = body.slice(0, tm.index+3); break } }
      }
    }
  }

  // Map: fieldname_lower (without leading f) → style object
  const attrStyle = {}

  const ensureA = k => { if (!attrStyle[k]) attrStyle[k] = {} }

  const styleRe = /f(\w+attri)\.style\s*:=\s*\[([^\]]*)\]/gi
  let sm
  while ((sm = styleRe.exec(ctorBody)) !== null) {
    const k = sm[1].toLowerCase(); ensureA(k)
    const f = sm[2].toLowerCase()
    attrStyle[k].bold      = /fsbold/i.test(f)
    attrStyle[k].italic    = /fsitalic/i.test(f)
    attrStyle[k].underline = /fsunderline/i.test(f)
    attrStyle[k].strikeout = /fsstrikeout/i.test(f)
  }
  const fgRe = /f(\w+attri)\.foreground\s*:=\s*(\w+)/gi
  while ((sm = fgRe.exec(ctorBody)) !== null) {
    const k = sm[1].toLowerCase(); ensureA(k); attrStyle[k].fg = sm[2]
  }
  const bgRe = /f(\w+attri)\.background\s*:=\s*(\w+)/gi
  while ((sm = bgRe.exec(ctorBody)) !== null) {
    const k = sm[1].toLowerCase(); ensureA(k); attrStyle[k].bg = sm[2]
  }

  // Helper: look up style for a token name
  const getStyle = name => {
    const lc = name.toLowerCase()
    return attrStyle[lc+'attri']
        || attrStyle[propToField[lc+'attri']]
        || attrStyle[(propToField[lc+'attri']||'').replace(/attri$/,'')+'attri']
        || {}
  }

  /* ── 5. Keyword groups ─────────────────────────────────────────────────── */
  const kwGroups = {}   // typeName → Set<string>
  const addKw = (type, word) => {
    word = word.trim()
    if (!word) return
    const cap = type.charAt(0).toUpperCase() + type.slice(1)
    if (!kwGroups[cap]) kwGroups[cap] = new Set()
    kwGroups[cap].add(word.toLowerCase())
  }

  /* Pattern A: bare identifier: string = 'a,b,c,...';  (may span lines with +) */
  // Collect ALL bare-string constants (no type keyword needed — Mnemonics style)
  const bareConstRe = /\b(\w+)\s*:\s*string\s*=([\s\S]*?);(?=\s*\n)/gi
  const bareConsts  = {}
  let bc
  while ((bc = bareConstRe.exec(clean)) !== null) {
    const name = bc[1]
    // Assemble the full string value (may have + continuations and #NN)
    const expr = bc[2]
    const frags = extractStrFragments(expr)
    const combined = frags.join('')
    const words = combined.split(',').map(w => w.trim()).filter(w => /^[A-Za-z_]\w*$/.test(w))
    if (words.length > 3) bareConsts[name] = words
  }

  /* EnumerateKeywords(Ord(tkXxx), ConstName, ...) in constructor */
  const enumKwRe = /EnumerateKeywords\s*\(\s*Ord\s*\(\s*tk(\w+)\s*\)\s*,\s*(\w+)\s*,/gi
  let ek
  while ((ek = enumKwRe.exec(ctorBody)) !== null) {
    const typeLc = ek[1].toLowerCase()
    const constName = ek[2]
    if (INFRA.has(typeLc)) continue
    const words = bareConsts[constName]
    if (words && words.length) words.forEach(w => addKw(ek[1], w))
  }

  /* Pattern B: array[0..N] of string = ('word1', ...) */
  // Also handle KeyWords const that appears in the file
  const arrRe = /\bKeyWords\s*(?::\s*array\s*\[[\s\S]*?\]\s*of\s*string\s*)?\s*=\s*\(([\s\S]*?)\)\s*;/gi
  let ar
  while ((ar = arrRe.exec(clean)) !== null) {
    const content = ar[1]
    const words = []
    const wRe = /'([A-Za-z_]\w*)'/g; let wm
    while ((wm = wRe.exec(content)) !== null) words.push(wm[1])
    if (!words.length) continue

    // Now determine which token type each keyword maps to.
    // Build wordTypeMap: word_lower → typeName
    const wordTypeMap = {}
    words.forEach(w => wordTypeMap[w.toLowerCase()] = 'Key')

    // Scan every Func… body in the file.
    // Each Func returns a specific TtkTokenKind for its keyword(s).
    // The function name hints at the keyword: FuncType → handles 'type' etc.
    const funcRe = /function\s+\w+\.Func(\w+)\s*\([^)]*\)\s*:\s*TtkTokenKind\s*;[\s\S]*?begin([\s\S]*?)end\s*;/gi
    let fm
    while ((fm = funcRe.exec(clean)) !== null) {
      const funcSuffix = fm[1].toLowerCase()  // e.g. 'type', 'asm', 'cdecl'
      const body       = fm[2]
      // Find all Result := tkXxx assignments; take the first non-Identifier one
      const results    = [...body.matchAll(/Result\s*:=\s*(tk\w+)/gi)]
        .map(r => r[1])
        .filter(r => !/Identifier|Null|Unknown/i.test(r))
      if (!results.length) continue
      const tkName = results[0]
      const typeLc = tkName.slice(2).toLowerCase()
      if (INFRA.has(typeLc)) continue
      const typeCap = tkName.slice(2,3).toUpperCase() + tkName.slice(3)
      // The function name IS the keyword (FuncAsm → 'asm', FuncType → 'type' etc.)
      if (wordTypeMap.hasOwnProperty(funcSuffix))
        wordTypeMap[funcSuffix] = typeCap
    }

    // Also: KeyWordFunc (the default handler) returns tkKey for unrecognised
    // We leave those as 'Key'.

    words.forEach(w => addKw(wordTypeMap[w.toLowerCase()] || 'Key', w))
  }

  /* ── 6. Ident chars from Next procedure dispatch ───────────────────────── */
  let identStart = "'_', 'a'..'z', 'A'..'Z'"
  // Find Next procedure — locate its outermost case statement
  const nextM = clean.match(/procedure\s+\w+\.Next\s*;[\s\S]*?\bcase\s+fLine\s*\[Run\]\s+of([\s\S]*?)(?=end\s*;[\s\S]{0,50}inherited|inherited)/i)
  if (nextM) {
    const cb = nextM[1]
    // Match lines like: 'A'..'Z', 'a'..'z', '_': IdentProc;
    const identM = cb.match(/((?:'[^']'(?:\.\.'[^']')?\s*,\s*)*'[^']'(?:\.\.'[^']')?)\s*:\s*\n?\s*IdentProc/i)
    if (identM) identStart = identM[1].trim()
  }

  /* ── 7. Enclosures from Next dispatch and procedure bodies ─────────────── */
  const enclosures = []
  const hasProc = name => new RegExp('procedure\\s+\\w+\\.' + name + '\\b', 'i').test(clean)

  // Brace comment { }
  if (hasProc('BraceOpenProc') || hasProc('BorProc'))
    enclosures.push({ tokenType:'Comment', ruleName:'BraceComment', openSeq:'{',  closeSeq:'}',  multiLine:true })

  // Directive {$ }  — check BraceOpenProc body for '$'
  const bopB = clean.match(/procedure\s+\w+\.BraceOpenProc[\s\S]*?begin([\s\S]*?)end\s*;/i)
  if (bopB && /'\$'/.test(bopB[1]))
    enclosures.push({ tokenType:'Directive', ruleName:'Directive', openSeq:'{$', closeSeq:'}', multiLine:false })

  // Ansi comment (* *)
  if (hasProc('AnsiProc') || hasProc('RoundOpenProc')) {
    // Confirm RoundOpenProc actually opens (* not just (
    const ropB = clean.match(/procedure\s+\w+\.RoundOpenProc[\s\S]*?begin([\s\S]*?)end\s*;/i)
    if (!ropB || /'\*'|AnsiProc|tkComment/i.test(ropB[1]))
      enclosures.push({ tokenType:'Comment', ruleName:'AnsiComment', openSeq:'(*', closeSeq:'*)', multiLine:true })
  }

  // // single-line comment
  if (hasProc('SlashProc')) {
    const spB = clean.match(/procedure\s+\w+\.SlashProc[\s\S]*?begin([\s\S]*?)end\s*;/i)
    if (spB && /tkComment/i.test(spB[1]))
      enclosures.push({ tokenType:'Comment', ruleName:'LineComment', openSeq:'//', closeSeq:'', multiLine:false })
  }

  // ; and/or # line comments — check Next dispatch AND CommentProc
  if (hasProc('CommentProc')) {
    const cpB = clean.match(/procedure\s+\w+\.CommentProc[\s\S]*?begin([\s\S]*?)end\s*;/i)
    if (cpB && /tkComment/i.test(cpB[1])) {
      // Check what triggers CommentProc in Next
      if (nextM) {
        const cb = nextM[1]
        // '#', ';': CommentProc  or  ';': CommentProc
        if (/'[;]'[^:]*CommentProc|CommentProc[^']*'[;]'/i.test(cb) ||
            /"[;]"/.test(cb))
          enclosures.push({ tokenType:'Comment', ruleName:'SemiComment', openSeq:';', closeSeq:'', multiLine:false })
        if (/"#"|'#'[^:]*CommentProc/i.test(cb))
          enclosures.push({ tokenType:'Comment', ruleName:'HashComment', openSeq:'#', closeSeq:'', multiLine:false })
        // If the dispatch was '#', ';': CommentProc (grouped)
        if (/'#',\s*';'|';',\s*'#'/i.test(cb)) {
          if (!enclosures.find(e=>e.openSeq===';'))
            enclosures.push({ tokenType:'Comment', ruleName:'SemiComment', openSeq:';', closeSeq:'', multiLine:false })
          if (!enclosures.find(e=>e.openSeq==='#'))
            enclosures.push({ tokenType:'Comment', ruleName:'HashComment', openSeq:'#', closeSeq:'', multiLine:false })
        }
      }
    }
  }

  // Check Next dispatch directly for '#', ';' if no CommentProc
  if (nextM && !hasProc('CommentProc')) {
    const cb = nextM[1]
    if (/'#',\s*';'|';',\s*'#'/i.test(cb)) {
      enclosures.push({ tokenType:'Comment', ruleName:'SemiComment', openSeq:';', closeSeq:'', multiLine:false })
      enclosures.push({ tokenType:'Comment', ruleName:'HashComment', openSeq:'#', closeSeq:'', multiLine:false })
    }
  }

  // String — #39 / 'StringProc'
  if (hasProc('StringProc')) {
    const spB = clean.match(/procedure\s+\w+\.StringProc[\s\S]*?begin([\s\S]*?)end\s*;/i)
    if (spB && /tkString/i.test(spB[1]))
      enclosures.push({ tokenType:'String', ruleName:'StringSQ', openSeq:"'", closeSeq:"'", multiLine:false })
  } else if (nextM && /#39/.test(nextM[1])) {
    enclosures.push({ tokenType:'String', ruleName:'StringSQ', openSeq:"'", closeSeq:"'", multiLine:false })
  }

  // Double-quote string — #34 / 'SingleQuoteStringProc' (ASM style DQ)
  if (hasProc('SingleQuoteStringProc') ||
      (nextM && /#34/.test(nextM[1])))
    enclosures.push({ tokenType:'String', ruleName:'StringDQ', openSeq:'"', closeSeq:'"', multiLine:false })

  /* ── 8. GetSampleSource ─────────────────────────────────────────────────── */
  let sampleText = ''
  {
    // Step 1: find the start of the GetSampleSource function body.
    // We scan forward from the function keyword for the opening 'begin',
    // then depth-count begin/end to find the true closing end.
    const gssRe = /\bfunction\s+\w+\.GetSampleSource\b/i
    const gssFnMatch = gssRe.exec(src)
    if (gssFnMatch) {
      // Find the first 'begin' after the function declaration
      const afterDecl = src.slice(gssFnMatch.index)
      const beginRel  = afterDecl.search(/\bbegin\b/i)
      if (beginRel >= 0) {
        const bodyAbsStart = gssFnMatch.index + beginRel + 'begin'.length
        // Walk forward counting nested begin/end
        const beRe = /\b(begin|end)\b/gi
        beRe.lastIndex = gssFnMatch.index + beginRel  // start AT the opening begin
        let depth = 0, bodyEnd = -1, bm
        while ((bm = beRe.exec(src)) !== null) {
          if (bm[1].toLowerCase() === 'begin') { depth++ }
          else { depth--; if (depth === 0) { bodyEnd = bm.index; break } }
        }
        if (bodyEnd > bodyAbsStart) {
          const body = src.slice(bodyAbsStart, bodyEnd)
          // Find Result := expression.  It may span many lines ending with ';'.
          // Use a greedy match anchored to end of trimmed body so we take the
          // LAST semicolon (not the first one inside a string constant).
          const bodyTrim = body.trimEnd()
          const resM = bodyTrim.match(/Result\s*:=([\s\S]+)$/i)
          if (resM) {
            // Strip the trailing semicolon + optional line comment
            let expr = resM[1].replace(/;[\t ]*(?:\/\/[^\n]*)?\s*$/, '')
            sampleText = buildSampleText(expr)
          }
        }
      }
    }
  }

  /* ── 9. Assemble the document ───────────────────────────────────────────── */

  // Header
  const hdr = Object.assign(defCard('header'), {
    classCore, prefix: 'tk', identStart,
    identCont: "'_', '0'..'9', 'a'..'z', 'A'..'Z'"
  })
  doc.header.push(hdr)
  autoGenCharRule()

  // Token types  — in enum order, keep-flagged only
  const tokenNamesKept = []
  rawTks.filter(t => t.keep).forEach(t => {
    const card  = defCard('tokentype')
    card.name   = t.name
    const style = getStyle(t.name)
    if (style.fg)  { card.hasFG = true; card.fg = style.fg; card.fgFmt = 'named' }
    if (style.bg)  { card.hasBG = true; card.bg = style.bg; card.bgFmt = 'named' }
    if (style.bold || style.italic || style.underline || style.strikeout) {
      card.hasStyle   = true
      card.bold       = !!style.bold
      card.italic     = !!style.italic
      card.underline  = !!style.underline
      card.strikeout  = !!style.strikeout
    }
    doc.tokentype.push(card)
    tokenNamesKept.push(t.name)
  })
  const ttSet = new Set(tokenNamesKept)

  // Keyword groups — skip if no words, auto-add token type card if missing
  Object.entries(kwGroups).forEach(([typeName, wordSet]) => {
    if (!wordSet.size) return
    if (!ttSet.has(typeName)) {
      // Add a token type card for it with default styling
      const card = defCard('tokentype')
      card.name  = typeName
      const style = getStyle(typeName)
      if (style.fg) { card.hasFG = true; card.fg = style.fg; card.fgFmt = 'named' }
      if (style.bold||style.italic) { card.hasStyle=true; card.bold=!!style.bold; card.italic=!!style.italic }
      doc.tokentype.push(card)
      ttSet.add(typeName)
    }
    const kg      = defCard('keygroup')
    kg.groupName  = typeName
    kg.words      = [...wordSet].sort()
    doc.keygroup.push(kg)
  })

  // Enclosures — map token type to actual card name (fuzzy match)
  enclosures.forEach(e => {
    // Find the best matching token type card
    let match = [...ttSet].find(n => n.toLowerCase() === e.tokenType.toLowerCase())
    if (!match) {
      // Try partial match: 'Comment' in 'LineComment' etc.
      match = [...ttSet].find(n => n.toLowerCase().includes(e.tokenType.toLowerCase())
                                || e.tokenType.toLowerCase().includes(n.toLowerCase()))
    }
    if (!match) return   // no match — skip this enclosure
    const enc = defCard('enclosure')
    Object.assign(enc, { ...e, tokenType: match })
    doc.enclosedby.push(enc)
  })

  // Sample source
  if (sampleText.trim()) {
    const smp = defCard('sample')
    smp.text  = sampleText.trim()
    doc.sample.push(smp)
  }

  // Select header, render, show summary toast
  sel = doc.header[0] ? doc.header[0].id : null
  render(); renderInsp()

  const parts = [
    className,
    doc.tokentype.length + ' token type' + (doc.tokentype.length !== 1 ? 's' : ''),
    doc.keygroup.length  + ' key group'  + (doc.keygroup.length  !== 1 ? 's' : ''),
    doc.enclosedby.length + ' enclosure' + (doc.enclosedby.length !== 1 ? 's' : ''),
    doc.sample.length    ? 'sample source' : '',
  ].filter(Boolean)
  showToast('Loaded ' + parts.join(' · '))
}

/* ── Toast notification ─────────────────────────────────────────────────── */
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

function triggerMsgOpen() {
  document.getElementById('msg-file-input').click()
}

function onMsgFileSelected(evt) {
  const file = evt.target.files[0]; if (!file) return
  const reader = new FileReader()
  reader.onload = e => {
    try { loadMsgFile(e.target.result, file.name) }
    catch(ex) { showToast('Load error: ' + ex.message, true) }
    evt.target.value = ''
  }
  reader.readAsText(file, 'utf-8')
}

function loadMsgFile(text, filename) {
  if (LANE_CFG.some(l => doc[l.id].length) &&
      !confirm('Replace current canvas with ' + (filename || 'the .msg file') + '?')) return

  LANE_CFG.forEach(l => doc[l.id] = [])
  idSeq = 0; sel = null

  const D     = '|><|'
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  let   pos   = 0

  const cur  = ()  => pos < lines.length ? lines[pos] : ''
  const adv  = ()  => { pos++ }
  const eof  = ()  => pos >= lines.length
  const trim = s   => s.trim()
  const isDel= ()  => trim(cur()) === D

  const skipBlanks = () => { while (!eof() && trim(cur()) === '') adv() }

  /* ── Helper: parse a style expression like
       Background=clSilver|Foreground=clNavy|Style=[fsItalic,fsBold]  ──────── */
  function parseStyleExpr(expr, card) {
    if (!expr || !expr.trim()) return
    expr.split('|').forEach(clause => {
      clause = clause.trim()
      const eq = clause.indexOf('=')
      if (eq < 0) return
      const key = clause.slice(0, eq).trim().toLowerCase()
      const val = clause.slice(eq + 1).trim()
      if (key === 'foreground') {
        card.hasFG = true; card.fg = val; card.fgFmt = 'named'
      } else if (key === 'background') {
        card.hasBG = true; card.bg = val; card.bgFmt = 'named'
      } else if (key === 'style') {
        card.hasStyle = true
        const inner = val.replace(/^\[|\]$/g, '')
        card.bold      = /fsBold/i.test(inner)
        card.italic    = /fsItalic/i.test(inner)
        card.underline = /fsUnderline/i.test(inner)
        card.strikeout = /fsStrikeOut/i.test(inner)
      }
    })
  }

  /* ── Helper: parse IdentStart / IdentCont char-set expressions ───────────── */
  function parseIdentLine(line) {
    // IdentStart '_', 'a'..'z', 'A'..'Z' :: '_', '0'..'9', 'a'..'z', 'A'..'Z'::
    const m = line.match(/IdentStart\s*(.*?)\s*::\s*(.*?):*\s*$/i)
    return m ? { identStart: m[1].trim(), identCont: m[2].trim() } : null
  }

  /* ── Header (first 3 lines before the first |><|) ───────────────────────── */
  skipBlanks()
  const classLine = trim(cur()); adv()
  skipBlanks()
  const prefixLine = trim(cur()); adv()
  skipBlanks()
  const identLine  = trim(cur()); adv()

  const { core } = buildClassName(classLine)
  const identParsed = parseIdentLine(identLine)

  const hdr = Object.assign(defCard('header'), {
    classCore:   core,
    prefix:      prefixLine || 'tk',
    identStart:  identParsed ? identParsed.identStart : "'_', 'a'..'z', 'A'..'Z'",
    identCont:   identParsed ? identParsed.identCont  : "'_', '0'..'9', 'a'..'z', 'A'..'Z'",
  })
  doc.header.push(hdr)
  autoGenCharRule()

  /* ── Sections separated by |><| ──────────────────────────────────────────── */
  while (!eof()) {
    skipBlanks()
    if (eof()) break

    if (isDel()) {
      adv()          // consume the |><|
      skipBlanks()
      if (eof()) break

      const keyword = trim(cur())

      /* TOKENTYPES ────────────────────────────────────────────────────────── */
      if (keyword === 'TOKENTYPES') {
        adv()
        while (!eof() && !isDel()) {
          const line = trim(cur()); adv()
          if (!line) continue
          // Split on first space: "Comment Style=[fsItalic]|Foreground=clNavy"
          const sp = line.indexOf(' ')
          const name  = sp >= 0 ? line.slice(0, sp) : line
          const style = sp >= 0 ? line.slice(sp + 1) : ''
          if (!name) continue
          const card = defCard('tokentype')
          card.name  = name
          parseStyleExpr(style, card)
          doc.tokentype.push(card)
        }

      /* KEYS ──────────────────────────────────────────────────────────────── */
      } else if (/^KEYS\s+/i.test(keyword)) {
        const groupName = keyword.replace(/^KEYS\s+/i, '').trim()
        adv()
        const kg = defCard('keygroup')
        kg.groupName = groupName
        while (!eof() && !isDel()) {
          const w = trim(cur()); adv()
          if (w) kg.words.push(w)
        }
        doc.keygroup.push(kg)

      /* CHARS ─────────────────────────────────────────────────────────────── */
      } else if (keyword === 'CHARS') {
        adv()
        // Char rules are auto-generated — skip the block but re-sync from header
        while (!eof() && !isDel()) adv()
        autoGenCharRule()

      /* ENCLOSEDBY ────────────────────────────────────────────────────────── */
      } else if (keyword === 'ENCLOSEDBY') {
        adv()
        while (!eof() && !isDel()) {
          const line = trim(cur()); adv()
          if (!line) continue
          // TokenType,RuleName,OpenSeq,CloseSeq[,MultiLine]
          const parts = line.split(',')
          if (parts.length < 3) continue
          const enc = defCard('enclosure')
          enc.tokenType = parts[0].trim()
          enc.ruleName  = parts[1].trim()
          enc.openSeq   = parts[2].trim()
          enc.closeSeq  = parts.length > 3 ? parts[3].trim() : ''
          enc.multiLine = parts.length > 4 && /MultiLine/i.test(parts[4])
          doc.enclosedby.push(enc)
        }

      /* SAMPLESOURCE ──────────────────────────────────────────────────────── */
      } else if (keyword === 'SAMPLESOURCE') {
        adv()
        const sampleLines = []
        while (!eof() && !isDel()) {
          sampleLines.push(cur())   // preserve indentation
          adv()
        }
        // Trim trailing blank lines only
        while (sampleLines.length && !sampleLines[sampleLines.length - 1].trim())
          sampleLines.pop()
        if (sampleLines.length) {
          const smp = defCard('sample')
          smp.text   = sampleLines.join('\n')
          doc.sample.push(smp)
        }

      } else {
        adv()  // unknown section keyword — skip
      }

    } else {
      adv()  // unexpected line outside section — skip
    }
  }

  sel = doc.header[0] ? doc.header[0].id : null
  render(); renderInsp()

  const parts = [
    classLine,
    doc.tokentype.length + ' token type'  + (doc.tokentype.length  !== 1 ? 's' : ''),
    doc.keygroup.length  + ' key group'   + (doc.keygroup.length   !== 1 ? 's' : ''),
    doc.enclosedby.length + ' enclosure'  + (doc.enclosedby.length !== 1 ? 's' : ''),
    doc.sample.length     ? 'sample source' : '',
  ].filter(Boolean)
  showToast('Opened ' + parts.join(' · '))
}

/* ── Boot ── */
render(); renderInsp()
