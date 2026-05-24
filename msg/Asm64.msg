TSynAsm64Syn
tk
IdentStart '_', 'a'..'z', 'A'..'Z' :: '_', '0'..'9', 'a'..'z', 'A'..'Z'::
|><|
TOKENTYPES
Identifier Foreground=RGB(225,193,35)
Space
String Foreground=RGB(179,102,255)
registers8bit Foreground=RGB(255,213,0)
registers16bit Foreground=RGB(153,74,41)
registers32bit Foreground=RGB(255,0,136)
registers64bit Foreground=RGB(140,0,255)
Comment Foreground=RGB(24,216,24)|Style=[fsItalic]
Number Foreground=RGB(55,167,190)
Keywords Foreground=RGB(205,35,35)
Symbol Foreground=RGB(251,91,91)|Style=[fsItalic]
|><|
KEYS Keywords
mov
xor
syscall
|><|
KEYS registers8bit
ah
al
bh
bl
ch
cl
dh
dl
sil
dil
spl
bpl
r8b
r9b
r10b
r11b
r12b
r13b
r14b
r15b
|><|
KEYS registers16bit
ax
bx
cx
dx
si
di
sp
bp
r8w
r9w
r10w
r11w
r12w
r13w
r14w
r15w
|><|
KEYS registers32bit
eax
ebx
ecx
edx
esi
edi
esp
ebp
r8d
r9d
r10d
r11d
r12d
r13d
r14d
r15d
|><|
KEYS registers64bit
rax
rbx
rcx
rdx
rsi
rdi
rsp
rbp
r8
r9
r10
r11
r12
r13
r14
r15
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
String,String,","
Comment,CommentLine,;
|><|
SAMPLESOURCE
; helloworld.asm
; NASM syntax, 64-bit Linux example
; Demonstrates 8, 16, 32, and 64-bit registers and prints "Hello, world!"

section .data
    msg     db  "Hello, world!", 10
    msg_len equ $ - msg

section .text
    global _start

_start:
    ; --- Just to demonstrate different register sizes ---
    mov     al,  1          ;  8-bit register
    mov     bx,  2          ; 16-bit register
    mov     ecx, 3          ; 32-bit register
    mov     rdx, 4          ; 64-bit register

    ; --- Write "Hello, world!\n" to stdout ---
    mov     rax, 1          ; sys_write
    mov     rdi, 1          ; file descriptor: stdout
    mov     rsi, msg        ; buffer
    mov     rdx, msg_len    ; length
    syscall

    ; --- Exit(0) ---
    mov     rax, 60         ; sys_exit
    xor     rdi, rdi        ; status = 0
    syscall
|><|
