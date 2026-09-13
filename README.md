# Runbyte — сайт студии

Статичный сайт (HTML + CSS + JS, без сборки). Анимации на GSAP 3.13 (ScrollTrigger, SplitText, ScrambleText) и Lenis — все библиотеки и шрифты лежат в репозитории, внешних запросов у сайта нет.

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
assets/img/og.jpg     — превью для соцсетей (скриншот hero)
docs/DESIGN.md        — дизайн-система и правила «не-AI стиля»
_headers              — заголовки для Cloudflare (кэш, безопасность)
wrangler.jsonc        — конфиг Cloudflare Workers (static assets)
.assetsignore         — что не выгружать на Workers
```

## Картинки

Все в `assets/img/`, формат webp:

| Файл | Где используется |
|---|---|
| `tex-flipdot.webp` | подложка под canvas в hero |
| `wallpaper-desktop.webp` | постер после манифеста |
| `tex-grille-tile.webp` | фон секции Process (выровненная по яркости версия `tex-grille.webp`) |
| `tex-plastic-tile.webp` | фон карточек стадий и панелей услуг (бесшовная версия `tex-plastic.webp`) |
| `tex-splitflap.webp` | фон CTA |
| `og.jpg` | превью ссылки в соцсетях |
| `wallpaper-phone.webp`, `banner-linkedin.webp`, `avatar.webp` | для соцсетей, на сайте не используются |

Промты для генерации — в `docs/IMAGE-PROMPTS.md`.

## Деплой на Cloudflare Workers

Сайт раздаётся как static assets воркера. Конфиг — `wrangler.jsonc`, лишние файлы (`.git`, `docs`, README) исключены через `.assetsignore`.

### Вариант A — из дашборда, привязка к GitHub (деплой на каждый пуш)

1. https://dash.cloudflare.com → **Compute (Workers)** → **Workers & Pages** → **Create** → вкладка **Workers** → **Import a repository**.
2. Подключи GitHub-аккаунт, выбери репозиторий `itensity-dev/runbyte`.
3. Настройки:
   - Project name: `runbyte`
   - Production branch: ветка, где лежит сайт (`main` или текущая рабочая ветка)
   - Build command: *(пусто)*
   - Deploy command: `npx wrangler deploy`
   - Root directory: `/`
4. **Create and deploy**. Через ~1 минуту сайт будет на `https://runbyte.<твой-аккаунт>.workers.dev`.

### Вариант B — с компьютера одной командой

```bash
npm install
npx wrangler login      # откроется браузер, разреши доступ
npx wrangler deploy     # выведет URL вида https://runbyte.<аккаунт>.workers.dev
```

### Свой домен

В воркере → **Settings** → **Domains & Routes** → **Add** → **Custom domain** → ввести домен. Если домен уже в Cloudflare, DNS создастся автоматически.

## Что поменять перед публикацией

- `index.html`: адрес `hello@runbyte.dev`, телефон, город, ссылки на соцсети (`href="#"`), canonical/og URL (`https://runbyte.dev/`).
- Цены в FAQ (€25k–€250k, discovery от €4k) и часы работы (8:00–20:00 CET).
- «EST. 2017» в углу hero.
