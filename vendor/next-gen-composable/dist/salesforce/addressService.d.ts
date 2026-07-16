import type { AddressService } from '../core/port';
import { type SalesforceConnection } from './transport';
/**
 * AddressService over standard Salesforce objects.
 *
 * - listSavedAddresses: the account's Billing/Shipping compound addresses
 *   (account id from RuntimeContext.identity.accountId; empty for guests).
 * - searchAddresses/resolveAddress: not provided by Salesforce — they return
 *   `{ status: 'error' }`, which the composable treats as a provider outage
 *   and falls back to manual entry. Checkout is never blocked.
 * - validateAddress: core's offline format validation (US ZIP / CA postal).
 */
export type SalesforceAddressOptions = SalesforceConnection;
export declare function createSalesforceAddressService(options: SalesforceAddressOptions): AddressService;
