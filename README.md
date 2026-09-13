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
src/worker.js         — воркер: /api/contact для формы, остальное статика
_headers              — заголовки для Cloudflare (кэш, безопасность)
robots.txt, sitemap.xml, 404.html
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
| `avatar.webp` | apple-touch-icon и логотип в JSON-LD |
| `wallpaper-phone.webp`, `banner-linkedin.webp` | для соцсетей, на сайте не используются |

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

### Свой домен (runbyte.eu)

**Если DNS домена ещё не в Cloudflare** (домен куплен у регистратора и ведёт на его сервера):

1. Cloudflare Dashboard → **Add a domain** → ввести `runbyte.eu` → план Free.
2. Cloudflare покажет два своих nameserver'а вида `xxx.ns.cloudflare.com`. Прописать их у регистратора вместо текущих (раздел Nameservers / DNS-серверы). Обновление занимает от нескольких минут до суток, статус в Cloudflare сменится на Active.

**Привязка воркера к домену** (когда домен в Cloudflare):

1. **Workers & Pages** → **runbyte** → **Settings** → **Domains & Routes** → **Add** → **Custom Domain**.
2. Ввести `runbyte.eu`, нажать **Add domain**. Cloudflare сам создаст DNS-запись и выпустит SSL-сертификат.
3. Повторить для `www.runbyte.eu`, либо сделать редирект: **Rules** → **Redirect Rules** → шаблон «Redirect from WWW to root».

Через несколько минут сайт открывается по https://runbyte.eu. Адрес `*.workers.dev` можно оставить или отключить в **Settings** → **Domains & Routes**.

## Контактная форма

Форма на сайте трёхшаговая и отправляет JSON на `/api/contact`. Этот путь обрабатывает воркер `src/worker.js`, всё остальное он отдаёт как статику.

Куда уходят заявки, задаётся секретами воркера (Cloudflare → runbyte → **Settings** → **Variables and Secrets**):

| Переменная | Что делает |
|---|---|
| `RESEND_API_KEY` | ключ [Resend](https://resend.com): письмо уходит на `info@runbyte.eu`, reply-to = адрес клиента |
| `CONTACT_TO` | куда слать (по умолчанию `info@runbyte.eu`) |
| `CONTACT_FROM` | от кого (по умолчанию `Runbyte <noreply@runbyte.eu>`, домен нужно подтвердить в Resend) |
| `CONTACT_WEBHOOK_URL` | альтернатива почте: POST с JSON заявки на любой URL (Slack, Make, n8n, Telegram-бот) |

Если ничего не задано, воркер отвечает 501, и форма открывает почтовый клиент с уже заполненным письмом, так что заявка всё равно не теряется.

Настройка Resend за пять минут: зарегистрироваться, добавить домен `runbyte.eu` (две DNS-записи, Cloudflare покажет как), создать API-ключ, вставить его в секрет `RESEND_API_KEY`.

Защита: honeypot-поле, серверная валидация, лимит длины полей. Заявки нигде не хранятся, только письмо.

## SEO

- Title, description, keywords, canonical, robots, Open Graph и Twitter-карточки в `<head>`.
- JSON-LD: Organization, WebSite, ProfessionalService с каталогом услуг, FAQPage.
- `robots.txt`, `sitemap.xml`, страница `404.html`.
- Один `h1`, семантические `section`/`article`/`h2`, alt у картинок, шрифты и картинки локальные.
- Комментариев в исходниках страницы нет.

После подключения домена: добавить сайт в Google Search Console и отправить `https://runbyte.eu/sitemap.xml`.

## Что поменять перед публикацией

- Ссылки Privacy и Imprint в футере (`href="#"`): нужны реальные страницы.
- Секрет `RESEND_API_KEY` для формы (см. выше).
- «EST. 2017» в углу hero.
