import type { CartDTO, CartLineDTO } from './types';
export declare const QUANTITY_MIN = 1;
export declare const QUANTITY_MAX = 99;
/** Offline quantity check — steppers clamp, but hosts may pass arbitrary values. */
export declare function quantityIssue(quantity: number): string | null;
/** Line price in minor units. */
export declare const lineTotal: (line: CartLineDTO) => number;
export declare const computeSubtotal: (lines: CartLineDTO[]) => number;
/**
 * Display-only approximation while a mutation is in flight: subtotal is
 * recomputed from the lines; discount/tax keep their last server values.
 * The next server response replaces the whole cart — this never becomes
 * an authoritative total.
 */
export declare function withOptimisticTotals(cart: CartDTO): CartDTO;
/** Minor units → localized currency string (2999, 'USD' → "$29.99"). */
export declare function formatMoney(amountMinor: number, currency: string): string;
/** Total item count across lines (mini-cart badge). */
export declare const cartItemCount: (cart: CartDTO | null) => number;
