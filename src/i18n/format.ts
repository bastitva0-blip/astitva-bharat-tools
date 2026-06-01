// Minimal {key} template substitution for i18n strings with dynamic values.
//
// Pattern: dict entries that need interpolation hold a template with `{key}`
// placeholders; the call site supplies the vars. Keeps the dict pure data (no
// JSX, no ICU plurals) — simple to translate, simple to grep.
//
// Example:
//   fmt(dict.photoResize.variant.titleTemplate, { name: preset.name })
//
// A placeholder appearing in the template but missing from vars is left as
// "{key}" so it surfaces visibly in QA rather than failing silently.

export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}
