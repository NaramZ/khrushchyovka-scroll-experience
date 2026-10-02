# ДОМА / DOMA

**An interactive walk through a Soviet panel flat, about memory, emotion and the architecture that shaped them.**
By Naram Ziady and Sami: a simple idea we wanted to explore.

**Walk it here: https://naramz.github.io/khrushchyovka-scroll-experience/** (desktop browser recommended; the first load takes a few seconds)

## About

Everyone had the same place. Millions of families were given the same flat, in the same concrete block, built from the same factory-made panels. That's exactly what makes the memories of these homes so specific. When the architecture is identical, every difference is human: how a family decorated, where they put the things they were given, the small choices that turned a standard flat into *home*.

And the building shaped the life inside it. The kitchen was built tiny, so it became the place to sit, talk and gossip late into the night. There was nowhere to keep anything, so the balcony became the cellar, the pantry and the storeroom. These things didn't happen everywhere. They happened *there*, because of the architecture.

These aren't our memories to tell. They belong to the people who live in these buildings. ДОМА comes from being a guest: invited into other people's homes, in flats exactly like every other flat in the block, and nothing like any of them.

### Memory

The piece is designed to feel like remembering rather than looking. Slide the **Memory** strip (bottom left) up and the scene fades the way a memory does: the gaussian paint thickens, the brush strokes grow, colour drains, nothing stays in focus and sound goes muffled. Slide it all the way and almost everything is gone. But you can still see the building: a huge, pale rectangle with rows of windows. You can forget the rooms and whose flat it was. You don't forget the architecture. It's simple, repeated and deeply memorable, and that's what makes it so emotional.

### The walk

- **The block and the stairwell:** the shared part of the building, where short fragments of text appear beside you like thoughts.
- **Flat № 6:** the hall, the kitchen (lit like a dream of it, a period radio playing), the living room, the bedroom and the balcony. A slider strips the flat back *as designed*, then fills it again *as lived*: the building is the constant, home is the variable.
- **Across the road:** a new block goes up panel by panel. You climb in through a window and watch the same room fill up again for another family: another home, another story beginning.
- **Four seasons** change the light outside and in, with a painterly look and the grey overcast of Tarkovsky's *Stalker*.

The written entry, **“Someone else’s home”**, opens from the **Journal** button inside the piece.

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
The top bar has three buttons: **Journal**, **Settings** and **Hide**. Hide clears the screen down to the scene; **Show** (top right) or the `H` key brings the controls back.
- **Scroll** to travel through nine chapters (about five minutes). The bar at the bottom turns the page; click its title to open the list of chapters.
- **Settings**: season (summer by default), sound, walking and flying, and, folded under *Look & atmosphere*, indoor haze and the gaussian paint. Settings are remembered.
- **Walk around the flat** (bottom right, inside the flat, or `G`): first person. Click to look around, `W A S D` to move, `Shift` to run, `Esc` frees the mouse; **Back to the journey** at the top returns you to the scroll.
- **Fly around** (Settings, or `F`): orbit, pan, zoom, `W A S D`, `Q / E`.
- **Memory** (a tab bottom left; open it, then drag the handle up, click a word on the scale, scroll over it, or use the arrow keys): fades the whole scene from “Now” to “Only the shape”, like a memory: colour drains, brush strokes grow, sound muffles, and only the building’s outline stays.
- **As designed ↔ as lived**: a slider that appears inside the flat.
- **Journal**: “Someone else’s home”, an old leather notebook on a desk, in 3D: grab a page and pull it over, or use ‹ › and the arrow keys; **Index** jumps to the contents): a walk through the rooms and what each one meant, how we made it, sources and controls. **Printed text** swaps the handwriting for print. `M` toggles sound.

**On a phone:** swipe up and down anywhere to travel. Tap **Tilt to look** and move your phone to look around (iPhone asks for permission once). In Fly around: drag to look, pinch to move forward and back, two fingers to slide, double-tap somewhere to glide there.

## Sound
Click or press a key once and the sound starts (browsers need a gesture). The kitchen radio uses the recordings in `audio/`; they are also embedded in `index.html`, so the page works on its own.

## Editing (optional)
`index.html` is generated. The source is in `src/` (split into modules); after editing, rebuild with:
```
python3 src/build.py
```
`original.html` is the first version and is kept because the build reads the reference photographs from it.
