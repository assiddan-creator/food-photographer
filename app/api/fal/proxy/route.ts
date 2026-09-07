import { createRouteHandler } from '@fal-ai/server-proxy/nextjs';

// Lock the public proxy to the edit models the UI actually offers.
// Storage uploads go to rest.fal.ai and skip this POST endpoint check.
export const { GET, POST, PUT } = createRouteHandler({
  allowedEndpoints: [
    'fal-ai/nano-banana/**',
    'fal-ai/nano-banana-2/**',
    'fal-ai/nano-banana-pro/**',
    'fal-ai/bytedance/seedream/v5/lite/**',
    'fal-ai/flux-2-pro/**',
  ],
});
