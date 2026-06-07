import { defineCloudflareConfig } from '@opennextjs/cloudflare';

export default defineCloudflareConfig({
  // ── Incremental cache ──
  // Disabled — we don't use ISR. Enable later if we add cached server pages.
  // incrementalCache: kvIncrementalCache,

  // ── Tag cache ──
  // Used by `revalidateTag()`. Not used currently.
  // tagCache: d1NextTagCache,

  // ── Queue ──
  // For background ISR revalidation. Not needed.
  // queue: doQueue,
});
