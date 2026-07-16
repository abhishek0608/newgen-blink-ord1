import { jsx as a, jsxs as f } from "react/jsx-runtime";
import { useRef as U, useEffect as A, useSyncExternalStore as z, useId as E, useState as O } from "react";
const R = 12;
function $(e, s) {
  return e <= 0 || s <= 0 ? 0 : Math.ceil(e / s);
}
function D(e, s) {
  try {
    return new Intl.NumberFormat(void 0, { style: "currency", currency: s }).format(e);
  } catch {
    return `${s} ${e.toFixed(2)}`;
  }
}
function me(e) {
  return [e.name, e.sku, D(e.price, e.currency)].filter((s) => s.trim() !== "").join(" · ");
}
const q = /^\d{5}(-\d{4})?$/, H = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, W = /* @__PURE__ */ new Set(["us", "usa", "united states", "united states of america"]), B = /* @__PURE__ */ new Set(["ca", "can", "canada"]), V = () => ({
  street: "",
  city: "",
  state: "",
  zip: "",
  country: ""
});
function L(e) {
  const s = e.trim().toLowerCase();
  return W.has(s) ? "US" : B.has(s) ? "CA" : e.trim();
}
function F(e, s) {
  const t = {}, r = L(e.country);
  return e.street.trim() || (t.street = "Street is required"), e.city.trim() || (t.city = "City is required"), e.country.trim() || (t.country = "Country is required"), r === "US" ? (e.state.trim() || (t.state = "State is required"), q.test(e.zip.trim()) || (t.zip = "Enter a valid US ZIP code (12345 or 12345-6789)")) : r === "CA" ? (e.state.trim() || (t.state = "Province is required"), H.test(e.zip.trim()) || (t.zip = "Enter a valid Canadian postal code (A1A 1A1)")) : (e.zip.trim() || (t.zip = "ZIP / postal code is required"), s === "install" && !e.state.trim() && (t.state = "State / province is required")), t;
}
function N(e) {
  const s = L(e.country), t = e.state.trim();
  return {
    street: e.street.trim(),
    city: e.city.trim(),
    state: t.length <= 3 ? t.toUpperCase() : t,
    zip: s === "CA" ? e.zip.trim().toUpperCase() : e.zip.trim(),
    country: s
  };
}
function x(e) {
  const s = [e.state, e.zip].filter((t) => t.trim() !== "").join(" ");
  return [e.street, e.city, s, e.country].map((t) => t.trim()).filter((t) => t !== "").join(", ");
}
const Z = () => ({
  mode: "search",
  query: "",
  searching: !1,
  suggestions: [],
  searchDegraded: !1,
  savedAddresses: [],
  loadingSaved: !1,
  draft: V(),
  issues: {},
  submitting: !1,
  resolvingSuggestionId: null,
  selected: null,
  errorMessage: null
});
function Q(e) {
  const { service: s, context: t, addressType: r } = e, i = e.debounceMs ?? 250, c = e.minQueryLength ?? 3;
  let l = {
    onAddressSelected: e.onAddressSelected,
    onAddressChange: e.onAddressChange
  }, n = Z();
  const v = /* @__PURE__ */ new Set();
  let m = null, d = 0;
  const h = (o) => {
    n = { ...n, ...o };
    for (const g of v) g();
  }, u = (o) => {
    var g;
    h({ selected: o, draft: o, errorMessage: null }), (g = l.onAddressSelected) == null || g.call(l, o);
  }, _ = (o) => {
    h({ mode: "manual", searchDegraded: !0, searching: !1, suggestions: [], errorMessage: o });
  }, p = async (o) => {
    const g = ++d;
    h({ searching: !0 });
    const y = await s.searchAddresses(t, { text: o, addressType: r });
    if (g === d) {
      if (y.status === "error") {
        _(y.errorMessage ?? "Address search is unavailable — enter your address manually.");
        return;
      }
      h({ searching: !1, suggestions: y.suggestions });
    }
  };
  return {
    getState: () => n,
    subscribe(o) {
      return v.add(o), () => {
        v.delete(o);
      };
    },
    setCallbacks(o) {
      l = o;
    },
    async init() {
      if (!t.identity.accountId) return;
      h({ loadingSaved: !0 });
      const o = await s.listSavedAddresses(t, { addressType: r });
      h({
        loadingSaved: !1,
        savedAddresses: o.status === "success" ? o.addresses : []
      });
    },
    setQuery(o) {
      if (h({ query: o }), m && clearTimeout(m), !n.searchDegraded) {
        if (o.trim().length < c) {
          d += 1, h({ suggestions: [], searching: !1 });
          return;
        }
        m = setTimeout(() => {
          p(o.trim());
        }, i);
      }
    },
    async selectSuggestion(o) {
      h({ resolvingSuggestionId: o });
      const g = await s.resolveAddress(t, { suggestionId: o });
      if (h({ resolvingSuggestionId: null }), g.status === "error" || !g.address) {
        const y = g.errorMessage ?? "Could not load that address — enter it manually.";
        return _(y), { status: "error", errorMessage: y };
      }
      return h({ suggestions: [], query: "" }), u(g.address), { status: "success" };
    },
    selectSavedAddress(o) {
      const g = n.savedAddresses.find((y) => y.id === o);
      return g ? (u(g.address), { status: "success" }) : { status: "error", errorMessage: "Saved address not found" };
    },
    setMode(o) {
      h({ mode: o, errorMessage: null });
    },
    setDraftField(o, g) {
      var T;
      const y = { ...n.draft, [o]: g }, w = { ...n.issues };
      delete w[o], h({ draft: y, issues: w }), (T = l.onAddressChange) == null || T.call(l, y);
    },
    async submitManualAddress() {
      const o = F(n.draft, r);
      if (Object.keys(o).length > 0)
        return h({ issues: o }), { status: "error", errorMessage: "Fix the highlighted fields" };
      h({ submitting: !0, issues: {} });
      const g = await s.validateAddress(t, { address: n.draft, addressType: r });
      if (h({ submitting: !1 }), g.status === "error")
        return u(N(n.draft)), { status: "success" };
      if (g.valid === !1) {
        const y = g.errorMessage ?? "This address could not be verified";
        return h({ issues: g.issues ?? {}, errorMessage: y }), { status: "error", errorMessage: y };
      }
      return u(g.normalized ?? N(n.draft)), { status: "success" };
    },
    dispose() {
      m && clearTimeout(m);
    }
  };
}
const j = (e) => ({
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
function X(e) {
  const { service: s, context: t } = e, r = e.debounceMs ?? 250;
  let i = {
    onProductSelected: e.onProductSelected,
    onAddToCart: e.onAddToCart
  }, c = j(e.pageSize ?? R);
  const l = /* @__PURE__ */ new Set();
  let n = null, v = 0;
  const m = (u) => {
    c = { ...c, ...u };
    for (const _ of l) _();
  }, d = async () => {
    const u = ++v;
    m({ loading: !0 });
    const _ = await s.searchProducts(t, {
      text: c.query.trim(),
      sort: c.sort,
      page: c.page,
      pageSize: c.pageSize,
      ...c.categoryId ? { categoryId: c.categoryId } : {}
    });
    if (u === v) {
      if (_.status === "error") {
        m({
          loading: !1,
          loaded: !0,
          degraded: !0,
          errorMessage: _.errorMessage ?? "The catalog is temporarily unavailable — try again."
        });
        return;
      }
      m({
        loading: !1,
        loaded: !0,
        degraded: !1,
        errorMessage: null,
        products: _.products,
        totalCount: _.totalCount,
        pageCount: $(_.totalCount, c.pageSize)
      });
    }
  }, h = (u) => {
    n && clearTimeout(n), m({ ...u, page: 1 }), d();
  };
  return {
    getState: () => c,
    subscribe(u) {
      return l.add(u), () => {
        l.delete(u);
      };
    },
    setCallbacks(u) {
      i = u;
    },
    async init() {
      m({ loadingCategories: !0 });
      const [u] = await Promise.all([s.listCategories(t), d()]);
      m({
        loadingCategories: !1,
        categories: u.status === "success" ? u.categories : []
      });
    },
    setQuery(u) {
      m({ query: u, page: 1 }), n && clearTimeout(n), n = setTimeout(() => {
        d();
      }, r);
    },
    setCategory(u) {
      h({ categoryId: u });
    },
    setSort(u) {
      h({ sort: u });
    },
    setPage(u) {
      const _ = Math.min(Math.max(1, u), Math.max(1, c.pageCount));
      _ !== c.page && (n && clearTimeout(n), m({ page: _ }), d());
    },
    async refresh() {
      n && clearTimeout(n), await d();
    },
    async selectProduct(u) {
      const _ = (g) => {
        var y;
        return m({ selected: g }), (y = i.onProductSelected) == null || y.call(i, g), { status: "success" };
      }, p = c.products.find((g) => g.id === u);
      if (p) return _(p);
      m({ resolvingProductId: u });
      const o = await s.getProduct(t, { productId: u });
      if (m({ resolvingProductId: null }), o.status === "error" || !o.product) {
        const g = o.errorMessage ?? "Could not load that product.";
        return m({ errorMessage: g }), { status: "error", errorMessage: g };
      }
      return _(o.product);
    },
    addToCart(u, _ = 1) {
      var o, g;
      const p = c.products.find((y) => y.id === u) ?? (((o = c.selected) == null ? void 0 : o.id) === u ? c.selected : void 0);
      return p ? p.inStock ? _ < 1 ? { status: "error", errorMessage: "Quantity must be at least 1" } : ((g = i.onAddToCart) == null || g.call(i, p, _), { status: "success" }) : { status: "error", errorMessage: "This product is out of stock" } : { status: "error", errorMessage: "Product not found" };
    },
    dispose() {
      n && clearTimeout(n);
    }
  };
}
function G(e) {
  const s = U(null);
  s.current ?? (s.current = Q(e));
  const t = s.current, { onAddressSelected: r, onAddressChange: i } = e;
  return A(() => {
    t.setCallbacks({ onAddressSelected: r, onAddressChange: i });
  }, [t, r, i]), A(() => (t.init(), () => {
    t.dispose();
  }), [t]), { state: z(t.subscribe, t.getState, t.getState), controller: t };
}
const K = {
  shipping: "Shipping address",
  billing: "Billing address",
  install: "Install address"
}, Y = {
  street: "Address Line 1",
  city: "City",
  state: "State/Province",
  zip: "ZIP/Postal Code",
  country: "Country"
}, J = ["city", "state", "zip", "country"], ee = ({ expanded: e }) => /* @__PURE__ */ a(
  "svg",
  {
    className: "ec-address__chevron",
    viewBox: "0 0 24 24",
    width: "24",
    height: "24",
    "aria-hidden": "true",
    style: { transform: e ? "none" : "rotate(180deg)" },
    children: /* @__PURE__ */ a("path", { d: "M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z", fill: "currentColor" })
  }
);
function he(e) {
  const s = E(), [t, r] = O(!0), i = e.expanded ?? t, { state: c, controller: l } = G({
    service: e.service,
    context: e.context,
    addressType: e.addressType,
    onAddressSelected: e.onAddressSelected,
    onAddressChange: e.onAddressChange,
    debounceMs: e.debounceMs,
    minQueryLength: e.minQueryLength
  }), n = e.title ?? K[e.addressType], v = c.selected ? c.selected.street || c.selected.city || c.selected.state : "", m = () => {
    var h;
    const d = !i;
    r(d), (h = e.onExpandChange) == null || h.call(e, d);
  };
  return /* @__PURE__ */ a("section", { className: "ec-address", "data-address-type": e.addressType, children: /* @__PURE__ */ f("div", { className: "ec-address__section", children: [
    /* @__PURE__ */ f(
      "div",
      {
        className: "ec-address__header",
        "data-expanded": i,
        role: "button",
        tabIndex: 0,
        onClick: m,
        onKeyDown: (d) => {
          (d.key === "Enter" || d.key === " ") && (d.preventDefault(), m());
        },
        children: [
          /* @__PURE__ */ a("h3", { className: "ec-address__title", children: n }),
          /* @__PURE__ */ f("div", { className: "ec-address__header-meta", children: [
            v ? /* @__PURE__ */ a("span", { className: "ec-address__selectedtext", children: v }) : null,
            /* @__PURE__ */ a(ee, { expanded: i })
          ] })
        ]
      }
    ),
    i ? /* @__PURE__ */ f("div", { className: "ec-address__body", children: [
      c.errorMessage ? /* @__PURE__ */ a("div", { role: "alert", className: "ec-address__alert", children: /* @__PURE__ */ a("span", { children: c.errorMessage }) }) : null,
      c.selected ? /* @__PURE__ */ a("div", { className: "ec-address__radio-box", "data-testid": "ec-address-selected", children: /* @__PURE__ */ a("p", { className: "ec-address__radio-box-detail", children: x(c.selected) }) }) : null,
      c.savedAddresses.length > 0 && !c.selected ? /* @__PURE__ */ a("div", { className: "ec-address__saved", children: c.savedAddresses.map((d) => /* @__PURE__ */ f(
        "button",
        {
          type: "button",
          className: "ec-address__radio-box ec-address__radio-box--clickable",
          onClick: () => l.selectSavedAddress(d.id),
          children: [
            /* @__PURE__ */ a("p", { className: "ec-address__radio-box-title", children: d.label }),
            /* @__PURE__ */ a("p", { className: "ec-address__radio-box-detail", children: x(d.address) })
          ]
        },
        d.id
      )) }) : null,
      c.mode === "search" && !c.searchDegraded ? /* @__PURE__ */ f("div", { className: "ec-address__search", children: [
        /* @__PURE__ */ f("div", { className: "ec-address__field", children: [
          /* @__PURE__ */ a("label", { htmlFor: `${s}-search`, children: "Search for an address" }),
          /* @__PURE__ */ a("div", { className: "ec-address__input-wrapper", children: /* @__PURE__ */ a(
            "input",
            {
              id: `${s}-search`,
              className: "ec-address__input",
              type: "text",
              autoComplete: "off",
              placeholder: "Start typing an address…",
              value: c.query,
              onChange: (d) => l.setQuery(d.target.value)
            }
          ) })
        ] }),
        c.searching ? /* @__PURE__ */ a("p", { className: "ec-address__hint", children: "Searching…" }) : null,
        c.suggestions.length > 0 ? /* @__PURE__ */ a("ul", { className: "ec-address__suggestions", children: c.suggestions.map((d) => /* @__PURE__ */ a("li", { children: /* @__PURE__ */ a(
          "button",
          {
            type: "button",
            className: "ec-address__suggestion",
            disabled: c.resolvingSuggestionId !== null,
            onClick: () => void l.selectSuggestion(d.id),
            children: d.label
          }
        ) }, d.id)) }) : null,
        /* @__PURE__ */ a("button", { type: "button", className: "ec-address__link", onClick: () => l.setMode("manual"), children: "Enter address manually" })
      ] }) : /* @__PURE__ */ f(
        "form",
        {
          className: "ec-address__form",
          noValidate: !0,
          onSubmit: (d) => {
            d.preventDefault(), l.submitManualAddress();
          },
          children: [
            /* @__PURE__ */ a(
              P,
              {
                field: "street",
                idBase: s,
                value: c.draft.street,
                error: c.issues.street,
                onChange: (d) => l.setDraftField("street", d)
              }
            ),
            /* @__PURE__ */ a("div", { className: "ec-address__row", children: J.map((d) => /* @__PURE__ */ a(
              P,
              {
                field: d,
                idBase: s,
                value: c.draft[d],
                error: c.issues[d],
                onChange: (h) => l.setDraftField(d, h),
                grow: !0
              },
              d
            )) }),
            /* @__PURE__ */ f("div", { className: "ec-address__actions", children: [
              c.searchDegraded ? /* @__PURE__ */ a("span", {}) : /* @__PURE__ */ a("button", { type: "button", className: "ec-address__link", onClick: () => l.setMode("search"), children: "Back to search" }),
              /* @__PURE__ */ a("button", { type: "submit", className: "ec-address__btn-primary", disabled: c.submitting, children: c.submitting ? "Validating…" : "Continue" })
            ] })
          ]
        }
      )
    ] }) : null
  ] }) });
}
function P({ field: e, idBase: s, value: t, error: r, grow: i, onChange: c }) {
  return /* @__PURE__ */ f("div", { className: `ec-address__field${i ? " ec-address__field--grow" : ""}`, children: [
    /* @__PURE__ */ a("label", { htmlFor: `${s}-${e}`, children: Y[e] }),
    /* @__PURE__ */ a("div", { className: "ec-address__input-wrapper", children: /* @__PURE__ */ a(
      "input",
      {
        id: `${s}-${e}`,
        className: "ec-address__input",
        type: "text",
        autoComplete: "off",
        value: t,
        "aria-invalid": r ? !0 : void 0,
        onChange: (l) => c(l.target.value)
      }
    ) }),
    r ? /* @__PURE__ */ a("div", { className: "ec-address__error-tooltip", children: r }) : null
  ] });
}
function te(e) {
  const s = U(null);
  s.current ?? (s.current = X(e));
  const t = s.current, { onProductSelected: r, onAddToCart: i } = e;
  return A(() => {
    t.setCallbacks({ onProductSelected: r, onAddToCart: i });
  }, [t, r, i]), A(() => (t.init(), () => {
    t.dispose();
  }), [t]), { state: z(t.subscribe, t.getState, t.getState), controller: t };
}
const se = () => /* @__PURE__ */ a("svg", { className: "ec-catalog__search-icon", viewBox: "0 0 24 24", width: "20", height: "20", "aria-hidden": "true", children: /* @__PURE__ */ a(
  "path",
  {
    d: "M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z",
    fill: "currentColor"
  }
) }), re = () => /* @__PURE__ */ a("svg", { className: "ec-catalog__not-found-icon", viewBox: "0 0 24 24", width: "17", height: "17", "aria-hidden": "true", children: /* @__PURE__ */ a(
  "path",
  {
    d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z",
    fill: "currentColor"
  }
) }), I = ({ direction: e }) => /* @__PURE__ */ a("svg", { viewBox: "0 0 24 24", width: "20", height: "20", "aria-hidden": "true", children: e === "back" ? /* @__PURE__ */ a("path", { d: "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z", fill: "currentColor" }) : /* @__PURE__ */ a("path", { d: "M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z", fill: "currentColor" }) });
function ae(e, s) {
  return s <= 7 ? Array.from({ length: s }, (t, r) => r + 1) : e <= 4 ? [1, 2, 3, 4, "...", s - 1, s] : e >= s - 3 ? [1, 2, "...", s - 3, s - 2, s - 1, s] : [1, "...", e - 1, e, e + 1, "...", s];
}
function fe(e) {
  const s = E(), t = e.layout ?? "horizontal", { state: r, controller: i } = te({
    service: e.service,
    context: e.context,
    onProductSelected: e.onProductSelected,
    onAddToCart: e.onAddToCart,
    debounceMs: e.debounceMs,
    pageSize: e.pageSize
  }), c = r.loading && r.products.length === 0, l = r.loaded && !r.loading && r.products.length === 0 && !r.degraded;
  return /* @__PURE__ */ f("section", { className: "ec-catalog", children: [
    /* @__PURE__ */ a("div", { className: "ec-catalog__header", children: /* @__PURE__ */ f("div", { className: "ec-catalog__header-title", children: [
      /* @__PURE__ */ a("span", { className: "ec-catalog__subheading", children: r.loaded ? `Showing ${r.totalCount} results` : "Showing ... results" }),
      /* @__PURE__ */ a("h3", { className: "ec-catalog__title", children: e.title ?? "Catalog" })
    ] }) }),
    /* @__PURE__ */ a("div", { className: "ec-catalog__search", children: /* @__PURE__ */ f("div", { className: "ec-catalog__search-box", children: [
      /* @__PURE__ */ a(
        "input",
        {
          id: `${s}-search`,
          type: "search",
          "aria-label": "Search products",
          placeholder: "Search products...",
          autoComplete: "off",
          value: r.query,
          onChange: (n) => i.setQuery(n.target.value)
        }
      ),
      /* @__PURE__ */ a(se, {})
    ] }) }),
    r.errorMessage ? /* @__PURE__ */ f("div", { role: "alert", className: "ec-catalog__alert", children: [
      /* @__PURE__ */ a("span", { children: r.errorMessage }),
      r.degraded ? /* @__PURE__ */ a("button", { type: "button", className: "ec-catalog__retry", onClick: () => void i.refresh(), children: "Retry" }) : null
    ] }) : null,
    l ? /* @__PURE__ */ f("div", { className: "ec-catalog__not-found", "data-testid": "ec-catalog-empty", children: [
      /* @__PURE__ */ a(re, {}),
      /* @__PURE__ */ a("span", { className: "ec-catalog__not-found-text", children: "No results found" })
    ] }) : /* @__PURE__ */ a("ul", { className: `ec-catalog__items ec-catalog__items--${t}`, "data-layout": t, children: c ? Array.from({ length: 3 }, (n, v) => /* @__PURE__ */ f("li", { className: `ec-catalog__card ec-catalog__card--${t}`, "aria-hidden": "true", children: [
      /* @__PURE__ */ a("div", { className: "ec-catalog__card-image", children: /* @__PURE__ */ a("div", { className: "ec-catalog__skeleton ec-catalog__skeleton--image" }) }),
      /* @__PURE__ */ f("div", { className: "ec-catalog__card-text", children: [
        /* @__PURE__ */ a("div", { className: "ec-catalog__skeleton ec-catalog__skeleton--title" }),
        /* @__PURE__ */ a("div", { className: "ec-catalog__skeleton ec-catalog__skeleton--line" })
      ] })
    ] }, `skeleton-${v}`)) : r.products.map((n) => /* @__PURE__ */ a(
      ce,
      {
        product: n,
        layout: t,
        onOpen: () => void i.selectProduct(n.id),
        onAddToCart: () => i.addToCart(n.id)
      },
      n.id
    )) }),
    r.pageCount > 1 ? /* @__PURE__ */ a("nav", { className: "ec-catalog__pagination-wrap", "aria-label": "Catalog pages", children: /* @__PURE__ */ f("ul", { className: "ec-catalog__pagination", children: [
      /* @__PURE__ */ a("li", { children: /* @__PURE__ */ a(
        "button",
        {
          type: "button",
          className: "ec-catalog__page ec-catalog__page--arrow",
          "aria-label": "Previous page",
          disabled: r.page <= 1 || r.loading,
          onClick: () => i.setPage(r.page - 1),
          children: /* @__PURE__ */ a(I, { direction: "back" })
        }
      ) }),
      ae(r.page, r.pageCount).map(
        (n, v) => n === "..." ? /* @__PURE__ */ a("li", { children: /* @__PURE__ */ a("span", { className: "ec-catalog__page ec-catalog__page--gap", children: "…" }) }, `gap-${v}`) : /* @__PURE__ */ a("li", { children: /* @__PURE__ */ a(
          "button",
          {
            type: "button",
            className: "ec-catalog__page",
            "aria-label": `Go to page ${n}`,
            "aria-current": r.page === n ? "page" : void 0,
            disabled: r.loading,
            onClick: () => i.setPage(n),
            children: n
          }
        ) }, n)
      ),
      /* @__PURE__ */ a("li", { children: /* @__PURE__ */ a(
        "button",
        {
          type: "button",
          className: "ec-catalog__page ec-catalog__page--arrow",
          "aria-label": "Next page",
          disabled: r.page >= r.pageCount || r.loading,
          onClick: () => i.setPage(r.page + 1),
          children: /* @__PURE__ */ a(I, { direction: "forward" })
        }
      ) })
    ] }) }) : null
  ] });
}
function ce({ product: e, layout: s, onOpen: t, onAddToCart: r }) {
  return /* @__PURE__ */ f("li", { className: `ec-catalog__card ec-catalog__card--${s}`, "data-in-stock": e.inStock, children: [
    /* @__PURE__ */ a("div", { className: "ec-catalog__card-image", children: e.imageUrl ? /* @__PURE__ */ a("img", { src: e.imageUrl, alt: "", loading: "lazy" }) : /* @__PURE__ */ a("div", { className: "ec-catalog__card-image-placeholder", children: e.sku }) }),
    /* @__PURE__ */ f("div", { className: "ec-catalog__card-text", children: [
      /* @__PURE__ */ a("button", { type: "button", className: "ec-catalog__card-title", onClick: t, children: e.name }),
      /* @__PURE__ */ a("p", { className: "ec-catalog__card-desc", children: e.description })
    ] }),
    /* @__PURE__ */ f("div", { className: "ec-catalog__card-attributes", children: [
      /* @__PURE__ */ f("div", { className: "ec-catalog__card-field", children: [
        /* @__PURE__ */ a("span", { className: "ec-catalog__card-field-label", children: "SKU" }),
        /* @__PURE__ */ a("span", { className: "ec-catalog__card-field-value", children: e.sku })
      ] }),
      /* @__PURE__ */ f("div", { className: "ec-catalog__card-field", children: [
        /* @__PURE__ */ a("span", { className: "ec-catalog__card-field-label", children: "Price" }),
        /* @__PURE__ */ a("span", { className: "ec-catalog__card-field-value", children: D(e.price, e.currency) })
      ] })
    ] }),
    /* @__PURE__ */ a("div", { className: "ec-catalog__card-button", children: e.inStock ? /* @__PURE__ */ a("button", { type: "button", className: "ec-catalog__btn-primary", onClick: r, children: "Add to cart" }) : /* @__PURE__ */ a("span", { className: "ec-catalog__not-available", children: "Not Available" }) })
  ] });
}
const C = {
  searchAddresses: "platform/address:search",
  resolveAddress: "platform/address:resolve",
  validateAddress: "platform/address:validate",
  listSavedAddresses: "platform/address:listSaved"
}, b = (e) => e instanceof Error ? e.message : "Address service request failed";
function _e(e) {
  return {
    async searchAddresses(s, t) {
      try {
        return await e(C.searchAddresses, { context: s, ...t });
      } catch (r) {
        return { status: "error", errorMessage: b(r), suggestions: [] };
      }
    },
    async resolveAddress(s, t) {
      try {
        return await e(C.resolveAddress, { context: s, ...t });
      } catch (r) {
        return { status: "error", errorMessage: b(r) };
      }
    },
    async validateAddress(s, t) {
      try {
        return await e(C.validateAddress, { context: s, ...t });
      } catch (r) {
        return { status: "error", errorMessage: b(r) };
      }
    },
    async listSavedAddresses(s, t) {
      try {
        return await e(C.listSavedAddresses, { context: s, ...t });
      } catch (r) {
        return { status: "error", errorMessage: b(r), addresses: [] };
      }
    }
  };
}
const k = {
  searchProducts: "platform/catalog:search",
  getProduct: "platform/catalog:get",
  listCategories: "platform/catalog:listCategories"
}, M = (e) => e instanceof Error ? e.message : "Catalog service request failed";
function ye(e) {
  return {
    async searchProducts(s, t) {
      try {
        return await e(k.searchProducts, { context: s, ...t });
      } catch (r) {
        return { status: "error", errorMessage: M(r), products: [], totalCount: 0 };
      }
    },
    async getProduct(s, t) {
      try {
        return await e(k.getProduct, { context: s, ...t });
      } catch (r) {
        return { status: "error", errorMessage: M(r) };
      }
    },
    async listCategories(s) {
      try {
        return await e(k.listCategories, { context: s });
      } catch (t) {
        return { status: "error", errorMessage: M(t), categories: [] };
      }
    }
  };
}
const ne = [
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
], ie = [
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
function ve(e = {}) {
  const s = e.fixtures ?? ne, t = e.savedAddresses ?? ie, r = () => new Promise((i) => setTimeout(i, e.latencyMs ?? 0));
  return {
    async searchAddresses(i, c) {
      if (await r(), e.failSearch) return { status: "error", errorMessage: "mock: address search unavailable", suggestions: [] };
      const l = c.text.toLowerCase();
      return {
        status: "success",
        suggestions: s.filter((n) => n.suggestion.label.toLowerCase().includes(l)).map((n) => n.suggestion)
      };
    },
    async resolveAddress(i, c) {
      if (await r(), e.failResolve) return { status: "error", errorMessage: "mock: address resolve unavailable" };
      const l = s.find((n) => n.suggestion.id === c.suggestionId);
      return l ? { status: "success", address: l.address } : { status: "error", errorMessage: `mock: unknown suggestion ${c.suggestionId}` };
    },
    async validateAddress(i, c) {
      if (await r(), e.failValidate) return { status: "error", errorMessage: "mock: address validation unavailable" };
      const l = F(c.address, c.addressType);
      return Object.keys(l).length > 0 ? { status: "success", valid: !1, issues: l, errorMessage: "This address could not be verified" } : { status: "success", valid: !0, normalized: N(c.address) };
    },
    async listSavedAddresses(i, c) {
      return await r(), i.identity.accountId ? { status: "success", addresses: t } : { status: "success", addresses: [] };
    }
  };
}
function Se(e = {}) {
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
), oe = [
  { id: "cat-systems", label: "Filtration systems" },
  { id: "cat-filters", label: "Replacement filters" },
  { id: "cat-accessories", label: "Accessories" }
], de = [
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
], le = (e, s) => {
  const t = [...e];
  switch (s) {
    case "price-asc":
      return t.sort((r, i) => r.price - i.price);
    case "price-desc":
      return t.sort((r, i) => i.price - r.price);
    case "name":
      return t.sort((r, i) => r.name.localeCompare(i.name));
    case "relevance":
      return t;
  }
};
function pe(e = {}) {
  const s = e.products ?? de, t = e.categories ?? oe, r = () => new Promise((i) => setTimeout(i, e.latencyMs ?? 0));
  return {
    async searchProducts(i, c) {
      if (await r(), e.failSearch)
        return { status: "error", errorMessage: "mock: catalog search unavailable", products: [], totalCount: 0 };
      const l = c.text.trim().toLowerCase(), n = le(
        s.filter((m) => c.categoryId && m.categoryId !== c.categoryId ? !1 : l ? [m.name, m.description, m.sku].some(
          (d) => d.toLowerCase().includes(l)
        ) : !0),
        c.sort
      ), v = (c.page - 1) * c.pageSize;
      return {
        status: "success",
        products: n.slice(v, v + c.pageSize),
        totalCount: n.length
      };
    },
    async getProduct(i, c) {
      if (await r(), e.failGetProduct) return { status: "error", errorMessage: "mock: product lookup unavailable" };
      const l = s.find((n) => n.id === c.productId);
      return l ? { status: "success", product: l } : { status: "error", errorMessage: `mock: unknown product ${c.productId}` };
    },
    async listCategories(i) {
      return await r(), e.failCategories ? { status: "error", errorMessage: "mock: categories unavailable", categories: [] } : { status: "success", categories: t };
    }
  };
}
export {
  C as ADDRESS_EXECUTOR_METHODS,
  he as AddressPanel,
  k as CATALOG_EXECUTOR_METHODS,
  fe as CatalogPanel,
  R as DEFAULT_CATALOG_PAGE_SIZE,
  Q as createAddressController,
  X as createCatalogController,
  _e as createExecutorAddressService,
  ye as createExecutorCatalogService,
  ve as createMockAddressService,
  pe as createMockCatalogService,
  Se as createMockRuntimeContext,
  V as emptyAddress,
  x as formatAddressLine,
  D as formatPrice,
  me as formatProductLine,
  N as normalizeAddress,
  L as normalizeCountry,
  $ as pageCountOf,
  G as useAddressController,
  te as useCatalogController,
  F as validateAddressFormat
};
//# sourceMappingURL=index.js.map
