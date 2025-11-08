# 🛡️ Centralized Form Validation System

A comprehensive form validation system that provides automatic input sanitization, centralized validation rules, and enhanced error handling for React Native applications.

## ✨ Features

- **🔒 Automatic XSS Protection** - Built-in sanitization prevents script injection attacks
- **📋 Centralized Validation Rules** - Reusable validation strategies for common patterns
- **⚡ Real-time Validation** - Instant feedback as users type
- **🎯 Type-safe Error Handling** - Consistent error display and management
- **📊 Form State Tracking** - Monitor form validity, submission state, and statistics
- **🧩 Composable Architecture** - Mix and match validation rules as needed

## 🚀 Quick Start

### 1. Basic Form with Validation

```javascript
import { useFormValidation } from "./hooks/useFormValidation";
import { validationSets } from "./utils/validationRules";
import ValidatedInput from "./components/ValidatedInput";

const MyForm = () => {
  const { handleSubmit, getFieldProps, canSubmit, isSubmitting } =
    useFormValidation({
      defaultValues: { email: "", password: "" },
      validationRules: validationSets.login,
      onSubmit: async (sanitizedData) => {
        // Data is automatically sanitized and validated
        await submitToServer(sanitizedData);
      },
    });

  return (
    <View>
      <Controller
        {...getFieldProps("email")}
        render={({ value, onChange, onBlur, error, hasError }) => (
          <ValidatedInput
            label="Email"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={error}
            hasError={hasError}
            keyboardType="email-address"
          />
        )}
      />

      <Button
        title="Submit"
        onPress={handleSubmit}
        disabled={!canSubmit}
        loading={isSubmitting}
      />
    </View>
  );
};
```

### 2. Input Sanitization

```javascript
import { sanitizeInput } from "./utils/validationRules";

// Automatically removes dangerous content
const userInput = '<script>alert("xss")</script>Hello World';
const safeInput = sanitizeInput(userInput); // 'Hello World'
```

## 📁 File Structure

```
utils/
  ├── validationRules.js          # Validation rules and sanitization
hooks/
  ├── useFormValidation.js        # Enhanced form validation hook
components/
  ├── ValidatedInput.js           # Input component with validation display
examples/
  ├── EnhancedLoginScreen.js      # Example implementation
docs/
  ├── FORM_VALIDATION.md          # Comprehensive documentation
__tests__/
  ├── validationSystem.test.js    # Complete test suite
```

## 🛡️ Security Features

### XSS Protection

The system automatically sanitizes all user inputs to prevent cross-site scripting attacks:

```javascript
// Dangerous input patterns automatically removed:
'<script>alert("xss")</script>'     → ''
'<iframe src="evil.com"></iframe>'  → ''
'javascript:alert("evil")'          → ''
'onclick="malicious()"'             → ''
```

### Input Validation

```javascript
// Email validation with sanitization
validationRules.email();

// Password with minimum length
validationRules.password(8);

// Text with length limits and XSS protection
validationRules.text(0, 255, true);

// Currency validation
validationRules.currency(parseCurrencyFunction);
```

## 🎯 Validation Rules

### Pre-built Rules

- ✅ **Email** - RFC compliant email validation
- ✅ **Password** - Configurable minimum length
- ✅ **Currency** - Positive number validation with custom parser
- ✅ **Text** - Length limits with automatic sanitization
- ✅ **Category** - Whitelist validation
- ✅ **Date** - Valid date checking
- ✅ **Phone** - Phone number format validation
- ✅ **Custom** - Your own validation logic

### Pre-configured Form Sets

- 🔐 **Login Form** - Email + Password
- 📝 **Registration Form** - Email + Password + Confirmation
- 💰 **Transaction Form** - Title + Description + Amount + Category + Date
- 🔄 **Recurring Transaction** - All transaction fields + Frequency

## 🔧 Enhanced Form Hook

The `useFormValidation` hook extends react-hook-form with additional features:

```javascript
const {
  // Core form methods
  control,
  handleSubmit,
  resetForm,

  // Enhanced methods
  getFieldProps, // Simplified field configuration
  validateField, // Validate specific field
  getSanitizedValues, // Get clean form data

  // State management
  errors,
  isSubmitting,
  isValid,
  canSubmit,
  formStats, // Detailed form statistics

  // Error handling
  setFieldError,
  clearFieldErrors,
  hasFieldError,
  getFieldError,
} = useFormValidation(options);
```

## 🧪 Testing

Comprehensive test suite covering:

- ✅ Sanitization functions (XSS prevention)
- ✅ Validation rule accuracy
- ✅ Form integration scenarios
- ✅ Performance benchmarks
- ✅ Security vulnerability tests
- ✅ Edge case handling

Run tests:

```bash
npm test validationSystem.test.js
```

## 📚 Examples

### Transaction Form (Before & After)

**Before** (Manual validation):

```javascript
const [errors, setErrors] = useState({});

const validateForm = () => {
  const newErrors = {};

  if (!title.trim()) {
    newErrors.title = "Title required";
  }

  if (!description.trim()) {
    newErrors.description = "Description required";
  } else if (description.length < 3) {
    newErrors.description = "Too short";
  }

  // ... more manual validation

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  // Manual sanitization needed
  const cleanData = {
    title: title.trim(),
    description: description.trim(),
    // ... manual cleaning
  };

  await saveTransaction(cleanData);
};
```

**After** (Automated validation):

```javascript
const form = useFormValidation({
  validationRules: validationSets.transaction(categories, parseCurrency),
  onSubmit: async (sanitizedData) => {
    // Data automatically validated and sanitized
    await saveTransaction(sanitizedData);
  },
});

// Form fields automatically handled with getFieldProps()
```

## 🔄 Migration Guide

### Step 1: Install Dependencies

No additional dependencies needed - works with existing react-hook-form.

### Step 2: Replace Manual Validation

```javascript
// Old approach
const [errors, setErrors] = useState({});
const validateForm = () => {
  /* manual validation */
};

// New approach
const form = useFormValidation({
  validationRules: validationSets.login,
  onSubmit: handleSubmit,
});
```

### Step 3: Update Input Components

```javascript
// Replace standard TextInput with ValidatedInput
<ValidatedInput
  label="Email"
  value={value}
  onChangeText={onChange}
  error={error}
  hasError={hasError}
/>
```

## 🎨 Customization

### Custom Validation Rules

```javascript
const customRules = {
  username: {
    required: "Username required",
    minLength: { value: 3, message: "Too short" },
    validate: (value) => {
      if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        return "Only alphanumeric and underscore allowed";
      }
      return true;
    },
  },
};
```

### Custom Sanitization

```javascript
const customSanitize = (input) => {
  return sanitizeInput(input).replace(/[^a-zA-Z0-9\s]/g, ""); // Remove special chars
};
```

## 🛠️ API Reference

### Core Functions

```javascript
// Sanitization
sanitizeInput(input); // Clean single input
sanitizeFormData(formData); // Clean form object
isSafeValue(value); // Check if value is safe

// Validation Rules
validationRules.required(message);
validationRules.email(message);
validationRules.password(minLength, message);
validationRules.currency(parseFunction, message);
validationRules.category(allowedList, message);
validationRules.custom(validateFn, message);

// Validation Sets
validationSets.login;
validationSets.register(passwordValue);
validationSets.transaction(categories, parseCurrency);
```

## 📊 Performance

- **Sanitization**: Handles 10KB+ text in <100ms
- **Validation**: Real-time validation with minimal latency
- **Memory**: Efficient cleanup prevents memory leaks
- **Bundle Size**: Lightweight implementation (~5KB gzipped)

## 🤝 Contributing

1. Add new validation rules to `validationRules.js`
2. Include XSS sanitization where applicable
3. Add comprehensive tests
4. Update documentation
5. Consider adding to pre-configured sets

## 📄 License

This validation system is part of the Tech Challenge 4 project and follows the same license terms.

---

**🚀 Ready to secure your forms?** Check out the [complete documentation](./docs/FORM_VALIDATION.md) and [examples](./examples/) to get started!
