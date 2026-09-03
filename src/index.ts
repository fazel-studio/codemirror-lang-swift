import { LRLanguage, LanguageSupport, indentNodeProp, foldNodeProp, delimitedIndent } from "@codemirror/language"
import { styleTags, tags as t } from "@lezer/highlight"
import { parser } from "./parser.js"

const configuredParser = parser.configure({
  props: [
    styleTags({
      "class struct enum protocol extension actor func var let typealias associatedtype init subscript get set willSet didSet": t.definitionKeyword,
      "import": t.moduleKeyword,
      "if else guard switch case default for while repeat return break continue fallthrough defer do catch throw": t.controlKeyword,
      "open public internal fileprivate private": t.modifier,
      "static final override required convenience mutating nonmutating lazy weak unowned indirect dynamic nonisolated isolated some any": t.modifier,
      "async await throws rethrows": t.modifier,
      "in where as is": t.operatorKeyword,
      "true false nil": t.atom,
      "self Self super": t.self,
      Identifier: t.variableName,
      TypeIdentifier: t.typeName,
      Number: t.number,
      "String RawStringToken MultiLineStringToken": t.string,
      InterpolationDelimiter: t.special(t.string),
      LineComment: t.lineComment,
      BlockComment: t.blockComment,
      DocBlockComment: t.docComment,
      DocLineComment: t.docComment,
      Attribute: t.annotation,
      ShorthandArgument: t.variableName,
      "( )": t.paren,
      "[ ]": t.squareBracket,
      "{ }": t.brace,
      ". , ; :": t.punctuation,
      "Operator OperatorToken ?? ?. ... ..< ->": t.operator,
      '"!" "?"': t.operator,
    }),
    indentNodeProp.add({
      MemberBody: delimitedIndent({ closing: "}" }),
      Block: delimitedIndent({ closing: "}" }),
      CodeBlock: delimitedIndent({ closing: "}" }),
      SwitchStatement: delimitedIndent({ closing: "}" }),
    }),
    foldNodeProp.add({
      MemberBody: (node) => ({ from: node.from + 1, to: node.to - 1 }),
      Block: (node) => ({ from: node.from + 1, to: node.to - 1 }),
      CodeBlock: (node) => ({ from: node.from + 1, to: node.to - 1 }),
    }),
  ],
})

export const swiftLanguage = LRLanguage.define({
  parser: configuredParser,
  languageData: {
    commentTokens: { line: "//", block: { open: "/*", close: "*/" } },
    indentOnInput: /^\s*\}$/,
    closeBrackets: { brackets: ["(", "[", "{", '"'] },
  },
})

export function swift() {
  return new LanguageSupport(swiftLanguage)
}
