import type { CatalogService } from '../core/catalogPort';
import type { ComposableExecutor } from './executorAddressService';
/**
 * Catalog methods on the composable-core transport seam (Foundry-30845).
 * The host's runtime factory supplies the executor — this package never
 * talks to a network or to Salesforce directly.
 */
export declare const CATALOG_EXECUTOR_METHODS: {
    readonly searchProducts: "platform/catalog:search";
    readonly getProduct: "platform/catalog:get";
    readonly listCategories: "platform/catalog:listCategories";
};
/** Wraps an executor as a CatalogService. Executor failures become `{ status: 'error' }` — never a rejection. */
export declare function createExecutorCatalogService(executor: ComposableExecutor): CatalogService;
