# ДОМА / DOMA — a spatial journal

A personal HCI project about emotion and memory in Soviet panel housing: everyone had the same flat, and the small differences made it home. Written up as a journal entry; made for a Typography & Design course (Case Study 08): a Soviet panel tower, its stairwell and one late‑Soviet flat; a construction site where a 1‑464‑type block is assembled panel by panel; and an ending where the same room is built and furnished again in the new building. Four seasons, a first‑person walk mode and a painterly gaussian look.

## How to run it

It's a single web page: **`index.html`**. It needs an internet connection (Three.js, GSAP and fonts load from CDNs) and a desktop browser with WebGL 2 (Chrome, Edge, Firefox or Safari — Chrome/Edge recommended).

**Easiest: run the launcher**
- **Mac:** double‑click `start-mac.command`. If macOS blocks it ("unidentified developer"), right‑click it, choose **Open**, then **Open** again.
- **Windows:** double‑click `start-windows.bat`.

Each launcher starts a small local web server and opens `http://localhost:8000` in your browser. Leave the terminal window open while you use it and close it when you're done.

**Or start a server yourself** (from this folder), then open `http://localhost:8000`:
```
python3 -m http.server 8000
```
(or `npx serve .` if you have Node.)

**Double‑clicking `index.html` directly** also works in most browsers, but if it stays on the loading screen, use one of the options above; some browsers restrict pages opened straight from disk.

The first load takes a few seconds while the city is built.

## Controls
- **Scroll** to travel through nine chapters (about five minutes); **Chapters ▾** in the top bar jumps to any of them.
- **Autumn ▾** (top bar): season, indoor haze, and the gaussian paint (splat level, brush strokes, brush size, focus). Settings are remembered.
- **Walk ◉** (or `G`): first person. Click to look around, `W A S D` to move, `Shift` to run, `Esc` frees the mouse, `G` or `Esc` again to leave.
- **Free camera** (or `F`): orbit, pan, zoom, `W A S D`, `Q / E`.
- **Memory** knob (bottom left; drag it round, scroll over it, or use the arrow keys): fades the whole scene from “Now” to “Only the shape”, like a memory: colour drains, brush strokes grow, sound muffles, and only the building’s outline stays.
- **As designed ↔ as lived**: a slider that appears inside the flat.
- **Journal**: the written entry, in the style of the journal on naramziady.com: the question behind it, designing for memory, what got scrapped, by the numbers, what I'd do differently, sources and controls. `M` toggles sound.

## Sound
Click or press a key once and the sound starts (browsers need a gesture). The kitchen radio uses the recordings in `audio/`; they are also embedded in `index.html`, so the page works on its own.

## Editing (optional)
`index.html` is generated. The source is in `src/` (split into modules); after editing, rebuild with:
```
python3 src/build.py
```
`original.html` is the first version and is kept because the build reads the reference photographs from it.
