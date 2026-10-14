import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REFERENCE_LOCALE = 'ru_RU';
export const LOCALES_DIR = fileURLToPath(new URL('../locales/', import.meta.url));

const LOCALE_NAME = /^[a-z]{2,3}_[A-Z]{2}$/;
const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/;
const PLACEHOLDER = /\{\{\s*([\w.]+)[^}]*\}\}/g;
const SLOT = /\{(\w+)\}/g;

const COMMAND_LIST = /^bot\.commands\.([^.]+)\.(triggers|patterns)$/;
const DATE_LIST = /^bot\.dates\./;
const OPTIONAL_KEY = /^bot\.commands\.[^.]+\.triggers$/;

/** Slots each phrase list may use. bot-service implements the same slots; a new list needs both. */
const LIST_SLOTS = [
  [/^bot\.commands\.[^.]+\.triggers$/, []],
  [/^bot\.commands\.[^.]+\.patterns$/, ['date']],
  [/^bot\.dates\.(today|tomorrow|dayAfterTomorrow)$/, []],
  [/^bot\.dates\.(weekday|nextWeekday|thisWeekday)$/, ['weekday']],
  [/^bot\.dates\.in$/, ['n', 'day', 'week']],
  [/^bot\.dates\.(week|nextWeek|dayUnits|weekUnits)$/, []],
  [/^bot\.dates\.monthDay$/, ['n', 'month']],
  [/^bot\.dates\.weekdays\.(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/, []],
  [/^bot\.dates\.months\.(january|february|march|april|may|june|july|august|september|october|november|december)$/, []],
];

export const toLanguageTag = (locale) => locale.replace('_', '-');

const normalize = (phrase) => phrase.trim().toLowerCase().replace(/\s+/g, ' ');

function flatten(value, prefix, out) {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child !== null && typeof child === 'object' && !Array.isArray(child)) flatten(child, path, out);
    else out.set(path, child);
  }
  return out;
}

const allowedSlots = (path) => LIST_SLOTS.find(([pattern]) => pattern.test(path))?.[1];

function checkValue(locale, path, value, errors) {
  const isList = COMMAND_LIST.test(path) || DATE_LIST.test(path);
  if (!isList) {
    if (typeof value !== 'string' || value.trim() === '') errors.push(`${locale}: ${path} must be a non-empty string`);
    return;
  }
  if (!Array.isArray(value) || value.length === 0 || value.some((item) => typeof item !== 'string' || !item.trim())) {
    errors.push(`${locale}: ${path} must be a non-empty list of non-empty strings`);
    return;
  }
  const allowed = allowedSlots(path);
  if (!allowed) {
    errors.push(`${locale}: ${path} is not a known phrase list; add it to LIST_SLOTS and to bot-service`);
    return;
  }
  const seen = new Set();
  for (const item of value) {
    if (item.includes('{{')) errors.push(`${locale}: ${path} "${item}" uses {{…}}; lists take {slot} only`);
    const slots = [...item.matchAll(SLOT)].map((match) => match[1]);
    for (const slot of slots) {
      if (!allowed.includes(slot)) errors.push(`${locale}: ${path} "${item}" has unknown slot {${slot}}`);
    }
    if (path.endsWith('.patterns') && slots.length === 0) {
      errors.push(`${locale}: ${path} "${item}" has no slot; put fixed phrases in triggers`);
    }
    const key = normalize(item);
    if (seen.has(key)) errors.push(`${locale}: ${path} lists "${item}" twice`);
    seen.add(key);
  }
}

/** Splits flat keys into plural groups (base → categories) and plain keys. */
function shape(flat) {
  const plurals = new Map();
  const plain = new Set();
  for (const path of flat.keys()) {
    const match = PLURAL_SUFFIX.exec(path);
    if (!match) {
      plain.add(path);
      continue;
    }
    const base = path.slice(0, match.index);
    if (!plurals.has(base)) plurals.set(base, new Set());
    plurals.get(base).add(match[1]);
  }
  return { plurals, plain };
}

function placeholders(flat, paths) {
  const names = new Set();
  for (const path of paths) {
    const value = flat.get(path);
    if (typeof value === 'string') for (const match of value.matchAll(PLACEHOLDER)) names.add(match[1]);
  }
  return [...names].sort().join(', ');
}

const sameSet = (a, b) => a.size === b.size && [...a].every((item) => b.has(item));

/**
 * Checks parsed locale files against each other.
 * @param {Record<string, unknown>} files locale code → parsed JSON
 * @returns {string[]} errors, empty when the files are valid
 */
export function checkLocales(files) {
  const errors = [];
  if (!(REFERENCE_LOCALE in files)) return [`reference locale ${REFERENCE_LOCALE} is missing`];

  const flats = {};
  for (const [locale, data] of Object.entries(files)) {
    if (!LOCALE_NAME.test(locale)) {
      errors.push(`${locale}: file name must look like ru_RU (language_REGION)`);
      continue;
    }
    try {
      Intl.getCanonicalLocales(toLanguageTag(locale));
    } catch {
      errors.push(`${locale}: not a valid locale`);
      continue;
    }
    if (data === null || typeof data !== 'object' || Array.isArray(data)) {
      errors.push(`${locale}: top level must be an object`);
      continue;
    }
    flats[locale] = flatten(data, '', new Map());
    for (const [path, value] of flats[locale]) checkValue(locale, path, value, errors);
  }
  if (!flats[REFERENCE_LOCALE]) return errors;

  const reference = shape(flats[REFERENCE_LOCALE]);
  for (const [locale, flat] of Object.entries(flats)) {
    const { plurals, plain } = shape(flat);
    const categories = new Set(new Intl.PluralRules(toLanguageTag(locale)).resolvedOptions().pluralCategories);
    const required = (path) => !OPTIONAL_KEY.test(path);

    for (const path of reference.plain) {
      if (required(path) && !plain.has(path)) errors.push(`${locale}: missing ${path}`);
    }
    for (const path of plain) {
      if (required(path) && !reference.plain.has(path)) errors.push(`${locale}: ${path} is not in ${REFERENCE_LOCALE}`);
    }
    for (const base of reference.plurals.keys()) {
      if (!plurals.has(base)) errors.push(`${locale}: missing plural ${base}`);
    }
    for (const [base, forms] of plurals) {
      if (!reference.plurals.has(base)) {
        errors.push(`${locale}: plural ${base} is not in ${REFERENCE_LOCALE}`);
        continue;
      }
      if (!sameSet(forms, categories)) {
        errors.push(`${locale}: ${base} needs forms ${[...categories].join(', ')}; has ${[...forms].join(', ')}`);
      }
    }

    if (locale === REFERENCE_LOCALE) {
      checkReferencePlurals(flat, reference.plurals, errors);
      continue;
    }
    const referenceFlat = flats[REFERENCE_LOCALE];
    for (const path of plain) {
      if (!reference.plain.has(path)) continue;
      const expected = placeholders(referenceFlat, [path]);
      const actual = placeholders(flat, [path]);
      if (expected !== actual) errors.push(`${locale}: ${path} has {{${actual}}}; ${REFERENCE_LOCALE} has {{${expected}}}`);
    }
    for (const [base, forms] of plurals) {
      const referenceForms = reference.plurals.get(base);
      if (!referenceForms) continue;
      // Every form needs every placeholder: ru "_one" also covers 21, 31, ...
      const expected = placeholders(referenceFlat, [...referenceForms].map((form) => `${base}_${form}`));
      for (const form of forms) {
        const actual = placeholders(flat, [`${base}_${form}`]);
        if (expected !== actual) {
          errors.push(`${locale}: ${base}_${form} has {{${actual}}}; ${REFERENCE_LOCALE} has {{${expected}}}`);
        }
      }
    }
  }

  checkCollisions(flats, errors);
  return errors;
}

function checkReferencePlurals(flat, plurals, errors) {
  for (const [base, forms] of plurals) {
    const paths = [...forms].map((form) => `${base}_${form}`);
    const expected = placeholders(flat, paths);
    for (const path of paths) {
      const actual = placeholders(flat, [path]);
      if (actual !== expected) errors.push(`${REFERENCE_LOCALE}: ${path} has {{${actual}}}; other forms have {{${expected}}}`);
    }
  }
}

/** A phrase may lead to one command only, across every locale, because all locales are active for every user. */
function checkCollisions(flats, errors) {
  for (const kind of ['trigger', 'pattern']) {
    const owners = new Map();
    for (const [locale, flat] of Object.entries(flats)) {
      for (const [path, value] of flat) {
        const command = /^bot\.commands\.([^.]+)\./.exec(path)?.[1];
        if (!command) continue;
        let phrases = [];
        if (kind === 'trigger' && path.endsWith('.button') && typeof value === 'string') phrases = [value];
        if (kind === 'trigger' && path.endsWith('.triggers') && Array.isArray(value)) phrases = value;
        if (kind === 'pattern' && path.endsWith('.patterns') && Array.isArray(value)) phrases = value;
        for (const phrase of phrases) {
          if (typeof phrase !== 'string') continue;
          const key = normalize(phrase);
          if (!owners.has(key)) owners.set(key, new Map());
          const commands = owners.get(key);
          if (!commands.has(command)) commands.set(command, locale);
        }
      }
    }
    for (const [phrase, commands] of owners) {
      if (commands.size > 1) {
        const list = [...commands].map(([command, locale]) => `${command} (${locale})`).join(', ');
        errors.push(`${kind} "${phrase}" belongs to several commands: ${list}`);
      }
    }
  }
}

export function readLocales(dir = LOCALES_DIR) {
  const files = {};
  const errors = [];
  for (const name of readdirSync(dir).sort()) {
    if (!name.endsWith('.json')) continue;
    try {
      files[name.slice(0, -'.json'.length)] = JSON.parse(readFileSync(join(dir, name), 'utf8'));
    } catch (error) {
      errors.push(`${name}: ${error.message}`);
    }
  }
  return { files, errors };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { files, errors } = readLocales();
  errors.push(...checkLocales(files));
  for (const error of errors) console.error(`✗ ${error}`);
  if (errors.length > 0) process.exit(1);
  console.log(`✓ ${Object.keys(files).join(', ')}: valid`);
}
