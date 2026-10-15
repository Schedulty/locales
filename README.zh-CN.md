# Schedulty locales

[English](./README.md) · [Русский](./README.ru.md) · **中文**

[Schedulty](https://schedulty.ru) 的翻译文件。Schedulty 是一个帮助学生查看课程表的服务，包括 Telegram 和 VK 机器人、通知以及网站。
每种语言一个 JSON 文件，包含用户看到的所有文本，以及机器人能够识别的短语（“Schedule”、“Schedule for tomorrow”、“Расписание на пятницу”）。

[![Check](https://github.com/Schedulty/locales/actions/workflows/check.yml/badge.svg)](https://github.com/Schedulty/locales/actions/workflows/check.yml)
[![Version](https://img.shields.io/github/v/tag/Schedulty/locales?label=version)](https://github.com/Schedulty/locales/tags)

## 语言

| 文件 | 语言 |
|---|---|
| [`ru_RU.json`](./locales/ru_RU.json) | 俄语（基准） |
| [`en_US.json`](./locales/en_US.json) | 英语（美国） |

没有你的语言？欢迎[添加](./CONTRIBUTING.md#add-a-language)或[提出请求](https://github.com/Schedulty/locales/issues/new?template=new-language.yml)。

## 安装

npm 包 `@schedulty/locales` 只发布到 Schedulty 的私有注册表，仅供 Schedulty 自己的服务使用。
如需在你的项目中使用这些翻译，请直接复制 [`locales/`](./locales) 中的 JSON 文件：它们是普通的
[i18next](https://www.i18next.com) 资源，采用 MIT 许可证。

## 使用

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

包导出的内容：

| 导出 | 说明 |
|---|---|
| `LOCALES` | 所有语言代码，与文件名一致（`'en_US'`、`'ru_RU'`） |
| `REFERENCE_LOCALE` | `'ru_RU'`，其他文件都以它为基准进行检查 |
| `toLanguageTag(locale)` | `ru_RU` → `ru-RU`，即 `Intl` 和 i18next 使用的格式 |
| `Locale`、`Resources` | 语言代码和文件结构的 TypeScript 类型 |

文本采用 i18next JSON v4 格式：`{{name}}` 占位符和 CLDR 复数形式（`key_one`、`key_few` 等）。

## 检查

`npm test` 会将每个文件与 `ru_RU.json` 对比：键必须相同，必须包含该语言需要的所有复数形式，占位符必须一致，
机器人短语中只能使用已知的槽位，并且同一个短语不能对应两个命令。CI 会在每个 pull request 上运行检查。

## 版本

- **major**：从不升级；
- **minor**：新增语言，或对现有语言的较大修改；
- **patch**：修正和小的补充。

参见 [CHANGELOG.md](./CHANGELOG.md)。

## 参与贡献

请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)（英文）和[行为准则](./CODE_OF_CONDUCT.md)。安全问题请参见
[SECURITY.md](./SECURITY.md)。问题咨询：locale@schedulty.ru。

## 许可证

[MIT](./LICENSE)
