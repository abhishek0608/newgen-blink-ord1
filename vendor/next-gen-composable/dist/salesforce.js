import { n as C, v as I } from "./validation-Cx6ESUpl.js";
const g = (s) => s.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
function h(s) {
  const a = s.apiVersion ?? "v62.0", c = () => typeof s.baseUrl == "function" ? s.baseUrl() : Promise.resolve(s.baseUrl);
  return async (i) => {
    const [t, r] = await Promise.all([c(), s.tokenProvider()]), e = await fetch(
      `${t.replace(/\/$/, "")}/services/data/${a}/query?q=${encodeURIComponent(i)}`,
      { headers: { Authorization: `Bearer ${r}` } }
    ), o = await e.json().catch(() => null);
    if (!e.ok) {
      const n = Array.isArray(o) ? o.map((d) => d.message ?? "").join("; ") : `HTTP ${e.status}`;
      throw new Error(`Salesforce query failed: ${n}`);
    }
    return o;
  };
}
const S = "UnitPrice, Product2.Id, Product2.Name, Product2.ProductCode, Product2.Description, Product2.Family, Product2.DisplayUrl, Product2.IsActive", l = "FROM PricebookEntry WHERE Pricebook2.IsStandard = true AND IsActive = true AND Product2.IsActive = true", m = {
  relevance: "Product2.Name ASC",
  name: "Product2.Name ASC",
  "price-asc": "UnitPrice ASC",
  "price-desc": "UnitPrice DESC"
}, p = (s) => s instanceof Error ? s.message : "Salesforce catalog request failed";
function f(s) {
  const a = h(s), c = s.currency ?? "USD", i = (t) => ({
    id: t.Product2.Id,
    sku: t.Product2.ProductCode ?? "",
    name: t.Product2.Name,
    description: t.Product2.Description ?? "",
    price: t.UnitPrice ?? 0,
    currency: c,
    categoryId: t.Product2.Family ?? void 0,
    imageUrl: t.Product2.DisplayUrl ?? void 0,
    inStock: t.Product2.IsActive
  });
  return {
    async searchProducts(t, r) {
      try {
        const e = [], o = r.text.trim();
        if (o) {
          const u = `'%${g(o)}%'`;
          e.push(`(Product2.Name LIKE ${u} OR Product2.ProductCode LIKE ${u})`);
        }
        r.categoryId && e.push(`Product2.Family = '${g(r.categoryId)}'`);
        const n = e.length ? ` AND ${e.join(" AND ")}` : "", [d, P] = await Promise.all([
          a(`SELECT COUNT() ${l}${n}`),
          a(
            `SELECT ${S} ${l}${n} ORDER BY ${m[r.sort] ?? m.relevance} LIMIT ${r.pageSize} OFFSET ${(r.page - 1) * r.pageSize}`
          )
        ]);
        return { status: "success", products: P.records.map(i), totalCount: d.totalSize };
      } catch (e) {
        return { status: "error", errorMessage: p(e), products: [], totalCount: 0 };
      }
    },
    async getProduct(t, r) {
      try {
        const o = (await a(
          `SELECT ${S} ${l} AND Product2.Id = '${g(r.productId)}' LIMIT 1`
        )).records[0];
        return o ? { status: "success", product: i(o) } : { status: "error", errorMessage: `Unknown product ${r.productId}` };
      } catch (e) {
        return { status: "error", errorMessage: p(e) };
      }
    },
    async listCategories(t) {
      try {
        return {
          status: "success",
          categories: (await a(
            `SELECT Product2.Family Family ${l} AND Product2.Family != null GROUP BY Product2.Family`
          )).records.filter((e) => !!e.Family).map((e) => ({ id: e.Family, label: e.Family }))
        };
      } catch (r) {
        return { status: "error", errorMessage: p(r), categories: [] };
      }
    }
  };
}
const $ = (s, a) => {
  const c = s[`${a}Street`];
  return c ? {
    street: c,
    city: s[`${a}City`] ?? "",
    state: s[`${a}State`] ?? "",
    zip: s[`${a}PostalCode`] ?? "",
    country: s[`${a}Country`] ?? ""
  } : null;
};
function E(s) {
  const a = h(s);
  return {
    async searchAddresses() {
      return {
        status: "error",
        errorMessage: "Address search is not available — enter the address manually.",
        suggestions: []
      };
    },
    async resolveAddress() {
      return { status: "error", errorMessage: "Address search is not available." };
    },
    async validateAddress(c, i) {
      const t = C(i.address), r = I(t, i.addressType);
      return { status: "success", valid: Object.keys(r).length === 0, issues: r, normalized: t };
    },
    async listSavedAddresses(c, i) {
      const t = c.identity.accountId;
      if (!t) return { status: "success", addresses: [] };
      try {
        const e = (await a(
          `SELECT Id, Name, BillingStreet, BillingCity, BillingState, BillingPostalCode, BillingCountry, ShippingStreet, ShippingCity, ShippingState, ShippingPostalCode, ShippingCountry FROM Account WHERE Id = '${g(t)}' LIMIT 1`
        )).records[0];
        if (!e) return { status: "success", addresses: [] };
        const o = [], n = $(e, "Billing"), d = $(e, "Shipping"), P = i.addressType === "billing" ? [{ kind: "Billing", address: n }, { kind: "Shipping", address: d }] : [{ kind: "Shipping", address: d }, { kind: "Billing", address: n }];
        for (const { kind: u, address: y } of P)
          y && o.push({ id: `${e.Id}-${u}`, label: `${e.Name} — ${u}`, address: y });
        return { status: "success", addresses: o };
      } catch (r) {
        return { status: "error", errorMessage: r instanceof Error ? r.message : "Saved address lookup failed", addresses: [] };
      }
    }
  };
}
export {
  E as createSalesforceAddressService,
  f as createSalesforceCatalogService
};
//# sourceMappingURL=salesforce.js.map
