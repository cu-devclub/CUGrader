# Next-intl Implementation Guide

This guide shows how to implement internationalization (i18n) in your Next.js application using next-intl.

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx                 # Root layout with NextIntlClientProvider
│   └── example/
│       └── next-intl_example/
│           └── page.tsx           # Example page showing all features
├── components/
│   └── locale-switcher.tsx        # Reusable locale switching component
├── i18n/
│   └── request.ts                 # i18n configuration
└── messages/
    ├── en.json                    # English translations
    └── th.json                    # Thai translations
```

## 🚀 Quick Start

### 1. Install next-intl

```bash
npm install next-intl
```

### 2. Configure next.config.ts

```typescript
import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  // your existing config
};

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
export default withNextIntl(nextConfig);
```

### 3. Create Translation Files

Create `messages/en.json`:
```json
{
  "common": {
    "welcome": "Welcome!",
    "greeting": "Hello {name}!",
    "itemCount": "{count, plural, =0 {No items} =1 {1 item} other {# items}}"
  }
}
```

Create `messages/th.json`:
```json
{
  "common": {
    "welcome": "ยินดีต้อนรับ!",
    "greeting": "สวัสดี {name}!",
    "itemCount": "{count, plural, =0 {ไม่มีรายการ} other {# รายการ}}"
  }
}
```

### 4. Configure i18n/request.ts

```typescript
import { getRequestConfig } from 'next-intl/server';

const locales = ['en', 'th'];

export default getRequestConfig(async ({ locale }) => {
    // Default to English if locale is not provided or invalid
    const validLocale = locale && locales.includes(locale) ? locale : 'en';

    return {
        locale: validLocale,
        messages: (await import(`../../messages/${validLocale}.json`)).default
    };
});
```

### 5. Create Middleware (Optional)

Create `src/middleware.ts` for automatic locale routing:
```typescript
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'th'],
  defaultLocale: 'en',
  localePrefix: 'as-needed'
});

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/'
  ]
};
```

### 6. Update Root Layout

```typescript
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();

  return (
    <html>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

## 🎯 Usage Examples

### Basic Translation

```typescript
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('common');
  
  return <h1>{t('welcome')}</h1>;
}
```

### Variable Interpolation

```typescript
const t = useTranslations('common');
const userName = 'John';

return <p>{t('greeting', { name: userName })}</p>;
```

### Pluralization

```typescript
const t = useTranslations('common');
const itemCount = 5;

return <p>{t('itemCount', { count: itemCount })}</p>;
```

### Locale Detection

```typescript
import { useLocale } from 'next-intl';

function LocaleAwareComponent() {
  const locale = useLocale();
  
  return <p>Current locale: {locale}</p>;
}
```

### Locale Switching

```typescript
'use client'

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  const toggleLocale = () => {
    const newLocale = locale === 'en' ? 'th' : 'en';
    document.cookie = \`locale=\${newLocale}; path=/; max-age=31536000\`;
    router.refresh();
  };

  return (
    <button onClick={toggleLocale}>
      {locale === 'en' ? 'ไทย' : 'EN'}
    </button>
  );
}
```

## 🌍 Advanced Features

### Date and Number Formatting

```typescript
import { useLocale } from 'next-intl';

function FormattedContent() {
  const locale = useLocale();
  
  const date = new Date().toLocaleDateString(
    locale === 'th' ? 'th-TH' : 'en-US'
  );
  
  const currency = new Intl.NumberFormat(
    locale === 'th' ? 'th-TH' : 'en-US',
    { 
      style: 'currency', 
      currency: locale === 'th' ? 'THB' : 'USD' 
    }
  ).format(1250.50);

  return (
    <div>
      <p>Date: {date}</p>
      <p>Price: {currency}</p>
    </div>
  );
}
```

### Nested Translation Keys

```json
{
  "navigation": {
    "home": "Home",
    "about": "About",
    "contact": "Contact"
  },
  "forms": {
    "validation": {
      "required": "This field is required",
      "email": "Please enter a valid email"
    }
  }
}
```

```typescript
const t = useTranslations('navigation');
const formT = useTranslations('forms.validation');

return (
  <div>
    <nav>{t('home')}</nav>
    <span>{formT('required')}</span>
  </div>
);
```

## 📝 Translation File Best Practices

### 1. Consistent Structure
Keep the same structure across all language files:

```json
// ✅ Good
{
  "common": { "save": "Save", "cancel": "Cancel" },
  "user": { "profile": "Profile", "settings": "Settings" }
}
```

### 2. Meaningful Keys
Use descriptive keys that indicate context:

```json
// ✅ Good
{
  "button": {
    "submit": "Submit",
    "cancel": "Cancel"
  },
  "message": {
    "success": "Operation completed successfully",
    "error": "An error occurred"
  }
}
```

### 3. Pluralization Syntax
Use ICU message format for plurals:

```json
{
  "itemCount": "{count, plural, =0 {No items} =1 {One item} other {# items}}"
}
```

## 🔧 Troubleshooting

### Common Issues

1. **404 errors after adding next-intl**
   - Make sure middleware.ts is in the correct location
   - Verify your matcher patterns in middleware config

2. **"No locale was returned" error**
   - Ensure your i18n/request.ts returns both locale and messages
   - Check that your locale parameter is being handled correctly

3. **Translations not updating**
   - Restart your development server after changing translation files
   - Clear browser cache and cookies

### Debug Tips

1. **Log current locale:**
```typescript
const locale = useLocale();
console.log('Current locale:', locale);
```

2. **Check available translations:**
```typescript
const t = useTranslations();
console.log('Available keys:', Object.keys(t.raw()));
```

## 🎉 Live Example

Visit `/example/next-intl_example` to see all these features in action with a complete working example that demonstrates:

- Basic translations
- Variable interpolation  
- Pluralization
- Date/number formatting
- Locale switching
- Code examples

## 📚 Additional Resources

- [Next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://formatjs.io/docs/core-concepts/icu-syntax/)
- [Next.js Internationalization](https://nextjs.org/docs/advanced-features/i18n-routing)

---

Happy coding! 🚀
