
chart
  = s:start e:expressions { return [s].concat(e) }

expressions =

  head:expression  tail:(__ expression)*
  {		   
    return tail.length > 0 ? [head].concat(tail.map((r) => r[1])): head;
  } / e:end { return e }
    
start
  = s:statement { return { content: s.content , type : "start" } }

end
  = s:statement { return { content: s.content , type : "end" } }

block "block"
  =  "{" __ s:expression+ "}" { return s }
  / s:expression              { return s }

comment "comment"
  = "//" s:string { return { type: 'comment', content: s} }

expression "expression"
  = condition / loop / statement / comment

condition "condition"
  = "if" __ "(" __ t:string __ ")" __ b:block __ alternate:alternate?
  { return { type: 'condition', test: t, block: b, alternate: alternate } }

alternate "else"
  = "else" __ b:block __  { return b }
  

loop "loop"
  = "while" __ "(" __  t:string __ ")" __ b:block __
  { return { type: 'loop', test: t, block: b } }

statement "statement"
  = s:string EOS { return { type : 'statement', content : s }}

string "string"
  =  c:[0-9a-zA-z_ ]+ { return c.join('').trim() } 

EOS
  = __ ";"__
  / EOF


__ "whitespace"
  = ("\t"
  / "\v"
  / "\n"
  / "\r\n"
  / "\f"
  / " "
  / "\u00A0"
  / "\uFEFF") * { return }

EOF
  = !.
