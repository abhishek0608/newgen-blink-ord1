import type { CatalogService } from '../core/catalogPort';
/**
 * OPT-IN HTTP transport layer, shipped as the separate ./http subpath export.
 * Client half of the BFF pattern: every catalog op becomes a same-origin
 * POST { method, payload } to the host's BFF route, so no backend credentials,
 * hosts, or query language ever reach the browser. Pairs with
 * createSalesforceCatalogHandler on the ./salesforce subpath (or any server
 * route speaking the same protocol). The main entry stays transport-free.
 */
export interface HttpCatalogServiceOptions {
    /** BFF route that speaks the { method, payload } protocol. Default '/api/catalog'. */
    endpoint?: string;
    /** Extra request headers (e.g. the host app's own auth). */
    headers?: Record<string, string>;
}
export declare function createHttpCatalogService(options?: HttpCatalogServiceOptions): CatalogService;
