import type { CartService } from '../core/port';
import type { RuntimeContext } from '../core/runtime';
import type { CartDTO } from '../core/types';
export interface CartPanelProps {
    context: RuntimeContext;
    service: CartService;
    onCartChange?: (cart: CartDTO) => void;
    /** productList block header (blink cart page). */
    title?: string;
    /** quoteSummary block header. */
    summaryTitle?: string;
    debounceMs?: number;
}
/**
 * Cart page replicating the blink storefront cart (TemplateRenderer blocks):
 * OrganismsProductListBlock (MoleculeDataTable + AtomButtonCounter + REMOVE),
 * OrganismsPromoCodeBlock, OrganismsQuoteSummaryBlock, and AtomEmptyCart.
 */
export declare function CartPanel(props: CartPanelProps): import("react").JSX.Element;
