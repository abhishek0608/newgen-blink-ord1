import type { CatalogProduct } from './catalogTypes';
/** Default grid page size — 12 divides evenly into 2/3/4-column layouts. */
export declare const DEFAULT_CATALOG_PAGE_SIZE = 12;
/** Number of pages for a result set; 0 when there are no matches. */
export declare function pageCountOf(totalCount: number, pageSize: number): number;
/** Locale currency display with a deterministic fallback for unknown codes. */
export declare function formatPrice(price: number, currency: string): string;
/** Single-line display form for a product (cart lines, selection summaries). */
export declare function formatProductLine(product: CatalogProduct): string;
