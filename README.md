# Runbyte — сайт студии

Статичный сайт (HTML + CSS + JS, без сборки). Анимации на GSAP 3.13 (ScrollTrigger, SplitText, ScrambleText) и Lenis — все библиотеки и шрифты лежат в репозитории, внешних запросов у сайта нет.

## Запуск локально

Сайт лежит в `public/`. Ровно как на Cloudflare, с воркером формы, `_headers` и 404:

```bash
npm install
npm run dev        # http://localhost:8787
```

Без Node, только статика (форма отправляться не будет):

```bash
python3 -m http.server 8080 --directory public
```

## Структура

```
public/                    — всё, что уходит на хостинг, и только это
  index.html               — главная
  legal/index.html         — Legal notice: реквизиты RunByte UAB и условия использования
  privacy/index.html       — Privacy policy (GDPR)
  404.html                 — страница «не найдено»
  _headers                 — кэш и заголовки безопасности для Cloudflare
  robots.txt, sitemap.xml, site.webmanifest
  favicon.ico, favicon.svg, apple-touch-icon.png
  assets/css/main.css      — стили главной
  assets/css/legal.css     — стили юридических страниц
  assets/css/fonts.css     — @font-face, шрифты самохостятся
  assets/js/main.js        — все интеракции главной
  assets/js/vendor/        — gsap, ScrollTrigger, SplitText, ScrambleText, CustomEase, lenis
  assets/fonts/            — Archivo, IBM Plex Mono (woff2)
  assets/icons/            — иконки 192/512 для Android и манифеста
  assets/img/              — картинки и текстуры
  .assetsignore            — файлы из public/, которые не выгружаются (картинки для соцсетей)
src/worker.js              — воркер: POST /api/contact для формы, остальное отдаёт статика
wrangler.jsonc             — конфиг Cloudflare Workers
docs/DESIGN.md             — дизайн-система и правила «не-AI стиля»
docs/IMAGE-PROMPTS.md      — промты для генерации картинок
```

## Картинки

Все в `public/assets/img/`, формат webp. Новые файлы загружать туда же.

| Файл | Где используется |
|---|---|
| `tex-flipdot.webp` | подложка под canvas в hero |
| `wallpaper-desktop.webp` | постер после манифеста |
| `tex-grille-tile.webp` | фон секции Process (выровненная по яркости версия `tex-grille.webp`) |
| `tex-plastic-tile.webp` | фон карточек стадий и панелей услуг (бесшовная версия `tex-plastic.webp`) |
| `tex-splitflap.webp` | фон блока с формой |
| `og.jpg` | превью ссылки в соцсетях (снимок hero) |
| `wallpaper-phone.webp`, `banner-linkedin.webp`, `avatar.webp` | для соцсетей, на хостинг не выгружаются |

## Кэш

| Что | Политика |
|---|---|
| шрифты, `assets/js/vendor/` | год, `immutable`: эти файлы не меняются |
| картинки и иконки | неделя |
| `assets/css/*`, `assets/js/main.js`, HTML | `max-age=0, must-revalidate`: браузер каждый раз сверяется с сервером, правки видны сразу |

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
   - Root directory: `/` (сайт берётся из `public/`, это задано в `wrangler.jsonc`)
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

## Юридические данные

Оператор сайта: **RunByte UAB**, company code **308145424**, Литва. Реквизиты стоят в футере главной, в `public/legal/index.html`, `public/privacy/index.html` и в JSON-LD главной (`legalName`, `identifier`).

## Что поменять перед публикацией

- Секрет `RESEND_API_KEY` для формы (см. выше).
- `public/legal/index.html`, строка «Registered office»: вписать юридический адрес из регистра. Закон Литвы об услугах информационного общества требует указывать его на сайте.
- Если компания плательщик НДС, добавить строку «VAT code» туда же.
- Если подключите почтовый сервис для формы, назвать его в `public/privacy/index.html`, раздел «Who receives the data».
- «EST. 2017» в углу hero.
