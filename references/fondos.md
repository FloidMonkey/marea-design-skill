# Fondos y texturas

La textura es lo que impide que el crema se lea como color plano. Bien hecha no
se nota; mal hecha es lo único que se ve.

## 1. La banda texturizada a todo el ancho

El patrón del sistema: bandas horizontales de textura a todo el ancho, detrás de
una corrida de tarjetas, separadas por huecos de crema limpio.

```css
.productos {
  padding-top: 6.0735vw;
  padding-bottom: 10.4683vw;
  background-image: url('/assets/decor/textura-banda.webp');
  background-repeat: repeat-y;
  background-size: 100% auto;
  background-position: 0 37.2681vw;   /* desplazamiento medido del vector */
}
```

**La tesela es un periodo COMPLETO, no la banda.** Esto es lo que casi todo el
mundo hace mal. Con `repeat-y` de una banda pelada, las bandas quedan pegadas
una tras otra y desaparece el hueco de crema. La tesela tiene que incluir la
textura arriba **y la transparencia abajo**:

```
┌─────────────────┐  ← la tesela
│ textura (1078)  │
│                 │
├─────────────────┤
│ transparente    │
│ (1256)          │
└─────────────────┘  ← periodo total 2334
```

Se genera con un script de build (sharp o similar) que compone la hoja de
textura sobre un lienzo transparente del alto del periodo. Ese periodo sale de
medir el vector: en el sitio original era ≈ una banda cada dos tarjetas.

**`background-size: 100% auto`** — la banda escala con el ancho de la página y
conserva su proporción. Nunca `cover` para esto: recorta impredeciblemente.

**Sirve una tesela más liviana en móvil.** La hoja de escritorio son cientos de
KB que en un teléfono no aportan nada:

```css
@media (max-width: 720px) {
  .productos { background-image: url('/assets/decor/textura-banda-720.webp'); }
}
```

## 2. Medir el periodo desde el vector

No lo estimes a ojo. Con las tarjetas ocultas, recorre el render del vector fila
por fila en tres columnas y busca dónde empieza y termina cada banda:

```js
// Dentro de la página, con el vector renderizado en un <canvas>
const ctx = canvas.getContext('2d');
const { data, width } = ctx.getImageData(0, 0, canvas.width, canvas.height);
const cols = [width * 0.2 | 0, width * 0.5 | 0, width * 0.8 | 0];
let anterior = false;
for (let y = 0; y < canvas.height; y++) {
  const conTextura = cols.some((x) => data[(y * width + x) * 4 + 3] > 8);
  if (conTextura !== anterior) console.log(conTextura ? 'inicia' : 'termina', y);
  anterior = conTextura;
}
```

Tres columnas y no una porque la textura tiene huecos: una sola columna te da
transiciones falsas.

Una comprobación que vale la pena: si el alto de banda coincide exactamente con
la hoja de textura escalada al ancho de la página, la banda **no está
recortada** y puedes usar la hoja completa. En el sitio original:
`1536 × (1926.58 / 2752) = 1075 ≈ 1078` medido. Coincide.

## 3. Texturas dentro de una forma

Cuando la textura va dentro de una ola o de una forma irregular, va en el SVG
recortada por la propia forma:

```html
<defs>
  <clipPath id="recorte-cinta"><path d="…la cinta…"/></clipPath>
</defs>
<g clip-path="url(#recorte-cinta)">
  <image href="/assets/decor/ola-textura.webp" width="1948" height="412" x="0" y="328.6"/>
</g>
```

El `<image>` va posicionado con las coordenadas del vector, no centrado a ojo.
Si la textura tiene dirección (vetas, espigas, trama diagonal), el desplazamiento
importa: moverlo 10 unidades cambia qué parte del motivo se ve.

## 4. Grounds alternos

```css
.seccion       { background: var(--color-bg); }       /* crema */
.seccion--alt  { background: var(--color-bg-alt); }   /* verde muy claro */
```

La regla: **alternar, y poner una ola en cada cambio**. Tres o más colores
seguidos sin ola se leen como rayas.

El tercer nivel (`--color-bg-alt-2`) existe pero se usa muy poco: una vez por
sitio, para la sección que tiene que destacar del ritmo.

## 5. La franja de llamada a la acción

El único bloque que va a color pleno de borde a borde:

```css
.cta-franja { background: var(--color-primary); color: #fff; text-align: center; }
.cta-franja h2 { color: #fff; }
.cta-franja .container { padding-block: clamp(2.5rem, 6vw, 4rem); }

/* Variante de alto impacto: amarillo con texto verde */
.cta-franja--home { background: var(--color-accent); color: var(--color-primary-dark); }
```

La variante amarilla es la aparición más fuerte del acento en todo el sitio.
**Una por página como máximo**, y no en todas las páginas.

## 6. Optimización

Reglas que el proyecto original impuso y que conviene heredar:

- Originales de cámara **nunca** se publican. Viven fuera del artefacto
  desplegable y se ignoran en git.
- Solo se publican variantes de pipeline: **WebP + JPEG de respaldo, ≤ 300 KB**.
- Las texturas son el caso más pesado: prueba bajarles la resolución antes que
  subir la compresión. Una textura al 60 % de resolución es indistinguible; la
  misma con artefactos de JPEG se ve sucia sobre crema.
- Versiona los assets por `mtime` en la URL (`?v=…`) para que cada cambio
  invalide la caché del navegador solo.
