import type { CartService } from '../core/port';
/**
 * The composable-core transport seam (Foundry-30845): a generic
 * Executor(method, payload). The host's runtime factory supplies a mock,
 * custom (BFF), or lwc implementation — this package never talks to a
 * network or to Salesforce directly. Pricing/tax/promo evaluation stays
 * behind the host BFF; no pricing engine is embedded.
 */
export type ComposableExecutor = (method: string, payload: Record<string, unknown>) => Promise<unknown>;
export declare const CART_EXECUTOR_METHODS: {
    readonly getCart: "platform/cart:get";
    readonly addLine: "platform/cart:addLine";
    readonly updateLineQuantity: "platform/cart:updateLineQuantity";
    readonly removeLine: "platform/cart:removeLine";
    readonly applyPromoCode: "platform/cart:applyPromo";
    readonly removePromoCode: "platform/cart:removePromo";
};
/** Wraps an executor as a CartService. Executor failures become `{ status: 'error' }` — never a rejection. */
export declare function createExecutorCartService(executor: ComposableExecutor): CartService;
