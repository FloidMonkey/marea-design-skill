# Lenguaje visual de Marea

Todo lo de acá está medido sobre un sitio real en producción, no propuesto en
abstracto. Cuando un número parece arbitrario, casi siempre viene de un vector.

## 1. La paleta y por qué es así

```css
--color-primary:      #005C2F;   /* verde estructural */
--color-primary-dark: #065B28;   /* olas, pies de tarjeta, encabezado */
--color-accent:       #FFE100;   /* el único acento */
--color-bg:           #F5F4E5;   /* crema: el suelo de todo el sitio */
--color-bg-solid:     #FFFFFF;   /* solo dentro de tarjetas */
--color-bg-alt:       #DDE6D9;   /* sección alterna */
--color-bg-alt-2:     #C7DACE;   /* tercer nivel, uso escaso */
--color-text:         #1C2420;
--color-text-muted:   #4A554F;
```

**El crema no es decorativo, es estructural.** Es el suelo sobre el que flota
todo: las tarjetas blancas se leen como objetos *encima* del crema, no como
huecos. Si cambias el crema por blanco, las tarjetas desaparecen y el sistema
entero se aplana. Es el cambio más destructivo que puedes hacerle a Marea.

**El amarillo es el único acento y se gasta rápido.** Tres apariciones por
página es mucho. En el sitio original: el eslogan cursivo sobre la ola, el
descriptor en el pie de las tarjetas de marca, y el marco de corchete de las
tarjetas de valores. Nada más. En el momento en que lo usas para un botón
secundario, deja de significar "esto importa".

**Dos verdes, no uno.** `--color-primary` es el verde de la marca y va en
titulares, iconos y franjas llenas. `--color-primary-dark` es apenas más oscuro
y más azulado; va en las superficies grandes (olas, pies de tarjeta, el
encabezado) donde el verde de marca a tamaño completo resulta ácido. La
diferencia es sutil a propósito: se siente, no se ve.

## 2. Tipografía

```css
--font-headline: 'Inter', 'Segoe UI', Arial, sans-serif;
--font-body:     'Inter', 'Segoe UI', Arial, sans-serif;
--font-cursiva:  'Aesthetic Moment Italic', cursive;  /* SOLO en olas */
```

Una sola grotesca para todo lo estructural. No hace falta que sea Inter: sirve
cualquier grotesca neutra **con un 800 real**, porque los titulares del sistema
viven en 800 y un falso bold sintético se nota de inmediato sobre el crema.

La cursiva es la firma del lenguaje y tiene **una sola** función: el eslogan que
cabalga sobre la ola. El contraste entre la grotesca geométrica sobre plano y la
letra manuscrita sobre una curva es todo el efecto. En cuanto la cursiva aparece
en un `h2`, el efecto se muere y el sitio parece una plantilla de bodas.

**Tamaños fluidos, siempre.** Nada de `font-size` fijo por breakpoint:

```css
h1 { font-size: clamp(1.9rem, 5vw, 3.4rem); }
h2 { font-size: clamp(1.5rem, 3.4vw, 2.4rem); }
```

Cuando el contenedor mide en `vw` o `cqw`, el texto tiene que medir igual o la
proporción se rompe en los anchos intermedios. Este es el error más frecuente al
implementar el sistema: se prueba a 360, 1440 y 1920, y el desastre vive en 1100.

**Cuidado con el piso del `clamp()` en texto dentro de tarjetas de proporción
fija.** Un piso deja de escalar en anchos intermedios, cambia el número de
líneas y deforma una tarjeta ya medida. En los bloques de producto el texto va
en `cqw` puro, sin piso, justamente por eso.

## 3. Ritmo vertical

```css
.seccion       { padding: clamp(2.5rem, 7vw, 5rem) 0; }
.seccion--alt  { background: var(--color-bg-alt); }
```

La página alterna `--color-bg` y `--color-bg-alt`, y **cada cambio de color
lleva una ola encima**. Esa es la regla que hace que la alternancia se lea como
decisión y no como rayas.

Una sección interna puede romper el ritmo si el vector lo pide: en el sitio
original varias secciones usan valores en `vw` tomados directamente del
compuesto (`md:pt-[9.8406vw]`). Está bien; lo que no está bien es mezclar
`clamp()` y `vw` crudo en la misma dimensión del mismo bloque, porque dejan de
escalar juntos.

## 4. Las reglas de composición

**Nada vive en un rectángulo pelado.** Cada bloque está recortado por una curva,
enmarcado por un corchete, o limitado por una franja de color. Si te encuentras
dibujando una caja con borde, te saliste del lenguaje.

**Las cosas se solapan.** Las olas se comen el borde de la sección de arriba. El
icono de una tarjeta de valores rompe el borde superior del marco. La persona
recortada sobresale por encima y por debajo de la ola. Ese solape es lo que da
profundidad sin sombras pesadas.

**Las sombras son casi inexistentes**, salvo en los recortes:

```css
--shadow: 0 2px 12px rgba(0, 65, 25, .10);          /* tarjetas: apenas se ve */
filter: drop-shadow(0 10px 12px rgba(0, 0, 0, .25)); /* personas recortadas */
```

La sombra de tarjeta es deliberadamente débil y **tiene tinte verde**, no gris.
Sobre crema, una sombra gris se ve sucia.

**Radios generosos, no tímidos.** `--radius: 8px` para elementos pequeños; las
tarjetas grandes van mucho más redondeadas (`1.5rem`, o `4.9488cqw` cuando la
medida sale del vector). Un radio de 4px sobre este crema parece un error.

## 5. Fotografía

Fotos reales de la operación, gente trabajando, producto en contexto. Nada de
stock genérico. Siempre `object-fit: cover` con `object-position` pensado, y
variantes optimizadas (WebP + JPEG, ≤ 300 KB) generadas por pipeline, nunca el
original de la cámara.

Las personas que aparecen sobre las olas van **recortadas del fondo**, en PNG o
WebP con transparencia, con `drop-shadow`. No son fotos en caja: son figuras que
se paran sobre la curva.

## 6. Qué hace que esto no parezca plantilla

Tres cosas, en orden de importancia:

1. **La cursiva sobre la curva.** Ningún generador produce esto. Es texto sobre
   un `<textPath>` cuya curva es paralela a la cresta de la ola.
2. **El solape.** Los elementos se invaden. Las plantillas apilan bloques.
3. **La textura.** Bandas de textura a todo el ancho, con periodo medido, detrás
   de las tarjetas. Rompe la planitud del color liso sin recurrir a degradados.

Si tienes que recortar por presupuesto, recorta por el final de esa lista.
