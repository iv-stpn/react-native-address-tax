// Skip Husky in CI, production, and when husky isn't installed (e.g. published package installs).
if (process.env.NODE_ENV === "production" || process.env.CI === "true") {
  process.exit(0);
}
try {
  const husky = (await import("husky")).default;
  husky();
} catch {
  // husky is a devDependency; skip when it's absent.
}
