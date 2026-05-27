/*
================================================================================
  SynGen .msg Designer  |  js/parser.js
  Copyright (c) 2026 Mark Stephen Day. All Rights Reserved.
  PROPRIETARY AND CONFIDENTIAL — unauthorised copying strictly prohibited.
================================================================================
*/
'use strict'

/* ── Colour data & conversion utilities ─────────────────────────────────── */
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

/* ── .msg generation ────────────────────────────────────────────────────── */
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

/* ── .msg round-trip loader ─────────────────────────────────────────────── */
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


/* ── .pas reverse parser ────────────────────────────────────────────────── */
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
