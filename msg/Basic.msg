TSynBasicSyn
tk
IdentStart '_', 'a'..'z', 'A'..'Z' :: '_', '0'..'9', 'a'..'z', 'A'..'Z'::
|><|
TOKENTYPES
Comment Foreground=clGreen|Style=[fsItalic]
Keywords Foreground=RGB(92,204,94)
Test Foreground=RGB(199,165,41)|Style=[fsBold]
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
{Styling from Token types - Comment, Keywords and Test}
add
your
keywords
here
This is the tokentype test
|><|
