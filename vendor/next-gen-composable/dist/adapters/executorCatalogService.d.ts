import type { CatalogService } from '../core/catalogPort';
import type { ComposableExecutor } from './executorAddressService';
/**
 * Catalog methods on the composable-core transport seam (Foundry-30845).
 * The host's runtime factory supplies the executor — this package never
 * talks to a network or to Salesforce directly. The method names live in
 * core (shared with the server-side handler); re-exported here for hosts.
 */
import { CATALOG_EXECUTOR_METHODS } from '../core/catalogPort';
export { CATALOG_EXECUTOR_METHODS };
/** Wraps an executor as a CatalogService. Executor failures become `{ status: 'error' }` — never a rejection. */
export declare function createExecutorCatalogService(executor: ComposableExecutor): CatalogService;
