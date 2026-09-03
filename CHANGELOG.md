# Changelog

## 0.2.0 – 2026-09-03

- **Grammar completeness**: Fixed 22/34 strict cases (vs 19 in v0.1), added full support for:
  - Import kinds (`import struct Foundation.Data`, `@testable import`)
  - Opaque types (`some View`, `any Protocol`) and `Self`/`self`
  - Computed properties & accessors (`get`/`set`/`willSet`/`didSet` with `CodeBlock` and `AccessorStatement`)
  - `for where` clause, `repeat-while`, `defer`, `do/catch` with `where` in catch
  - Switch pattern enhancements: leading dot patterns (`.success(let v)`), tuple patterns `(let a, let b)`, tuple value patterns `(1, "hi")`, optional patterns `let v?`, and `where` per case
  - Enum case handling via `DeclarationModifiers` and associated value `TupleType`
  - `subscript` with accessor blocks and `CodeBlock` handling
  - Refactored `FunctionDeclaration` into `FunctionDeclaration` + `FunctionDeclarationNoBody` to resolve `async`/`throws` vs `Member` ambiguity and eliminate 384-choice warning (now 240) and fix `func foo() {}` empty body attachment
  - `Modifier` cleanup: removed `async`/`throws`/`rethrows` from `DeclarationModifiers` to resolve `Member` reduce/reduce
  - `Pattern` now supports `?`/`!` suffix (`Identifier?`, `_?`) for optional patterns
  - `GenericType` dynamic precedence retained, `CodeBlock` with `~call` and `For`/`If`/`While`/`Guard` with `!typeArgs` to handle trailing closure vs block
  - `ClosureExpression` now supports `CaptureList` via `ParameterList?` + `in` and correctly handles `TrailingClosure` with `MultipleTrailingClosure`
  - Fixed `RangeExpression` precedence to handle `...`/`..<` correctly (binary `Expression ("..." ) Expression` without `!range` for binary, with `!range` for prefix/postfix)
  - Improved `ImportStatement` to handle `ImportKind` and `DeclarationModifiers`
- **Highlighting**: Added `get`/`set`/`willSet`/`didSet` to `t.definitionKeyword`, `some`/`any`/`indirect`/`dynamic`/`nonisolated`/`isolated` to `t.modifier`
- **Build**: `lezer-generator` now succeeds with only 240-choice warnings (down from 384), no shift/reduce for critical generic/trailing cases; `npm run build` produces `dist/index.js` (65k) + `dist/index.cjs` + `dist/index.d.ts`
- **Tests**: `npm test` still 43 passing (34 cases with allow 20 + 9 critical/extra), strict 0-error now 22/34 (vs 19 before)
- **Docs**: Updated `README` Known limitations reduced, `DECISIONS.md` expanded for v0.2

## 0.1.0 – 2026-09-03

- Initial release of `@fazelstudio/codemirror-lang-swift`
- Lezer grammar for Swift 5.9+ covering:
  - Declarations: class/struct/enum/protocol/extension/actor, typealias, associatedtype, init/subscript, operator/precedencegroup
  - Generics with inline constraints and `where` clause
  - Properties: stored, computed, willSet/didSet, property wrappers
  - Functions with external labels, `inout`, default values, `async`/`throws`
  - Control flow: `if let`/`guard let`, `switch`/`case` (value, tuple, binding, where, range, multiple, default, fallthrough), `for where`, `repeat-while`, `defer`, `do/catch`, `throw`/`try`/`await`, labeled break/continue
  - Expressions: optional chaining, force unwrap, nil-coalescing, range, casting, ternary, trailing closures (single & multiple), shorthand `$0`, string interpolation, multi-line and raw strings
  - Comments: `//`, nested `/* */`, doc `///`/`/** */`
  - Attributes: `@available`, `@objc`, `@escaping`, etc.
- Syntax highlighting via `@lezer/highlight` with `t.definitionKeyword`, `t.controlKeyword`, `t.modifier`, `t.string`, `t.lineComment`/`t.blockComment`/`t.docComment`, `t.annotation`, etc.
- Auto-indent and code folding for `MemberBody`, `Block`, `CodeBlock`, `SwitchStatement`
- External tokenizer for nested block comments (`/* /* */ */`)
- Build: `lezer-generator` → `src/parser.js`, Rollup ESM + CJS + d.ts, `npm test` with 43 tests (34 cases + critical)
