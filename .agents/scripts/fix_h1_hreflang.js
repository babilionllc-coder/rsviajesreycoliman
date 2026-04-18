#!/usr/bin/env node
/**
 * fix_h1_hreflang.js
 * Two one-shot SEO fixes:
 * 1. Add a semantic, visually-accessible H1 immediately after <body> on
 *    landing pages that currently have zero H1 (SPA templates rendered by JS).
 * 2. Remove the incorrect `hreflang="en"` alternate link on every page
 *    (site is Spanish-only — rsviajes.yaml says languages:[es]).
 *    Keep the `hreflang="es"` self-reference + `x-default` pointing to ES.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

// Pages that need an H1 injected + the copy to use.
// All keywords are grounded in rsviajes.yaml priority_target_keywords.
const H1_MAP = {
  'tour.html':
    'Tours desde Colima — Itinerario, Fechas y Precios | RS Viajes Rey Colimán',
  'viaje.html':
    'Detalles del Viaje — Itinerario, Precios y Fechas de Salida | RS Viajes Rey Colimán',
  'revista.html':
    'Revista Digital de Viajes desde Colima — Destinos, Guías y Ofertas',
  'mas-destinos.html':
    'Más Destinos desde Colima — Cruceros, Luna de Miel y Viajes de Graduación',
  'viajes-internacionales.html':
    'Viajes Internacionales desde Colima — Paquetes a Europa, Asia y Medio Oriente',
  'viajes-nacionales.html':
    'Viajes Nacionales — Cancún, Los Cabos, Riviera Maya y Playa del Carmen desde Colima',
};

// Visually-hidden-but-accessible H1 (WCAG sr-only pattern, clip method).
// Google treats this pattern as legitimate content (not hidden-text spam).
const h1Block = (copy) =>
  `    <!-- SEO: accessible H1 (screen-reader class) -->\n` +
  `    <h1 style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;">${copy}</h1>\n`;

let changed = 0;

// --- Step 1: inject H1 on landing pages ---
for (const [filename, copy] of Object.entries(H1_MAP)) {
  const fp = path.join(ROOT, filename);
  if (!fs.existsSync(fp)) {
    console.log(`⚠️  skip (missing): ${filename}`);
    continue;
  }
  let html = fs.readFileSync(fp, 'utf8');

  // Idempotent: skip if we already injected a visible H1.
  if (/<h1\b/i.test(html)) {
    console.log(`✓  already has <h1>: ${filename}`);
    continue;
  }

  const bodyRe = /(<body[^>]*>\s*\n)/i;
  if (!bodyRe.test(html)) {
    console.log(`⚠️  no <body> match: ${filename}`);
    continue;
  }

  html = html.replace(bodyRe, `$1${h1Block(copy)}`);
  fs.writeFileSync(fp, html);
  console.log(`+  injected H1: ${filename}`);
  changed++;
}

// --- Step 2: remove wrong hreflang="en" alternate on every .html ---
function walk(dir, acc = []) {
  const SKIP = new Set([
    'node_modules', '.git', '.github', '.agents', '.vercel',
    'Remotion', 'instagram-stories', 'report', 'scraped_html', 'reports',
  ]);
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir)) {
    if (SKIP.has(entry)) continue;
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, acc);
    else if (entry.endsWith('.html')) acc.push(full);
  }
  return acc;
}

const htmlFiles = walk(ROOT);
// Match a single <link rel="alternate" hreflang="en" ... /> line
// on its own — whitespace-only prefix and trailing newline consumed.
const hreflangEnRe =
  /^[ \t]*<link\s+rel="alternate"\s+hreflang="en"[^>]*\/>\s*\n/gim;

let hreflangFixed = 0;
for (const fp of htmlFiles) {
  const before = fs.readFileSync(fp, 'utf8');
  if (!hreflangEnRe.test(before)) continue;
  hreflangEnRe.lastIndex = 0; // reset global regex
  const after = before.replace(hreflangEnRe, '');
  if (after !== before) {
    fs.writeFileSync(fp, after);
    hreflangFixed++;
    console.log(`-  removed hreflang="en": ${path.relative(ROOT, fp)}`);
  }
}

console.log(`\n✅ done: ${changed} H1 injections, ${hreflangFixed} hreflang-en removals`);
