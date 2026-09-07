# Product brief — Assi & Johnny Photobooth AI

Hebrew RTL food-photo studio for a solo creator (Assi). Phone snap in → commercial plate out. Live: [food-photographer.vercel.app](https://food-photographer.vercel.app).

## Live product

- Style presets (classics / studio / cinema / social-AI) + optional free-text prompt
- Upload or rear camera
- Fal.ai image edit (`FAL_KEY` via `/api/fal/proxy`)
- Optional Gemini dish analysis (“נתח את המנה”)
- Result: before/after, download, share-with-signature, restaurant WhatsApp stub

## Not in scope yet

Auth, billing, rate limits, CRM, batch export, watermarks.

## Next 3

1. **Restaurant lead CTA** — real `NEXT_PUBLIC_WHATSAPP` (or form) and click tracking. The result-screen button is the stub.
2. **Watermark free tier** — unpaid downloads get a light mark; restaurants pay for clean files.
3. **Batch menu export** — several dishes → one styled set for home creators and restaurant menus.
