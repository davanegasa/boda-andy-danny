# Invitación digital — Andrés Mauricio & Karen Daniela

Sitio web estático con la invitación de boda. Un solo archivo HTML autocontenido (fuentes e imágenes embebidas en base64) desplegado en GitHub Pages.

**Repositorio:** [github.com/davanegasa/boda-andy-danny](https://github.com/davanegasa/boda-andy-danny)

## Contenido de la invitación

| Sección | Descripción |
|---------|-------------|
| **Portada** | Nombres, mensaje de bienvenida y fecha del evento |
| **Mensaje** | Texto personal y versículo (Eclesiastés 4:9) |
| **Cuenta regresiva** | Días, horas, minutos y segundos hasta la boda |
| **Lugares** | Ceremonia (siempre visible); recepción y mapa (solo invitados de lista) |
| **Dress code** | Traje formal; verde oliva y blanco reservados para los novios |
| **RSVP** | Confirmación por WhatsApp con fecha límite el **20 de julio** |

### Datos del evento

| | |
|---|---|
| **Fecha** | Sábado 1 de agosto de 2026, 2:00 PM (hora Colombia, UTC−5) |
| **Ceremonia** | Iglesia La Biblia Dice — Ac 116 #70C-58, Suba, Bogotá |
| **Recepción** | Cl 86A #69T-41, Bogotá — 4:00 PM |
| **RSVP** | WhatsApp +57 304 579 7493 |

## Estructura del repositorio

```
.
├── index.html              # Invitación principal (archivo único ~700 KB)
├── opcion-1/index.html     # Redirección a la raíz (compatibilidad)
├── enlaces/
│   ├── index.html          # Página para organizadores (descargar CSV)
│   └── invitados.csv       # Lista exportable para Excel / WhatsApp
├── docs/
│   ├── PERSONALIZACION.md  # Parámetros URL y edición de la lista
│   ├── ENLACES-INVITADOS.md # Tabla de enlaces ?f=1 … ?f=79
│   └── ENLACES-INVITADOS.csv # Mismo CSV que enlaces/invitados.csv
└── scripts/
    └── generar-enlaces.mjs # Regenera MD, CSV y página de descarga
```

## Tipos de enlace

### Genérico (sin parámetros)

```
https://davanegasa.github.io/boda-andy-danny/
```

Muestra solo la **ceremonia**. No incluye recepción, mapa ni banner personalizado. El mensaje de WhatsApp es genérico.

### Personalizado por código de familia (recomendado)

```
https://davanegasa.github.io/boda-andy-danny/?f=14
```

- `f` es el número de fila en la lista (1–79).
- Muestra banner con nombre, puestos reservados y niños.
- Revela recepción y mapa esquemático.
- Personaliza el mensaje de confirmación por WhatsApp.

**Descargar enlaces:** [enlaces/](enlaces/) (página con botón CSV) · [docs/ENLACES-INVITADOS.csv](docs/ENLACES-INVITADOS.csv) · [docs/ENLACES-INVITADOS.md](docs/ENLACES-INVITADOS.md)

### Personalizado manual (parámetro `i`)

```
https://davanegasa.github.io/boda-andy-danny/?i=eyJuIjoiSm9zw6kgUMOpcmV6IiwicCI6MiwiayI6MCwidCI6ImEifQ
```

JSON en base64 URL-safe: `{ "n": "nombre", "p": puestos, "k": niños, "t": "a"|"f" }`

- `t: "f"` → familia/lista (muestra recepción y mapa).
- `t: "a"` → amigos (solo ceremonia).

Detalle en [docs/PERSONALIZACION.md](docs/PERSONALIZACION.md).

## Despliegue

El sitio es HTML estático. Con GitHub Pages activado en la rama `main` y carpeta raíz, cada push publica automáticamente.

Para probar en local:

```bash
# Python
python3 -m http.server 8080

# o Node
npx serve .
```

Abrir `http://localhost:8080/?f=1` para ver una invitación personalizada.

## Mantenimiento

### Cambiar fecha, WhatsApp o lista de invitados

Editar las constantes al final de `index.html`:

```javascript
const FECHA_BODA = "2026-08-01T14:00:00-05:00";
const WHATSAPP_RSVP = "573045797493";
const LISTA_B64 = "..."; // [nombre, puestos, niños] × N familias
```

Tras modificar `LISTA_B64`, regenerar la tabla, el CSV y la página de descarga:

```bash
node scripts/generar-enlaces.mjs
```

### Descargar la lista de enlaces

| Método | Dónde |
|--------|--------|
| **Página web** | `https://davanegasa.github.io/boda-andy-danny/enlaces/` — tabla + botón «Descargar CSV» |
| **CSV directo** | [docs/ENLACES-INVITADOS.csv](docs/ENLACES-INVITADOS.csv) o [enlaces/invitados.csv](enlaces/invitados.csv) |
| **GitHub** | Abrir el CSV en el repo → botón **Raw** → guardar archivo |
| **Local** | `node scripts/generar-enlaces.mjs` y abrir `enlaces/invitados.csv` en Excel |

La página `enlaces/` no está enlazada desde la invitación pública (solo para organizadores).

### Notas de la revisión técnica

- **Archivo monolítico:** `index.html` incluye fuentes WOFF2 e imágenes JPEG en base64; no depende de CDN ni assets externos (salvo Google Maps y WhatsApp).
- **HTML sin envoltorio:** el archivo no declara `<!doctype>`, `<html>`, `<head>` ni `<body>`; los navegadores lo corrigen, pero conviene añadirlos si se refactoriza.
- **Estilos de borrador:** quedan reglas CSS para `.toggle-version` y `body[data-version="amigos"]` sin uso en el HTML actual.
- **Mapa:** es un SVG esquemático; la nota en la invitación indica que la ruta real de Google Maps está pendiente.
- **`opcion-1/`:** conserva enlaces antiguos; redirige a `../` preservando query string y hash.

## Historial de diseño

El proyecto pasó por un selector con cuatro opciones de diseño; la **opción 1** (nombres completos, paleta oliva) quedó como versión final en la raíz. Los borradores fueron eliminados del repositorio.
