import type { CatalogService } from '../core/catalogPort';
import type { RuntimeContext } from '../core/runtime';
import type { CatalogCategory, CatalogProduct, CatalogSort } from '../core/catalogTypes';
import type { MutationResult } from '../core/types';
export interface CatalogControllerState {
    query: string;
    categoryId: string | null;
    sort: CatalogSort;
    /** 1-based. */
    page: number;
    pageSize: number;
    loading: boolean;
    /** True once the first search has settled — gates the "no results" state. */
    loaded: boolean;
    products: CatalogProduct[];
    totalCount: number;
    pageCount: number;
    categories: CatalogCategory[];
    loadingCategories: boolean;
    /**
     * True while the catalog provider is failing. The last successful page
     * stays on screen — an outage degrades browsing, it never empties the page.
     */
    degraded: boolean;
    selected: CatalogProduct | null;
    resolvingProductId: string | null;
    errorMessage: string | null;
}
export interface CatalogControllerCallbacks {
    /** A product was opened/selected (detail view, quote line, …). */
    onProductSelected?: (product: CatalogProduct) => void;
    /** Host owns the cart — the composable only emits the DTO + quantity. */
    onAddToCart?: (product: CatalogProduct, quantity: number) => void;
}
export interface CatalogControllerOptions extends CatalogControllerCallbacks {
    service: CatalogService;
    context: RuntimeContext;
    debounceMs?: number;
    pageSize?: number;
}
export interface CatalogController {
    getState(): CatalogControllerState;
    subscribe(listener: () => void): () => void;
    setCallbacks(callbacks: CatalogControllerCallbacks): void;
    /** Loads category facets and the first page. */
    init(): Promise<void>;
    setQuery(text: string): void;
    setCategory(categoryId: string | null): void;
    setSort(sort: CatalogSort): void;
    setPage(page: number): void;
    /** Re-runs the current query — the retry path after an outage. */
    refresh(): Promise<void>;
    selectProduct(productId: string): Promise<MutationResult>;
    addToCart(productId: string, quantity?: number): MutationResult;
    dispose(): void;
}
export declare function createCatalogController(options: CatalogControllerOptions): CatalogController;
