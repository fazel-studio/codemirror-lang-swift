import { nodeResolve } from "@rollup/plugin-node-resolve"
import typescript from "@rollup/plugin-typescript"

export default [
  {
    input: "src/index.ts",
    output: [
      { file: "dist/index.js", format: "es" },
      { file: "dist/index.cjs", format: "cjs", exports: "named" }
    ],
    external: [/^@codemirror\//, /^@lezer\//],
    plugins: [
      nodeResolve(),
      typescript({ declaration: true, declarationDir: "dist", rootDir: "src" })
    ]
  }
]
