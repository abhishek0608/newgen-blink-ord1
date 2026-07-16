import type { CatalogService } from '../core/catalogPort';
import type { CatalogCategory, CatalogProduct } from '../core/catalogTypes';
export interface MockCatalogServiceOptions {
    latencyMs?: number;
    failSearch?: boolean;
    failGetProduct?: boolean;
    failCategories?: boolean;
    products?: CatalogProduct[];
    categories?: CatalogCategory[];
}
/**
 * Complete in-memory CatalogService — lets a consumer catalog page run e2e
 * with no backend (mock-first rule). Failure flags simulate provider outages
 * so hosts can exercise the degraded-but-browsable state deterministically.
 */
export declare function createMockCatalogService(options?: MockCatalogServiceOptions): CatalogService;
