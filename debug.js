const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;

  let result = input
    // Remove script tags and their contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove iframe tags and their contents
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    // Remove object tags and their contents
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    // Remove embed tags and their contents
    .replace(/<embed\b[^>]*>/gi, "")
    // Remove javascript: protocols and everything until whitespace
    .replace(/javascript\s*:[^"'\s]*(?:"[^"]*"|'[^']*')*[^"'\s]*/gi, "")
    // Remove event handlers (on* attributes) - comprehensive patterns
    .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\bon\w+\s*=\s*[^"'\s>]+/gi, "")
    // Remove standalone event handlers
    .replace(/\bon\w+="[^"]*"/gi, "")
    .replace(/\bon\w+='[^']*'/gi, "");

  // Only trim if the result starts/ends with whitespace and the original doesn't
  if (
    result !== input.trim() &&
    (input.startsWith(" ") || input.endsWith(" "))
  ) {
    return result;
  }

  return result.trim();
};

const input = 'javascript:alert("xss") Normal text';
const result = sanitizeInput(input);
console.log("Input:", JSON.stringify(input));
console.log("Output:", JSON.stringify(result));
console.log("Expected:", JSON.stringify(" Normal text"));
console.log("Match:", result === " Normal text");

// Let's debug step by step
let step1 = input.replace(
  /javascript\s*:[^"'\s]*(?:"[^"]*"|'[^']*')*[^"'\s]*/gi,
  ""
);
console.log("After JS removal:", JSON.stringify(step1));
