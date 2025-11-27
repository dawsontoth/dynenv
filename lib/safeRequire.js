import { createRequire } from 'module';

// Create a CommonJS-compatible require that works from ESM context
const requireCompat = createRequire(import.meta.url);

export function safeRequire(ref) {
  try {
    return requireCompat(ref);
  }
  catch (err) {
    console.error(err);
    return null;
  }
}
