# HEZQEN Brand System

**Source of truth:** supplied HEZQEN Logo Kit & Usage Guidelines v1.0, November 2026.  
**Legal status:** trademark and domain clearance have not been completed.

## Brand identity and naming

- Write the brand name as **HEZQEN** in all running text. Do not write “Hezqen” or “HezQen”.
- Tagline: **Research. Intelligence. Perspective.**
- Endorsement: **A TINLANCE COMPANY** / **HEZQEN — BY TINLANCE** where the context calls for the parent-company relationship.
- The mark communicates structured insight and forward direction: hexagon container, square-cut H monogram, one rising amber bar, geometric wordmark and the amber Q tail.
- Never typeset the logo wordmark with a font. Use the supplied outlined artwork.

## Supplied artwork and current integration

The SVG master files are used directly:

- `public/brand/hezqen-horizontal-color.svg` — primary horizontal logo for light surfaces.
- `public/brand/hezqen-horizontal-reversed.svg` — primary horizontal logo for dark surfaces.
- `public/favicon.svg` — supplied favicon mark.

These integrated files match the corresponding supplied kit SVGs. The rest of the kit contains stacked, wordmark-only, mono, icon, small-size, favicon/app-icon and social-media variants. The repository has not yet integrated the complete app-icon and social-media export set; do not imply that the PWA, platform icons or Open Graph image are complete.

## Logo layouts and colorways

The kit provides six layouts: horizontal + tagline, horizontal compact, wordmark-only, stacked + tagline, stacked, and icon mark.

Approved colorways:
- `-color`: navy + amber, for light backgrounds.
- `-reversed`: white + amber, for dark backgrounds.
- `-mono-navy`, `-mono-white`, `-mono-black`: single-color use for print, engraving, stamps and low-fidelity output.
- `-on-white` and `-on-navy`: artwork with the named background included.

Choose the layout for available space, then the colorway for the surface. Never substitute an unapproved colorway.

## Clear space and minimum sizes

Let **X** equal half the height of the wordmark capitals. Maintain at least **1X clear space on every side**, free from text, imagery, edges and other logos.

| Logo version | Minimum screen width/size | Minimum print size |
|---|---:|---:|
| Horizontal + tagline | 200 px wide | 45 mm |
| Horizontal compact | 120 px wide | 30 mm |
| Stacked + tagline | 140 px wide | 35 mm |
| Stacked | 90 px wide | 22 mm |
| Wordmark-only | 100 px wide | 25 mm |
| Icon mark | 24 px; use small-size bold artwork at 16 px | 8 mm |

Below the tagline version's minimum size, switch to the corresponding layout without the tagline. Below 32 px, use the supplied small-size bold icon or favicon artwork.

## Color tokens and contrast

| Token | Hex | Use |
|---|---|---|
| Navy | #0B1B33 | Primary brand surface and text |
| Graphite | #2A3441 | Secondary dark text |
| Amber | #F5A623 | Signal accent only |
| Amber Deep | #A35F00 | Readable amber text on light backgrounds |
| Slate | #5B6678 | Secondary text |
| Mist | #F4F5F7 | Light surface |
| White | #FFFFFF | Primary background |

Target visual balance is approximately 75% white/mist, 18% navy, 5% graphite and 2% amber. Amber is reserved for the crossbar and Q tail in the logo. It should be the signal, not a broad background or body-text color.

The kit's documented contrast ratios are:

| Pair | Contrast | Kit result |
|---|---:|---|
| White on Navy | 17.2:1 | Pass |
| Navy on White | 17.2:1 | Pass |
| Amber on Navy | 8.5:1 | Pass |
| Navy on Amber | 8.5:1 | Pass |
| Amber Deep on White | 5.0:1 | Pass |
| Slate on White | 5.8:1 | Pass |
| Amber on White | 2.0:1 | Decorative only; fails text contrast |

Use Amber Deep, not Amber, for readable text on light backgrounds. Validate actual component states and combinations in the rendered application; a palette table alone does not establish WCAG conformance.

## Typography

Use Inter for all text and Inter Display for headlines at 28 px and above. Use a system monospace stack for code, formulas and calculator outputs.

| Role | Kit type scale |
|---|---|
| Display | 40 / 46, Bold |
| Heading | 28 / 34, Bold |
| Subheading | 20 / 28, SemiBold |
| Body | 17 / 28, Regular; direct, specific and evidence-led |
| Label | 11 px, SemiBold uppercase, +20% tracking |

Use sentence case for headlines and capitals only for labels. The initial application uses an Inter-first system stack until the font files are packaged locally. Inter and Inter Display are SIL Open Font License fonts.

## Backgrounds and co-branding

- White and Mist: use the `-color` variant.
- Navy and Graphite: use the `-reversed` variant.
- Amber surface: use the `-mono-navy` variant.
- Photography: use a single-color variant over a calm, even area; never place the logo over busy detail or faces.
- One-color print, embossing, laser etching, watermarks and stamps: use a supplied mono variant. In mono, the amber bar and Q tail become the same color as the rest of the mark.

When co-branded with the Tinlance mark, keep both at equal visual weight, separate them by at least 2X, and use a thin vertical rule. HEZQEN retains its own editorial identity and governance.

## Prohibited treatments

Do not:
- stretch, squash, rotate or tilt the artwork;
- recolor, re-space or redraw letters, or move the amber bar or Q tail;
- retype the wordmark or separate the mark from the wordmark within horizontal/stacked lockups;
- add outlines, gradients, shadows, glows or bevels;
- use low-contrast, busy or clashing backgrounds;
- crowd the mark or reduce clear space;
- use the tagline below its minimum size;
- use Amber as body text on white.

## Legal note

The supplied kit explicitly states that trademark and domain clearance have not been completed. Asset delivery is not legal clearance. Complete trademark and domain clearance in the target markets before a commercial brand launch.
