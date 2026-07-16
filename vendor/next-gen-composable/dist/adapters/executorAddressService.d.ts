import type { AddressService } from '../core/port';
/**
 * The composable-core transport seam (Foundry-30845): a generic
 * Executor(method, payload). The host's runtime factory supplies a mock,
 * custom (BFF), or lwc implementation — this package never talks to a
 * network or to Salesforce directly. Google Places stays behind the host
 * BFF (POST /api/v1/platform/address:search); no vendor SDK is embedded.
 */
export type ComposableExecutor = (method: string, payload: Record<string, unknown>) => Promise<unknown>;
export declare const ADDRESS_EXECUTOR_METHODS: {
    readonly searchAddresses: "platform/address:search";
    readonly resolveAddress: "platform/address:resolve";
    readonly validateAddress: "platform/address:validate";
    readonly listSavedAddresses: "platform/address:listSaved";
};
/** Wraps an executor as an AddressService. Executor failures become `{ status: 'error' }` — never a rejection. */
export declare function createExecutorAddressService(executor: ComposableExecutor): AddressService;
