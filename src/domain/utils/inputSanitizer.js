export const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;

  let result = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^>]*>/gi, "")
    .replace(/javascript\s*:[^"'\s]*(?:"[^"]*"|'[^']*')*[^"'\s]*/gi, "")
    .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\bon\w+\s*=\s*[^"'\s>]+/gi, "")
    .replace(/\bon\w+="[^"]*"/gi, "")
    .replace(/\bon\w+='[^']*'/gi, "");

  result = result.trimStart();

  const hasTrailingSpace = result.endsWith(" ");
  result = result.replace(/\s{2,}/g, " ");

  if (hasTrailingSpace && !result.endsWith(" ")) {
    result += " ";
  }

  return result;
};

export const isSafeValue = (value) => {
  if (typeof value !== "string") return true;

  const dangerous = [
    /<script/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /javascript:/i,
    /on\w+\s*=/i,
  ];

  return !dangerous.some((pattern) => pattern.test(value));
};

export const sanitizeFormData = (data) => {
  const sanitized = {};

  Object.keys(data).forEach((key) => {
    const value = data[key];
    if (typeof value === "string") {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  });

  return sanitized;
};

export const createSanitizationValidator = (
  message = "Contém caracteres inválidos"
) => {
  return (value) => {
    if (typeof value !== "string") return true;
    const sanitized = sanitizeInput(value);
    return sanitized === value || message;
  };
};

export const normalizeText = (input) => {
  if (typeof input !== "string") return input;
  return input.trim().toLowerCase();
};

export const normalizeCurrency = (input) => {
  if (typeof input !== "string") return input;
  return input.replace(/[^\d.,]/g, "").replace(",", ".");
};
