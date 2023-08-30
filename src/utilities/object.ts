export function cleanObj(obj: Record<string, any>) {
  const entries = Object.entries(obj).filter((e) => e[1] !== null && e[1] !== undefined);
  return Object.fromEntries(entries);
}
