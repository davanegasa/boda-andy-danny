#!/usr/bin/env node
/**
 * Regenera docs/ENLACES-INVITADOS.md a partir de LISTA_B64 en index.html.
 * Uso: node scripts/generar-enlaces.mjs [URL_BASE]
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const html = readFileSync(join(root, "index.html"), "utf8");
const match = html.match(/const LISTA_B64="([^"]+)"/);
if (!match) {
  console.error("No se encontró LISTA_B64 en index.html");
  process.exit(1);
}

function b64d(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return Buffer.from(s, "base64").toString("utf8");
}

const lista = JSON.parse(b64d(match[1]));
const base = (process.argv[2] || "https://davanegasa.github.io/boda-andy-danny/").replace(/\/?$/, "/");

let md = `# Enlaces personalizados por familia

Generado automáticamente desde \`LISTA_B64\` en \`index.html\`.

| # | Familia / invitado | Puestos | Niños | Enlace |
|---:|---|---:|---:|---|
`;

for (let i = 0; i < lista.length; i++) {
  const [nombre, puestos, ninos] = lista[i];
  const n = i + 1;
  const url = `${base}?f=${n}`;
  md += `| ${n} | ${nombre} | ${puestos} | ${ninos} | [?f=${n}](${url}) |\n`;
}

const outDir = join(root, "docs");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "ENLACES-INVITADOS.md"), md);
console.log(`Listo: ${lista.length} enlaces → docs/ENLACES-INVITADOS.md`);
