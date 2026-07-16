/**
 * All money values are integer minor units (cents). The server owns pricing
 * math — the composable never computes authoritative totals.
 */
/** A single cart line. `id` is the server-issued line id — mutations key on it. */
export interface CartLineDTO {
    id: string;
    sku: string;
    name: string;
    variant?: string;
    imageUrl?: string;
    quantity: number;
    /** Unit price in minor units, after any line-level pricing the server applied. */
    unitPrice: number;
}
/** Server-computed totals, minor units. */
export interface CartTotalsDTO {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
}
/** Normalized cart DTO emitted to the host. The host owns checkout hand-off. */
export interface CartDTO {
    id: string;
    /** ISO 4217, e.g. 'USD'. */
    currency: string;
    lines: CartLineDTO[];
    /** One promo code per cart (blink checkout parity). */
    promoCode: string | null;
    totals: CartTotalsDTO;
}
export type ServiceStatus = 'success' | 'error';
/** Mutations return this — they never throw. */
export interface MutationResult {
    status: ServiceStatus;
    errorMessage?: string;
}
/** Every successful cart operation returns the full re-priced cart. */
export interface CartResult {
    status: ServiceStatus;
    errorMessage?: string;
    cart?: CartDTO;
}
export interface AddLineInput {
    sku: string;
    quantity: number;
}
export interface UpdateLineQuantityInput {
    lineId: string;
    quantity: number;
}
export interface RemoveLineInput {
    lineId: string;
}
export interface ApplyPromoCodeInput {
    code: string;
}
export interface ApplyPromoCodeResult extends CartResult {
    /** false = the service worked but rejected the code (unknown/expired). */
    accepted?: boolean;
}
