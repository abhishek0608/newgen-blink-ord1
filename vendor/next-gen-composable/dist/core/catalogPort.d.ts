import type { RuntimeContext } from './runtime';
import type { GetProductInput, GetProductResult, ListCategoriesResult, SearchProductsInput, SearchProductsResult } from './catalogTypes';
/**
 * The catalog service port. Every method takes RuntimeContext first — the
 * host supplies identity (pricingSchema on the identity drives account
 * pricing); the composable never invents credentials. Implementations must
 * resolve (never reject): failures are expressed as
 * `{ status: 'error', errorMessage }`.
 */
export interface CatalogService {
    /** Paged product search/browse over the host's catalog provider. Empty text = browse all. */
    searchProducts(context: RuntimeContext, input: SearchProductsInput): Promise<SearchProductsResult>;
    /** Resolve a product id into a full CatalogProduct (deep links, refreshed pricing). */
    getProduct(context: RuntimeContext, input: GetProductInput): Promise<GetProductResult>;
    /** Category facets for the filter bar. */
    listCategories(context: RuntimeContext): Promise<ListCategoriesResult>;
}
/**
 * Wire protocol for CatalogService calls that cross a transport seam — shared
 * by the executor adapter and the ./http client on one side, and any
 * server-side handler (e.g. createSalesforceCatalogHandler) on the other.
 */
export declare const CATALOG_EXECUTOR_METHODS: {
    readonly searchProducts: "platform/catalog:search";
    readonly getProduct: "platform/catalog:get";
    readonly listCategories: "platform/catalog:listCategories";
};
