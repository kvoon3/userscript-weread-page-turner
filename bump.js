/* eslint-disable antfu/no-top-level-await */
import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const { version } = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'))

const manifestPath = path.join(root, 'extension', 'manifest.json')
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'))
manifest.version = version
await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

await new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [path.join(root, 'sync-shared.js')], {
    cwd: root,
    stdio: 'inherit',
  })
  child.on('exit', code => (code === 0 ? resolve() : reject(new Error(`sync-shared exited ${code}`))))
  child.on('error', reject)
})
