import { C as P } from "./catalogPort-CUiYclZD.js";
import { n as A, v as E } from "./validation-Cx6ESUpl.js";
const y = (e) => e.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
function $(e) {
  const s = e.apiVersion ?? "v62.0", o = () => typeof e.baseUrl == "function" ? e.baseUrl() : Promise.resolve(e.baseUrl);
  return async (c) => {
    const [t, a] = await Promise.all([o(), e.tokenProvider()]), r = await fetch(
      `${t.replace(/\/$/, "")}/services/data/${s}/query?q=${encodeURIComponent(c)}`,
      { headers: { Authorization: `Bearer ${a}` } }
    ), n = await r.json().catch(() => null);
    if (!r.ok) {
      const i = Array.isArray(n) ? n.map((d) => d.message ?? "").join("; ") : `HTTP ${r.status}`;
      throw new Error(`Salesforce query failed: ${i}`);
    }
    return n;
  };
}
const h = "UnitPrice, Product2.Id, Product2.Name, Product2.ProductCode, Product2.Description, Product2.Family, Product2.DisplayUrl, Product2.IsActive", g = "FROM PricebookEntry WHERE Pricebook2.IsStandard = true AND IsActive = true AND Product2.IsActive = true", C = {
  relevance: "Product2.Name ASC",
  name: "Product2.Name ASC",
  "price-asc": "UnitPrice ASC",
  "price-desc": "UnitPrice DESC"
}, S = (e) => e instanceof Error ? e.message : "Salesforce catalog request failed";
function I(e) {
  const s = $(e), o = e.currency ?? "USD", c = (t) => ({
    id: t.Product2.Id,
    sku: t.Product2.ProductCode ?? "",
    name: t.Product2.Name,
    description: t.Product2.Description ?? "",
    price: t.UnitPrice ?? 0,
    currency: o,
    categoryId: t.Product2.Family ?? void 0,
    imageUrl: t.Product2.DisplayUrl ?? void 0,
    inStock: t.Product2.IsActive
  });
  return {
    async searchProducts(t, a) {
      try {
        const r = [], n = a.text.trim();
        if (n) {
          const l = `'%${y(n)}%'`;
          r.push(`(Product2.Name LIKE ${l} OR Product2.ProductCode LIKE ${l})`);
        }
        a.categoryId && r.push(`Product2.Family = '${y(a.categoryId)}'`);
        const i = r.length ? ` AND ${r.join(" AND ")}` : "", [d, p] = await Promise.all([
          s(`SELECT COUNT() ${g}${i}`),
          s(
            `SELECT ${h} ${g}${i} ORDER BY ${C[a.sort] ?? C.relevance} LIMIT ${a.pageSize} OFFSET ${(a.page - 1) * a.pageSize}`
          )
        ]);
        return { status: "success", products: p.records.map(c), totalCount: d.totalSize };
      } catch (r) {
        return { status: "error", errorMessage: S(r), products: [], totalCount: 0 };
      }
    },
    async getProduct(t, a) {
      try {
        const n = (await s(
          `SELECT ${h} ${g} AND Product2.Id = '${y(a.productId)}' LIMIT 1`
        )).records[0];
        return n ? { status: "success", product: c(n) } : { status: "error", errorMessage: `Unknown product ${a.productId}` };
      } catch (r) {
        return { status: "error", errorMessage: S(r) };
      }
    },
    async listCategories(t) {
      try {
        return {
          status: "success",
          categories: (await s(
            `SELECT Product2.Family Family ${g} AND Product2.Family != null GROUP BY Product2.Family`
          )).records.filter((r) => !!r.Family).map((r) => ({ id: r.Family, label: r.Family }))
        };
      } catch (a) {
        return { status: "error", errorMessage: S(a), categories: [] };
      }
    }
  };
}
const v = async (e) => {
  if (e.body !== void 0 && e.body !== null)
    return typeof e.body == "string" ? JSON.parse(e.body) : e.body;
  let s = "";
  for await (const o of e) s += o;
  return s ? JSON.parse(s) : {};
}, u = (e, s, o) => {
  e.statusCode = s, e.setHeader("Content-Type", "application/json"), e.end(JSON.stringify(o));
};
function O(e) {
  const s = I(e);
  return async (o, c) => {
    if (o.method !== "POST") {
      u(c, 405, { error: "Method not allowed — use POST with { method, payload }" });
      return;
    }
    try {
      const { method: t, payload: a } = await v(o), { context: r, ...n } = a ?? {}, i = r;
      switch (t) {
        case P.searchProducts:
          u(c, 200, await s.searchProducts(i, n));
          return;
        case P.getProduct:
          u(c, 200, await s.getProduct(i, n));
          return;
        case P.listCategories:
          u(c, 200, await s.listCategories(i));
          return;
        default:
          u(c, 400, { error: `Unknown catalog method: ${String(t)}` });
      }
    } catch (t) {
      u(c, 502, { error: t instanceof Error ? t.message : "Catalog handler failed" });
    }
  };
}
const f = (e, s) => {
  const o = e[`${s}Street`];
  return o ? {
    street: o,
    city: e[`${s}City`] ?? "",
    state: e[`${s}State`] ?? "",
    zip: e[`${s}PostalCode`] ?? "",
    country: e[`${s}Country`] ?? ""
  } : null;
};
function U(e) {
  const s = $(e);
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
    async validateAddress(o, c) {
      const t = A(c.address), a = E(t, c.addressType);
      return { status: "success", valid: Object.keys(a).length === 0, issues: a, normalized: t };
    },
    async listSavedAddresses(o, c) {
      const t = o.identity.accountId;
      if (!t) return { status: "success", addresses: [] };
      try {
        const r = (await s(
          `SELECT Id, Name, BillingStreet, BillingCity, BillingState, BillingPostalCode, BillingCountry, ShippingStreet, ShippingCity, ShippingState, ShippingPostalCode, ShippingCountry FROM Account WHERE Id = '${y(t)}' LIMIT 1`
        )).records[0];
        if (!r) return { status: "success", addresses: [] };
        const n = [], i = f(r, "Billing"), d = f(r, "Shipping"), p = c.addressType === "billing" ? [{ kind: "Billing", address: i }, { kind: "Shipping", address: d }] : [{ kind: "Shipping", address: d }, { kind: "Billing", address: i }];
        for (const { kind: l, address: m } of p)
          m && n.push({ id: `${r.Id}-${l}`, label: `${r.Name} — ${l}`, address: m });
        return { status: "success", addresses: n };
      } catch (a) {
        return { status: "error", errorMessage: a instanceof Error ? a.message : "Saved address lookup failed", addresses: [] };
      }
    }
  };
}
export {
  U as createSalesforceAddressService,
  O as createSalesforceCatalogHandler,
  I as createSalesforceCatalogService
};
//# sourceMappingURL=salesforce.js.map
