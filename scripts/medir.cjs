#!/usr/bin/env node
/**
 * Marea — measuring harness / arnés de medición
 *
 * Opens a page at several widths and prints the geometry of the selectors you
 * ask for, as a fraction of the viewport AND of the parent. That second column
 * is the one you compare against a vector composite: designs are proportional,
 * and a raw pixel number tells you nothing at another width.
 *
 * Abre una página en varios anchos e imprime la geometría de los selectores que
 * le pidas, como fracción del viewport Y del padre. Esa segunda columna es la
 * que se compara contra el compuesto.
 *
 * Usage:
 *   node medir.cjs <url> <selectores separados por coma> [--anchos 900,1280,1920]
 *   node medir.cjs http://localhost:8080/ ".ola-figura,.card-marca--home"
 *
 * Requires playwright: npm i -D @playwright/test
 */

'use strict';

const ANCHOS_POR_DEFECTO = [360, 768, 900, 1100, 1280, 1440, 1920];

function parseArgs(argv) {
  const libres = [];
  let anchos = ANCHOS_POR_DEFECTO;

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--anchos') {
      anchos = (argv[++i] || '').split(',').map(Number).filter((n) => n > 0);
    } else {
      libres.push(argv[i]);
    }
  }

  return { url: libres[0], selectores: (libres[1] || '').split(',').map((s) => s.trim()).filter(Boolean), anchos };
}

/**
 * Playwright rarely lives next to this script: the skill gets cloned into
 * .claude/skills/, which has no node_modules of its own. So resolve from the
 * project being measured (cwd) and from NODE_PATH before giving up.
 */
function cargarChromium() {
  const { createRequire } = require('module');
  const path = require('path');

  const candidatos = [
    () => require('@playwright/test'),
    () => createRequire(path.join(process.cwd(), 'noop.js'))('@playwright/test'),
    () => createRequire(path.join(process.cwd(), 'noop.js'))('playwright'),
  ];

  for (const base of (process.env.NODE_PATH || '').split(path.delimiter).filter(Boolean)) {
    candidatos.push(() => require(path.join(base, '@playwright', 'test')));
  }

  for (const intentar of candidatos) {
    try {
      const mod = intentar();
      if (mod && mod.chromium) { return mod.chromium; }
    } catch { /* siguiente candidato */ }
  }
  return null;
}

async function main() {
  const { url, selectores, anchos } = parseArgs(process.argv.slice(2));

  if (!url || !selectores.length) {
    console.error('uso: node medir.cjs <url> "<sel1,sel2>" [--anchos 900,1280]');
    process.exit(1);
  }

  const chromium = cargarChromium();
  if (!chromium) {
    console.error('No encuentro @playwright/test.');
    console.error('  · instálalo en el proyecto:  npm i -D @playwright/test');
    console.error('  · o apunta a una instalación existente:  NODE_PATH=/ruta/node_modules');
    process.exit(1);
  }

  const navegador = await chromium.launch();

  for (const ancho of anchos) {
    const pagina = await navegador.newPage({
      viewport: { width: ancho, height: Math.round(ancho * 0.62) },
    });

    await pagina.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    // Fonts change metrics. Measuring before they settle gives you numbers that
    // look stable and are wrong.
    await pagina.evaluate(() => document.fonts.ready);
    await pagina.waitForTimeout(250);

    const filas = await pagina.evaluate((sels) => {
      const salida = [];

      for (const sel of sels) {
        document.querySelectorAll(sel).forEach((el, i) => {
          const r = el.getBoundingClientRect();
          const padre = el.parentElement ? el.parentElement.getBoundingClientRect() : r;
          const cs = getComputedStyle(el);

          salida.push({
            sel: sel + (i ? `[${i}]` : ''),
            w: +r.width.toFixed(2),
            h: +r.height.toFixed(2),
            // Fraction of the viewport — compare against vw in the composite.
            vw: +(r.width / window.innerWidth * 100).toFixed(4),
            // Fraction of the parent — compare against cqw / % in the composite.
            pct: padre.width ? +(r.width / padre.width * 100).toFixed(4) : null,
            ratio: r.height ? +(r.width / r.height).toFixed(5) : null,
            fs: cs.fontSize,
            lh: cs.lineHeight,
          });
        });
      }

      return salida;
    }, selectores);

    console.log(`\n  ─── ${ancho}px ${'─'.repeat(Math.max(0, 52 - String(ancho).length))}`);
    if (!filas.length) {
      console.log('    (ningún elemento coincide)');
    }
    for (const f of filas) {
      console.log(
        '    ' + f.sel.padEnd(26) +
        String(f.w).padStart(9) + ' x ' + String(f.h).padEnd(9) +
        '  ' + String(f.vw).padStart(8) + 'vw' +
        '  ' + String(f.pct).padStart(8) + '%padre' +
        '  ratio ' + String(f.ratio).padStart(8) +
        '  ' + f.fs + '/' + f.lh
      );
    }

    await pagina.close();
  }

  await navegador.close();
  console.log('\n  Compara la columna %padre contra el compuesto, no los píxeles.');
  console.log('  Y ancla en el marco de PÁGINA del vector, no en el artboard.\n');
}

main().catch((e) => { console.error(e); process.exit(1); });
