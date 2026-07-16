import type { CatalogController, CatalogControllerOptions, CatalogControllerState } from '../ui-logic/catalogController';
export interface UseCatalogControllerResult {
    state: CatalogControllerState;
    controller: CatalogController;
}
/**
 * Binds a CatalogController to React. The controller is created once per
 * mount; callbacks are kept fresh across renders via setCallbacks.
 */
export declare function useCatalogController(options: CatalogControllerOptions): UseCatalogControllerResult;
