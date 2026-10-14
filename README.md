# Schedulty locales

**English** · [Русский](./README.ru.md) · [中文](./README.zh-CN.md)

Translations for [Schedulty](https://schedulty.ru), a service that helps students keep track of their class schedule:
a bot for Telegram and VK, notifications, and a website. One JSON file per language holds every text the user sees,
plus the phrases the bot understands ("Schedule", "Schedule for tomorrow", "Расписание на пятницу").

[![Check](https://github.com/Schedulty/locales/actions/workflows/check.yml/badge.svg)](https://github.com/Schedulty/locales/actions/workflows/check.yml)
[![Package](https://img.shields.io/github/v/tag/Schedulty/locales?label=package)](https://github.com/Schedulty/locales/pkgs/npm/locales)

## Languages

| File | Language |
|---|---|
| [`ru_RU.json`](./locales/ru_RU.json) | Russian (reference) |
| [`en_US.json`](./locales/en_US.json) | English (United States) |

Your language is missing? [Add it](./CONTRIBUTING.md#add-a-language) or
[ask for it](https://github.com/Schedulty/locales/issues/new?template=new-language.yml).

## Install

The package is published to [GitHub Packages](https://github.com/Schedulty/locales/pkgs/npm/locales). GitHub asks for
a token even for public packages:

1. Create a [personal access token (classic)](https://github.com/settings/tokens/new?scopes=read:packages) with the
   `read:packages` scope.
2. Add the registry to `.npmrc` in your project (or in `~/.npmrc`):

   ```ini
   @schedulty:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
   ```

3. Put the token in the `GITHUB_TOKEN` environment variable and install:

   ```sh
   npm install @schedulty/locales i18next
   ```

In GitHub Actions, `GITHUB_TOKEN` is already set; add `packages: read` to the job's `permissions`.

## Use

```js
import i18next from 'i18next';
import ruRU from '@schedulty/locales/ru_RU.json' with { type: 'json' };
import enUS from '@schedulty/locales/en_US.json' with { type: 'json' };

await i18next.init({
  lng: 'ru-RU',
  fallbackLng: 'ru-RU',
  resources: {
    'ru-RU': { translation: ruRU },
    'en-US': { translation: enUS },
  },
});

i18next.t('bot.commands.schedule.lessonCount', { count: 21 }); // "21 пара"
```

The package exports:

| Export | What it is |
|---|---|
| `LOCALES` | Every locale code, as in the file names (`'en_US'`, `'ru_RU'`) |
| `REFERENCE_LOCALE` | `'ru_RU'`, the file all others are checked against |
| `toLanguageTag(locale)` | `ru_RU` → `ru-RU`, the form `Intl` and i18next expect |
| `Locale`, `Resources` | TypeScript types of a locale code and of a file |

Texts use the i18next JSON v4 format: `{{name}}` placeholders and CLDR plural forms (`key_one`, `key_few`, ...).

## Check

`npm test` checks every file against `ru_RU.json`: the same keys, every plural form the language needs, the same
placeholders, known slots in bot phrases, and no phrase that leads to two commands. CI runs it on every pull request.

## Versions

- **major**: never;
- **minor**: a new language, or a big change to an existing one;
- **patch**: fixes and small additions.

See [CHANGELOG.md](./CHANGELOG.md).

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md) and the [Code of Conduct](./CODE_OF_CONDUCT.md). Security issues: see
[SECURITY.md](./SECURITY.md). Questions: locale@schedulty.ru.

## Licence

[MIT](./LICENSE)
