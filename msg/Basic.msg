TSynBasicSyn
tk
IdentStart '_', 'a'..'z', 'A'..'Z' :: '_', '0'..'9', 'a'..'z', 'A'..'Z'::
|><|
TOKENTYPES
Comment Foreground=RGB(66,160,255)|Style=[fsItalic]
Identifier Foreground=RGB(121,121,255)
Keywords Foreground=RGB(92,204,94)
Test Foreground=RGB(157,0,0)|Style=[fsBold]
|><|
KEYS Keywords
add
your
keywords
here
|><|
KEYS Test
This
is
the
tokentype
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
|><|
SAMPLESOURCE
{Paste your sample source here}
{Token types example - keywords come from Key groups}
{Styling from Token types - Comment, Identifier, Keywords and Test}
{Keywords}
add
your
keywords
here
{Indentifier}
These are indentifiers
{Test}
This is the tokentype test

|><|
