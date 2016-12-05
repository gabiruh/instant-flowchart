
string
  =  char+ EOS  { return { t: text() }  } 

char
  = .

EOS
  = ";"
  / EOF

__
  = "\t"
  / "\v"
  / "\f"
  / " "
  / "\u00A0"
  / "\uFEFF"


EOF
  = !.