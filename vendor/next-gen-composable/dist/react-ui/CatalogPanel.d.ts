import type { CatalogService } from '../core/catalogPort';
import type { RuntimeContext } from '../core/runtime';
import type { CatalogProduct } from '../core/catalogTypes';
/** 'horizontal' (blink's productItemOrientation) stacks full-width cards, image left; 'grid' wraps vertical cards. */
export type CatalogLayout = 'horizontal' | 'grid';
export interface CatalogPanelProps {
    context: RuntimeContext;
    service: CatalogService;
    onProductSelected?: (product: CatalogProduct) => void;
    onAddToCart?: (product: CatalogProduct, quantity: number) => void;
    title?: string;
    debounceMs?: number;
    pageSize?: number;
    layout?: CatalogLayout;
}
export declare function CatalogPanel(props: CatalogPanelProps): import("react").JSX.Element;
