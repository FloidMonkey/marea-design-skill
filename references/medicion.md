# Medir desde un compuesto vectorial

Cuando existe un compuesto de diseño (Illustrator, Figma, PDF), **el compuesto
manda** — incluso por encima de ajustes previos hechos a mano, incluso los del
propio cliente. Si algo contradice una decisión anterior, dilo y vuelve a medir;
no negocies con el número.

## Las cuatro reglas

### 1. Ancla en la caja correcta

El error más caro y el más invisible. Un artboard suele ser más ancho que la
página que contiene: márgenes de sangrado, marcas de registro, una mesa de
trabajo con aire.

```
artboard   1952.73  ← lo que mide el archivo
página     1920.00  ← lo que se publica  ← DIVIDE POR ESTE
```

Dividir por el artboard en vez de por el marco de página dejó una franja entera
1,7 % pequeña en el proyecto original. Nadie lo ve a ojo; se ve al superponer.

Localiza el marco de página como un rectángulo real del vector (a menudo tiene
un `x` distinto de 0, por ejemplo `x=21.05`) y usa **ese** como origen y como
divisor. Para un bloque interno, ancla en el rectángulo del panel, no en la
página.

### 2. Compara tinta contra tinta

- En canvas: `ctx.measureText(t).actualBoundingBoxLeft/Right` → extensión de
  **tinta**.
- En SVG: `elemento.getBBox()` → extensión de **tinta**.
- `ctx.measureText(t).width` → **avance**, que incluye el espacio lateral.

Comparar un avance contra una tinta te da un error del 2–4 % que vas a
interpretar como diferencia de kerning. No lo es.

### 3. El texto vectorial se mide por su ancla y su línea base

`getBBox()` de un `<text>` te da la caja de la tinta, que depende de qué letras
tiene. Para posicionar, usa el **ancla** (`x`, `y` del elemento, más el
`transform`) y la línea base. Dos titulares con el mismo ancla y distinta altura
de tinta están alineados, aunque sus `getBBox()` no coincidan.

### 4. Verifica en reverso

Rompe la cosa a propósito y confirma que la comprobación falla.

Una prueba del proyecto original pasaba con el valor correcto **y** con el valor
revertido: el tamaño venía de un `sizes` del `srcset` derivado de los mismos
porcentajes que la prueba validaba. Se validaba a sí misma. Solo la verificación
en reverso lo destapó.

Si al romperlo la prueba sigue verde, la prueba no existe.

## Kerning: el vector y el navegador no coinciden

Illustrator kernea **1,4–2 % más apretado** que un navegador en tamaños de
display. A tamaños pequeños ocurre lo contrario: el eje de tamaño óptico de la
fuente ensancha el texto proporcionalmente.

Consecuencia práctica: **un salto de línea forzado calibrado a 1920 se rompe
entre 1100 y 1440.** Si el diseño tiene quiebres manuales, prueba esos anchos
antes de darlos por buenos.

No persigas el 100 %. Un 1–2 % de diferencia en el ancho de un titular es el
comportamiento normal del texto; gastar horas ahí es perder el tiempo que
necesitas para el ritmo vertical, que sí se nota.

## Anchos de prueba

```
360   480   768   900   1100   1280   1440   1920
```

Los cuatro del medio son donde vive el problema. 360/1440/1920 son los que todo
el mundo prueba y donde casi nada falla.

## Convertir una medida del vector

```
valor_css = medida_vector / ancho_del_marco_de_pagina * 100     → vw
valor_css = medida_vector / ancho_de_la_tarjeta      * 100      → cqw
```

Usa `cqw` (con `container-type: inline-size`) siempre que el bloque deba
conservar su proporción independiente del viewport — tarjetas, paneles,
cualquier cosa que aparezca en grillas de distinto número de columnas. Usa `vw`
solo para lo que realmente se mide contra la página: el ritmo de secciones, las
franjas a todo el ancho.

Deja el número con cuatro decimales (`9.8406vw`). No es precisión falsa: es la
huella de que salió de una medición y no de un tanteo, y le dice al siguiente
que lo toque que hay un origen que revisar.

## El arnés de medición

`scripts/medir.cjs` abre la página en varios anchos e imprime las cajas que le
pidas. Úsalo así:

```bash
node scripts/medir.cjs http://localhost:8080/ ".ola-figura,.card-marca--home"
```

Para comparar contra el vector, renderiza el SVG en la misma página y mide los
dos con el mismo código. Medir el vector con una herramienta y el HTML con otra
introduce diferencias que no son del diseño.

## Prototipa sin tocar el repositorio

Antes de escribir en el proyecto, inyecta la variante y captura las dos:

```js
if (variante === 'sin-borde') await page.addStyleTag({ content: '.card { border-top: 0 !important }' });
await elemento.screenshot({ path: `v-${variante}.png` });
```

Muestra ambas capturas y deja elegir. Es más rápido que discutirlo y evita
commits de ida y vuelta.

## Cuando el compuesto no existe

Algunas páginas no lo tienen. Dilo explícitamente en vez de inventar medidas:
"esta página no tiene compuesto; estas proporciones las derivé de las páginas
que sí". Deja anotado cuál es cuál. Nada envenena más un sistema de diseño que
un número inventado que después alguien trata como canónico.
