#!/usr/bin/env node
/**
 * Regenera la lista de enlaces personalizados desde LISTA_B64 en index.html.
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

function csvCell(value) {
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const lista = JSON.parse(b64d(match[1]));
const base = (process.argv[2] || "https://davanegasa.github.io/boda-andy-danny/").replace(/\/?$/, "/");

const filas = lista.map(([nombre, puestos, ninos], i) => {
  const n = i + 1;
  return { n, nombre, puestos, ninos, url: `${base}?f=${n}` };
});

// Markdown
let md = `# Enlaces personalizados por familia

Generado automáticamente desde \`LISTA_B64\` en \`index.html\`.

Descargar en CSV: [ENLACES-INVITADOS.csv](ENLACES-INVITADOS.csv) · Página web: [../enlaces/](../enlaces/)

| # | Familia / invitado | Puestos | Niños | Enlace |
|---:|---|---:|---:|---|
`;
for (const f of filas) {
  md += `| ${f.n} | ${f.nombre} | ${f.puestos} | ${f.ninos} | [?f=${f.n}](${f.url}) |\n`;
}

// CSV (BOM para Excel en español)
const csvHeader = "numero,familia,puestos,ninos,enlace\n";
const csvBody = filas
  .map((f) => [f.n, f.nombre, f.puestos, f.ninos, f.url].map(csvCell).join(","))
  .join("\n");
const csv = "\uFEFF" + csvHeader + csvBody + "\n";

// Página de descarga para organizadores
const filasTabla = filas
  .map(
    (f) =>
      `<tr><td>${f.n}</td><td>${escapeHtml(f.nombre)}</td><td>${f.puestos}</td><td>${f.ninos}</td>` +
      `<td><a href="${escapeHtml(f.url)}">${escapeHtml(f.url)}</a></td></tr>`
  )
  .join("\n");

const pagina = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Enlaces de invitación — Andy &amp; Danny</title>
  <style>
    :root{--oliva:#3e4527;--crema:#f4f2e6;--tinta:#2b2d22}
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,-apple-system,sans-serif;background:var(--crema);color:var(--tinta);line-height:1.5;padding:24px 16px 48px}
    .wrap{max-width:960px;margin:0 auto}
    h1{font-size:1.5rem;font-weight:600;margin-bottom:6px}
    p.sub{color:#5c5f4c;margin-bottom:20px;font-size:.95rem}
    .acciones{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:24px}
    .btn{
      display:inline-flex;align-items:center;gap:8px;
      background:var(--oliva);color:#fbfaf3;text-decoration:none;
      padding:12px 20px;border-radius:8px;font-weight:600;font-size:.9rem;
    }
    .btn:hover{background:#2e3420}
    .btn-sec{background:#fff;color:var(--oliva);border:1px solid #a9ad8c}
    .btn-sec:hover{background:#fbfaf3}
    .aviso{
      background:#fff;border:1px solid #dcd9c4;border-radius:8px;
      padding:14px 16px;font-size:.88rem;margin-bottom:24px;
    }
    .tabla-wrap{overflow:auto;background:#fff;border:1px solid #dcd9c4;border-radius:8px}
    table{width:100%;border-collapse:collapse;font-size:.85rem}
    th,td{padding:10px 12px;text-align:left;border-bottom:1px solid #eceadf}
    th{background:var(--oliva);color:#fbfaf3;font-weight:600;position:sticky;top:0}
    tr:last-child td{border-bottom:0}
    td a{word-break:break-all;color:var(--oliva)}
    .pie{margin-top:20px;font-size:.8rem;color:#5c5f4c}
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Enlaces de invitación</h1>
    <p class="sub">Lista para enviar por WhatsApp — ${filas.length} familias · Generado desde <code>LISTA_B64</code></p>

    <div class="aviso">
      Página solo para organizadores. No está enlazada desde la invitación pública.
      Regenerar con: <code>node scripts/generar-enlaces.mjs</code>
    </div>

    <div class="acciones">
      <a class="btn" href="invitados.csv" download="enlaces-invitacion-andy-danny.csv">Descargar CSV</a>
      <a class="btn btn-sec" href="../">Ver invitación</a>
    </div>

    <div class="tabla-wrap">
      <table>
        <thead>
          <tr><th>#</th><th>Familia / invitado</th><th>Puestos</th><th>Niños</th><th>Enlace</th></tr>
        </thead>
        <tbody>
${filasTabla}
        </tbody>
      </table>
    </div>

    <p class="pie">Última generación: ${new Date().toISOString().slice(0, 10)} · Base: ${escapeHtml(base)}</p>
  </div>
</body>
</html>
`;

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const docsDir = join(root, "docs");
const enlacesDir = join(root, "enlaces");
mkdirSync(docsDir, { recursive: true });
mkdirSync(enlacesDir, { recursive: true });

writeFileSync(join(docsDir, "ENLACES-INVITADOS.md"), md);
writeFileSync(join(docsDir, "ENLACES-INVITADOS.csv"), csv);
writeFileSync(join(enlacesDir, "invitados.csv"), csv);
writeFileSync(join(enlacesDir, "index.html"), pagina);

console.log(`Listo: ${filas.length} enlaces`);
console.log("  → docs/ENLACES-INVITADOS.md");
console.log("  → docs/ENLACES-INVITADOS.csv");
console.log("  → enlaces/index.html (página de descarga)");
console.log("  → enlaces/invitados.csv");
