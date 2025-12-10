class FormatService {
  formatCurrency(value, currency = "BRL", locale = "pt-BR") {
    if (value === null || value === undefined || isNaN(value)) {
      return this.getCurrencySymbol(currency) + " 0,00";
    }

    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency,
      }).format(value);
    } catch (error) {
      const formatted = this.formatNumber(value, 2);
      return `${this.getCurrencySymbol(currency)} ${formatted}`;
    }
  }

  formatNumber(value, decimals = 2, locale = "pt-BR") {
    if (value === null || value === undefined || isNaN(value)) {
      return "0";
    }

    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }

  formatDate(date, format = "short", locale = "pt-BR") {
    if (!date) return "";

    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return "";
    }

    const formats = {
      short: { day: "2-digit", month: "2-digit", year: "numeric" },
      long: { day: "2-digit", month: "long", year: "numeric" },
      full: {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      },
    };

    return new Intl.DateTimeFormat(locale, formats[format] || formats.short).format(
      dateObj
    );
  }

  formatRelativeTime(date, locale = "pt-BR") {
    if (!date) return "";

    const dateObj = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffMs = now - dateObj;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? "semana" : "semanas"} atrás`;
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? "mês" : "meses"} atrás`;
    }

    const years = Math.floor(diffDays / 365);
    return `${years} ${years === 1 ? "ano" : "anos"} atrás`;
  }

  parseCurrency(value) {
    if (!value) return 0;

    let cleaned = value.replace(/[^\d,.-]/g, "");

    cleaned = cleaned.replace(",", ".");

    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  getCurrencySymbol(currency) {
    const symbols = {
      BRL: "R$",
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
    };

    return symbols[currency] || currency;
  }

  formatPhone(phone) {
    if (!phone) return "";

    const cleaned = phone.replace(/\D/g, "");

    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }

    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }

    return phone;
  }

  truncate(text, maxLength = 50, suffix = "...") {
    if (!text || text.length <= maxLength) return text;

    return text.slice(0, maxLength - suffix.length) + suffix;
  }

  capitalize(text) {
    if (!text) return "";

    return text
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }
}

export const formatService = new FormatService();
