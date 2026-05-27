TSynBasicMSGSyn
tk
IdentStart '_', 'a'..'z', 'A'..'Z' :: '_', '0'..'9', 'a'..'z', 'A'..'Z'::
|><|
TOKENTYPES
Comment Foreground=$00408080|Style=[fsItalic]
Keyword Foreground=RGB(92,204,94)|Style=[fsBold, fsItalic]
Identifier Foreground=RGB(121,121,255)|Style=[fsUnderline]
Test Foreground=RGB(157,0,0)|Style=[fsBold, fsStrikeOut]
String Background=$00004646|Foreground=RGB(0,128,64)
|><|
KEYS Keyword
add
your
keywords
here
|><|
KEYS Test
This
is
the
token
type
test
|><|
CHARS
'_', 'a'..'z', 'A'..'Z':: Ident
BeginProc
  fTokenID := IdentKind(fLine + Run);
  inc(Run, fStringLen);
  while IsIdentChar(fLine[Run]) do
    Inc(Run);
EndProc
|><|
ENCLOSEDBY
Comment,BraceComment,{,},MultiLine
String,StringDQ,","
|><|
SAMPLESOURCE
{Paste your sample source here}
{
Token types example - 
Keywords from Key groups - Keywords and Test
}

{
Styling from Token types - 
Comment, Keywords, Identifier, Test and String
}

{Keywords}
Add your keywords here

{Indentifier}
These are indentifiers

{Test}
This is the token type test

{String}
"This is a string"
|><|
