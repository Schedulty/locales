# Schedulty locales

[English](./README.md) · **Русский** · [中文](./README.zh-CN.md)

Переводы для [Schedulty](https://schedulty.ru), сервиса, который помогает студентам следить за расписанием занятий:
бот в Telegram и VK, уведомления и сайт. В одном JSON-файле на каждый язык лежат все тексты, которые видит
пользователь, и фразы, которые понимает бот («Расписание», «Расписание на завтра», «Schedule for friday»).

[![Check](https://github.com/Schedulty/locales/actions/workflows/check.yml/badge.svg)](https://github.com/Schedulty/locales/actions/workflows/check.yml)
[![Package](https://img.shields.io/github/v/tag/Schedulty/locales?label=package)](https://github.com/Schedulty/locales/pkgs/npm/locales)

## Языки

| Файл | Язык |
|---|---|
| [`ru_RU.json`](./locales/ru_RU.json) | Русский (эталон) |
| [`en_US.json`](./locales/en_US.json) | Английский (США) |

Нет вашего языка? [Добавьте его](./CONTRIBUTING.md#add-a-language) или
[попросите о нём](https://github.com/Schedulty/locales/issues/new?template=new-language.yml).

## Установка

Пакет опубликован в [GitHub Packages](https://github.com/Schedulty/locales/pkgs/npm/locales). GitHub требует токен
даже для публичных пакетов:

1. Создайте [personal access token (classic)](https://github.com/settings/tokens/new?scopes=read:packages) с правом
   `read:packages`.
2. Добавьте реестр в `.npmrc` проекта (или в `~/.npmrc`):

   ```ini
   @schedulty:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
   ```

3. Положите токен в переменную окружения `GITHUB_TOKEN` и установите пакет:

   ```sh
   npm install @schedulty/locales i18next
   ```

В GitHub Actions `GITHUB_TOKEN` уже задан; добавьте `packages: read` в `permissions` задачи.

## Использование

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

Пакет экспортирует:

| Экспорт | Что это |
|---|---|
| `LOCALES` | Коды всех локалей, как в именах файлов (`'en_US'`, `'ru_RU'`) |
| `REFERENCE_LOCALE` | `'ru_RU'`, файл, с которым сверяются остальные |
| `toLanguageTag(locale)` | `ru_RU` → `ru-RU`, форма, которую ждут `Intl` и i18next |
| `Locale`, `Resources` | TypeScript-типы кода локали и файла |

Тексты в формате i18next JSON v4: подстановки `{{name}}` и формы множественного числа CLDR (`key_one`, `key_few`, ...).

## Проверка

`npm test` сверяет каждый файл с `ru_RU.json`: те же ключи, все нужные языку формы множественного числа, те же
подстановки, только известные слоты во фразах бота и ни одной фразы, ведущей к двум командам. CI запускает проверку
на каждый pull request.

## Версии

- **major**: никогда;
- **minor**: новый язык или большое изменение существующего;
- **patch**: исправления и небольшие дополнения.

См. [CHANGELOG.md](./CHANGELOG.md).

## Участие

Прочитайте [CONTRIBUTING.md](./CONTRIBUTING.md) (на английском) и [Кодекс поведения](./CODE_OF_CONDUCT.md).
Уязвимости: см. [SECURITY.md](./SECURITY.md). Вопросы: locale@schedulty.ru.

## Лицензия

[MIT](./LICENSE)
