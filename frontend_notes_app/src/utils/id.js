let counter = 0;

/**
 * Generate a short unique id.
 */
// PUBLIC_INTERFACE
export function newId() {
  /** Public function to generate unique IDs for notes. */
  const rnd = Math.random().toString(36).slice(2, 8);
  const ts = Date.now().toString(36);
  counter = (counter + 1) % 1000;
  return `n_${ts}_${rnd}_${counter}`;
}
