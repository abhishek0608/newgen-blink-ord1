import type { RuntimeContext } from './runtime';
import type { ListSavedAddressesInput, ListSavedAddressesResult, ResolveAddressInput, ResolveAddressResult, SearchAddressesInput, SearchAddressesResult, ValidateAddressInput, ValidateAddressResult } from './types';
/**
 * The address service port. Every method takes RuntimeContext first — the
 * host supplies identity; the composable never invents credentials.
 * Implementations must resolve (never reject): failures are expressed as
 * `{ status: 'error', errorMessage }`.
 */
export interface AddressService {
    /** Typeahead over the host's address provider (Google Places behind the host BFF). */
    searchAddresses(context: RuntimeContext, input: SearchAddressesInput): Promise<SearchAddressesResult>;
    /** Resolve a suggestion id into a normalized AddressDTO. */
    resolveAddress(context: RuntimeContext, input: ResolveAddressInput): Promise<ResolveAddressResult>;
    /** Verify a manually entered address. */
    validateAddress(context: RuntimeContext, input: ValidateAddressInput): Promise<ValidateAddressResult>;
    /** Account-scoped saved addresses; must return an empty list for guests. */
    listSavedAddresses(context: RuntimeContext, input: ListSavedAddressesInput): Promise<ListSavedAddressesResult>;
}
