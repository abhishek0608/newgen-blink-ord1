import type { AddressDTO, AddressType, FieldIssues } from './types';
export declare const emptyAddress: () => AddressDTO;
/** Collapse common country spellings to ISO-ish codes; pass anything else through. */
export declare function normalizeCountry(country: string): string;
/**
 * Offline format validation — the deterministic fallback when the address
 * provider is unavailable. US and Canada get postal-format checks (Homewater
 * sells in both); other countries get presence checks only. Install addresses
 * are strictest: a truck goes to this door, so state/province is always required.
 */
export declare function validateAddressFormat(address: AddressDTO, addressType: AddressType): FieldIssues;
/** Trim fields, uppercase short state codes and Canadian postal codes. */
export declare function normalizeAddress(address: AddressDTO): AddressDTO;
/** Single-line display form, skipping empty parts. */
export declare function formatAddressLine(address: AddressDTO): string;
