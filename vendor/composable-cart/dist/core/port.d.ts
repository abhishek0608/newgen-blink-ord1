import type { RuntimeContext } from './runtime';
import type { AddLineInput, ApplyPromoCodeInput, ApplyPromoCodeResult, CartResult, RemoveLineInput, UpdateLineQuantityInput } from './types';
/**
 * The cart service port. Every method takes RuntimeContext first — the host
 * supplies identity; the composable never invents credentials.
 * Implementations must resolve (never reject): failures are expressed as
 * `{ status: 'error', errorMessage }`. Every successful mutation returns the
 * full re-priced cart — the server owns pricing math.
 */
export interface CartService {
    /** The current cart for this context (session/quote scoped by the host). */
    getCart(context: RuntimeContext): Promise<CartResult>;
    /** Add a sku; the server merges into an existing line or creates one. */
    addLine(context: RuntimeContext, input: AddLineInput): Promise<CartResult>;
    /** Set a line's quantity (already coalesced by the controller). */
    updateLineQuantity(context: RuntimeContext, input: UpdateLineQuantityInput): Promise<CartResult>;
    removeLine(context: RuntimeContext, input: RemoveLineInput): Promise<CartResult>;
    /** Rejected codes come back as `{ status: 'success', accepted: false }`. */
    applyPromoCode(context: RuntimeContext, input: ApplyPromoCodeInput): Promise<ApplyPromoCodeResult>;
    removePromoCode(context: RuntimeContext): Promise<CartResult>;
}
