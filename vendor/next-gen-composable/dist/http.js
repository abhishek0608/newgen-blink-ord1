import { c as s } from "./executorCatalogService-C2ArODnq.js";
function l(r = {}) {
  const a = r.endpoint ?? "/api/catalog";
  return s(async (o, n) => {
    const e = await fetch(a, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...r.headers },
      body: JSON.stringify({ method: o, payload: n })
    }), t = await e.json().catch(() => null);
    if (!e.ok) {
      const c = (t == null ? void 0 : t.error) ?? `HTTP ${e.status}`;
      throw new Error(`Catalog request failed: ${c}`);
    }
    return t;
  });
}
export {
  l as createHttpCatalogService
};
//# sourceMappingURL=http.js.map
