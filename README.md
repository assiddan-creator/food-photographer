# Assi & Johnny Photobooth AI — Virtual Food Photographer

**עברית למטה ↓**

Turn a phone photo of a dish into a commercial food image. Hebrew RTL kitchen UI: tap **צלם מנה**, get a photo-quality check, pick a style, generate, then **ייצוא לוולט/תן-ביס/סטורי/ריבוע / שלח ללקוח / הורדה / שתף**. Also **Wolt 16:9**, **Ten Bis 16:9**, **story 9:16**, or **square 1:1** from one generated photo (no extra Fal job), refresh a whole menu with **batch mode** (up to 10 dishes → ZIP), or compose **תפריט צהריים** (3–5 already-enhanced dishes → office WhatsApp).

Live demo: [food-photographer.vercel.app](https://food-photographer.vercel.app)

## What it is

A Next.js App Router product. The **live generate path** is client-side Fal.ai (`hooks/usePipeline.ts`) through `/api/fal/proxy` (`FAL_KEY`). Images are uploaded with `fal.storage.upload`, then the selected edit model runs via `fal.subscribe`.

After capture, **photo QA** (`/api/analyze-photo`) uses Gemini vision to check focus, lighting, and whether the full dish is in frame. Optional **“נתח את המנה”** still uses `/api/analyze-food`. Both share `lib/gemini.ts` (`GEMINI_API_KEY`, optional `GEMINI_ANALYZE_MODEL`, default `gemini-3-flash-preview` with `gemini-2.5-flash` fallback).

**Wolt pack:** the «משלוחים (וולט) / מוכן לוולט» preset forces Fal `16:9` and a commercial listing prompt (complimentary background, same plated dish). After generate, **«לאן מייצאים?»** lets you download **Wolt 16:9** and **Ten Bis / Cibus 16:9** from the same photo (`wolt-16x9.jpg` / `tenbis-16x9.jpg`) plus story 9:16 and square 1:1. Crops run in the browser (center cover, long edge ≥1000px). Cinema / social styles stay separate. The export does not add text, borders, or watermarks.

**TikTok / creator pack:** the «ליוצרים / טיקטוק» category and preset force Fal `9:16` and the same enhance-only rules, framed for home bakers, cake makers, and food TikTok creators in Israel. After generate, **«לאן מייצאים?»** can save `story-9x16.jpg` (and the other ratios) from that same photo.

**Batch menu («תפריט שלם (כמה מנות)»):** restaurants or creators upload up to **10** dish photos, pick one style (default Wolt 16:9 enhance-only; TikTok 9:16 is available), and run them **one after another** on the same Fal `usePipeline` / `fal.subscribe` path. Per-item status is ממתין / בעבודה / מוכן / שגיאה. Failed items can be skipped or retried without losing successes. **«הורד הכל (ZIP)»** packs Wolt 16:9 or TikTok 9:16 JPGs with `lib/wolt-export.ts` / `lib/tiktok-export.ts` + client-side JSZip. Each photo spends Fal usage like a single generate.

**Lunch menu («תפריט צהריים»):** pick **3–5** dishes already enhanced in this app (single or batch results are remembered on-device). Optional name + price per card, then a warm office-group WhatsApp message (business name from restaurant settings). Guidance only for a ~10:30 send — not a scheduler. Share attaches the selected photos when the device allows.

This is not a full SaaS yet: no auth, billing, or rate limits. Treat the public Fal proxy and analyze route as spend-sensitive.

## Required environment variables

Copy `.env.example` to `.env.local`:

| Variable | Required | Used by |
| --- | --- | --- |
| `FAL_KEY` | Yes (generate) | `/api/fal/proxy` — Fal storage + image edit |
| `GEMINI_API_KEY` | Photo QA + optional analyze | `/api/analyze-photo`, `/api/analyze-food` |
| `GEMINI_ANALYZE_MODEL` | Optional | Vision model override (default `gemini-3-flash-preview`) |
| `NEXT_PUBLIC_WHATSAPP` | Optional | Fallback restaurant WhatsApp (`9725…` or `https://wa.me/…`). Owner settings in the app override this per device. |
| `NEXT_PUBLIC_GOOGLE_REVIEW_URL` | Optional | Fallback Google review link for the «דירוג בגוגל» template. Owner settings override this per device. |

Do not commit real keys. `.gitignore` ignores `.env*` except `.env.example`.

## Run locally

```bash
npm install
cp .env.example .env.local
# put FAL_KEY (and optionally GEMINI_API_KEY) in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run lint    # eslint
```

## Deploy notes (Vercel)

1. Import [assiddan-creator/food-photographer](https://github.com/assiddan-creator/food-photographer).
2. Set `FAL_KEY` in the Vercel project (Production + Preview).
3. Set `GEMINI_API_KEY` if analyze should work in that environment.
4. Optionally set `NEXT_PUBLIC_WHATSAPP` as a fallback number. Owners can also save WhatsApp + Google review URL in **הגדרות מסעדה** (stored in the browser).
5. Redeploy after changing `NEXT_PUBLIC_*` vars (they are inlined at build time).

The Fal proxy forwards the server `FAL_KEY`. Anyone who can hit the deployed site can spend that key — add rate limiting / auth before paid traffic.

## Architecture (live vs removed)

| Path | Status |
| --- | --- |
| `usePipeline` / `useBatchPipeline` → `/api/fal/proxy` → Fal edit models | **Live** generate (single + sequential batch) |
| `/api/analyze-photo` → Gemini | **Live** kitchen photo QA (focus / light / framing) |
| `/api/analyze-food` → Gemini | **Live** optional analyze |
| Replicate (`/api/generate`, `/api/poll`, `/api/restore`) | **Removed** — unused by UI |
| Cloudinary (`/api/upload`) | **Removed** — UI uploads via Fal storage |
| `/api/fal-generate`, `/api/fal-speed-test`, `lib/fal.ts` | **Removed** — leftover experiments |

## Roadmap (next 3)

1. **Watermark free tier** — mark unpaid exports so restaurants can upgrade to clean files.
2. **Camera + photo QA for batch** — shoot dishes into the menu queue with the same kitchen photo check.
3. **Cloud settings** — sync restaurant WhatsApp / review URL beyond this device when auth exists.

See [PRODUCT.md](./PRODUCT.md) for the short product brief.

---

# צלם מנות וירטואלי — Assi & Johnny Photobooth AI

מעלים או מצלמים מנה מהטלפון ומקבלים תמונה שנראית כמו צילום סטודיו. ממשק עברי RTL למטבח: **צלם מנה**, בדיקת איכות, בחירת סגנון, יצירה, ואז **לאן מייצאים? / שלח ללקוח / הורדה / שתף**.

דמו חי: [food-photographer.vercel.app](https://food-photographer.vercel.app)

## מה זה

אפליקציית Next.js. **נתיב היצירה החי** הוא Fal.ai דרך `hooks/usePipeline.ts` ו־`/api/fal/proxy` (צריך `FAL_KEY`). ההעלאה היא `fal.storage.upload`, ואז המודל שנבחר רץ ב־`fal.subscribe`.

**«נתח את המנה»** אופציונלי — Gemini (`GEMINI_API_KEY`).

**חבילת וולט:** הסגנון «משלוחים (וולט) / מוכן לוולט» כופה 16:9 ורקע מחמיא עם מנה זהה. במסך התוצאה — «לאן מייצאים?» לייצוא וולט, תן ביס/סיבוס, סטורי וריבוע מאותה תמונה (חיתוך ממורכז בדפדפן, בלי יצירה מחדש).

**חבילת יוצרים / טיקטוק:** הסגנון «ליוצרים / טיקטוק» כופה 9:16 לאופים ביתיים, עוגות ויוצרי אוכל. ב«לאן מייצאים?» אפשר להוריד סטורי 9:16 וגם גדלים אחרים מאותה תמונה.

**תפריט שלם:** עד 10 תמונות, סגנון אחד (ברירת מחדל וולט; אפשר טיקטוק 9:16), עיבוד אחת אחרי השנייה, והורדת ZIP. כל תמונה עולה שימוש ב־Fal.

**תפריט צהריים:** בוחרים 3–5 מנות שכבר שופרו באפליקציה (בלי צילום מחדש), ממלאים שם ומחיר לפי הצורך, ומקבלים הודעת וואטסאפ חמה לקבוצת משרד (~10:30 כהנחיה בלבד).

אין עדיין התחברות, תשלום או הגבלת קצב. המפתח של Fal חשוף דרך הפרוקסי לכל מי שנכנס לאתר.

## משתני סביבה

| משתנה | חובה | שימוש |
| --- | --- | --- |
| `FAL_KEY` | כן (יצירה) | פרוקסי Fal |
| `GEMINI_API_KEY` | בדיקת תמונה + ניתוח מנה | `/api/analyze-photo`, `/api/analyze-food` |
| `GEMINI_ANALYZE_MODEL` | לא חובה | מודל Gemini (ברירת מחדל `gemini-3-flash-preview`) |
| `NEXT_PUBLIC_WHATSAPP` | לא חובה | מספר וואטסאפ גיבוי. אפשר גם לשמור ב«הגדרות מסעדה» במכשיר |
| `NEXT_PUBLIC_GOOGLE_REVIEW_URL` | לא חובה | קישור דירוג גוגל גיבוי. אפשר גם לשמור בהגדרות |

העתיקו `.env.example` ל־`.env.local`. אל תעלו מפתחות אמיתיים לגיט.

## הרצה מקומית

```bash
npm install
cp .env.example .env.local
npm run dev
```

## פריסה ב־Vercel

מגדירים `FAL_KEY` בפרויקט. `GEMINI_API_KEY` אם רוצים ניתוח מנה. `NEXT_PUBLIC_WHATSAPP` לכפתור הוואטסאפ (מספר או קישור מלא). אחרי שינוי משתנה `NEXT_PUBLIC_*` צריך redeploy.

## מפת דרכים (3 הבאים)

1. **שכבת חינם עם ווטרמרק** — ייצוא מסומן עד שמשלמים.
2. **מצלמה ובדיקת תמונה לתפריט שלם** — לצלם מנות לתור עם אותה בדיקת איכות.
3. **הגדרות בענן** — לסנכרן וואטסאפ / דירוג גוגל מעבר למכשיר הזה.
