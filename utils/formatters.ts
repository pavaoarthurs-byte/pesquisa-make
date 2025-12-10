
export const toSentenceCase = (str: string): string => {
  if (!str) return "";
  const trimmed = str.trim();
  if (trimmed.length === 0) return "";
  // Converte tudo para minúsculo e põe a primeira em maiúsculo
  const lower = trimmed.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};
