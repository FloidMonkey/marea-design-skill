# Trampas

Cada una de estas costó tiempo real. Están ordenadas por cuánto: la primera se
repitió cuatro veces en un mismo proyecto.

## 1. Tailwind en `@layer` pierde contra CSS sin capa

**Síntoma:** `h-full`, `w-full` o `grid-cols-4` "no hacen nada" sobre una imagen
o un SVG. Sin error, sin aviso.

**Causa:** las utilidades de Tailwind viven en `@layer utilities`. Una regla sin
capa —tu propio reset, `img, svg, video { height: auto }`— **gana siempre**
contra una regla en capa, sin importar la especificidad. Es cómo funciona la
cascada por capas, no un bug.

**Salida:** `h-full!` (el `!` de Tailwind 4), o una clase propia sin capa:

```css
/* fuera de todo @layer */
.foto-cover { width: 100%; height: 100%; object-fit: cover; }
```

**Cómo diagnosticarlo rápido:** en DevTools, si la regla aparece tachada y la
que gana es la tuya con menos especificidad, es esto.

## 2. `width`/`height` en `<svg>` e `<img>` ganan al `viewBox`

**Síntoma:** un icono se renderiza cuadrado aunque su `viewBox` sea 148×136. O
un packshot sale desproporcionado mientras está fuera de pantalla con
`loading="lazy"`.

**Causa:** Chrome deriva una proporción intrínseca de los atributos. Con
`height: auto` en CSS, esa proporción **vence al `viewBox`**.

**Salida:** quita los atributos de los SVG inline, o define ambos ejes en CSS.

Cuidado: si los quitas de *algunos* y no de otros, vas a "arreglar" un sitio y
dejar el mismo defecto en otro. Hazlo de una vez en toda la familia de iconos.

## 3. Una utilidad arbitraria nueva necesita recompilar

**Síntoma:** agregas `md:pt-[9.8406vw]` y no pasa nada.

**Causa:** Tailwind escanea el fuente y genera solo las clases que encuentra. Una
clase nueva —aunque sea completamente estándar— no existe hasta el próximo
`css:build`.

**Regla:** ante "no se ve el cambio", **recompila antes de depurar**. Es la causa
más frecuente, por lejos, y la más barata de descartar.

## 4. `justify-self: center` colapsa el elemento a cero

**Síntoma:** una tarjeta de grilla desaparece por completo.

**Causa:** centrar quita el estirado por defecto del elemento de grilla. Sin un
ancho propio, colapsa.

**Salida:** `width: 100%` junto al `justify-self: center`. Van siempre en pareja.

## 5. Los márgenes en porcentaje se calculan contra el ANCHO

**Síntoma:** un `margin-top: -9%` pensado como solape se traga entera una
sección corta.

**Causa:** `margin` y `padding` en porcentaje resuelven contra el **ancho** del
contenedor, en los cuatro lados. Siempre. Un -9 % en una página de 1920 son
-173 px, no el 9 % del alto de la sección.

**Salida:** para solapes verticales, valores fijos o `clamp()` en px/vw.

## 6. `container-type` + `padding: cqw` en el mismo elemento

**Síntoma:** el elemento colapsa o parpadea entre dos tamaños.

**Causa:** dependencia circular real en Chromium — el padding depende del ancho
del contenedor, que es el propio elemento, cuyo ancho depende del padding.

**Salida:** separa en dos elementos. `container-type` en el exterior, el
`padding: cqw` en el interior.

## 7. `clamp()` en `rem` no escala con texto en `cqw`

**Síntoma:** una tarjeta está perfecta a 1920 y le sobran 4 px de aire a 1280.

**Causa:** el texto en `cqw` escala linealmente con el contenedor; el relleno en
`clamp()` de `rem` no. Entre el piso y el techo del clamp escalan a ritmos
distintos.

**Salida:** calibra en el **peor** ancho, no en el más grande. Suele ser
1280–1440. Y prueba los anchos intermedios siempre: 900, 1100, 1300. El desastre
nunca vive en 360, 1440 ni 1920, que son los que todo el mundo prueba.

## 8. `<img>` en columna flex sin `min-height: 0`

**Síntoma:** en una fila de tarjetas iguales, unas tienen el pie más alto que
otras sin razón aparente.

**Causa:** un `<img>` en una columna flex impone un piso de `min-content` que
**varía por archivo**. Aplasta a sus hermanos de forma distinta en cada tarjeta.

**Salida:** `min-height: 0` en la imagen. Siempre, no solo cuando falla.

## 9. Un SVG por `<img>` es un documento aislado

**Síntoma:** el SVG ignora tus custom properties; su `mix-blend-mode` no afecta
al fondo de la página; `currentColor` no hereda.

**Causa:** es exactamente eso, un documento aparte. No hay herencia posible.

**Salida:** SVG **inline** para cualquier cosa que necesite tokens, fuentes,
`currentColor` o mezcla. `<img>` solo para ilustraciones autocontenidas.

**Cómo comprobarlo sin dudas:** pon el SVG sobre rojo puro y mide el píxel. Si el
resultado es una mezcla y no el color esperado, la mezcla ocurrió *dentro* del
SVG, no contra la página.

## 10. `getClientRects()` de un Range no cuenta líneas

**Síntoma:** tu prueba de "el titular ocupa dos líneas" falla con un texto que
visiblemente ocupa dos.

**Causa:** `getClientRects()` devuelve **un rectángulo por fragmento inline**. Un
`<strong>` en medio parte la línea en tres rectángulos.

**Salida:** agrupa por coordenada `top` redondeada antes de contar.

## 11. Recolorear en masa borra formas

**Síntoma:** pones un logo entero a un color y desaparecen detalles.

**Causa:** las formas que dependían de **contraste** (no de alfa) se funden con
sus vecinas al recibir el mismo color.

**Salida:** heurística por píxel, no reemplazo global. Y verifica **sobre el
fondo real**, no sobre blanco.

## 12. Fuera del CSS, pero del mismo linaje

**`php -S` no lee `.htaccess`.** Compresión, caché, cabeceras de seguridad y
páginas de error no existen en el servidor embebido. Un puntaje de rendimiento
local no dice nada del real.

**El PHP local puede no ser el de producción.** Una deprecación que solo existe
en la versión del hosting no la ve ninguna suite. Si la versión difiere,
consíguete esa versión y corre la suite con ella: en el proyecto original
apareció un defecto real en el primer intento.

**Prueba el artefacto servido, no solo el fuente.** Si generas una copia para
publicar, sírvela y corre las pruebas contra ella.

**Repite antes de perseguir.** Un puntaje raro o una prueba caída aislada suelen
pasar a la segunda. Una regresión de verdad se repite.
