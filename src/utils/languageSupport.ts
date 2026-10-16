import type { LanguageCode } from '../types';

export const SUPPORTED_LANGUAGE_CODES: readonly LanguageCode[] = ['hi', 'en'];

export const isLanguageAvailable = (code: string): code is LanguageCode =>
  SUPPORTED_LANGUAGE_CODES.some((supportedCode) => supportedCode === code);

export const getAvailableLanguage = (value: string | null): LanguageCode => {
  const candidate = value ?? '';
  return isLanguageAvailable(candidate) ? candidate : 'hi';
};
