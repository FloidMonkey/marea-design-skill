# Marea

**A Claude Code skill for building institutional websites with a wave-driven
editorial design language — plus the browser-measurement craft that makes
vector-faithful work actually land.**

*Skill de Claude Code para sitios institucionales con lenguaje editorial de
olas, y el oficio de medición que hace que la fidelidad al vector funcione.*

---

## What this is

Marea is a complete visual language extracted from a production website: curved
wave dividers carrying handwritten slogans between sections, full-bleed textured
bands, layered rounded cards with coloured footer strips, and a warm
cream-and-deep-green palette.

It is not a component library and not a CSS framework. It is **knowledge** — the
kind that normally dies in a chat transcript. Every value in it came off a real
build, and the comments say what each one is *for*, which is what you need when
you swap the palette for a different brand.

It ships in two halves, and most projects need both:

1. **The visual language.** Palette, type, vertical rhythm, and seven building
   blocks that compose into a full site without looking templated.
2. **The craft.** How to measure an Illustrator or Figma composite and translate
   it faithfully, and the dozen CSS traps that cost real days on the original
   build — the kind that produce no error, just a layout that is quietly wrong.

## What it can do

Once loaded, Claude can:

- **Build a site in the Marea language from scratch** — section rhythm, wave
  transitions, card grids, CTA strips, hero, footer.
- **Build a wave divider or a figure wave correctly the first time**, including
  the hard part: a cursive slogan riding a `<textPath>` along a curve parallel
  to the wave crest, with a halo stroke when it sits over texture.
- **Produce the card systems** — brand cards with a colour footer strip, bracket
  cards whose icon breaks the frame, product blocks sized in container units,
  box-less stat bands.
- **Tile a textured band correctly** — the tile is a full period with the gap
  baked in, not the band alone, which is the mistake almost everyone makes.
- **Translate a vector composite into CSS** with the right anchor box, ink-to-ink
  comparisons, and units that survive the in-between widths.
- **Diagnose the silent failures** from a symptom: "`h-full` does nothing",
  "the icon renders square", "the card disappeared", "a short section vanished",
  "the strips don't line up across a row".
- **Measure a live page** at eight widths and print geometry as a fraction of
  the viewport and of the parent (`scripts/medir.cjs`).

### What it deliberately does not do

- **Dashboards and dense data UI.** Wave dividers and a cream ground fight
  information density. Use a neutral system there.
- **Replace a designer.** If a composite exists, this skill tells Claude the
  composite wins — including over earlier hand-tuning, including the client's.
- **Generate imagery.** Textures, cut-out figures and packshots are production
  assets. The skill tells you how to prepare and tile them, not how to shoot
  them.

## Install

Claude Code reads skills from `.claude/skills/` in a project, or
`~/.claude/skills/` for every project.

```bash
# For one project
git clone https://github.com/FloidMonkey/marea-design-skill .claude/skills/marea

# For every project
git clone https://github.com/FloidMonkey/marea-design-skill ~/.claude/skills/marea
```

Then just describe what you want. The skill matches on wave dividers, editorial
section rhythm, agro-industrial or food-industry sites, brand card grids, and
"implement this composite faithfully".

To force it: `/marea`.

## Layout

```
SKILL.md                    entry point (EN) — language, blocks, traps, workflow
references/
  lenguaje-visual.md        (ES) palette, type, rhythm, composition rules
  olas.md                   (ES) the wave system end to end
  tarjetas.md               (ES) every card recipe, with what went wrong
  fondos.md                 (ES) textured bands, tiling, measuring the period
  trampas-css.md            (ES) the trap catalogue, ordered by cost
  medicion.md               (ES) measuring a composite, worked
assets/
  tokens.css                drop-in custom properties, commented
  componentes.css           the component CSS, project-neutral
scripts/
  medir.cjs                 Playwright harness for measuring a live page
```

`SKILL.md` and this README are in English; the deep references are in Spanish,
which is the language the work was done in. Code, class names and values are
language-neutral throughout.

## A taste of what is in here

The three that cost the most, from `references/trampas-css.md`:

> **Tailwind inside `@layer` loses to an unlayered reset.** A plain
> `img, svg { height: auto }` in your own stylesheet beats `h-full`, silently,
> because unlayered rules outrank layered ones regardless of specificity. This
> bit four separate times on one project.

> **`width`/`height` attributes on `<svg>` beat the `viewBox`.** Chrome derives
> an intrinsic aspect ratio from the attributes; with `height: auto` that ratio
> wins and your icon renders square.

> **Percentage margins resolve against the container's *width*, never its
> height.** A `margin-top: -9%` meant as vertical overlap will swallow a short
> section whole.

And the rule that governs the rest, from `SKILL.md`:

> **Nothing sits in a plain rectangle.** Every block is either clipped by a
> curve, framed by a bracket, or bounded by a colour strip. If you find yourself
> drawing a bordered box, you have left the language.

## Adapting it to another brand

The palette is the least portable part and the easiest to change. Read the
"why" comments in `assets/tokens.css` before swapping values — several tokens do
structural work that is not obvious from the hex:

- **The cream ground is structural.** White cards read as objects *on* it.
  Replace it with white and the system goes flat. Pick a different warm
  off-white, not `#fff`.
- **Two greens, not one.** The darker one exists for large surfaces where the
  brand colour goes acid at full size.
- **One accent, spent sparingly.** Three appearances per page is already a lot.
- **The cursive is for waves only.** It is the signature; in a heading it reads
  as a wedding template.

## Scope of what is published

Distilled from a production build. What is published here is the
**implementation technique** — proportions, CSS mechanics, measurement method
and failure catalogue. No client artwork, photography, logotypes, copy or design
composite is included, and none is needed to use this: every asset the recipes
reference is one you bring or produce yourself.

## License

MIT. See [LICENSE](LICENSE).
