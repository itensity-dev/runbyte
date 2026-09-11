# Промты для картинок (GPT Image)

Все изображения — **реалистичная фотография**, не 3D-рендер и не иллюстрация. Общая идея: тёмная студия, тёплый вольфрамовый свет, плёночное зерно, один акцентный оранжевый источник света. Никаких «AI-глянцевых» вещей.

## Общие правила (добавляй в конец каждого промта)

```
Style: realistic editorial photograph, shot on 35mm film, shallow depth of field, visible fine film grain, slightly underexposed, warm tungsten light, matte surfaces, no gloss.
Palette: near-black warm charcoal #141311, warm bone paper #EFEAE2, one accent of signal orange #FF4A1F as a light source or small object — never as a gradient.
Negative: no purple, no blue-cyan gradients, no glassmorphism, no neon glow, no glossy 3D blobs, no floating abstract shapes, no holograms, no text, no logos, no watermarks, no smiling stock-photo people looking at camera, no HDR look, no oversaturation.
```

## Список файлов

Сохраняй с этими именами в `assets/img/` — сайт их подхватит без правок кода. Размеры можно генерировать в ближайшем поддерживаемом соотношении, потом обрезать.

| Файл | Размер (px) | Где на сайте |
|---|---|---|
| `hero.jpg` | 2400 × 1400 (16:9 → кроп 16:7) | Главный экран, широкая полоса под заголовком |
| `about.jpg` | 1200 × 1500 (4:5) | Секция «The studio», портретный кадр |
| `service-01.jpg` … `service-06.jpg` | 1200 × 900 (4:3) | Превью при наведении на строку услуги |
| `work-01.jpg` … `work-05.jpg` | 1600 × 1100 (16:11) | Карточки кейсов, горизонтальный скролл |
| `cta.jpg` | 2400 × 1200 (2:1) | Фон финального блока «Let's talk» (затемняется на 45%) |
| `og.jpg` | 1200 × 630 | Превью ссылки в соцсетях |

---

## hero.jpg — 2400×1400

```
Wide cinematic photograph of a software studio late at night. A long dark oak desk seen from a low angle, two large monitors switched on showing only dim dark-mode code (unreadable, out of focus), a mechanical keyboard in the foreground with sharp focus on the keycaps. Most of the frame is deep warm charcoal shadow. On the right third of the image, a strong warm signal-orange light leak from an off-frame lamp grazes the desk edge and the wall, fading into darkness. Empty chair, no people. Composition leaves the center-left dark and calm.
```

## about.jpg — 1200×1500 (портрет)

```
Vertical documentary photograph inside a converted industrial loft used as a design and engineering studio. Two people seen from behind or in profile, blurred, standing at a whiteboard covered with wireframe sketches and sticky notes; they are not looking at the camera. Concrete floor, tall factory windows with late-afternoon light, a single orange extension cord running across the floor as the only bright color. Muted warm tones, film grain, honest and unposed.
```

## service-01.jpg — Web development — 1200×900

```
Close-up photograph of an ultrawide monitor on a dark desk displaying a clean dark-mode website layout with a large bone-white headline (text unreadable, out of focus). Reflection of a warm desk lamp on the screen bezel. Coffee cup half in frame. Everything dark charcoal except the screen and one orange sticky note on the monitor edge.
```

## service-02.jpg — Product & UX design — 1200×900

```
Overhead photograph of a designer's desk: printed paper wireframes laid out in a grid on bone-colored paper, a black marker, a steel ruler, one orange highlighter, a tablet with a pen showing a grayscale interface mockup. Warm directional light from the upper left casting soft long shadows. Matte paper texture visible, subtle grain.
```

## service-03.jpg — Mobile apps — 1200×900

```
Photograph of a hand holding a modern black smartphone in a dim workshop; the screen shows a minimal dark banking-style app interface with bone-white typography and one orange button (details unreadable). Background is out-of-focus dark shelves with a small warm lamp. Skin tones natural, hand only, no face. Shallow depth of field.
```

## service-04.jpg — AI integration — 1200×900

```
Photograph of a server rack detail in a dark data-center corridor: rows of matte black hardware, small status LEDs in warm amber and one glowing orange indicator, thin cables neatly bundled. Cold-dark background with a single warm light source from the end of the corridor. Industrial, quiet, precise. Film grain.
```

## service-05.jpg — Cloud & DevOps — 1200×900

```
Photograph of a network engineer's workbench: a patch panel with black and dark-gray ethernet cables, one orange cable standing out, a label printer, a laptop lid half closed reflecting a warm lamp. Dark charcoal environment, shallow focus on the orange cable connector, everything else softly blurred.
```

## service-06.jpg — Support & growth — 1200×900

```
Photograph of a dark desk with a paper notebook open to a handwritten checklist, a mechanical watch, a phone face-down, and a small desk lamp casting a warm pool of light on the page. Moody, calm, 'on-call at night' feeling. Bone-colored paper, warm shadows, film grain.
```

## work-01.jpg — Northwind Logistics (fleet platform) — 1600×1100

```
Photograph of a large wall-mounted monitor in a dark logistics control room displaying a dark-mode fleet map with small orange vehicle markers and bone-white data panels (details unreadable). A silhouette of an operator's shoulder in the foreground, out of focus. Warm ambient lamp, cold screen glow balanced to warm tones. Realistic, cinematic.
```

## work-02.jpg — Halden Bank (mobile banking) — 1600×1100

```
Editorial product photograph of two black smartphones lying on a bone-colored linen surface, screens showing a minimal dark banking app with large numbers in bone-white and one orange accent element (unreadable). Soft warm window light from the side, gentle shadows, matte textures, subtle grain. No hands.
```

## work-03.jpg — Meridian Health (patient portal) — 1600×1100

```
Photograph of a laptop on a wooden reception desk inside a modern, dimly lit clinic; the screen shows a calm dark-mode patient dashboard with bone-white cards (unreadable). Blurred background of a corridor with warm wall lights. A stethoscope partially in frame. Muted, warm, trustworthy mood, film grain.
```

## work-04.jpg — Kova Coffee (e-commerce) — 1600×1100

```
Photograph of a matte black coffee bag with a blank label standing on a dark countertop next to a tablet showing a minimal dark storefront page with a single orange 'add to cart' button (text unreadable). Steam from a cup, warm tungsten kitchen light, deep shadows, tactile textures, film grain.
```

## work-05.jpg — Atlas Studio (3D configurator) — 1600×1100

```
Photograph of a designer's dark studio with a monitor showing a realistic 3D render of a lounge chair in a neutral studio scene (interface hidden, only the chair visible), a physical fabric swatch book on the desk with one orange swatch pulled out. Warm desk lamp, dark charcoal walls, shallow depth of field, grain.
```

## cta.jpg — 2400×1200

```
Wide photograph of a dark raw concrete wall in an industrial building at night, lit by a single thin horizontal line of warm orange light from a hidden fixture near the bottom edge, fading upward into deep charcoal. Rough matte texture, subtle dust, no objects, no text. Composition mostly empty and dark; the image will be darkened further and text placed on top.
```

## og.jpg — 1200×630

```
Same scene and lighting as hero.jpg but tighter: the dark desk edge and the keyboard in the lower third, the warm orange light leak on the right, the upper-left two thirds almost pure warm charcoal. No text. Space for a headline on the left.
```

---

## После генерации

1. Сожми в JPEG качество ~80 (Squoosh / ImageOptim). Целевой вес: hero ≤ 400 KB, остальные ≤ 250 KB.
2. Положи в `assets/img/` с точными именами из таблицы.
3. Если картинка получилась светлее ожидаемого — не страшно: hero и cta поверх имеют затемняющий градиент, но проверь читаемость белого текста на `cta.jpg`.
