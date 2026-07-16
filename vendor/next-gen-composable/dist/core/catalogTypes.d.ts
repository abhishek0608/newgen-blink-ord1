import type { ServiceStatus } from './types';
/** Sort orders the catalog page exposes. 'relevance' is the provider's default ranking. */
export type CatalogSort = 'relevance' | 'price-asc' | 'price-desc' | 'name';
/** Normalized product DTO emitted to the host. The host owns cart/persistence. */
export interface CatalogProduct {
    id: string;
    sku: string;
    name: string;
    description: string;
    price: number;
    /** ISO 4217 code, e.g. 'USD'. */
    currency: string;
    categoryId?: string;
    imageUrl?: string;
    inStock: boolean;
}
/** A catalog facet the host's provider exposes (family, brand, …). */
export interface CatalogCategory {
    id: string;
    label: string;
}
export interface SearchProductsInput {
    text: string;
    sort: CatalogSort;
    /** 1-based. */
    page: number;
    pageSize: number;
    categoryId?: string;
}
export interface SearchProductsResult {
    status: ServiceStatus;
    errorMessage?: string;
    products: CatalogProduct[];
    /** Total matches across all pages — drives pagination. */
    totalCount: number;
}
export interface GetProductInput {
    productId: string;
}
export interface GetProductResult {
    status: ServiceStatus;
    errorMessage?: string;
    product?: CatalogProduct;
}
export interface ListCategoriesResult {
    status: ServiceStatus;
    errorMessage?: string;
    categories: CatalogCategory[];
}
