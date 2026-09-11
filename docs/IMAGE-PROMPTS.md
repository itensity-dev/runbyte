# Текстуры и обои под концепцию «running bytes» (GPT Image)

Сайт намеренно без фотографий, поэтому текстуры нужны только как **фоновые подложки с низкой прозрачностью** и как **обои / баннеры** для соцсетей. Всё в одной палитре: почти чёрный `#0A0A0B`, графит `#1A1A1D`, флип-дот жёлтый `#FFC940`, бумажно-белый `#F2F1EC`.

## Хвост для каждого промта

```
Style: realistic macro photograph, physical object, matte surfaces, fine film grain, single warm key light from upper left, deep shadows, slightly underexposed.
Palette: near-black #0A0A0B, graphite #1A1A1D, flip-dot yellow #FFC940 as the only saturated color, bone white #F2F1EC for text glyphs where present.
Negative: no purple, no blue or cyan light, no neon glow, no lens flare, no glass, no gradients, no 3D render look, no text other than what is specified, no logos, no watermark, no people.
```

## Текстуры для сайта

| Файл | Размер | Где и как |
|---|---|---|
| `tex-flipdot.jpg` | 2400×1600 | Подложка hero под canvas, `opacity: .18`, `mix-blend-mode: screen` |
| `tex-grille.jpg` | 2000×2000, тайлится | Фон секции Process, `opacity: .25` |
| `tex-splitflap.jpg` | 2400×1200 | Фон CTA вместо/поверх потока байтов, затемняется на 50% |
| `tex-plastic.jpg` | 1200×1200, тайлится | Фон карточек стадий и панелей визуализаций, `opacity: .5` |

### tex-flipdot.jpg — реальное флип-дот табло, макро

```
Extreme close-up of a real electromechanical flip-dot display panel, seen at a slight angle. A dense grid of small round discs, most turned to their matte black side, a scattered minority flipped to the bright yellow side forming no readable pattern. Tiny gaps between discs reveal the dark plastic substrate. Slight dust on the surface, a few discs caught mid-flip showing a thin yellow edge. Shallow depth of field, sharp in the center third, softly blurred toward the edges.
```

### tex-grille.jpg — перфорированный металл, тайл

```
Top-down macro photograph of black anodized aluminium speaker grille with a perfectly regular hexagonal pattern of small round perforations, edge-to-edge, no border, suitable for seamless tiling. Very subtle brushed texture on the metal, faint warm light catching the rim of each hole. Uniform lighting across the whole frame, no vignette.
```

### tex-splitflap.jpg — сплит-флап табло

```
Close-up photograph of a vintage mechanical split-flap departure board, black plastic flaps with a horizontal hinge line through the middle of each character cell, most cells blank black, a few cells showing bone-white block capitals, one cell frozen mid-flip. Rows of cells recede out of focus into the dark. Warm tungsten light from the left, dust particles in the air, film grain.
```

### tex-plastic.jpg — матовый пластик, тайл

```
Macro photograph of matte black textured plastic, fine even pebble grain like the housing of industrial electronics, uniform lighting, edge-to-edge, no border, suitable for seamless tiling. Very low contrast, no highlights, no scratches.
```

## Обои и баннеры

### wallpaper-desktop.jpg — 3840×2160

```
Wide photograph of a large electromechanical flip-dot display mounted on a dark concrete wall in an empty industrial hall at night. The board spells RUNBYTE in bold block capitals made of yellow discs on a field of black discs; the letters are wide and heavy, evenly spaced, perfectly centered. A single warm spotlight from above-left lights the board, the rest of the hall falls into deep shadow. Slight perspective from below and to the left, film grain, matte surfaces, no other text.
```

### wallpaper-phone.jpg — 1290×2796

```
Vertical photograph of a tall electromechanical flip-dot panel in a dark room. Yellow discs spell RUN on one line and BYTE on the line below in heavy block capitals, centered in the upper half; the lower half is a field of black discs with a few random yellow ones. Warm light from the top, deep shadows below, film grain, no other text.
```

### banner-linkedin.jpg — 1584×396

```
Very wide panoramic photograph of a horizontal flip-dot display strip on a dark wall. Small yellow discs form a single line of text RUNBYTE — SOFTWARE THAT RUNS. in block capitals, aligned left with generous empty black dot field on the right. Warm side light, shallow depth of field toward the far right, film grain.
```

### avatar.jpg — 1024×1024

```
Square macro photograph of a flip-dot panel where a 3×3 grid of large round discs is visible; seven discs are flipped to bright yellow and two (center and bottom-right) remain matte black. Dark plastic substrate between discs, warm light from upper left, film grain, centered, no text.
```

## После генерации

1. Сжать до JPEG ~80. Текстуры для тайлинга проверить на шов (в Photoshop: Filter → Other → Offset).
2. Положить в `assets/img/`.
3. Сказать мне, какие файлы готовы, подключу их в CSS.
