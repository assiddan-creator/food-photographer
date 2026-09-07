# Product brief — Assi & Johnny Photobooth AI

Hebrew RTL food-photo studio for a solo creator (Assi). Phone snap in → commercial plate out. Live: [food-photographer.vercel.app](https://food-photographer.vercel.app).

## Live product

- **Single-dish create (Mock v3.1 kitchen flow):** stepper 1 מצלמה → 2 בדיקה → 3 סגנון → 4 פעולות. Empty/camera is live rear camera (headline «צלמו את המנה עכשיו»); sticky «צור תמונה משופרת» only on the style step. Camera error primary is «נסה מצלמה שוב»; «העלה מתמונות» is secondary only. After capture, Gemini photo QA is advisory. Then locked styles + generate. Result hub (Mock v3.1): title «התמונה מוכנה / בלי קלוריות», tabs מסך פעולות | וואטסאפ | לעמוד, teal Wolt 16:9 → green WhatsApp ▶ → outlined page post ▶ → הורדה | שיתוף → נסה סגנון אחר. No calories / nutrition / guest-health features.
- Style presets (classics / creators / studio / cinema / social-AI) + optional free-text prompt
- **Preset brain:** classics = honest enhance; studio = commercial composition; cinema = look/grade; social-AI = viral / experimental; creators = TikTok 9:16. Custom text on classics/studio/social-AI appends authenticity only — the ARRI cinema suffix is cinema-category only (Wolt/TikTok still get their own rules).
- **Wolt-ready pack:** preset «מוכן לוולט» forces 16:9 + enhance-only prompt; result screen has «הורדה לוולט (16:9)» (client-side center crop → clean JPG) and a Hebrew checklist
- **TikTok / story pack:** preset «מוכן לסטורי» forces 9:16 + enhance-only prompt (Stories, Reels, TikTok — home bakers and food creators, not only restaurants); result screen has «הורדה לטיקטוק (9:16)» (client-side center crop → clean 9:16 JPG) and a short Hebrew checklist (אנכי 9:16, מתאים לסטורי/ריל, מנה במרכז)
- **Batch menu («תפריט שלם»):** up to 10 uploads, one style for the run (default Wolt 16:9; TikTok 9:16 is an option), sequential Fal enhance, skip/retry, gallery + «הורד הכל (ZIP)» of Wolt 16:9 or TikTok 9:16 JPGs
- Fal.ai image edit (`FAL_KEY` via `/api/fal/proxy`)
- Gemini photo QA (`GEMINI_API_KEY`, model `GEMINI_ANALYZE_MODEL` or `gemini-3-flash-preview` with `gemini-2.5-flash` fallback) plus optional dish analysis (“נתח את המנה”)
- Result kitchen stack (Mock v3.1): «הורדה לוולט · 16:9» (or «הורדה לסטורי · 9:16»), green «שליחה ללקוח בוואטסאפ ▶» (templates: המנה מוכנה / מבצע היום / לפעם הבאה / דירוג בגוגל), outlined «פרסום מוכן לעמוד ▶» (preview + copy/save + system share — no Facebook OAuth), «הורדה | שיתוף», «נסה סגנון אחר».

## Text overlays are unreliable

Fal image-edit often garbles letters — especially Hebrew. «פירוק מרכיבים (ניסיוני)» and «ערכים תזונתיים (ניסיוני)» live under social-AI. Prompts ask for a few short **English** callouts, not dense Hebrew infographics. Do not treat these as accurate nutrition or readable type. Prefer enhance-only classics (or Gemini’s on-screen analysis) when the dish must stay honest.

## Not in scope yet

Auth, billing, rate limits, CRM, watermarks.

## Next 3

1. **Restaurant lead CTA** — real `NEXT_PUBLIC_WHATSAPP` (or form) and click tracking. The result-screen button is the stub.
2. **Watermark free tier** — unpaid downloads get a light mark; restaurants pay for clean files.
3. **Camera + photo QA for batch** — shoot dishes into the menu queue and reuse the same kitchen photo check.
