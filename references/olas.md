# Las olas

La ola es el elemento que define Marea. Hay dos: el **divisor** (delgado, solo
separa) y la **ola figura** (alta, lleva contenido). Se implementan distinto.

## 1. El divisor

SVG a todo el ancho, estirado sin conservar proporción, subido exactamente su
propia altura para comerse la costura entre dos secciones.

```css
.ola {
  --alto: clamp(40px, 6vw, 74px);
  position: relative;
  z-index: 2;
  height: var(--alto);
  margin-top: calc(-1 * var(--alto));
  line-height: 0;
  pointer-events: none;
}
.ola svg { display: block; width: 100%; height: 100%; }

/* Variante ancha: la banda tras el hero */
.ola--cinta { --alto: clamp(70px, 9vw, 130px); }
```

```html
<div class="ola">
  <svg viewBox="0 0 1920 74" preserveAspectRatio="none" aria-hidden="true">
    <path fill="var(--color-bg-alt)"
          d="M0,32 C480,-12 960,76 1440,40 C1680,22 1800,18 1920,26 L1920,74 L0,74 Z"/>
  </svg>
</div>
```

Cuatro detalles que no son opcionales:

- **`preserveAspectRatio="none"`** — la ola tiene que estirarse al ancho del
  viewport. Sin esto se recorta o deja aire a los lados.
- **`line-height: 0`** — un SVG en flujo es *inline*: se apoya en una línea base
  y deja unos píxeles de la sección de atrás asomando debajo. Es el fallo más
  común y el más difícil de ver.
- **`margin-top` negativo igual a la altura** — la ola no ocupa espacio propio,
  se come el final de la sección anterior.
- **`pointer-events: none`** — si no, la ola tapa los enlaces que quedan debajo.

**El relleno del `path` es el color de la sección de ABAJO.** La ola es el borde
superior de lo que viene, no el inferior de lo que se va. Equivocarse acá
produce un resultado que se ve "casi bien" y nadie sabe por qué está mal.

### La curva

Una ola creíble tiene **crestas desiguales**. Una onda sinusoidal perfecta se
lee como decoración de software. La del sitio original desciende de izquierda a
derecha con dos crestas de distinta amplitud.

Esta es la banda de doble onda del compuesto real, tomada tal cual (viewBox
`0 0 1947.63 775.6`):

```
M1947.63,740.18
C1298.42,452.98, 649.21,931.07, 0,643.87
c0,-54.66 0,-109.33 0,-163.99
c649.21,222.99 1298.42,-319.31 1947.63,-96.31
v356.62 Z
```

Es una **cinta**: dos curvas paralelas separadas por una altura constante, no un
relleno hasta el borde inferior. Esa cinta es la que puede llevar textura y
texto adentro.

## 2. La ola figura

La pieza de autor del sistema. Una cinta curva alta que lleva:

- relleno de textura (una imagen recortada por la propia cinta),
- un eslogan cursivo que cabalga la curva,
- opcionalmente una persona recortada que sobresale por arriba y por abajo.

```css
.ola-figura {
  position: relative;
  z-index: 3;
  /* Solape en valor FIJO, no en %: los márgenes en porcentaje se calculan
     contra el ANCHO del contenedor, no su alto, y un -9% se traga entera una
     sección corta. */
  margin-top: clamp(-90px, -9vw, -50px);
  height: clamp(150px, 19vw, 220px);
  display: block;
  pointer-events: none;
}
.ola-figura__forma { position: absolute; inset: 0; width: 100%; height: 100%; }
.ola-figura__forma path { fill: var(--ola-color, var(--color-primary-dark)); }
```

### El eslogan sobre la curva

Acá está el 80 % del trabajo. El texto **no** va en un `<div>` rotado: va en un
`<textPath>` sobre una curva propia, paralela a la cresta.

```html
<svg viewBox="0 0 1947.63 775.6" aria-hidden="true">
  <defs>
    <!-- Curva SOLO para el texto: paralela a la cresta, desplazada hacia
         adentro de la cinta. No reutilices el path de la ola. -->
    <path id="curva-eslogan" fill="none"
          d="M677.82,639.62 Q900,608 1200,570 Q1500,530 1800,566 L1945,619"/>
    <clipPath id="recorte-cinta">
      <path d="M1947.63,740.18C1298.42,452.98,649.21,931.07,0,643.87c0-54.66,0-109.33,0-163.99,649.21,222.99,1298.42-319.31,1947.63-96.31v356.62Z"/>
    </clipPath>
  </defs>

  <!-- 1. relleno de textura, recortado por la cinta -->
  <g clip-path="url(#recorte-cinta)">
    <image href="/assets/decor/ola-textura.webp" width="1948" height="412" x="0" y="328.6"/>
  </g>

  <!-- 2. el eslogan -->
  <text style="font-family:var(--font-cursiva)" fill="#fff" font-size="101">
    <textPath href="#curva-eslogan">El orgullo de alimentar bien.</textPath>
  </text>
</svg>
```

**La curva del texto es un path aparte.** Tiene que ser paralela a la cresta
pero desplazada hacia dentro; si reutilizas el path de la ola, el texto se apoya
en el borde y se sale de la cinta en las crestas.

**Construye la curva con cuadráticas cortas (`Q`), no con una cúbica larga.** Una
sola `C` para todo el ancho hace que el espaciado de letras se apelotone en la
parte curva y se estire en la recta. Una docena de `Q` mantiene la velocidad
razonablemente constante.

### Cuando el eslogan va sobre fondo claro

Si la cinta es clara o el texto cae sobre la textura, hace falta halo. Dos
copias del mismo texto, la de atrás con trazo grueso:

```html
<g style="font-family:var(--font-cursiva);stroke:#fff;stroke-width:24px;
          stroke-linecap:round;stroke-linejoin:round" fill="#fff" font-size="104.98">
  <text><textPath href="#curva-eslogan">De la cáscara al empaque</textPath></text>
</g>
<g style="font-family:var(--font-cursiva)" fill="var(--color-primary-dark)" font-size="104.98">
  <text><textPath href="#curva-eslogan">De la cáscara al empaque</textPath></text>
</g>
```

El trazo grueso engorda la letra hacia **afuera y hacia adentro**, así que la
copia de color va encima para recuperar el peso original. `stroke-linejoin:round`
evita las púas en los vértices de la cursiva.

### La persona recortada

```css
.ola-figura__persona {
  position: absolute;
  left: clamp(.5rem, 4vw, 3rem);
  bottom: 0;
  height: 118%;              /* sobresale por arriba a propósito */
  width: auto;
  max-width: 240px;
  object-fit: contain;
  object-position: bottom;
  filter: drop-shadow(0 10px 12px rgba(0, 0, 0, .25));
}
```

El `118%` es el truco: la figura **rompe** el borde superior de la ola. Si la
encierras dentro, el efecto desaparece.

Cuando la figura va dentro del SVG como `<image>`, recórtala con un `clipPath`
propio para que no tape la curva por abajo.

### Variante sin persona

Texto a la izquierda y espigas (o el motivo vegetal que corresponda) a la
derecha:

```css
.ola-figura__texto--izquierda { right: auto; left: clamp(1rem, 6vw, 6rem); text-align: left; }
.ola-figura__espigas {
  position: absolute; right: clamp(.5rem, 4vw, 3rem); bottom: -8%;
  width: clamp(90px, 16vw, 200px); height: auto;
  filter: drop-shadow(0 6px 8px rgba(0, 0, 0, .18));
}
```

El `bottom: -8%` hace que el motivo cuelgue por debajo de la ola. Otra vez:
romper el borde, no respetarlo.

## 3. Móvil

La ola figura no aguanta debajo de ~640 px sin ajuste: el texto cursivo se hace
ilegible y la persona ocupa media pantalla.

```css
@media (max-width: 640px) {
  .ola-figura           { height: clamp(120px, 30vw, 160px); margin-top: -46px; }
  .ola-figura__persona  { max-width: 120px; left: .4rem; }
  .ola-figura__texto    { font-size: 1.25rem; right: .7rem; max-width: 62%; }
}
```

Si el eslogan sigue sin caber, **quítalo en móvil** antes que encogerlo más. Una
ola limpia se ve bien; una ola con letra ilegible se ve rota.

## 4. Errores que vas a cometer

| Síntoma | Causa |
|---|---|
| Línea de píxeles del color anterior bajo la ola | falta `line-height: 0` |
| La ola deja aire a los lados | falta `preserveAspectRatio="none"` |
| La ola tapa enlaces | falta `pointer-events: none` |
| Se ve "casi bien" pero rara | el `fill` es el color de arriba, debe ser el de abajo |
| Una sección corta desaparece | `margin-top` en % — se calcula contra el ancho |
| El eslogan se sale en las crestas | reutilizaste el path de la ola para el texto |
| Letras apelotonadas en la curva | una sola cúbica larga en vez de varias `Q` |
| La textura no se ve | el `<image>` está fuera del `clip-path`, o el SVG va por `<img>` |

Ese último merece énfasis: **un SVG cargado con `<img>` es un documento
aislado**. No ve tus custom properties, no hereda tus fuentes y su
`mix-blend-mode` no alcanza el fondo de la página. Las olas con texto o con
tokens van **inline**, siempre.
