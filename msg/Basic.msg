TSynBasicSyn
tk
IdentStart '_', 'a'..'z', 'A'..'Z' :: '_', '0'..'9', 'a'..'z', 'A'..'Z'::
|><|
TOKENTYPES
Comment Foreground=clGreen|Style=[fsItalic]
Keywords Foreground=RGB(168,125,31)
|><|
KEYS Keywords
add
your
keywords
here
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
{keywords example}
add
your
keywords
here
|><|