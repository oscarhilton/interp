const IS_WHITE_SPACE = (c: string) => /\s/.test(c);
const IS_OPERATOR = (c: string) => /[+\-*\/\^%=(),]/.test(c);
const IS_DIDGIT = (c: string) => /[0-9]/.test(c);
const IS_IDENTIFIER = (c: string) => typeof c === "string" && !IS_OPERATOR(c) && !IS_DIDGIT(c) && !IS_WHITE_SPACE(c);

type Operator = "+" | "-" | "*" | "/" | "^" | "%" | "=" | "(" | ")" | ","
enum StepState {
  NO_OPP,
  OPERATOR,
  DIGIT,
  INDENTIFIER,
  HALT,
}
enum TokenType {
  NUMBER,
  INDENTIFIER,
  OPERATOR,
  END,
}
interface Token {
  type: TokenType,
  value: string | number
}
class Lex {
  input: string
  tokens: Token[]
  constructor(input = "") {
    this.input = input
    this.tokens = []
  }
  step(c: string) {
    if (IS_WHITE_SPACE(c)) return StepState.NO_OPP
    if (IS_OPERATOR(c)) return StepState.OPERATOR
    if (IS_DIDGIT(c)) return StepState.DIGIT
    if (IS_IDENTIFIER(c)) return StepState.INDENTIFIER
    return StepState.HALT
  }
  run() {
    if (!this.input || !this.input.length)
      throw 'You have not supplied me anything to run!' 
    let i = 0;
    let c = this.input[i]
    const advance = (): string => c = this.input[++i]
    const addToken = (type: TokenType, value: any): void => { this.tokens.push({ type, value }) } 
    while (i < this.input.length) {
      switch (this.step(c)) {
        case StepState.HALT:
          throw `index: ${i}; char: ${this.input[i]}: is an unknown command`
        case StepState.NO_OPP:
          advance()
          break
        case StepState.DIGIT:
          var num = c as string | number;
          while (IS_DIDGIT(advance())) num = num.toString() + c;
          if (c === ".") do num += c; while (IS_DIDGIT(advance()));
          num = parseFloat(num as string);
          if (!isFinite(num)) throw "Number is too large or too small for a 64-bit double.";
          addToken(TokenType.NUMBER, num);
          break
        case StepState.OPERATOR:
          addToken(TokenType.OPERATOR, c);
          advance();
          break
        case StepState.INDENTIFIER:
          var idn = c;
          while (IS_IDENTIFIER(advance())) idn += c;
          addToken(TokenType.INDENTIFIER, idn);
          break
        default:
          throw 'Well, that was unexpected.'
      }
    }
    addToken(TokenType.END, null);
    return this.tokens
  }
}

console.log(new Lex('12 / 4 + 6').run())

interface Symbol extends Token {
  lbp?: number // left binding power
  nud?: Function // null denotative function
  led?: Function // left denotative function
  type: Operator | TokenType
}

class Parser {
  i: number
  parseTree: Token[]
  symbols: Object

  constructor(tokens: Token[]) {
    this.i = 0
    this.parseTree = [];
    this.symbols = {}
  }

  // symbol(id, nud?, lbp?, led?) {
  //   var sym = this.symbols[id] || {};
  //   Object.assign(this.symbols, {
  //     lbp: sym.lbp || lbp,
  //     nud: sym.nud || nud,
  //     led: sym.led || led
  //   })
  // };

  interperate(token: Token) {
    const sym = {
      [token.type]: {
        type: token.type,

        ...token
      }
    }

    Object.assign(this.symbols, sym)
    console.log(this.symbols, sym)
    return sym
  };

  foo() {
    var i = 0;
    var token = () => this.interperate(this.parseTree[i])
    const advance = () => i++; token()

    const expression = (rbp) => {
      var left, t = token();
      advance();

      if (!t.nud) throw "Unexpected token: " + t.type;

      left = t.nud(t);

      while (rbp < token().lbp) {
        t = token();
        advance();
        if (!t.led) throw "Unexpected token: " + t.type;
        left = t.led(left);
      }

      return left;
    };

    const infix = (id, lbp, rbp?, led?) => {
      rbp = rbp || lbp;
      this.symbol(id, null, lbp, led || function (left) {
        return {
          type: id,
          left: left,
          right: expression(rbp)
        };
      });
    }
  }

  token() {
    return this.interperate(this.parseTree[this.i])
  }

  run() {
    while (this.token().type !== TokenType.END) {
      this.parseTree.push(this.expression(0));
    }
    return this.parseTree;
  }

//     const infix = (id, lbp, rbp?, led?) => {
//       rbp = rbp || lbp;
//       this.symbol(id, null, lbp, led || function (left) {
//         return {
//           type: id,
//           left: left,
//           right: expression(rbp)
//         };
//       });
//     }

//     const prefix = (id, rbp) => {
//       this.symbol(id, () => {
//         return {
//           type: id,
//           right: expression(rbp)
//         };
//       });
//     };

//     prefix("-", 7);
//     infix("^", 6, 5);
//     infix("*", 4);
//     infix("/", 4);
//     infix("%", 4);
//     infix("+", 3);
//     infix("-", 3);

//     this.symbol(",");
//     this.symbol(")");
//     this.symbol("(end)");

//     this.symbol("(", () => {
//       const value = expression(2);
//       if (token().type !== ")") throw "Expected closing parenthesis ')'";
//       advance();
//       return value;
//     });

//     this.symbol("number", (number) => number);

//     this.symbol("identifier", (name) => {
//       if (token().type === "(") {
//         var args = [];
//         if (this.parseTree[i + 1].type === ")") advance();
//       else {
//         do {
//           advance();
//           args.push(expression(2));
//         } while (token().value === ",");    
//         if (token().type !== ")") throw "Expected closing parenthesis ')'";
//       }
        
//       advance();
//       return {
//         type: "call",
//         args: args,
//         name: name.value
//       };
//     }
//   return name;
//     });
    
// infix("=", 1, 2, (left) => {
//     if (left.type === "call") {
//       for (var i = 0; i < left.args.length; i++) {
//         if (left.args[i].type !== "identifier") throw "Invalid argument name";
//       }
//       return {
//         type: "function",
//         name: left.name,
//         args: left.args,
//         value: expression(2)
//       };
//     } else if (left.type === "identifier") {
//       return {
//         type: "assign",
//         name: left.value,
//         value: expression(2)
//       };
//     }
//     else throw "Invalid lvalue";
// });
//   }
}

console.log(new Parser(new Lex('12 / 4 + 6').run()).run())