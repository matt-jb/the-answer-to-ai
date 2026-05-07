# The Answer to AI, Software Engineering, and Everything

A presentation and field guide for navigating the rapidly shifting software engineering and IT landscape in the age of AI. It cuts through the hype to highlight what's genuinely changing, what stays the same, and how engineers, teams, and organizations can adapt without losing their footing.

## Run the slides

```bash
npm start
```

Then open <http://localhost:8080>. The page reloads automatically whenever you save `slides.md`, `index.html`, or any file in a top-level asset folder.

> Requires Node.js 18+. The dev server is a tiny zero-dependency script in `scripts/dev-server.mjs`, so no extra `npm install` step is needed beyond `reveal.js` itself.

## Where things live

| File / folder | What it's for |
| --- | --- |
| `slides.md` | **Write your slides here.** Each `---` on its own line starts a new slide. Each `--` on its own line starts a vertical sub-slide. |
| `index.html` | Reveal.js bootstrap: theme, plugins, and global config. Edit only when you want to change theme, transitions, or which plugins are enabled. |
| `assets/` | Drop your images here, then reference them with `![](assets/your-image.png)`. |
| `scratchpad.md` | Outline and source material for the talk. Move sections from here into `slides.md` as you build out the deck. |
| `scripts/dev-server.mjs` | Local dev server with auto-reload. |
| `node_modules/reveal.js/` | Reveal.js source (loaded directly by `index.html`). |

## Quick slide cheatsheet

Inside `slides.md` you can use:

- Standard Markdown: headings, lists, bold/italic, links, images, blockquotes.
- Fenced code blocks. Use ` ```js [1-3|5-7] ` for step-through line highlighting.
- `Note:` on a line — everything after it becomes speaker notes (press `S` during the talk to open the speaker view).
- `<!-- .slide: data-background-color="#1a1a2e" -->` at the top of a slide for per-slide backgrounds, classes, or other Reveal slide attributes.
- `<!-- .element: class="fragment" -->` after a list item or paragraph to reveal it on click.

The starter `slides.md` already demonstrates each of these — keep them as a reference or replace them as you build out the deck.

## Image layouts

Markdown lets you drop in raw HTML, so you can mix and match. Common patterns (all live in the starter `slides.md`):

**Sized image** — the `<!-- .element: -->` comment attaches HTML attributes to the previous element:

```markdown
![](assets/photo.jpg)
<!-- .element: style="max-height: 50vh" -->
```

**Image beside text** — utility classes are defined in `index.html`:

```markdown
<div class="cols image-text">
  <div>

![](assets/photo.jpg)

  </div>
  <div>

### Heading
- bullet one
- bullet two

  </div>
</div>
```

> Inside `<div>` blocks you must leave a blank line before and after Markdown content, or the parser treats it as raw HTML and won't render `**bold**`, lists, etc.

**Three-column gallery** — same `cols` helper with `thirds`:

```markdown
<div class="cols thirds">
  <figure>

![](assets/a.jpg)

  <figcaption>caption A</figcaption>
  </figure>
  <figure>

![](assets/b.jpg)

  <figcaption>caption B</figcaption>
  </figure>
</div>
```

**Full-bleed image** — set the image as the slide's background:

```markdown
<!-- .slide: data-background-image="assets/photo.jpg" data-background-size="contain" data-background-color="#000" -->
```

Use `data-background-size="cover"` to fill and crop instead of letterbox.

**Image with a text overlay** — same as above, plus content on the slide:

```markdown
<!-- .slide: data-background-image="assets/photo.jpg" data-background-opacity="0.35" -->

## Heading on top of the image

Body text stays readable thanks to the dimmed background.
```

The available column variants are `.cols` (50/50), `.cols.image-text` (image-heavy left), `.cols.text-image` (text-heavy left), and `.cols.thirds` (three equal). Add or tweak them in the `<style>` block of `index.html`.

## Keyboard shortcuts during the talk

| Keys | What they do |
| --- | --- |
| `→` / `Space` | Next slide / fragment |
| `←` | Previous |
| `↓` / `↑` | Navigate vertical (drill-down) slides |
| `S` | Open speaker view (with notes and timer) |
| `F` | Fullscreen |
| `O` / `Esc` | Slide overview |
| `B` / `.` | Pause (black screen) |
| `?` | Show all shortcuts |

## Changing the theme

Edit the `<link id="theme" ...>` line in `index.html`. Available themes live in `node_modules/reveal.js/dist/theme/` — `black`, `white`, `night`, `serif`, `dracula`, `solarized`, `moon`, `sky`, `league`, `beige`, `simple`, `blood`, plus high-contrast variants. The default here is `black`.
