/**
 * OPT-IN Salesforce adapter layer. Unlike every other layer in src/, this one
 * is allowed to own transport (fetch) — it ships as the separate subpath
 * export `@expedite-commerce/next-gen-composable/salesforce`, so hosts that
 * live on standard Salesforce objects wire a composable with just
 * { baseUrl, tokenProvider } and no host glue. Hosts on other backends (BFF,
 * AppSync, LWC, custom schemas) keep using the executor port; the core
 * package stays transport-free either way.
 */
/** Connection config — mirrors RuntimeSecurity: the host supplies identity. */
export interface SalesforceConnection {
    /** Org My Domain (https://acme.my.salesforce.com), or an async provider (e.g. read from a token-vending endpoint). */
    baseUrl: string | (() => Promise<string>);
    /** Returns a valid access token. The host owns caching and refresh. */
    tokenProvider: () => Promise<string>;
    /** REST API version, default v62.0. */
    apiVersion?: string;
}
export interface SoqlResult<T> {
    totalSize: number;
    done: boolean;
    records: T[];
}
export type SoqlRunner = <T>(query: string) => Promise<SoqlResult<T>>;
export declare const escapeSoql: (value: string) => string;
export declare function createSoqlRunner(connection: SalesforceConnection): SoqlRunner;
