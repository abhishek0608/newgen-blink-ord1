import { C as s } from "./catalogPort-CUiYclZD.js";
const o = (r) => r instanceof Error ? r.message : "Catalog service request failed";
function u(r) {
  return {
    async searchProducts(t, e) {
      try {
        return await r(s.searchProducts, { context: t, ...e });
      } catch (a) {
        return { status: "error", errorMessage: o(a), products: [], totalCount: 0 };
      }
    },
    async getProduct(t, e) {
      try {
        return await r(s.getProduct, { context: t, ...e });
      } catch (a) {
        return { status: "error", errorMessage: o(a) };
      }
    },
    async listCategories(t) {
      try {
        return await r(s.listCategories, { context: t });
      } catch (e) {
        return { status: "error", errorMessage: o(e), categories: [] };
      }
    }
  };
}
export {
  u as c
};
//# sourceMappingURL=executorCatalogService-C2ArODnq.js.map
