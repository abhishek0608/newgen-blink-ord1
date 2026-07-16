import type { CatalogService } from '../core/catalogPort';
import { type SalesforceConnection } from './transport';
/**
 * CatalogService over standard Salesforce objects:
 *   product  = PricebookEntry joined to Product2 (standard pricebook)
 *   category = Product2.Family
 * Methods resolve (never reject) per the port contract — transport failures
 * surface as `{ status: 'error' }` and the UI degrades, never blanks.
 */
export interface SalesforceCatalogOptions extends SalesforceConnection {
    /** ISO 4217 currency for prices, default 'USD' (single-currency orgs). */
    currency?: string;
}
export declare function createSalesforceCatalogService(options: SalesforceCatalogOptions): CatalogService;
