import type { AddressService } from '../core/port';
import type { RuntimeContext } from '../core/runtime';
import type { AddressDTO, AddressSuggestion, SavedAddress } from '../core/types';
export interface MockAddressFixture {
    suggestion: AddressSuggestion;
    address: AddressDTO;
}
export interface MockAddressServiceOptions {
    latencyMs?: number;
    failSearch?: boolean;
    failResolve?: boolean;
    failValidate?: boolean;
    fixtures?: MockAddressFixture[];
    savedAddresses?: SavedAddress[];
}
/**
 * Complete in-memory AddressService — lets a consumer checkout run e2e with
 * no backend (mock-first rule). Failure flags simulate provider outages so
 * hosts can exercise the manual-entry fallback deterministically.
 */
export declare function createMockAddressService(options?: MockAddressServiceOptions): AddressService;
/** Convenience RuntimeContext for demos and tests. */
export declare function createMockRuntimeContext(overrides?: Partial<RuntimeContext>): RuntimeContext;
