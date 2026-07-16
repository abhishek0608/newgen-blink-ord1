/**
 * TEMPORARY CORE SHIM — Foundry-30845 (`@expedite-commerce/composable-core`)
 * is not published yet. These types mirror the RuntimeContext contract from
 * the build notes. When core ships, delete this file and re-export from
 * `@expedite-commerce/composable-core` instead. Nothing else in this package
 * may define runtime/identity/session/security shapes.
 */
export type ComposableRuntime = 'mock' | 'custom' | 'lwc';
export interface RuntimeIdentity {
    organizationId: string;
    accountId?: string;
    contactId?: string;
    pricingSchema?: string;
}
export interface RuntimeSession {
    origin: 'REACT_STOREFRONT';
    quoteId?: string;
    storefrontId?: string;
}
export interface RuntimeSecurity {
    baseUrl: string;
    tokenProvider: () => Promise<string>;
}
export interface RuntimeContext {
    runtime: ComposableRuntime;
    identity: RuntimeIdentity;
    session: RuntimeSession;
    security?: RuntimeSecurity;
}
