import {ExternalTokenizer} from "@lezer/lr"
import {BlockComment, DocBlockComment} from "./parser.terms.js"

// Nested block comment handling for Swift
// Swift supports nested /* /* */ */ which most C-family languages do not.
// We need depth counting externally.

export const blockComment = new ExternalTokenizer(input => {
  let pos = 0
  // Must start with /*
  if (input.next != 47) return // '/'
  if (input.peek(1) != 42) return // '*'

  // Check if it's doc comment /** (but not /**/ empty? Still doc if second char is * and third is not /)
  // Distinguish: /** ... */ is DocBlockComment, /* ... */ is BlockComment
  // Heuristic: if after /* the next is * and not / then doc
  let isDoc = false
  if (input.peek(2) == 42) {
    // peek 2 is '*', so we have /** ; check that it's not /**/ ? Still doc but treat as doc
    // Ensure not /*/ weird, but we treat /** as doc
    isDoc = true
  }

  let depth = 0
  let i = 0

  // Scan ahead to find matching */
  // We need to count nested /*
  // Use input.peek
  while (true) {
    let ch = input.peek(i)
    let next = input.peek(i + 1)
    if (ch < 0) break // EOF without close -> not a valid token, don't accept
    if (ch == 47 && next == 42) { // /*
      depth++
      i += 2
      continue
    }
    if (ch == 42 && next == 47) { // */
      depth--
      i += 2
      if (depth == 0) {
        // We've found the closing */
        // Advance input by i characters and accept
        for (let j = 0; j < i; j++) input.advance()
        input.acceptToken(isDoc ? DocBlockComment : BlockComment)
        return
      }
      continue
    }
    i++
    // Safety: avoid huge scan without limit? but okay
    if (i > 100000) break
  }
  // If we didn't close, don't accept (let error recovery handle)
})
