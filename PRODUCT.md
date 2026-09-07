# Product brief — Assi & Johnny Photobooth AI

Hebrew RTL food-photo studio for a solo creator (Assi). Phone snap in → commercial plate out. Live: [food-photographer.vercel.app](https://food-photographer.vercel.app).

## Live product

- **Single-dish create (Mock v3.1 kitchen flow):** stepper 1 מצלמה → 2 בדיקה → 3 סגנון → 4 פעולות. Empty/camera is live rear camera (headline «צלמו את המנה עכשיו»); sticky «צור תמונה משופרת» only on the style step. Camera error primary is «נסה מצלמה שוב»; «העלה מתמונות» is secondary only. After capture, Gemini photo QA is advisory. Then locked styles + generate. Result hub (Mock v3.1): title «התמונה מוכנה / בלי קלוריות», tabs מסך פעולות | וואטסאפ | לעמוד, gold «לאן מייצאים? ▶» → WhatsApp ▶ → outlined page post ▶ → הורדה | שיתוף → נסה סגנון אחר. No calories / nutrition / guest-health features.
- Style presets (classics / creators / studio / cinema / social-AI) + optional free-text prompt
- **Preset brain:** classics = honest enhance; studio = commercial composition; cinema = look/grade; social-AI = viral / experimental; creators = TikTok 9:16. Custom text on classics/studio/social-AI appends authenticity only — the ARRI cinema suffix is cinema-category only (Wolt/TikTok still get their own rules).
- **Wolt-ready pack:** preset «מוכן לוולט» forces 16:9 + commercial listing prompt (complimentary background, same dish); result hub opens «לאן מייצאים?» for Wolt / Ten Bis 16:9 download (client-side center crop → clean JPG)
- **TikTok / story pack:** preset «מוכן לסטורי» forces 9:16 + enhance-only prompt; the same «לאן מייצאים?» screen downloads `story-9x16.jpg` (and the other ratios) from the generated photo
- **Batch menu («תפריט שלם»):** up to 10 uploads, one style for the run (default Wolt 16:9; TikTok 9:16 is an option), sequential Fal enhance, skip/retry, gallery + «הורד הכל (ZIP)» of Wolt 16:9 or TikTok 9:16 JPGs
- Fal.ai image edit (`FAL_KEY` via `/api/fal/proxy`)
- Gemini photo QA (`GEMINI_API_KEY`, model `GEMINI_ANALYZE_MODEL` or `gemini-3-flash-preview` with `gemini-2.5-flash` fallback) plus optional dish analysis (“נתח את המנה”)
- Result kitchen stack (Mock v3.1): «לאן מייצאים? ▶» opens the multi-platform export screen, then WhatsApp ▶ (templates: המנה מוכנה / מבצע היום / לפעם הבאה / **הזמנה ישירה · הטבה** / דירוג בגוגל), outlined «פרסום מוכן לעמוד ▶», «הורדה | שיתוף», «נסה סגנון אחר».
- **Multi-platform export («לאן מייצאים?»):** after generate, pick one or more targets from the same photo (no new Fal job): **וולט 16:9** «רקע מחמיא · מנה זהה», **תן ביס** «משלוחים · גם סיבוס · 16:9» (same listing crop as Wolt, `tenbis-16x9.jpg`), **סטורי / ריל 9:16**, **ריבוע 1:1**. Gold «הורד נבחרים (N)», outlined «שתף נבחרים», and batch «ייצא הכל לוולט+תן-ביס». Client-side center crop (cover) via canvas. One file downloads as `wolt-16x9.jpg` / `tenbis-16x9.jpg` / `story-9x16.jpg` / `square-1x1.jpg`; two or more pack those names into `wolt-tenbis.zip` or `export-selected.zip`.
- **Restaurant settings («הגדרות מסעדה»):** header entry from the kitchen. Mock chrome: חזרה, title, subtitle «וואטסאפ · גוגל · נאמנות — בלי קלוריות», WhatsApp (number + business name), Google review link + «בדיקת קישור», locked loyalty info cards **הזמנה ראשונה ישירה · 10%** and **לקוח חוזר · 12%** with «נעול» (subtitle «קבוע במערכת · אין בחירת אחוז»; helper «בלי בחירה בין השניים · בלי 15%»), optional first-order and returning copy. Saved in `localStorage` (env fallbacks). WhatsApp templates pull 10% first / 12% returning. Google review template is request + link only — **no discount**.
- **Loyalty WhatsApp bridge («הזמנה ישירה · הטבה»):** gold chip alongside the other templates — does **not** replace «לפעם הבאה». Owner picks **ראשון 10%** or **חוזר 12%** (locked rates from settings). First: welcome + 10% on first direct order + reply «אני». Returning: «חברים של הבית» + 12% on direct order. Optional settings copy when set. Dish photo is attached. Never «עזוב תן-ביס/וולט» and never a discount tied to a Google review.
- **Lunch menu («תפריט צהריים»):** compose a short daily set from dishes **already enhanced** in the app (single generate + batch results, remembered on-device). Pick **3–5** cards (optional name + price), then «הודעה למשרד»: warm WhatsApp preview for an office group (business name from settings, prices in the list, direct order / pickup, no Ten Bis/Wolt bashing). Guidance chip «מומלץ לשלוח ~10:30» — not a scheduler. Copy / open WhatsApp and attach the selected photos when the device allows.

## Text overlays are unreliable

Fal image-edit often garbles letters — especially Hebrew. «פירוק מרכיבים (ניסיוני)» and «ערכים תזונתיים (ניסיוני)» live under social-AI. Prompts ask for a few short **English** callouts, not dense Hebrew infographics. Do not treat these as accurate nutrition or readable type. Prefer enhance-only classics (or Gemini’s on-screen analysis) when the dish must stay honest.

## Not in scope yet

Auth, billing, rate limits, CRM, watermarks, multi-tenant cloud settings.

## Next 3

1. **Watermark free tier** — unpaid downloads get a light mark; restaurants pay for clean files.
2. **Camera + photo QA for batch** — shoot dishes into the menu queue and reuse the same kitchen photo check.
3. **Cloud settings** — sync restaurant WhatsApp / review URL beyond this device when auth exists.
