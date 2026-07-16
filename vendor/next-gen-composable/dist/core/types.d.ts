/** Which address this instance captures. Drives labels + validation strictness. */
export type AddressType = 'shipping' | 'billing' | 'install';
/** Normalized address DTO emitted to the host. The host owns persistence. */
export interface AddressDTO {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}
export type AddressField = keyof AddressDTO;
/** Per-field validation messages, keyed by DTO field. */
export type FieldIssues = Partial<Record<AddressField, string>>;
/** A typeahead hit. Opaque id resolves to a full DTO via resolveAddress. */
export interface AddressSuggestion {
    id: string;
    label: string;
}
/** An account-scoped saved address (empty list for guests). */
export interface SavedAddress {
    id: string;
    label: string;
    address: AddressDTO;
}
export type ServiceStatus = 'success' | 'error';
/** Mutations return this — they never throw. */
export interface MutationResult {
    status: ServiceStatus;
    errorMessage?: string;
}
export interface SearchAddressesInput {
    text: string;
    addressType: AddressType;
    countryHint?: string;
}
export interface SearchAddressesResult {
    status: ServiceStatus;
    errorMessage?: string;
    suggestions: AddressSuggestion[];
}
export interface ResolveAddressInput {
    suggestionId: string;
}
export interface ResolveAddressResult {
    status: ServiceStatus;
    errorMessage?: string;
    address?: AddressDTO;
}
export interface ValidateAddressInput {
    address: AddressDTO;
    addressType: AddressType;
}
export interface ValidateAddressResult {
    status: ServiceStatus;
    errorMessage?: string;
    valid?: boolean;
    issues?: FieldIssues;
    normalized?: AddressDTO;
}
export interface ListSavedAddressesInput {
    addressType: AddressType;
}
export interface ListSavedAddressesResult {
    status: ServiceStatus;
    errorMessage?: string;
    addresses: SavedAddress[];
}
