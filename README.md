# Runbyte — сайт студии

Статичный сайт (HTML + CSS + JS, без сборки). Анимации на GSAP 3.13 (ScrollTrigger, SplitText) и Lenis — все библиотеки и шрифты лежат в репозитории, внешних запросов у сайта нет.

## Запуск локально

Нужен любой статик-сервер (открывать `index.html` двойным кликом нельзя — шрифты и картинки не подгрузятся из-за `file://`).

```bash
# вариант 1 — Python
python3 -m http.server 8080

# вариант 2 — Node
npx serve .
```

Открой http://localhost:8080.

## Структура

```
index.html            — вся страница
assets/css/main.css   — дизайн-система и стили секций
assets/css/fonts.css  — @font-face (шрифты самохостятся)
assets/js/main.js     — все интеракции
assets/js/vendor/     — gsap, ScrollTrigger, SplitText, CustomEase, lenis
assets/fonts/         — Bricolage Grotesque, Instrument Serif, JetBrains Mono (woff2)
assets/img/           — картинки. Сейчас плейсхолдеры-текстуры, заменяются 1:1
docs/DESIGN.md        — дизайн-система и правила «не-AI стиля»
docs/IMAGE-PROMPTS.md — промты для GPT Image с размерами и именами файлов
_headers              — заголовки для Cloudflare Pages (кэш, безопасность)
```

## Замена картинок

Сгенерируй по промтам из `docs/IMAGE-PROMPTS.md`, сохрани в `assets/img/` под теми же именами — код трогать не нужно.

## Деплой на Cloudflare Pages

1. Запушь репозиторий на GitHub (ветка `main`).
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → выбери репозиторий.
3. Настройки сборки:
   - Framework preset: **None**
   - Build command: *(пусто)*
   - Build output directory: `/`
4. **Save and Deploy**. Через минуту сайт доступен на `*.pages.dev`.
5. Свой домен: в проекте Pages → **Custom domains** → **Set up a custom domain**. Если домен уже в Cloudflare, DNS-запись создастся автоматически.

Каждый пуш в `main` — новый деплой; пуши в другие ветки дают preview-URL.

Файл `_headers` Cloudflare подхватывает сам: агрессивный кэш на `assets/*` и базовые security-заголовки.

## Что поменять перед публикацией

- `index.html`: адрес `hello@runbyte.dev`, телефон, город, ссылки на соцсети (`href="#"`), canonical/og URL (`https://runbyte.dev/`).
- Кейсы в секции «Selected work» и цитаты клиентов — сейчас это вымышленные примеры-заглушки.
- Цифры в секции «Numbers» (140+, 9 yrs, 32, 96%).
