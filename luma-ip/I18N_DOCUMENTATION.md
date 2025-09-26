# Internationalization (i18n) Documentation for LUMA IP

## Overview

This document provides comprehensive guidance on the internationalization implementation for the LUMA IP platform, supporting English, Spanish, French, and Mandarin Chinese languages.

## Architecture

The LUMA IP platform consists of two main parts with different i18n implementations:

1. **Static HTML Files** - Using vanilla JavaScript i18n
2. **Next.js Application** - Using React Context API with JSON translation files

## 1. Static HTML Files Implementation

### Files Covered
- `/workspace/index.html` - Main landing page
- `/workspace/luma-ip-app.html` - Application demo page
- `/workspace/luma-ip-demo.html` - Demo page

### Core i18n Script
Location: `/workspace/i18n.js`

### How It Works

1. **Automatic Language Detection**: The system automatically detects the user's browser language and applies it if supported.

2. **Language Persistence**: Selected language is saved in localStorage and persists across sessions.

3. **Language Switcher**: A floating language selector appears in the top-right corner of each page.

4. **Translation Application**: Elements with `data-i18n` attributes are automatically translated.

### Adding Translations to HTML Elements

```html
<!-- Text content -->
<h1 data-i18n="hero.title">Default Text</h1>

<!-- Placeholder text -->
<input type="text" data-i18n="contact.form.name" placeholder="Your Name">

<!-- Button text -->
<button data-i18n="nav.getStarted">Get Started</button>
```

### Adding New Translations

1. Open `/workspace/i18n.js`
2. Add your translation keys to all language objects:

```javascript
translations: {
  en: {
    'new.key': 'English text',
    // ...
  },
  es: {
    'new.key': 'Texto en español',
    // ...
  },
  fr: {
    'new.key': 'Texte en français',
    // ...
  },
  zh: {
    'new.key': '中文文本',
    // ...
  }
}
```

3. Use the key in your HTML:
```html
<span data-i18n="new.key">Default text</span>
```

## 2. Next.js Application Implementation

### File Structure

```
/workspace/patent-platform/apps/web/
├── public/locales/
│   ├── en/common.json    # English translations
│   ├── es/common.json    # Spanish translations
│   ├── fr/common.json    # French translations
│   └── zh/common.json    # Chinese translations
├── lib/i18n.ts           # i18n utilities
├── contexts/language-context.tsx  # React Context for language management
└── components/language-switcher.tsx  # Language switcher component
```

### Using Translations in React Components

```tsx
import { useLanguage } from '@/contexts/language-context';

export function MyComponent() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t('hero.title')}</h1>
      <p>{t('hero.description')}</p>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

### Adding New Translations to Next.js App

1. Add the translation to all JSON files in `/workspace/patent-platform/apps/web/public/locales/`:

**en/common.json:**
```json
{
  "section": {
    "newKey": "English text"
  }
}
```

**es/common.json:**
```json
{
  "section": {
    "newKey": "Texto en español"
  }
}
```

**fr/common.json:**
```json
{
  "section": {
    "newKey": "Texte en français"
  }
}
```

**zh/common.json:**
```json
{
  "section": {
    "newKey": "中文文本"
  }
}
```

2. Use in your component:
```tsx
const { t } = useLanguage();
return <span>{t('section.newKey')}</span>;
```

## 3. Language Codes

| Language | Code | Flag |
|----------|------|------|
| English | en | 🇺🇸 |
| Spanish | es | 🇪🇸 |
| French | fr | 🇫🇷 |
| Mandarin Chinese | zh | 🇨🇳 |

## 4. Best Practices

### Translation Keys

1. **Use Hierarchical Structure**: Organize keys by section/feature
   - Good: `dashboard.overview.title`
   - Bad: `dashboard_overview_title`

2. **Be Descriptive**: Keys should indicate their purpose
   - Good: `auth.error.invalidCredentials`
   - Bad: `error1`

3. **Consistency**: Use the same key structure across all files

### Content Guidelines

1. **Text Length**: Translations can vary in length. Design UI to accommodate:
   - German/French: Often 30% longer than English
   - Chinese: Often 30% shorter than English
   - Spanish: Often 15-20% longer than English

2. **Cultural Sensitivity**: Consider cultural differences:
   - Date formats: MM/DD/YYYY (US) vs DD/MM/YYYY (EU) vs YYYY/MM/DD (China)
   - Number formats: 1,000.00 (US) vs 1.000,00 (EU)
   - Currency symbols and placement

3. **Avoid Hardcoded Text**: Never hardcode text in components:
   ```tsx
   // Bad
   <button>Submit</button>
   
   // Good
   <button>{t('common.submit')}</button>
   ```

## 5. Testing Translations

### Manual Testing

1. **Language Switching**: Test switching between all languages
2. **Persistence**: Verify language selection persists after refresh
3. **Fallbacks**: Test missing translations fall back to English
4. **Layout**: Check UI accommodates different text lengths

### Browser Testing

Test with different browser language settings:
- Chrome: Settings → Advanced → Languages
- Firefox: Settings → General → Language
- Safari: System Preferences → Language & Region

## 6. Adding a New Language

### For Static HTML Files

1. Add language to `/workspace/i18n.js`:
```javascript
languages: {
  // ... existing languages
  de: { name: 'Deutsch', flag: '🇩🇪' }
}
```

2. Add translations object:
```javascript
translations: {
  // ... existing translations
  de: {
    'nav.home': 'Startseite',
    // ... all other keys
  }
}
```

### For Next.js Application

1. Create new translation file:
```bash
mkdir -p /workspace/patent-platform/apps/web/public/locales/de
```

2. Create `common.json` with all translations

3. Update `/workspace/patent-platform/apps/web/lib/i18n.ts`:
```typescript
export const languages = {
  // ... existing languages
  de: { name: 'Deutsch', flag: '🇩🇪' }
} as const;
```

4. Update `next-i18next.config.js`:
```javascript
locales: ['en', 'es', 'fr', 'zh', 'de'],
```

## 7. Common Translation Patterns

### Placeholders and Variables

For dynamic content, use placeholders:

```json
{
  "welcome": "Welcome, {{name}}!",
  "items": "You have {{count}} items"
}
```

In React:
```tsx
t('welcome', { name: userName })
t('items', { count: itemCount })
```

### Pluralization

Handle plural forms:

```json
{
  "items": {
    "zero": "No items",
    "one": "1 item",
    "other": "{{count}} items"
  }
}
```

### Rich Text

For HTML content:
```json
{
  "terms": "By clicking, you agree to our <a>Terms of Service</a>"
}
```

## 8. Troubleshooting

### Common Issues

1. **Translations Not Showing**
   - Check if `data-i18n` attribute is correctly set
   - Verify translation key exists in all language files
   - Check browser console for errors

2. **Language Not Persisting**
   - Verify localStorage is enabled
   - Check for conflicts with other localStorage keys

3. **Layout Breaking**
   - Test with longer translations
   - Use CSS `text-overflow: ellipsis` for constrained spaces
   - Consider responsive design for different text lengths

## 9. Performance Considerations

1. **Lazy Loading**: Translations are loaded on-demand
2. **Caching**: Translations are cached in memory after first load
3. **Bundle Size**: Each language file is separate, reducing initial load

## 10. Maintenance Checklist

When adding new features:

- [ ] Add translation keys to all language files
- [ ] Use translation keys in all user-facing text
- [ ] Test UI with all languages
- [ ] Update this documentation if needed
- [ ] Consider text length variations
- [ ] Test on mobile devices

## 11. Resources

### Translation Services
- [DeepL](https://www.deepl.com/) - High-quality translations
- [Google Translate](https://translate.google.com/) - Quick translations
- Professional translation services for production

### Tools
- [i18n Ally](https://marketplace.visualstudio.com/items?itemName=lokalise.i18n-ally) - VS Code extension
- [Crowdin](https://crowdin.com/) - Translation management platform
- [Lokalise](https://lokalise.com/) - Collaborative translation platform

## Contact

For questions about internationalization, please contact the development team or refer to the project's issue tracker.