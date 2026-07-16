import type { CartService } from '../core/port';
import type { RuntimeContext } from '../core/runtime';
export interface MockCatalogItem {
    sku: string;
    name: string;
    variant?: string;
    /** Minor units. */
    unitPrice: number;
}
export interface MockPromo {
    code: string;
    percentOff: number;
}
export interface MockCartServiceOptions {
    latencyMs?: number;
    failGetCart?: boolean;
    /** Fails add/update/remove while getCart keeps working — exercises the resync path. */
    failMutations?: boolean;
    failPromo?: boolean;
    catalog?: MockCatalogItem[];
    promos?: MockPromo[];
    /** Seed lines, applied through the same merge logic as addLine. */
    initialLines?: {
        sku: string;
        quantity: number;
    }[];
    /** Flat rate the mock "server" applies after discount. Default 8%. */
    taxRate?: number;
}
/**
 * Complete in-memory CartService — lets a consumer cart run e2e with no
 * backend (mock-first rule). Holds server-side cart state in a closure and
 * re-prices on every mutation, exactly like the real BFF contract. Failure
 * flags simulate outages so hosts can exercise error/resync paths
 * deterministically.
 */
export declare function createMockCartService(options?: MockCartServiceOptions): CartService;
/** Convenience RuntimeContext for demos and tests. */
export declare function createMockRuntimeContext(overrides?: Partial<RuntimeContext>): RuntimeContext;
