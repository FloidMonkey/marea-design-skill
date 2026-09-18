---
name: marea
description: Build corporate and institutional websites in the Marea design language — curved wave dividers that carry cursive slogans between sections, textured full-bleed bands, layered rounded cards with a coloured footer strip, and a warm cream-and-deep-green palette. Use when asked for a site (or a section) with wave/curve separators, an agro-industrial or food-industry feel, editorial section rhythm, brand/product card grids, or when implementing a vector composite (Illustrator/Figma/PDF) faithfully in HTML and CSS. Also carries the browser-measurement discipline and the CSS traps that make vector-faithful work actually land.
---

# Marea — a wave-driven editorial web language

Marea is a complete visual language for institutional websites, extracted from a
production build. It is opinionated on purpose: a small set of building blocks
that compose into a whole site without looking like a template.

Two halves, and you usually need both:

1. **The visual language** — palette, type, rhythm, and seven building blocks.
2. **The craft** — how to measure a vector composite and translate it faithfully,
   plus the CSS traps that cost real days on the original build.

## When to reach for this

Good fit: corporate or institutional sites, agro-industry, food production,
manufacturing, cooperatives; anything that wants warmth and craft rather than
SaaS minimalism. Also any project where a designer handed you an Illustrator or
Figma composite and "make it match" is the actual job.

Poor fit: dashboards, dense data UI, developer tools. The wave dividers and the
cream ground fight information density. Use `dataviz` or a neutral system there.

## The language in one screen

**Palette.** A warm cream ground, deep green as the structural colour, a single
saturated yellow as the only accent. Restraint is the point: the yellow appears
on perhaps three elements per page and always means "read this".

```css
--color-primary:      #005C2F;  /* structural green: bands, headings, icons  */
--color-primary-dark: #065B28;  /* wave fills, card footers, header          */
--color-accent:       #FFE100;  /* the single accent — use sparingly         */
--color-bg:           #F5F4E5;  /* the cream ground the whole site sits on   */
--color-bg-alt:       #DDE6D9;  /* alternating section ground                */
--color-text:         #1C2420;
--color-text-muted:   #4A554F;
```

Full token set with rationale: `assets/tokens.css`.

**Type.** One grotesque for everything structural (Inter works; so does any
neutral grotesque with a real 800 weight), plus **one cursive display face used
only on the waves**. That contrast — geometric sans on flat ground, handwriting
riding a curve — is the signature of the language. Never use the cursive for
anything but wave slogans; the moment it appears in a heading the effect dies.

**Rhythm.** Sections breathe on a fluid scale, never fixed padding:

```css
.seccion { padding: clamp(2.5rem, 7vw, 5rem) 0; }
```

Alternate `--color-bg` and `--color-bg-alt` down the page, and let a wave sit on
every transition where the colour changes. The waves are what make the
alternation read as deliberate instead of striped.

## The seven building blocks

Each has a full recipe in `references/`. Briefly:

| Block | What it does | Reference |
|---|---|---|
| **Wave divider** (`.ola`) | Curved SVG that eats the seam between two sections | `references/olas.md` |
| **Figure wave** (`.ola-figura`) | Tall wave carrying a cursive slogan, a cut-out person, and a texture fill | `references/olas.md` |
| **Textured band** | Full-bleed repeating texture behind a card run | `references/fondos.md` |
| **Brand card** (`.card-marca--home`) | Logo above, deep-green footer strip with name and descriptor | `references/tarjetas.md` |
| **Bracket card** | Value/feature card framed by an open yellow bracket, icon breaking the top edge | `references/tarjetas.md` |
| **Product block** | Rounded card: family photo above, white presentation panel below | `references/tarjetas.md` |
| **Stat band** | Icon + two-weight figure, no rules, no boxes | `references/tarjetas.md` |

The composition rule that ties them together: **nothing sits in a plain
rectangle.** Every block is either clipped by a curve, framed by a bracket, or
bounded by a colour strip. If you find yourself drawing a bordered box, you have
left the language.

## The wave, in short

The wave is a full-width SVG with `preserveAspectRatio="none"`, pulled up over
the section above it by exactly its own height:

```css
.ola {
  --alto: clamp(40px, 6vw, 74px);
  position: relative; z-index: 2;
  height: var(--alto);
  margin-top: calc(-1 * var(--alto));   /* eats the seam */
  line-height: 0;                        /* kills the inline-SVG descender gap */
  pointer-events: none;
}
.ola svg { display: block; width: 100%; height: 100%; }
```

`line-height: 0` is not optional — without it the SVG sits on a text baseline
and leaves a few stray pixels of the section behind it.

The tall variant carries content. Read `references/olas.md` before building one:
the slogan rides a `<textPath>` along a curve parallel to the wave crest, and
getting that curve right is most of the work.

## Craft: the part that actually costs time

These are not style preferences. Each one cost hours on the original build, and
they recur in any project of this shape.

**Tailwind inside `@layer` loses to an unlayered reset.** A plain
`img, svg { height: auto }` in your own stylesheet beats `h-full` from Tailwind,
silently, because unlayered rules outrank layered ones regardless of
specificity. Symptom: `h-full` "does nothing" on an image. Fix: `h-full!`, or a
bespoke unlayered class. This bit four separate times on one project.

**`width`/`height` attributes on `<svg>` and `<img>` beat the `viewBox`.** Chrome
derives an intrinsic aspect ratio from the attributes; with `height: auto` in CSS
that ratio wins and your icon renders square. Strip the attributes from inline
SVG icons, or set both axes in CSS.

**A new arbitrary Tailwind utility needs a rebuild.** "The change isn't showing"
is a forgotten `css:build` far more often than a CSS bug. Check that first.

**`justify-self: center` removes a grid item's stretch.** The item collapses to
zero width unless you also give it `width: 100%`.

**Percentage margins resolve against the container's *width*, never its height.**
A `margin-top: -8%` meant as vertical overlap will swallow a short section whole.

**`container-type: inline-size` and `padding` in `cqw` on the same element** is a
circular dependency; Chromium collapses it. Split them across two elements.

**`clamp()` in `rem` does not scale with text sized in `cqw`.** Calibrate padding
at the *worst* width, not the widest — usually 1280–1440, not 1920.

**An SVG loaded through `<img>` is an isolated document.** Its `mix-blend-mode`
cannot reach the page behind it. Inline the SVG if you need it to blend.

Longer list with symptoms and diagnoses: `references/trampas-css.md`.

## Implementing from a vector composite

If a composite exists, it is the authority — including over earlier hand-tuning,
including the client's own. Say so plainly and re-measure.

The discipline, in four rules:

1. **Anchor on the right box.** Divide by the *page frame*, not the canvas. An
   artboard is often a few percent wider than the page; using it made a whole
   band 1.7 % small on the original build.
2. **Compare ink to ink.** Canvas `actualBoundingBox` against SVG `getBBox`.
   Never compare an advance width to an ink extent.
3. **Measure vector text by its anchor and baseline**, not by `getBBox()`.
4. **Verify every check in reverse.** Break the thing deliberately and confirm
   the check fails. A test that cannot fail is not a test — one on the original
   build passed because it was reading a value derived from the same source it
   was validating.

Illustrator kerns roughly 1.4–2 % tighter than a browser at display sizes, and at
small sizes the browser's optical-size axis makes text proportionally *wider*.
Forced line breaks calibrated at 1920 will wrap unexpectedly at 1100–1440. Always
check the intermediate widths, not just 360 / 1440 / 1920.

Method and the measuring harness: `references/medicion.md` and `scripts/medir.cjs`.

## Working rhythm

- Prototype in the browser and **show it before touching the repo** — inject the
  variant with `addStyleTag` and screenshot both states side by side.
- Test the **served artifact**, not just the source.
- Repeat a suspicious score before chasing it; flaky runs are common and a real
  regression repeats.
- Never invent data — figures, certifications, contacts. Leave the field empty
  and say it is pending.

## Reference map

- `references/lenguaje-visual.md` — palette, type, rhythm, composition rules (ES)
- `references/olas.md` — the wave system end to end (ES)
- `references/tarjetas.md` — every card recipe (ES)
- `references/fondos.md` — textured bands and how to tile them (ES)
- `references/trampas-css.md` — the full trap catalogue with symptoms (ES)
- `references/medicion.md` — measuring a composite, with worked examples (ES)
- `assets/tokens.css` — drop-in custom properties
- `assets/componentes.css` — the component CSS, project-neutral
- `scripts/medir.cjs` — Playwright harness for measuring a live page
