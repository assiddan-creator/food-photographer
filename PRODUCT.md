# Product brief — Assi & Johnny Photobooth AI

Hebrew RTL food-photo studio for a solo creator (Assi). Phone snap in → commercial plate out. Live: [food-photographer.vercel.app](https://food-photographer.vercel.app).

## Live product

- **Single-dish create (simplified):** empty state is upload-only (step 1) with a cyan hint and a disabled sticky «צור תמונה משופרת». After upload (step 2), four primary styles — Wolt 16:9, TikTok 9:16, luxury menu, smart auto. Remaining presets sit under «עוד סגנונות»; Fal models (Hebrew: מהיר / מאוזן / איכות) and free-text sit under «הגדרות מתקדמות». Gemini «נתח את המנה» is a ghost secondary sticky action, not a competing green CTA.
- Style presets (classics / creators / studio / cinema / social-AI) + optional free-text prompt
- **Preset brain:** classics = honest enhance; studio = commercial composition; cinema = look/grade; social-AI = viral / experimental; creators = TikTok 9:16. Custom text on classics/studio/social-AI appends authenticity only — the ARRI cinema suffix is cinema-category only (Wolt/TikTok still get their own rules).
- **Wolt-ready pack:** preset «משלוחים (וולט) / מוכן לוולט» forces 16:9 + enhance-only prompt; result screen has «הורדה לוולט (16:9)» (client-side center crop → clean JPG) and a Hebrew checklist
- **TikTok / creator pack:** category + preset «ליוצרים / טיקטוק» forces 9:16 + enhance-only prompt (home bakers, cake makers, food creators — not only restaurants); result screen has «הורדה לטיקטוק (9:16)» (client-side center crop → clean 9:16 JPG) and a short Hebrew checklist (אנכי 9:16, מתאים לסטורי/ריל, מנה במרכז)
- **Batch menu («תפריט שלם»):** up to 10 uploads, one style for the run (default Wolt 16:9; TikTok 9:16 is an option), sequential Fal enhance, skip/retry, gallery + «הורד הכל (ZIP)» of Wolt 16:9 or TikTok 9:16 JPGs
- Upload or rear camera
- Fal.ai image edit (`FAL_KEY` via `/api/fal/proxy`)
- Optional Gemini dish analysis (“נתח את המנה”)
- Result: before/after, Wolt 16:9 export, TikTok 9:16 export, download, share-with-signature, restaurant WhatsApp stub

## Text overlays are unreliable

Fal image-edit often garbles letters — especially Hebrew. «פירוק מרכיבים (ניסיוני)» and «ערכים תזונתיים (ניסיוני)» live under social-AI. Prompts ask for a few short **English** callouts, not dense Hebrew infographics. Do not treat these as accurate nutrition or readable type. Prefer enhance-only classics (or Gemini’s on-screen analysis) when the dish must stay honest.

## Not in scope yet

Auth, billing, rate limits, CRM, watermarks.

## Next 3

1. **Restaurant lead CTA** — real `NEXT_PUBLIC_WHATSAPP` (or form) and click tracking. The result-screen button is the stub.
2. **Watermark free tier** — unpaid downloads get a light mark; restaurants pay for clean files.
3. **Camera for batch** — shoot dishes into the queue without leaving the phone.
