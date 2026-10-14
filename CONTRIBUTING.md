# Contributing

Thank you for helping translate Schedulty. By contributing you agree to the [Code of Conduct](./CODE_OF_CONDUCT.md),
and your changes are published under the [MIT licence](./LICENSE).

You need [Node.js](https://nodejs.org) 20 or newer to run the check. There is nothing to install.

```sh
npm test
```

## Fix a text

1. Find the key in `locales/<language>.json`.
2. Change the text. Keep every `{{placeholder}}` and `{slot}` exactly as written.
3. Run `npm test` and open a pull request.

## Add a language

1. Copy `locales/en_US.json` to `locales/<language>_<REGION>.json`, e.g. `uk_UA.json`, `pt_BR.json`. The region
   decides the date order and the 12/24-hour clock, so pick the one your users live in.
2. Translate every text. Do not leave English behind; a missing key fails the check.
3. Fix the plural forms (below). `npm test` lists the forms your language needs.
4. Write your own triggers, patterns and date phrases (below). Do not translate them word by word.
5. Add a line to `CHANGELOG.md` under "Unreleased" and open a pull request.

## The file

`ru_RU.json` is the reference: every other file has the same keys. Top-level sections:

| Section | What it holds |
|---|---|
| `common` | Texts every app uses: school types, week names, units, actions |
| `bot` | The chat bot: commands, the setup wizard, date phrases |

Texts use [i18next](https://www.i18next.com/) syntax: `{{name}}` is replaced by a value.

## Plurals

A key with a count has one entry per plural form of the language, named `key_<form>`. The forms come from
[Unicode CLDR](https://cldr.unicode.org/index/cldr-spec/plural-rules): English has `one` and `other`, Russian has
`one`, `few`, `many` and `other`.

```json
"lessonCount_one": "{{count}} пара",
"lessonCount_few": "{{count}} пары",
"lessonCount_many": "{{count}} пар",
"lessonCount_other": "{{count}} пары"
```

Every form keeps `{{count}}`: Russian `one` is also used for 21, 31 and so on, so "одна пара" would be wrong.

## Bot commands

Each command under `bot.commands` may have:

| Key | What the bot does with it |
|---|---|
| `button` | Shows a button with this text; typing the text also runs the command |
| `triggers` | Extra phrases that run the command, e.g. `"timetable"`. Optional, and may differ per language |
| `patterns` | Phrases with a `{date}` slot, e.g. `"schedule for {date}"` |

Phrases are matched without regard to case, and the phrases of **every** language work for every user, so one phrase
must not lead to two commands in any two files. The check reports it.

## Date phrases

`bot.dates` lists the words that fill `{date}`: `today`, `tomorrow`, `dayAfterTomorrow`, weekdays, and phrases with
their own slots:

| Slot | Matches |
|---|---|
| `{date}` | Any phrase from `bot.dates`, or a date in digits (`11.10`, `10/11`) in the order of your region |
| `{weekday}` | Any word from `bot.dates.weekdays` |
| `{n}` | A number |
| `{day}`, `{week}` | Any plural form of `common.units.day` / `common.units.week` |

List every form a word takes in your language: Russian needs both "пятница" and "пятницу" because "расписание на
пятницу" changes the ending. Phrases are plain text. Do not use regular expressions; the bot reads every
character literally.
