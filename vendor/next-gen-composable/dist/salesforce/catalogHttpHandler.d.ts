import { type SalesforceCatalogOptions } from './catalogService';
/**
 * Server half of the BFF pattern: a Node-style request handler that fronts
 * the Salesforce catalog service. Mount it on one POST route (default
 * /api/catalog) and point createHttpCatalogService (./http subpath) at it —
 * Salesforce credentials stay on the server; the browser only ever sees
 * catalog DTOs. Works as a Vercel function, Express route, or Vite dev
 * middleware.
 */
/** Minimal structural request/response shapes — no Node type dependency. */
export interface CatalogHandlerRequest {
    method?: string;
    /** Pre-parsed body when the host framework provides one (Vercel does). */
    body?: unknown;
}
export interface CatalogHandlerResponse {
    statusCode: number;
    setHeader(name: string, value: string): void;
    end(chunk?: string): void;
}
export type SalesforceCatalogHandler = (req: CatalogHandlerRequest, res: CatalogHandlerResponse) => Promise<void>;
export declare function createSalesforceCatalogHandler(options: SalesforceCatalogOptions): SalesforceCatalogHandler;
