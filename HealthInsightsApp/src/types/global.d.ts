/** Minimal process.env for config and tests (avoids requiring @types/node). */
declare const process: {
  env: Record<string, string | undefined>;
} | undefined;
