import {
  electronicFormatIBAN,
  friendlyFormatIBAN,
  validateIBAN,
  extractIBAN,
  getCountrySpecifications,
  ValidationErrorsIBAN,
} from 'ibantools'
import { COUNTRIES } from './countries'

export type IbanErrorCode =
  | 'INVALID_FORMAT'
  | 'INVALID_CHECKSUM'
  | 'UNSUPPORTED_COUNTRY'
  | 'TOO_SHORT'
  | 'TOO_LONG'

export type ValidIbanResult = {
  valid: true
  iban: string
  formatted: string
  country: string
  country_name: string
  currency: string
  bank_code: string | null
  account_number: string | null
  bic: null
  bank_name: null
}

export type InvalidIbanResult = {
  valid: false
  iban: string
  error_code: IbanErrorCode
  error: string
}

export type IbanResult = ValidIbanResult | InvalidIbanResult

export function normalizeIban(raw: string): string {
  return (electronicFormatIBAN(raw) ?? raw.replace(/[\s-]/g, '').toUpperCase())
}

const ERROR_MESSAGES: Record<IbanErrorCode, string> = {
  INVALID_FORMAT: 'Input does not match IBAN format',
  INVALID_CHECKSUM: 'IBAN checksum validation failed',
  UNSUPPORTED_COUNTRY: 'Country code is not recognized in the IBAN registry',
  TOO_SHORT: 'IBAN is shorter than the expected length for this country',
  TOO_LONG: 'IBAN is longer than the expected length for this country',
}

function mapErrorCodes(normalized: string, errorCodes: ValidationErrorsIBAN[]): IbanErrorCode {
  if (errorCodes.includes(ValidationErrorsIBAN.NoIBANCountry)) return 'UNSUPPORTED_COUNTRY'
  if (errorCodes.includes(ValidationErrorsIBAN.WrongBBANLength)) {
    const spec = getCountrySpecifications()[normalized.slice(0, 2)]
    const expected = spec?.chars ?? null
    if (expected != null) return normalized.length < expected ? 'TOO_SHORT' : 'TOO_LONG'
    return 'INVALID_FORMAT'
  }
  if (errorCodes.includes(ValidationErrorsIBAN.WrongBBANFormat)) return 'INVALID_FORMAT'
  if (errorCodes.includes(ValidationErrorsIBAN.ChecksumNotNumber)) return 'INVALID_FORMAT'
  if (errorCodes.includes(ValidationErrorsIBAN.WrongIBANChecksum)) return 'INVALID_CHECKSUM'
  if (errorCodes.includes(ValidationErrorsIBAN.WrongAccountBankBranchChecksum)) return 'INVALID_CHECKSUM'
  return 'INVALID_FORMAT'
}

export function validateIban(raw: string): IbanResult {
  const normalized = normalizeIban(raw)

  if (!normalized || normalized.length < 4 || !/^[A-Z]{2}[A-Z0-9]+$/.test(normalized)) {
    return {
      valid: false,
      iban: normalized,
      error_code: 'INVALID_FORMAT',
      error: ERROR_MESSAGES.INVALID_FORMAT,
    }
  }

  const { valid, errorCodes } = validateIBAN(normalized)

  if (!valid) {
    const code = mapErrorCodes(normalized, errorCodes)
    return {
      valid: false,
      iban: normalized,
      error_code: code,
      error: ERROR_MESSAGES[code],
    }
  }

  const country = normalized.slice(0, 2)
  const info = COUNTRIES[country]
  const extracted = extractIBAN(normalized)
  const formatted = friendlyFormatIBAN(normalized) ?? normalized

  return {
    valid: true,
    iban: normalized,
    formatted,
    country,
    country_name: info?.name ?? country,
    currency: info?.currency ?? '',
    bank_code: extracted.bankIdentifier ?? null,
    account_number: extracted.accountNumber ?? null,
    bic: null,
    bank_name: null,
  }
}
