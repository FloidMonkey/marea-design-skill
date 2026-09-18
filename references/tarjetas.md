# Las tarjetas

Cuatro recetas. Todas comparten una idea: la tarjeta no es una caja con borde,
es una composición con una zona de color.

## 1. Tarjeta de marca — logo arriba, franja de color abajo

La más reutilizable del sistema. Logo sobre blanco, pie verde oscuro con nombre
y descriptor.

```css
.card-marca--home {
  padding: 0; gap: 0; border-radius: 1.5rem; overflow: hidden;
  display: flex; flex-direction: column;

  /* Proporción tomada del vector. Con un ancho libre la tarjeta se infla y el
     pie se llena de aire muerto, así que va con tope. */
  width: 100%; max-width: 273.26px; justify-self: center;
  aspect-ratio: 273.26 / 324.3;
  container-type: inline-size;
}

.card-marca--home img {
  flex: 1 1 auto;
  min-height: 0;                    /* imprescindible, ver abajo */
  width: 100%; height: 100%;
  object-fit: contain;
  padding: 1.25rem 1rem .5rem;
  box-sizing: border-box;
}

.card-marca--home__pie {
  flex: 0 0 31.4%;                  /* alto FIJO, no elástico */
  align-self: stretch; min-height: 0;
  background: var(--color-primary-dark);
  display: flex; flex-direction: column;
  align-items: center; text-align: center; gap: .2rem;
  padding: clamp(.45rem, 4.3cqw, .7rem) 1rem clamp(.5rem, 6cqw, .8rem);
}

.card-marca--home .card-marca__nombre {
  color: #fff;
  font-size: clamp(.75rem, 7.354cqw, 1.2563rem);
  line-height: 1.25;
}
.card-marca--home .card-marca__descriptor {
  color: var(--color-accent);
  font-size: clamp(.62rem, 6.257cqw, 1.069rem);
  line-height: 1.2;
}
```

Cuatro decisiones que costaron rondas de corrección:

**`justify-self: center` necesita `width: 100%`.** Centrar un elemento de grilla
le quita el estirado; sin ancho propio colapsa a cero. Si tu tarjeta desaparece,
es esto.

**El pie va en `flex-basis` fijo, no elástico.** Con `flex: 0 0 auto` el pie
crece cuando el descriptor ocupa dos líneas, y en una fila las franjas quedan
desalineadas entre tarjetas — se ve pésimo. Se fija el porcentaje al peor caso
medido (dos líneas) y todas quedan iguales.

**`min-height: 0` en la imagen.** En una columna flex de alto acotado, un `<img>`
sin `min-height: 0` impone un piso de `min-content` que varía por archivo y
aplasta a sus hermanos. El síntoma es un pie más corto en unas tarjetas que en
otras, sin causa aparente.

**El `31.4 %` sale del peor ancho, no del más grande.** El relleno del pie va en
`clamp()` de `rem` y el texto en `cqw`: no escalan juntos. Entre 1280 y 1440 el
relleno ocupa proporcionalmente más que a 1920. Calibra ahí.

**`container-type` y `padding` en `cqw` no pueden ir en el mismo elemento**: es
una dependencia circular que Chromium colapsa. Por eso el `container-type` vive
en la tarjeta y el `padding: cqw` en el pie.

## 2. Tarjeta de corchete — el marco abierto

Para valores, principios, atributos. Un corchete amarillo abierto enmarca el
contenido, y el icono rompe el borde superior.

```html
<article class="valor-item">
  <!-- El marco: trazo, no relleno; las esquinas superiores quedan ABIERTAS -->
  <svg class="valor-item__marco" viewBox="-1 -1 303.3 451.541"
       preserveAspectRatio="none" fill="none"
       stroke="var(--color-accent)" stroke-width="2" aria-hidden="true">
    <path d="M252.64,0c26.87,0,48.66,21.78,48.66,48.66v352.22c0,26.87-21.78,48.66-48.66,48.66H48.66c-26.87,0-48.66-21.78-48.66-48.66V48.66C0,21.78,21.78,0,48.66,0"/>
  </svg>

  <!-- El icono sobresale por arriba: margen negativo en % del ANCHO -->
  <div class="valor-item__hueco">
    <div class="valor-item__icono"><!-- svg del icono --></div>
  </div>

  <h3>Compromiso</h3>
  <p>…</p>
</article>
```

```css
.valor-item { position: relative; padding: 0 .5859vw 1.125rem; }
.valor-item__marco { position: absolute; inset: 0; width: 100%; height: 100%; }

.valor-item__hueco {
  width: 100%; display: flex; align-items: flex-end; justify-content: center;
  aspect-ratio: 100 / 47.4544;
  margin-bottom: -14.2715%;
  color: var(--color-primary-dark);
}
.valor-item__icono svg { width: 100%; height: auto; display: block; }
```

**El `path` no cierra.** Empieza y termina en el borde superior sin unirlos: ese
hueco es por donde asoma el icono. Un `Z` al final arruina el efecto.

**El `viewBox` empieza en `-1 -1`** para que el trazo de 2 px no se recorte a la
mitad contra el borde de la caja.

**El icono nunca lleva atributos `width`/`height`.** Con `height: auto` en CSS,
Chrome usa la proporción intrínseca de los atributos y te renderiza el icono
cuadrado. Ese bug se coló dos veces en el proyecto original.

**El relleno inferior va en `rem`, no en un `calc()` con `vw` negativo.** Un
`calc(1.5rem + 6vw - 120px)` se vuelve negativo bajo ~800 px, se colapsa a cero
y el texto se monta sobre la curva del corchete.

## 3. Bloque de producto — foto arriba, panel abajo

Tarjeta grande y redondeada: fotografía de familia arriba, panel blanco de
presentaciones abajo, ambos recortados por el radio.

```css
.producto-bloque {
  container-type: inline-size;         /* todo lo interno va en cqw */
  border-radius: 4.9488cqw;
  overflow: hidden;
  border: .0986cqw solid #005d30;
}
.producto-bloque__foto  { position: relative; height: 53.2462cqw; }
.producto-bloque__panel { height: 29.261cqw; }
.producto-bloque__panel--dos-filas { height: 61.6697cqw; }

.producto-item__foto {
  flex: 0 0 auto;
  aspect-ratio: 1.19568;
}
.producto-item__foto img {
  width: var(--foto-ancho, 44%);       /* ancho por presentación, del vector */
  max-width: none;
}
```

**Todo en `cqw`, nada en `vw`.** Así el bloque conserva sus proporciones
independiente del viewport, que es lo que permite que la misma tarjeta funcione
en una grilla de 1, 2 o 4 columnas.

**El texto va en `cqw` sin piso de `clamp()`.** Un piso deja de escalar en los
anchos intermedios, cambia el número de líneas y deforma una tarjeta ya medida.
Es contraintuitivo (normalmente quieres un piso de legibilidad) pero en una
tarjeta de proporción fija el piso es el que rompe.

**Cada presentación lleva su ancho medido.** Los empaques no son del mismo
tamaño: una bolsa de 2 kg y un saco de 45 kg deben verse proporcionados entre
sí. Se mide el ancho de tinta de cada uno en el vector y se pasa como custom
property. No los normalices: perder esa relación es perder la información.

## 4. Franja de cifras — sin cajas

Iconos con un dato de dos pesos. Sin bordes, sin fondo, sin separadores.

```css
.stats__icono svg { width: 100%; height: auto; display: block; }
.stats__dato   { margin: 0; text-align: center; }
.stats__fuerte,
.stats__debil  { line-height: .8962; }           /* muy ajustado, del vector */
.stats__fuerte { font-family: var(--font-headline); font-weight: 800; }
.stats__debil  { font-weight: 500; }
```

El `line-height` por debajo de 1 es deliberado: las dos líneas del dato tienen
que leerse como **una unidad**, no como dos renglones. Es lo que hace que la
franja funcione sin cajas que la ordenen.

Cuando una etiqueta necesita quebrarse en un punto concreto, pasa el texto como
arreglo y une con `"<br>\n"` — nunca con `implode('<br>', …)` a secas, porque en
`textContent` las palabras quedan pegadas ("todoslos niveles") y rompe cualquier
prueba que compare texto.

## 5. La tarjeta base

Para grillas simples (clientes, logos):

```css
.card-marca {
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.5rem 1rem;
  text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: .8rem;
  border-top: 4px solid var(--color-primary);
}
.card-marca img { height: 90px; width: 100%; object-fit: contain; }
```

**El área del logo es de altura FIJA.** Es lo que alinea los nombres entre
tarjetas cuando los logos tienen proporciones distintas. Un cliente sin logo
lleva un placeholder de la misma altura, no un hueco.

Nota honesta sobre el `border-top: 4px` con `border-radius`: el borde sigue la
curva y **se afina hasta desaparecer** en las esquinas, porque los lados no
tienen borde que lo continúe. A tamaño real casi no se nota. Si te molesta, las
salidas son borde de 1 px en las cuatro caras más la franja arriba, o el acento
como `box-shadow: inset 0 4px 0`. Las dos respetan el radio.
