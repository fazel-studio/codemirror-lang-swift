# @fazelstudio/codemirror-lang-swift

[![NPM version](https://img.shields.io/npm/v/@fazelstudio/codemirror-lang-swift.svg)](https://www.npmjs.com/package/@fazelstudio/codemirror-lang-swift) [![GitHub](https://img.shields.io/badge/GitHub-fazel--studio%2Fcodemirror--lang--swift-blue?logo=github)](https://github.com/fazel-studio/codemirror-lang-swift)

This package implements Swift (`.swift`) language support for the [CodeMirror](https://codemirror.net/) code editor: a full Lezer grammar covering classes, structs, enums, protocols, extensions, actors, functions (including `async`/`throws`), closures (including trailing closure syntax), optionals, generics, pattern matching, string interpolation, and documentation comments — with syntax highlighting compatible with any CodeMirror 6 theme.

This code is released under an MIT license.

## Usage

```js
import { EditorView, basicSetup } from "codemirror"
import { swift } from "@fazelstudio/codemirror-lang-swift"

new EditorView({
  parent: document.body,
  doc: `struct Greeting {
    let name: String
    var message: String {
        "Hello, \(name)!"
    }
}`,
  extensions: [basicSetup, swift()],
})
```

## API

### `swift(config?) → LanguageSupport`

Create a Swift language support extension. No configuration is required.

```js
import { swift } from "@fazelstudio/codemirror-lang-swift"
EditorView.create({ extensions: [swift()] })
```

### `swiftLanguage: LRLanguage`

The underlying `LRLanguage` instance. Useful for custom configuration, e.g. adding extra language data or completions:

```js
import { swiftLanguage } from "@fazelstudio/codemirror-lang-swift"
swiftLanguage.data.of({ autocomplete: myCompletions })
```

## Features

- **Declarations**: `class`, `struct`, `enum` (associated & raw values), `protocol`, `extension`, `actor`, `typealias`, `associatedtype`, `init`/`init?`/`init!`, `subscript`, `operator`/`precedencegroup`
- **Generics**: inline constraints (`<T: Comparable>`) and `where` clause (`where T: Equatable`)
- **Properties**: stored, computed (getter-only & `get`/`set`), `willSet`/`didSet`, property wrappers (`@State`, `@Published`, etc.)
- **Functions**: external/internal parameter labels (`for id`), `_` label, `inout`, default values, `async`/`throws`/`rethrows`, `mutating`/`static`/`class`/`override` etc.
- **Statements**: `if let`/`guard let` (multiple bindings), `switch`/`case` (value, tuple, binding `let x?`, `where`, range, multiple values, `default`, `fallthrough`), `for ... where`, `while`, `repeat-while`, `defer`, `do/catch`, `throw`/`try`/`try?`/`try!`/`await`, labeled `break`/`continue`
- **Expressions**: optional chaining `a?.b`, force unwrap `a!`, nil-coalescing `a ?? b`, range `...`/`..<`, casting `as`/`as?`/`as!`/`is`, ternary `? :`, trailing closures (single & multiple `onError:`), shorthand `$0`, string interpolation (simple & nested), multi-line `"""` and raw `#"..."#` strings
- **Comments**: `//`, nested `/* */` (`/* /* */ */` valid), doc comments `///` and `/** */`
- **Attributes**: `@available(...)`, `@objc`, `@escaping`, `@State`, `@MainActor`, etc.
- **Operators**: custom `infix operator +-: AdditionPrecedence` and overloading `static func +(lhs:rhs:)`

## Known limitations

- Custom `precedencegroup` declarations are parsed structurally but do not affect how this package parses operator precedence for custom operators — all custom operators are treated with a default precedence level in v0.2.
- Result builder DSL bodies (e.g. SwiftUI `@ViewBuilder` closures) are parsed as regular Swift statements, not with builder-specific semantics — this only affects semantic understanding, not syntax highlighting correctness.
- Doc comment field content (`- Parameter x: ...`) is highlighted as part of the doc comment block, not parsed into structured fields, in v0.2.
- String interpolation `\(expr)` inside regular strings is tokenized as part of the string token in v0.2 (interpolation delimiters are not separately highlighted). For raw strings with `\#(…)` and multi-line `"""` with interpolation, the content inside `\(…)` is still part of the surrounding string token, not a separate expression tree — this is intentional to avoid LR conflicts with `(` `)` depth and `"` handling, and will be addressed via external tokenizer in a future 0.3 if needed. Extended delimiter with arbitrary `#` count (`##"..."##`, `###"..."###` etc) is now supported via `#+` regex (previously limited to 2), but interpolation `\##(...` for >1 `#` is still not delimited separately.
- `return`/`break`/`continue`/`throw` with trailing `;` are now correctly parsed as single statements (`ReturnStatement:309` `kw<"return"> !label Expression ";"?`, `BreakStatement`/`ContinueStatement` `!label Identifier ";"?`, `ThrowStatement` `Expression ";"?` — fixes `return;`/`break outer;` previously `⚠(";")`), and `return <value>`/`break <label>` are single statements via `!label` precedence (fixes `return 42` previously split into `return` + `42` as 2 statements via `ExpressionStatement`). Remaining LR(1) edge without `trackNewline` is `return` without `;` + newline vs next `let` — correctly not greedy because `let` is not `Expression`, so `return` alone + `let x=1` stays 2 statements.
- Trailing closure vs `if`/`while`/`for`/`guard` block ambiguity remains for `if x.isEmpty { }` style where `x.isEmpty` could be interpreted as `x.isEmpty` with trailing closure `{ }` as part of condition (`Condition` includes `Expression` with trailing) rather than `if` block — handled via `!typeArgs` vs `!call` precedence and `CodeBlock[@dynamicPrecedence=1] ~call`, but still requires `()` around condition if it contains a call with trailing closure to be unambiguous (documented in DECISIONS.md).
- `for where` with trailing closure on the `where` condition (`for x in arr where foo() { } { }`) and `if let` with trailing on the bound value (`if let x = foo() { } { }`) remain ambiguous and will be parsed as `foo() { }` trailing inside the `where`/`let` value, not as loop/if body — use parentheses `where (foo() { })` or extract to variable to disambiguate.
- Generic `<...>` vs comparison `a < b` is handled via `~typeArgs` + `@dynamicPrecedence=1` on `GenericType` and `Type` vs `Expression` distinction, but `let x: Array<Dictionary<String, Int>>` nested and `Box<Int>(value:)` as `PrimaryExpression` are now supported; remaining edge `a<B, C>` as value still prefers generic when after `:` or `as`, and comparison otherwise — this matches Swift compiler heuristics (no space before `<` after identifier in type context).
- `some`/`any` opaque types (`some View`, `any Protocol`) are now supported as `OpaqueType` with `t.modifier` highlighting, but `some`/`any` as generic constraints (`where T: some Protocol`) are still parsed as `Identifier` + `Type`, not as opaque.

## Development

```bash
npm install
npm run build:grammar  # swift.grammar -> src/parser.js
npm run build          # src/*.ts -> dist/*.js + .cjs + .d.ts
npm test               # mocha test/test-swift.js (43 tests)
```

## License

MIT © Zulfazli (Fazelllyyy) — [fazel-studio](https://github.com/fazel-studio)
