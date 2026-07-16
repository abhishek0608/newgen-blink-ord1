import type { CartService } from '../core/port';
import type { RuntimeContext } from '../core/runtime';
import type { CartDTO, MutationResult } from '../core/types';
export interface CartControllerState {
    /** True during the initial getCart (and refresh). */
    loading: boolean;
    cart: CartDTO | null;
    /** Lines with an in-flight quantity/remove mutation — the UI disables their controls. */
    pendingLineIds: string[];
    addingSku: string | null;
    promoInput: string;
    applyingPromo: boolean;
    promoError: string | null;
    errorMessage: string | null;
}
export interface CartControllerCallbacks {
    /** Fires with every server-confirmed cart. Optimistic states stay UI-local. */
    onCartChange?: (cart: CartDTO) => void;
}
export interface CartControllerOptions extends CartControllerCallbacks {
    service: CartService;
    context: RuntimeContext;
    /** Coalesces rapid quantity-stepper clicks into one mutation per line. */
    debounceMs?: number;
}
export interface CartController {
    getState(): CartControllerState;
    subscribe(listener: () => void): () => void;
    setCallbacks(callbacks: CartControllerCallbacks): void;
    /** Loads the cart. */
    init(): Promise<void>;
    /** Re-fetches the cart — hosts call this after out-of-band mutations (e.g. PDP add-to-cart). */
    refresh(): Promise<void>;
    addLine(sku: string, quantity?: number): Promise<MutationResult>;
    /** Optimistic, coalesced per line by debounceMs. Quantity <= 0 removes the line. */
    setLineQuantity(lineId: string, quantity: number): void;
    /** Awaitable variant for edit-form UIs — pushes immediately, no optimistic state. Quantity <= 0 removes the line. */
    updateLineQuantity(lineId: string, quantity: number): Promise<MutationResult>;
    removeLine(lineId: string): Promise<MutationResult>;
    setPromoInput(code: string): void;
    applyPromo(): Promise<MutationResult>;
    removePromo(): Promise<MutationResult>;
    dispose(): void;
}
export declare function createCartController(options: CartControllerOptions): CartController;
