# Changelog

Versions follow these rules:

- **major**: never;
- **minor**: a new language, or a big change to an existing one;
- **patch**: fixes and small additions.

## 1.0.6

- `bot.wizard.<step>Empty` (`cityEmpty`, `schoolEmpty`, `facultyEmpty`, `groupEmpty`): the list of a setup step is
  empty and there is no earlier choice to go back to.

## 1.0.5

- `bot.errors.voiceTooLong` and `bot.errors.voiceUnavailable`: why a voice message has no transcript.

## 1.0.4

- `meta` section in every locale file: `name` (the language's own name) and `author`.

## 1.0.3

- Texts for the date format and time format settings: `common.dateTimeFormat` (date order and clock options),
  `bot.commands.dateFormat` and `bot.commands.timeFormat`.

## 1.0.2

- Texts for account linking (`bot.commands.link`) and the referral system (`bot.commands.invite`,
  `bot.commands.setReferrer`, `bot.joinReferrerGroup`), and `common.actions.yes`/`no`. Drafts

## 1.0.1

- Published only to Schedulty's private registry to keep all packages in one place; GitHub Packages publishing stopped. Outside users copy the files
  from `locales/`.

## 1.0.0

- Hello world!
