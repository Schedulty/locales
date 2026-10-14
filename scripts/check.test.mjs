import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { checkLocales, readLocales } from './check.mjs';

const { files: real } = readLocales();
const mutate = (change) => {
  const files = structuredClone(real);
  change(files);
  return checkLocales(files);
};
const expectError = (errors, fragment) =>
  assert.ok(
    errors.some((error) => error.includes(fragment)),
    `expected an error containing "${fragment}", got:\n${errors.join('\n')}`,
  );

describe('checkLocales', () => {
  it('accepts the shipped locale files', () => {
    assert.deepEqual(checkLocales(real), []);
  });

  it('reports a key missing from a translation', () => {
    expectError(mutate((f) => delete f.en_US.bot.pagination.last), 'en_US: missing bot.pagination.last');
  });

  it('reports a key that the reference does not have', () => {
    expectError(mutate((f) => (f.en_US.bot.pagination.middle = 'Middle')), 'en_US: bot.pagination.middle is not in ru_RU');
  });

  it('reports a missing plural form', () => {
    expectError(
      mutate((f) => delete f.ru_RU.common.units.day_many),
      'ru_RU: common.units.day needs forms one, few, many, other',
    );
  });

  it('reports a plural form the language does not use', () => {
    expectError(
      mutate((f) => (f.en_US.common.units.day_few = 'days')),
      'en_US: common.units.day needs forms one, other',
    );
  });

  it('reports a renamed placeholder', () => {
    expectError(
      mutate((f) => (f.en_US.bot.pagination.page = 'Page {{current}} of {{pages}}')),
      'en_US: bot.pagination.page has {{current, pages}}',
    );
  });

  it('reports a lost placeholder in plural forms', () => {
    expectError(
      mutate((f) => (f.en_US.bot.commands.schedule.lessonCount_other = 'classes')),
      'en_US: bot.commands.schedule.lessonCount_other has {{}}',
    );
    expectError(
      mutate((f) => (f.ru_RU.bot.commands.schedule.lessonCount_one = 'одна пара')),
      'ru_RU: bot.commands.schedule.lessonCount_one has {{}}',
    );
  });

  it('reports an unknown slot in a pattern', () => {
    expectError(
      mutate((f) => f.en_US.bot.commands.schedule.patterns.push('schedule for {when}')),
      'unknown slot {when}',
    );
  });

  it('reports a pattern without a slot', () => {
    expectError(mutate((f) => f.en_US.bot.commands.schedule.patterns.push('my schedule')), 'has no slot');
  });

  it('reports a slot in a list that takes none', () => {
    expectError(mutate((f) => f.en_US.bot.commands.help.triggers = ['help {n}']), 'unknown slot {n}');
    expectError(mutate((f) => f.en_US.bot.dates.today.push('{n}')), 'unknown slot {n}');
  });

  it('reports a phrase list the bot does not know', () => {
    expectError(
      mutate((f) => {
        f.ru_RU.bot.dates.yesterday = ['вчера'];
        f.en_US.bot.dates.yesterday = ['yesterday'];
      }),
      'ru_RU: bot.dates.yesterday is not a known phrase list',
    );
  });

  it('reports a duplicate phrase in one list', () => {
    expectError(mutate((f) => f.ru_RU.bot.dates.today.push('Сегодня')), 'lists "Сегодня" twice');
  });

  it('reports a trigger shared by two commands across locales', () => {
    expectError(
      mutate((f) => (f.en_US.bot.commands.help.triggers = ['расписание'])),
      'trigger "расписание" belongs to several commands',
    );
  });

  it('lets each locale have its own optional triggers', () => {
    assert.deepEqual(mutate((f) => delete f.ru_RU.bot.commands.help.triggers), []);
  });

  it('reports a list where a text is expected and the other way round', () => {
    expectError(mutate((f) => (f.en_US.bot.commands.help.button = ['Help'])), 'bot.commands.help.button must be a non-empty string');
    expectError(mutate((f) => (f.en_US.bot.dates.today = 'today')), 'bot.dates.today must be a non-empty list');
  });

  it('reports an empty text', () => {
    expectError(mutate((f) => (f.en_US.bot.typeahead.notFound = ' ')), 'bot.typeahead.notFound must be a non-empty string');
  });

  it('reports a badly named file', () => {
    expectError(mutate((f) => (f['en-US'] = f.en_US)), 'en-US: file name must look like ru_RU');
    expectError(mutate((f) => (f.en = f.en_US)), 'en: file name must look like ru_RU');
  });

  it('requires the reference locale', () => {
    expectError(mutate((f) => delete f.ru_RU), 'reference locale ru_RU is missing');
  });
});
