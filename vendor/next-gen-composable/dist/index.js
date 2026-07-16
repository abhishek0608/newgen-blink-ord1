import { v as I, n as k, e as F, f as w } from "./validation-Cx6ESUpl.js";
import { a as _e } from "./validation-Cx6ESUpl.js";
import { jsx as s, jsxs as _ } from "react/jsx-runtime";
import { useRef as P, useEffect as N, useSyncExternalStore as E, useId as U, useState as L } from "react";
import { c as ve } from "./executorCatalogService-C2ArODnq.js";
import { C as Ce } from "./catalogPort-CUiYclZD.js";
const z = 12;
function R(e, a) {
  return e <= 0 || a <= 0 ? 0 : Math.ceil(e / a);
}
function D(e, a) {
  try {
    return new Intl.NumberFormat(void 0, { style: "currency", currency: a }).format(e);
  } catch {
    return `${a} ${e.toFixed(2)}`;
  }
}
function de(e) {
  return [e.name, e.sku, D(e.price, e.currency)].filter((a) => a.trim() !== "").join(" · ");
}
const O = () => ({
  mode: "search",
  query: "",
  searching: !1,
  suggestions: [],
  searchDegraded: !1,
  savedAddresses: [],
  loadingSaved: !1,
  draft: F(),
  issues: {},
  submitting: !1,
  resolvingSuggestionId: null,
  selected: null,
  errorMessage: null
});
function $(e) {
  const { service: a, context: c, addressType: t } = e, i = e.debounceMs ?? 250, r = e.minQueryLength ?? 3;
  let n = {
    onAddressSelected: e.onAddressSelected,
    onAddressChange: e.onAddressChange
  }, o = O();
  const h = /* @__PURE__ */ new Set();
  let v = null, d = 0;
  const m = (l) => {
    o = { ...o, ...l };
    for (const g of h) g();
  }, C = (l) => {
    var g;
    m({ selected: l, draft: l, errorMessage: null }), (g = n.onAddressSelected) == null || g.call(n, l);
  }, u = (l) => {
    m({ mode: "manual", searchDegraded: !0, searching: !1, suggestions: [], errorMessage: l });
  }, y = async (l) => {
    const g = ++d;
    m({ searching: !0 });
    const f = await a.searchAddresses(c, { text: l, addressType: t });
    if (g === d) {
      if (f.status === "error") {
        u(f.errorMessage ?? "Address search is unavailable — enter your address manually.");
        return;
      }
      m({ searching: !1, suggestions: f.suggestions });
    }
  };
  return {
    getState: () => o,
    subscribe(l) {
      return h.add(l), () => {
        h.delete(l);
      };
    },
    setCallbacks(l) {
      n = l;
    },
    async init() {
      if (!c.identity.accountId) return;
      m({ loadingSaved: !0 });
      const l = await a.listSavedAddresses(c, { addressType: t });
      m({
        loadingSaved: !1,
        savedAddresses: l.status === "success" ? l.addresses : []
      });
    },
    setQuery(l) {
      if (m({ query: l }), v && clearTimeout(v), !o.searchDegraded) {
        if (l.trim().length < r) {
          d += 1, m({ suggestions: [], searching: !1 });
          return;
        }
        v = setTimeout(() => {
          y(l.trim());
        }, i);
      }
    },
    async selectSuggestion(l) {
      m({ resolvingSuggestionId: l });
      const g = await a.resolveAddress(c, { suggestionId: l });
      if (m({ resolvingSuggestionId: null }), g.status === "error" || !g.address) {
        const f = g.errorMessage ?? "Could not load that address — enter it manually.";
        return u(f), { status: "error", errorMessage: f };
      }
      return m({ suggestions: [], query: "" }), C(g.address), { status: "success" };
    },
    selectSavedAddress(l) {
      const g = o.savedAddresses.find((f) => f.id === l);
      return g ? (C(g.address), { status: "success" }) : { status: "error", errorMessage: "Saved address not found" };
    },
    setMode(l) {
      m({ mode: l, errorMessage: null });
    },
    setDraftField(l, g) {
      var M;
      const f = { ...o.draft, [l]: g }, p = { ...o.issues };
      delete p[l], m({ draft: f, issues: p }), (M = n.onAddressChange) == null || M.call(n, f);
    },
    async submitManualAddress() {
      const l = I(o.draft, t);
      if (Object.keys(l).length > 0)
        return m({ issues: l }), { status: "error", errorMessage: "Fix the highlighted fields" };
      m({ submitting: !0, issues: {} });
      const g = await a.validateAddress(c, { address: o.draft, addressType: t });
      if (m({ submitting: !1 }), g.status === "error")
        return C(k(o.draft)), { status: "success" };
      if (g.valid === !1) {
        const f = g.errorMessage ?? "This address could not be verified";
        return m({ issues: g.issues ?? {}, errorMessage: f }), { status: "error", errorMessage: f };
      }
      return C(g.normalized ?? k(o.draft)), { status: "success" };
    },
    dispose() {
      v && clearTimeout(v);
    }
  };
}
const H = (e) => ({
  query: "",
  categoryId: null,
  sort: "relevance",
  page: 1,
  pageSize: e,
  loading: !1,
  loaded: !1,
  products: [],
  totalCount: 0,
  pageCount: 0,
  categories: [],
  loadingCategories: !1,
  degraded: !1,
  selected: null,
  resolvingProductId: null,
  errorMessage: null
});
function W(e) {
  const { service: a, context: c } = e, t = e.debounceMs ?? 250, i = e.loadCategories ?? !0;
  let r = {
    onProductSelected: e.onProductSelected,
    onAddToCart: e.onAddToCart
  }, n = H(e.pageSize ?? z);
  const o = /* @__PURE__ */ new Set();
  let h = null, v = 0;
  const d = (u) => {
    n = { ...n, ...u };
    for (const y of o) y();
  }, m = async () => {
    const u = ++v;
    d({ loading: !0 });
    const y = await a.searchProducts(c, {
      text: n.query.trim(),
      sort: n.sort,
      page: n.page,
      pageSize: n.pageSize,
      ...n.categoryId ? { categoryId: n.categoryId } : {}
    });
    if (u === v) {
      if (y.status === "error") {
        d({
          loading: !1,
          loaded: !0,
          degraded: !0,
          errorMessage: y.errorMessage ?? "The catalog is temporarily unavailable — try again."
        });
        return;
      }
      d({
        loading: !1,
        loaded: !0,
        degraded: !1,
        errorMessage: null,
        products: y.products,
        totalCount: y.totalCount,
        pageCount: R(y.totalCount, n.pageSize)
      });
    }
  }, C = (u) => {
    h && clearTimeout(h), d({ ...u, page: 1 }), m();
  };
  return {
    getState: () => n,
    subscribe(u) {
      return o.add(u), () => {
        o.delete(u);
      };
    },
    setCallbacks(u) {
      r = u;
    },
    async init() {
      if (!i) {
        await m();
        return;
      }
      d({ loadingCategories: !0 });
      const [u] = await Promise.all([a.listCategories(c), m()]);
      d({
        loadingCategories: !1,
        categories: u.status === "success" ? u.categories : []
      });
    },
    setQuery(u) {
      d({ query: u, page: 1 }), h && clearTimeout(h), h = setTimeout(() => {
        m();
      }, t);
    },
    setCategory(u) {
      C({ categoryId: u });
    },
    setSort(u) {
      C({ sort: u });
    },
    setPage(u) {
      const y = Math.min(Math.max(1, u), Math.max(1, n.pageCount));
      y !== n.page && (h && clearTimeout(h), d({ page: y }), m());
    },
    async refresh() {
      h && clearTimeout(h), await m();
    },
    async selectProduct(u) {
      const y = (f) => {
        var p;
        return d({ selected: f }), (p = r.onProductSelected) == null || p.call(r, f), { status: "success" };
      }, l = n.products.find((f) => f.id === u);
      if (l) return y(l);
      d({ resolvingProductId: u });
      const g = await a.getProduct(c, { productId: u });
      if (d({ resolvingProductId: null }), g.status === "error" || !g.product) {
        const f = g.errorMessage ?? "Could not load that product.";
        return d({ errorMessage: f }), { status: "error", errorMessage: f };
      }
      return y(g.product);
    },
    addToCart(u, y = 1) {
      var g, f;
      const l = n.products.find((p) => p.id === u) ?? (((g = n.selected) == null ? void 0 : g.id) === u ? n.selected : void 0);
      return l ? l.inStock ? y < 1 ? { status: "error", errorMessage: "Quantity must be at least 1" } : ((f = r.onAddToCart) == null || f.call(r, l, y), { status: "success" }) : { status: "error", errorMessage: "This product is out of stock" } : { status: "error", errorMessage: "Product not found" };
    },
    dispose() {
      h && clearTimeout(h);
    }
  };
}
function q(e) {
  const a = P(null);
  a.current ?? (a.current = $(e));
  const c = a.current, { onAddressSelected: t, onAddressChange: i } = e;
  return N(() => {
    c.setCallbacks({ onAddressSelected: t, onAddressChange: i });
  }, [c, t, i]), N(() => (c.init(), () => {
    c.dispose();
  }), [c]), { state: E(c.subscribe, c.getState, c.getState), controller: c };
}
const B = {
  shipping: "Shipping address",
  billing: "Billing address",
  install: "Install address"
}, V = {
  street: "Address Line 1",
  city: "City",
  state: "State/Province",
  zip: "ZIP/Postal Code",
  country: "Country"
}, Q = ["city", "state", "zip", "country"], X = ({ expanded: e }) => /* @__PURE__ */ s(
  "svg",
  {
    className: "ec-address__chevron",
    viewBox: "0 0 24 24",
    width: "24",
    height: "24",
    "aria-hidden": "true",
    style: { transform: e ? "none" : "rotate(180deg)" },
    children: /* @__PURE__ */ s("path", { d: "M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z", fill: "currentColor" })
  }
);
function oe(e) {
  const a = U(), [c, t] = L(!0), i = e.expanded ?? c, { state: r, controller: n } = q({
    service: e.service,
    context: e.context,
    addressType: e.addressType,
    onAddressSelected: e.onAddressSelected,
    onAddressChange: e.onAddressChange,
    debounceMs: e.debounceMs,
    minQueryLength: e.minQueryLength
  }), o = e.title ?? B[e.addressType], h = r.selected ? r.selected.street || r.selected.city || r.selected.state : "", v = () => {
    var m;
    const d = !i;
    t(d), (m = e.onExpandChange) == null || m.call(e, d);
  };
  return /* @__PURE__ */ s("section", { className: "ec-address", "data-address-type": e.addressType, children: /* @__PURE__ */ _("div", { className: "ec-address__section", children: [
    /* @__PURE__ */ _(
      "div",
      {
        className: "ec-address__header",
        "data-expanded": i,
        role: "button",
        tabIndex: 0,
        onClick: v,
        onKeyDown: (d) => {
          (d.key === "Enter" || d.key === " ") && (d.preventDefault(), v());
        },
        children: [
          /* @__PURE__ */ s("h3", { className: "ec-address__title", children: o }),
          /* @__PURE__ */ _("div", { className: "ec-address__header-meta", children: [
            h ? /* @__PURE__ */ s("span", { className: "ec-address__selectedtext", children: h }) : null,
            /* @__PURE__ */ s(X, { expanded: i })
          ] })
        ]
      }
    ),
    i ? /* @__PURE__ */ _("div", { className: "ec-address__body", children: [
      r.errorMessage ? /* @__PURE__ */ s("div", { role: "alert", className: "ec-address__alert", children: /* @__PURE__ */ s("span", { children: r.errorMessage }) }) : null,
      r.selected ? /* @__PURE__ */ s("div", { className: "ec-address__radio-box", "data-testid": "ec-address-selected", children: /* @__PURE__ */ s("p", { className: "ec-address__radio-box-detail", children: w(r.selected) }) }) : null,
      r.savedAddresses.length > 0 && !r.selected ? /* @__PURE__ */ s("div", { className: "ec-address__saved", children: r.savedAddresses.map((d) => /* @__PURE__ */ _(
        "button",
        {
          type: "button",
          className: "ec-address__radio-box ec-address__radio-box--clickable",
          onClick: () => n.selectSavedAddress(d.id),
          children: [
            /* @__PURE__ */ s("p", { className: "ec-address__radio-box-title", children: d.label }),
            /* @__PURE__ */ s("p", { className: "ec-address__radio-box-detail", children: w(d.address) })
          ]
        },
        d.id
      )) }) : null,
      r.mode === "search" && !r.searchDegraded ? /* @__PURE__ */ _("div", { className: "ec-address__search", children: [
        /* @__PURE__ */ _("div", { className: "ec-address__field", children: [
          /* @__PURE__ */ s("label", { htmlFor: `${a}-search`, children: "Search for an address" }),
          /* @__PURE__ */ s("div", { className: "ec-address__input-wrapper", children: /* @__PURE__ */ s(
            "input",
            {
              id: `${a}-search`,
              className: "ec-address__input",
              type: "text",
              autoComplete: "off",
              placeholder: "Start typing an address…",
              value: r.query,
              onChange: (d) => n.setQuery(d.target.value)
            }
          ) })
        ] }),
        r.searching ? /* @__PURE__ */ s("p", { className: "ec-address__hint", children: "Searching…" }) : null,
        r.suggestions.length > 0 ? /* @__PURE__ */ s("ul", { className: "ec-address__suggestions", children: r.suggestions.map((d) => /* @__PURE__ */ s("li", { children: /* @__PURE__ */ s(
          "button",
          {
            type: "button",
            className: "ec-address__suggestion",
            disabled: r.resolvingSuggestionId !== null,
            onClick: () => void n.selectSuggestion(d.id),
            children: d.label
          }
        ) }, d.id)) }) : null,
        /* @__PURE__ */ s("button", { type: "button", className: "ec-address__link", onClick: () => n.setMode("manual"), children: "Enter address manually" })
      ] }) : /* @__PURE__ */ _(
        "form",
        {
          className: "ec-address__form",
          noValidate: !0,
          onSubmit: (d) => {
            d.preventDefault(), n.submitManualAddress();
          },
          children: [
            /* @__PURE__ */ s(
              T,
              {
                field: "street",
                idBase: a,
                value: r.draft.street,
                error: r.issues.street,
                onChange: (d) => n.setDraftField("street", d)
              }
            ),
            /* @__PURE__ */ s("div", { className: "ec-address__row", children: Q.map((d) => /* @__PURE__ */ s(
              T,
              {
                field: d,
                idBase: a,
                value: r.draft[d],
                error: r.issues[d],
                onChange: (m) => n.setDraftField(d, m),
                grow: !0
              },
              d
            )) }),
            /* @__PURE__ */ _("div", { className: "ec-address__actions", children: [
              r.searchDegraded ? /* @__PURE__ */ s("span", {}) : /* @__PURE__ */ s("button", { type: "button", className: "ec-address__link", onClick: () => n.setMode("search"), children: "Back to search" }),
              /* @__PURE__ */ s("button", { type: "submit", className: "ec-address__btn-primary", disabled: r.submitting, children: r.submitting ? "Validating…" : "Continue" })
            ] })
          ]
        }
      )
    ] }) : null
  ] }) });
}
function T({ field: e, idBase: a, value: c, error: t, grow: i, onChange: r }) {
  return /* @__PURE__ */ _("div", { className: `ec-address__field${i ? " ec-address__field--grow" : ""}`, children: [
    /* @__PURE__ */ s("label", { htmlFor: `${a}-${e}`, children: V[e] }),
    /* @__PURE__ */ s("div", { className: "ec-address__input-wrapper", children: /* @__PURE__ */ s(
      "input",
      {
        id: `${a}-${e}`,
        className: "ec-address__input",
        type: "text",
        autoComplete: "off",
        value: c,
        "aria-invalid": t ? !0 : void 0,
        onChange: (n) => r(n.target.value)
      }
    ) }),
    t ? /* @__PURE__ */ s("div", { className: "ec-address__error-tooltip", children: t }) : null
  ] });
}
function G(e) {
  const a = P(null);
  a.current ?? (a.current = W(e));
  const c = a.current, { onProductSelected: t, onAddToCart: i } = e;
  return N(() => {
    c.setCallbacks({ onProductSelected: t, onAddToCart: i });
  }, [c, t, i]), N(() => (c.init(), () => {
    c.dispose();
  }), [c]), { state: E(c.subscribe, c.getState, c.getState), controller: c };
}
const j = () => /* @__PURE__ */ s("svg", { className: "ec-catalog__search-icon", viewBox: "0 0 24 24", width: "20", height: "20", "aria-hidden": "true", children: /* @__PURE__ */ s(
  "path",
  {
    d: "M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z",
    fill: "currentColor"
  }
) }), K = () => /* @__PURE__ */ s("svg", { className: "ec-catalog__not-found-icon", viewBox: "0 0 24 24", width: "17", height: "17", "aria-hidden": "true", children: /* @__PURE__ */ s(
  "path",
  {
    d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z",
    fill: "currentColor"
  }
) }), x = ({ direction: e }) => /* @__PURE__ */ s("svg", { viewBox: "0 0 24 24", width: "20", height: "20", "aria-hidden": "true", children: e === "back" ? /* @__PURE__ */ s("path", { d: "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z", fill: "currentColor" }) : /* @__PURE__ */ s("path", { d: "M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z", fill: "currentColor" }) });
function Z(e, a) {
  return a <= 7 ? Array.from({ length: a }, (c, t) => t + 1) : e <= 4 ? [1, 2, 3, 4, "...", a - 1, a] : e >= a - 3 ? [1, 2, "...", a - 3, a - 2, a - 1, a] : [1, "...", e - 1, e, e + 1, "...", a];
}
function ie(e) {
  const a = U(), c = e.layout ?? "horizontal", { state: t, controller: i } = G({
    service: e.service,
    context: e.context,
    onProductSelected: e.onProductSelected,
    onAddToCart: e.onAddToCart,
    debounceMs: e.debounceMs,
    pageSize: e.pageSize,
    // Search-only panel — no category control, so skip the listCategories round-trip.
    loadCategories: !1
  }), r = t.loading && t.products.length === 0, n = t.loaded && !t.loading && t.products.length === 0 && !t.degraded;
  return /* @__PURE__ */ _("section", { className: "ec-catalog", children: [
    /* @__PURE__ */ s("div", { className: "ec-catalog__header", children: /* @__PURE__ */ _("div", { className: "ec-catalog__header-title", children: [
      /* @__PURE__ */ s("span", { className: "ec-catalog__subheading", children: t.loaded ? `Showing ${t.totalCount} results` : "Showing ... results" }),
      /* @__PURE__ */ s("h3", { className: "ec-catalog__title", children: e.title ?? "Catalog" })
    ] }) }),
    /* @__PURE__ */ s("div", { className: "ec-catalog__search", children: /* @__PURE__ */ _("div", { className: "ec-catalog__search-box", children: [
      /* @__PURE__ */ s(
        "input",
        {
          id: `${a}-search`,
          type: "search",
          "aria-label": "Search products",
          placeholder: "Search products...",
          autoComplete: "off",
          value: t.query,
          onChange: (o) => i.setQuery(o.target.value)
        }
      ),
      /* @__PURE__ */ s(j, {})
    ] }) }),
    t.errorMessage ? /* @__PURE__ */ _("div", { role: "alert", className: "ec-catalog__alert", children: [
      /* @__PURE__ */ s("span", { children: t.errorMessage }),
      t.degraded ? /* @__PURE__ */ s("button", { type: "button", className: "ec-catalog__retry", onClick: () => void i.refresh(), children: "Retry" }) : null
    ] }) : null,
    n ? /* @__PURE__ */ _("div", { className: "ec-catalog__not-found", "data-testid": "ec-catalog-empty", children: [
      /* @__PURE__ */ s(K, {}),
      /* @__PURE__ */ s("span", { className: "ec-catalog__not-found-text", children: "No results found" })
    ] }) : /* @__PURE__ */ s("ul", { className: `ec-catalog__items ec-catalog__items--${c}`, "data-layout": c, children: r ? Array.from({ length: 3 }, (o, h) => /* @__PURE__ */ _("li", { className: `ec-catalog__card ec-catalog__card--${c}`, "aria-hidden": "true", children: [
      /* @__PURE__ */ s("div", { className: "ec-catalog__card-image", children: /* @__PURE__ */ s("div", { className: "ec-catalog__skeleton ec-catalog__skeleton--image" }) }),
      /* @__PURE__ */ _("div", { className: "ec-catalog__card-text", children: [
        /* @__PURE__ */ s("div", { className: "ec-catalog__skeleton ec-catalog__skeleton--title" }),
        /* @__PURE__ */ s("div", { className: "ec-catalog__skeleton ec-catalog__skeleton--line" })
      ] })
    ] }, `skeleton-${h}`)) : t.products.map((o) => /* @__PURE__ */ s(
      Y,
      {
        product: o,
        layout: c,
        onOpen: () => void i.selectProduct(o.id),
        onAddToCart: () => i.addToCart(o.id)
      },
      o.id
    )) }),
    t.pageCount > 1 ? /* @__PURE__ */ s("nav", { className: "ec-catalog__pagination-wrap", "aria-label": "Catalog pages", children: /* @__PURE__ */ _("ul", { className: "ec-catalog__pagination", children: [
      /* @__PURE__ */ s("li", { children: /* @__PURE__ */ s(
        "button",
        {
          type: "button",
          className: "ec-catalog__page ec-catalog__page--arrow",
          "aria-label": "Previous page",
          disabled: t.page <= 1 || t.loading,
          onClick: () => i.setPage(t.page - 1),
          children: /* @__PURE__ */ s(x, { direction: "back" })
        }
      ) }),
      Z(t.page, t.pageCount).map(
        (o, h) => o === "..." ? /* @__PURE__ */ s("li", { children: /* @__PURE__ */ s("span", { className: "ec-catalog__page ec-catalog__page--gap", children: "…" }) }, `gap-${h}`) : /* @__PURE__ */ s("li", { children: /* @__PURE__ */ s(
          "button",
          {
            type: "button",
            className: "ec-catalog__page",
            "aria-label": `Go to page ${o}`,
            "aria-current": t.page === o ? "page" : void 0,
            disabled: t.loading,
            onClick: () => i.setPage(o),
            children: o
          }
        ) }, o)
      ),
      /* @__PURE__ */ s("li", { children: /* @__PURE__ */ s(
        "button",
        {
          type: "button",
          className: "ec-catalog__page ec-catalog__page--arrow",
          "aria-label": "Next page",
          disabled: t.page >= t.pageCount || t.loading,
          onClick: () => i.setPage(t.page + 1),
          children: /* @__PURE__ */ s(x, { direction: "forward" })
        }
      ) })
    ] }) }) : null
  ] });
}
function Y({ product: e, layout: a, onOpen: c, onAddToCart: t }) {
  return /* @__PURE__ */ _("li", { className: `ec-catalog__card ec-catalog__card--${a}`, "data-in-stock": e.inStock, children: [
    /* @__PURE__ */ s("div", { className: "ec-catalog__card-image", children: e.imageUrl ? /* @__PURE__ */ s("img", { src: e.imageUrl, alt: "", loading: "lazy" }) : /* @__PURE__ */ s("div", { className: "ec-catalog__card-image-placeholder", children: e.sku }) }),
    /* @__PURE__ */ _("div", { className: "ec-catalog__card-text", children: [
      /* @__PURE__ */ s("button", { type: "button", className: "ec-catalog__card-title", onClick: c, children: e.name }),
      /* @__PURE__ */ s("p", { className: "ec-catalog__card-desc", children: e.description })
    ] }),
    /* @__PURE__ */ _("div", { className: "ec-catalog__card-attributes", children: [
      /* @__PURE__ */ _("div", { className: "ec-catalog__card-field", children: [
        /* @__PURE__ */ s("span", { className: "ec-catalog__card-field-label", children: "SKU" }),
        /* @__PURE__ */ s("span", { className: "ec-catalog__card-field-value", children: e.sku })
      ] }),
      /* @__PURE__ */ _("div", { className: "ec-catalog__card-field", children: [
        /* @__PURE__ */ s("span", { className: "ec-catalog__card-field-label", children: "Price" }),
        /* @__PURE__ */ s("span", { className: "ec-catalog__card-field-value", children: D(e.price, e.currency) })
      ] })
    ] }),
    /* @__PURE__ */ s("div", { className: "ec-catalog__card-button", children: e.inStock ? /* @__PURE__ */ s("button", { type: "button", className: "ec-catalog__btn-primary", onClick: t, children: "Add to cart" }) : /* @__PURE__ */ s("span", { className: "ec-catalog__not-available", children: "Not Available" }) })
  ] });
}
const b = {
  searchAddresses: "platform/address:search",
  resolveAddress: "platform/address:resolve",
  validateAddress: "platform/address:validate",
  listSavedAddresses: "platform/address:listSaved"
}, A = (e) => e instanceof Error ? e.message : "Address service request failed";
function le(e) {
  return {
    async searchAddresses(a, c) {
      try {
        return await e(b.searchAddresses, { context: a, ...c });
      } catch (t) {
        return { status: "error", errorMessage: A(t), suggestions: [] };
      }
    },
    async resolveAddress(a, c) {
      try {
        return await e(b.resolveAddress, { context: a, ...c });
      } catch (t) {
        return { status: "error", errorMessage: A(t) };
      }
    },
    async validateAddress(a, c) {
      try {
        return await e(b.validateAddress, { context: a, ...c });
      } catch (t) {
        return { status: "error", errorMessage: A(t) };
      }
    },
    async listSavedAddresses(a, c) {
      try {
        return await e(b.listSavedAddresses, { context: a, ...c });
      } catch (t) {
        return { status: "error", errorMessage: A(t), addresses: [] };
      }
    }
  };
}
const J = [
  {
    suggestion: { id: "sugg-austin", label: "600 Congress Ave, Austin, TX 78701, USA" },
    address: { street: "600 Congress Ave", city: "Austin", state: "TX", zip: "78701", country: "US" }
  },
  {
    suggestion: { id: "sugg-sf", label: "1 Market St, San Francisco, CA 94105, USA" },
    address: { street: "1 Market St", city: "San Francisco", state: "CA", zip: "94105", country: "US" }
  },
  {
    suggestion: { id: "sugg-toronto", label: "325 Front St W, Toronto, ON M5V 2Y1, Canada" },
    address: { street: "325 Front St W", city: "Toronto", state: "ON", zip: "M5V 2Y1", country: "CA" }
  },
  {
    suggestion: { id: "sugg-vancouver", label: "800 Robson St, Vancouver, BC V6Z 2E7, Canada" },
    address: { street: "800 Robson St", city: "Vancouver", state: "BC", zip: "V6Z 2E7", country: "CA" }
  }
], ee = [
  {
    id: "saved-hq",
    label: "Head office",
    address: { street: "600 Congress Ave", city: "Austin", state: "TX", zip: "78701", country: "US" }
  },
  {
    id: "saved-warehouse",
    label: "Warehouse",
    address: { street: "2100 Logistics Pkwy", city: "Dallas", state: "TX", zip: "75201", country: "US" }
  }
];
function ue(e = {}) {
  const a = e.fixtures ?? J, c = e.savedAddresses ?? ee, t = () => new Promise((i) => setTimeout(i, e.latencyMs ?? 0));
  return {
    async searchAddresses(i, r) {
      if (await t(), e.failSearch) return { status: "error", errorMessage: "mock: address search unavailable", suggestions: [] };
      const n = r.text.toLowerCase();
      return {
        status: "success",
        suggestions: a.filter((o) => o.suggestion.label.toLowerCase().includes(n)).map((o) => o.suggestion)
      };
    },
    async resolveAddress(i, r) {
      if (await t(), e.failResolve) return { status: "error", errorMessage: "mock: address resolve unavailable" };
      const n = a.find((o) => o.suggestion.id === r.suggestionId);
      return n ? { status: "success", address: n.address } : { status: "error", errorMessage: `mock: unknown suggestion ${r.suggestionId}` };
    },
    async validateAddress(i, r) {
      if (await t(), e.failValidate) return { status: "error", errorMessage: "mock: address validation unavailable" };
      const n = I(r.address, r.addressType);
      return Object.keys(n).length > 0 ? { status: "success", valid: !1, issues: n, errorMessage: "This address could not be verified" } : { status: "success", valid: !0, normalized: k(r.address) };
    },
    async listSavedAddresses(i, r) {
      return await t(), i.identity.accountId ? { status: "success", addresses: c } : { status: "success", addresses: [] };
    }
  };
}
function ge(e = {}) {
  return {
    runtime: "mock",
    identity: { organizationId: "org-mock", accountId: "acct-mock", ...e.identity },
    session: { origin: "REACT_STOREFRONT", quoteId: "quote-mock", ...e.session },
    ...e.security ? { security: e.security } : {},
    ...e.runtime ? { runtime: e.runtime } : {}
  };
}
const S = (e) => "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="130"><rect width="100%" height="100%" fill="#f4f6f8"/><text x="50%" y="52%" fill="#9aa4af" font-family="Montserrat, sans-serif" font-size="15" font-weight="700" text-anchor="middle" dominant-baseline="middle">${e}</text></svg>`
), se = [
  { id: "cat-systems", label: "Filtration systems" },
  { id: "cat-filters", label: "Replacement filters" },
  { id: "cat-accessories", label: "Accessories" }
], te = [
  {
    id: "prod-uc-100",
    sku: "HW-UC-100",
    name: "UnderCounter Filtration System",
    description: "Two-stage under-sink system with dedicated faucet.",
    price: 349,
    currency: "USD",
    categoryId: "cat-systems",
    imageUrl: S("UC-100"),
    inStock: !0
  },
  {
    id: "prod-wh-400",
    sku: "HW-WH-400",
    name: "Whole Home Filtration System",
    description: "Point-of-entry carbon system for the whole house.",
    price: 1899,
    currency: "USD",
    categoryId: "cat-systems",
    imageUrl: S("WH-400"),
    inStock: !0
  },
  {
    id: "prod-ro-250",
    sku: "HW-RO-250",
    name: "Reverse Osmosis System",
    description: "Five-stage RO with remineralization cartridge.",
    price: 599,
    currency: "USD",
    categoryId: "cat-systems",
    imageUrl: S("RO-250"),
    inStock: !1
  },
  {
    id: "prod-cf-12",
    sku: "HW-CF-12",
    name: "Carbon Filter 12-Pack",
    description: "Annual supply of activated carbon filters.",
    price: 129,
    currency: "USD",
    categoryId: "cat-filters",
    imageUrl: S("CF-12"),
    inStock: !0
  },
  {
    id: "prod-sf-01",
    sku: "HW-SF-01",
    name: "Sediment Pre-Filter",
    description: "5-micron sediment pre-filter, universal housing.",
    price: 24,
    currency: "USD",
    categoryId: "cat-filters",
    imageUrl: S("SF-01"),
    inStock: !0
  },
  {
    id: "prod-ro-mem",
    sku: "HW-RO-MEM",
    name: "RO Membrane Cartridge",
    description: "Replacement membrane for the Reverse Osmosis System.",
    price: 89,
    currency: "USD",
    categoryId: "cat-filters",
    imageUrl: S("RO-MEM"),
    inStock: !0
  },
  {
    id: "prod-faucet-br",
    sku: "HW-FA-BR",
    name: "Designer Faucet — Brushed Nickel",
    description: "Lead-free dedicated drinking-water faucet.",
    price: 79,
    currency: "USD",
    categoryId: "cat-accessories",
    imageUrl: S("FA-BR"),
    inStock: !0
  },
  {
    id: "prod-leak-01",
    sku: "HW-LK-01",
    name: "Leak Detection Valve",
    description: "Auto-shutoff valve with moisture sensor.",
    price: 49,
    currency: "USD",
    categoryId: "cat-accessories",
    imageUrl: S("LK-01"),
    inStock: !0
  },
  {
    id: "prod-tds-01",
    sku: "HW-TDS-01",
    name: "TDS Test Meter",
    description: "Handheld total-dissolved-solids meter.",
    price: 19,
    currency: "USD",
    categoryId: "cat-accessories",
    imageUrl: S("TDS-01"),
    inStock: !1
  }
], ae = (e, a) => {
  const c = [...e];
  switch (a) {
    case "price-asc":
      return c.sort((t, i) => t.price - i.price);
    case "price-desc":
      return c.sort((t, i) => i.price - t.price);
    case "name":
      return c.sort((t, i) => t.name.localeCompare(i.name));
    case "relevance":
      return c;
  }
};
function me(e = {}) {
  const a = e.products ?? te, c = e.categories ?? se, t = () => new Promise((i) => setTimeout(i, e.latencyMs ?? 0));
  return {
    async searchProducts(i, r) {
      if (await t(), e.failSearch)
        return { status: "error", errorMessage: "mock: catalog search unavailable", products: [], totalCount: 0 };
      const n = r.text.trim().toLowerCase(), o = ae(
        a.filter((v) => r.categoryId && v.categoryId !== r.categoryId ? !1 : n ? [v.name, v.description, v.sku].some(
          (d) => d.toLowerCase().includes(n)
        ) : !0),
        r.sort
      ), h = (r.page - 1) * r.pageSize;
      return {
        status: "success",
        products: o.slice(h, h + r.pageSize),
        totalCount: o.length
      };
    },
    async getProduct(i, r) {
      if (await t(), e.failGetProduct) return { status: "error", errorMessage: "mock: product lookup unavailable" };
      const n = a.find((o) => o.id === r.productId);
      return n ? { status: "success", product: n } : { status: "error", errorMessage: `mock: unknown product ${r.productId}` };
    },
    async listCategories(i) {
      return await t(), e.failCategories ? { status: "error", errorMessage: "mock: categories unavailable", categories: [] } : { status: "success", categories: c };
    }
  };
}
export {
  b as ADDRESS_EXECUTOR_METHODS,
  oe as AddressPanel,
  Ce as CATALOG_EXECUTOR_METHODS,
  ie as CatalogPanel,
  z as DEFAULT_CATALOG_PAGE_SIZE,
  $ as createAddressController,
  W as createCatalogController,
  le as createExecutorAddressService,
  ve as createExecutorCatalogService,
  ue as createMockAddressService,
  me as createMockCatalogService,
  ge as createMockRuntimeContext,
  F as emptyAddress,
  w as formatAddressLine,
  D as formatPrice,
  de as formatProductLine,
  k as normalizeAddress,
  _e as normalizeCountry,
  R as pageCountOf,
  q as useAddressController,
  G as useCatalogController,
  I as validateAddressFormat
};
//# sourceMappingURL=index.js.map
