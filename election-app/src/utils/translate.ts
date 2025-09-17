// utils/translate.ts
export function interpolateTranslation(text: string, params?: Record<string, unknown>): string {
  if (!params) return text;
  
  let result = text;
  Object.entries(params).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    result = result.replace(new RegExp(placeholder, 'g'), String(value));
  });
  
  return result;
}