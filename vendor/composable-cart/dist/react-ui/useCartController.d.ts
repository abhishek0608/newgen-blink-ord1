import type { CartController, CartControllerOptions, CartControllerState } from '../ui-logic/cartController';
export interface UseCartControllerResult {
    state: CartControllerState;
    controller: CartController;
}
/**
 * Binds a CartController to React. The controller is created once per
 * mount; callbacks are kept fresh across renders via setCallbacks.
 */
export declare function useCartController(options: CartControllerOptions): UseCartControllerResult;
