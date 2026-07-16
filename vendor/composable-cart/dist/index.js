import { jsxs as p, jsx as a, Fragment as R } from "react/jsx-runtime";
import { useRef as $, useEffect as S, useSyncExternalStore as A, useId as D } from "react";
const q = 1, P = 99;
function N(e) {
  return Number.isInteger(e) ? e < q ? `Quantity must be at least ${q}` : e > P ? `Quantity cannot exceed ${P}` : null : "Quantity must be a whole number";
}
const I = (e) => e.unitPrice * e.quantity, Q = (e) => e.reduce((n, r) => n + I(r), 0);
function U(e) {
  const n = Q(e.lines), r = {
    ...e.totals,
    subtotal: n,
    total: n - e.totals.discount + e.totals.tax
  };
  return { ...e, totals: r };
}
function M(e, n) {
  return new Intl.NumberFormat("en", { style: "currency", currency: n }).format(e / 100);
}
const re = (e) => e ? e.lines.reduce((n, r) => n + r.quantity, 0) : 0, F = () => ({
  loading: !1,
  cart: null,
  pendingLineIds: [],
  addingSku: null,
  promoInput: "",
  applyingPromo: !1,
  promoError: null,
  errorMessage: null
});
function W(e) {
  const { service: n, context: r } = e, c = e.debounceMs ?? 300;
  let h = { onCartChange: e.onCartChange }, i = F();
  const u = /* @__PURE__ */ new Set(), g = /* @__PURE__ */ new Map(), _ = /* @__PURE__ */ new Map(), s = (t) => {
    i = { ...i, ...t };
    for (const o of u) o();
  }, l = (t) => {
    i.pendingLineIds.includes(t) || s({ pendingLineIds: [...i.pendingLineIds, t] });
  }, d = (t) => {
    s({ pendingLineIds: i.pendingLineIds.filter((o) => o !== t) });
  }, f = (t) => {
    var o;
    s({ cart: t, errorMessage: null }), (o = h.onCartChange) == null || o.call(h, t);
  }, v = async (t) => {
    const o = await n.getCart(r);
    s({
      errorMessage: t,
      cart: o.status === "success" && o.cart ? o.cart : i.cart
    });
  }, E = async () => {
    s({ loading: !0 });
    const t = await n.getCart(r);
    if (s({ loading: !1 }), t.status === "error" || !t.cart) {
      s({ errorMessage: t.errorMessage ?? "Could not load your cart." });
      return;
    }
    f(t.cart);
  }, T = (t) => {
    const o = (_.get(t) ?? 0) + 1;
    return _.set(t, o), o;
  }, x = async (t, o) => {
    const m = T(t);
    l(t);
    const y = await n.updateLineQuantity(r, { lineId: t, quantity: o });
    if (_.get(t) !== m) return { status: "success" };
    if (d(t), y.status === "error" || !y.cart) {
      const C = y.errorMessage ?? "Could not update the quantity — your cart has been refreshed.";
      return await v(C), { status: "error", errorMessage: C };
    }
    return f(y.cart), { status: "success" };
  }, O = async (t) => {
    var m, y;
    const o = (y = (m = i.cart) == null ? void 0 : m.lines.find((C) => C.id === t)) == null ? void 0 : y.quantity;
    o !== void 0 && await x(t, o);
  }, L = async (t) => {
    const o = g.get(t);
    o && (clearTimeout(o), g.delete(t)), T(t), l(t);
    const m = await n.removeLine(r, { lineId: t });
    if (d(t), m.status === "error" || !m.cart) {
      const y = m.errorMessage ?? "Could not remove the item — your cart has been refreshed.";
      return await v(y), { status: "error", errorMessage: y };
    }
    return f(m.cart), { status: "success" };
  };
  return {
    getState: () => i,
    subscribe(t) {
      return u.add(t), () => {
        u.delete(t);
      };
    },
    setCallbacks(t) {
      h = t;
    },
    init: E,
    refresh: E,
    async addLine(t, o = 1) {
      const m = N(o);
      if (m) return { status: "error", errorMessage: m };
      s({ addingSku: t });
      const y = await n.addLine(r, { sku: t, quantity: o });
      if (s({ addingSku: null }), y.status === "error" || !y.cart) {
        const C = y.errorMessage ?? "Could not add the item to your cart.";
        return s({ errorMessage: C }), { status: "error", errorMessage: C };
      }
      return f(y.cart), { status: "success" };
    },
    setLineQuantity(t, o) {
      const m = i.cart;
      if (!m || !m.lines.some((k) => k.id === t)) return;
      if (o <= 0) {
        L(t);
        return;
      }
      const y = Math.min(o, P);
      if (N(y)) return;
      const C = m.lines.map((k) => k.id === t ? { ...k, quantity: y } : k);
      s({ cart: U({ ...m, lines: C }) });
      const w = g.get(t);
      w && clearTimeout(w), g.set(
        t,
        setTimeout(() => {
          g.delete(t), O(t);
        }, c)
      );
    },
    async updateLineQuantity(t, o) {
      const m = i.cart;
      if (!m || !m.lines.some((w) => w.id === t))
        return { status: "error", errorMessage: "Line not found" };
      if (o <= 0) return L(t);
      const y = N(o);
      if (y) return { status: "error", errorMessage: y };
      const C = g.get(t);
      return C && (clearTimeout(C), g.delete(t)), x(t, o);
    },
    removeLine: L,
    setPromoInput(t) {
      s({ promoInput: t, promoError: null });
    },
    async applyPromo() {
      const t = i.promoInput.trim();
      if (!t) {
        const m = "Enter a promo code";
        return s({ promoError: m }), { status: "error", errorMessage: m };
      }
      s({ applyingPromo: !0, promoError: null });
      const o = await n.applyPromoCode(r, { code: t });
      if (s({ applyingPromo: !1 }), o.status === "error" || o.accepted === !1 || !o.cart) {
        const m = o.errorMessage ?? "This promo code could not be applied.";
        return s({ promoError: m }), { status: "error", errorMessage: m };
      }
      return s({ promoInput: "" }), f(o.cart), { status: "success" };
    },
    async removePromo() {
      s({ applyingPromo: !0, promoError: null });
      const t = await n.removePromoCode(r);
      if (s({ applyingPromo: !1 }), t.status === "error" || !t.cart) {
        const o = t.errorMessage ?? "Could not remove the promo code.";
        return s({ promoError: o }), { status: "error", errorMessage: o };
      }
      return f(t.cart), { status: "success" };
    },
    dispose() {
      for (const t of g.values()) clearTimeout(t);
      g.clear();
    }
  };
}
function B(e) {
  const n = $(null);
  n.current ?? (n.current = W(e));
  const r = n.current, { onCartChange: c } = e;
  return S(() => {
    r.setCallbacks({ onCartChange: c });
  }, [r, c]), S(() => (r.init(), () => {
    r.dispose();
  }), [r]), { state: A(r.subscribe, r.getState, r.getState), controller: r };
}
const Y = () => /* @__PURE__ */ a("svg", { viewBox: "0 0 16 16", width: "16", height: "16", "aria-hidden": "true", children: /* @__PURE__ */ a("path", { d: "M3 8h10", stroke: "currentColor", strokeWidth: "1.5" }) }), z = () => /* @__PURE__ */ a("svg", { viewBox: "0 0 16 16", width: "16", height: "16", "aria-hidden": "true", children: /* @__PURE__ */ a("path", { d: "M8 3v10M3 8h10", stroke: "currentColor", strokeWidth: "1.5" }) }), H = () => /* @__PURE__ */ a("svg", { viewBox: "0 0 16 16", width: "16", height: "16", "aria-hidden": "true", children: /* @__PURE__ */ a("path", { d: "M4 4l8 8M12 4l-8 8", stroke: "currentColor", strokeWidth: "1.5" }) }), V = () => /* @__PURE__ */ a("svg", { viewBox: "0 0 24 24", width: "36", height: "36", "aria-hidden": "true", children: /* @__PURE__ */ a(
  "path",
  {
    fill: "currentColor",
    d: "M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.49 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"
  }
) });
function ae(e) {
  const n = D(), { state: r, controller: c } = B({
    service: e.service,
    context: e.context,
    onCartChange: e.onCartChange,
    debounceMs: e.debounceMs
  }), h = e.title ?? "Shopping Cart", i = e.summaryTitle ?? "Order Summary", u = r.cart, g = u !== null && u.lines.length > 0, _ = g && u.lines.some((s) => s.imageUrl);
  return /* @__PURE__ */ p("div", { className: "ec-cart", children: [
    r.errorMessage ? /* @__PURE__ */ a("div", { role: "alert", className: "ec-cart__alert", children: /* @__PURE__ */ a("span", { children: r.errorMessage }) }) : null,
    r.loading ? /* @__PURE__ */ a("p", { className: "ec-cart__hint", children: "Loading…" }) : null,
    !r.loading && u && !g ? (
      /* AtomEmptyCart */
      /* @__PURE__ */ p("div", { className: "ec-cart__empty", children: [
        /* @__PURE__ */ a("span", { className: "ec-cart__empty-icon", children: /* @__PURE__ */ a(V, {}) }),
        /* @__PURE__ */ a("p", { children: "Your cart is empty." })
      ] })
    ) : null,
    !r.loading && u && g ? /* @__PURE__ */ p(R, { children: [
      /* @__PURE__ */ p("div", { className: "ec-cart__prodlist", children: [
        /* @__PURE__ */ a("div", { className: "ec-cart__prodlist-header", children: /* @__PURE__ */ a("h3", { children: h }) }),
        /* @__PURE__ */ p("table", { className: "ec-cart__table", children: [
          /* @__PURE__ */ a("thead", { children: /* @__PURE__ */ p("tr", { children: [
            _ ? /* @__PURE__ */ a("th", { className: "ec-cart__cell-img" }) : null,
            /* @__PURE__ */ a("th", { children: "LINE DESCRIPTION" }),
            /* @__PURE__ */ a("th", { children: "PRICE" }),
            /* @__PURE__ */ a("th", { className: "ec-cart__cell-center", children: "QTY" }),
            /* @__PURE__ */ a("th", { className: "ec-cart__cell-right", children: "TOTAL" }),
            /* @__PURE__ */ a("th", { className: "ec-cart__cell-actions" })
          ] }) }),
          /* @__PURE__ */ a("tbody", { children: u.lines.map((s) => /* @__PURE__ */ a(
            j,
            {
              line: s,
              currency: u.currency,
              pending: r.pendingLineIds.includes(s.id),
              showImage: _,
              onQuantity: (l) => c.setLineQuantity(s.id, l),
              onRemove: () => void c.removeLine(s.id)
            },
            s.id
          )) })
        ] }),
        /* @__PURE__ */ a("div", { className: "ec-cart__list-summary", children: /* @__PURE__ */ p("div", { className: "ec-cart__list-summary-row", children: [
          /* @__PURE__ */ a("span", { children: "Subtotal : " }),
          /* @__PURE__ */ a("span", { children: M(u.totals.subtotal, u.currency) })
        ] }) })
      ] }),
      /* @__PURE__ */ p("div", { className: "ec-cart__lower", children: [
        /* @__PURE__ */ a(K, { state: r, controller: c, cart: u, idBase: n }),
        /* @__PURE__ */ p("div", { className: "ec-cart__quote-summary", children: [
          /* @__PURE__ */ a("div", { className: "ec-cart__quote-summary-header", children: /* @__PURE__ */ a("h3", { children: i }) }),
          /* @__PURE__ */ p("dl", { className: "ec-cart__summary", "data-testid": "ec-cart-totals", children: [
            /* @__PURE__ */ p("div", { className: "ec-cart__summary-item", children: [
              /* @__PURE__ */ a("dt", { children: "Subtotal" }),
              /* @__PURE__ */ a("dd", { children: M(u.totals.subtotal, u.currency) })
            ] }),
            u.totals.discount > 0 ? /* @__PURE__ */ p("div", { className: "ec-cart__summary-item", children: [
              /* @__PURE__ */ a("dt", { children: "Discount" }),
              /* @__PURE__ */ p("dd", { children: [
                "−",
                M(u.totals.discount, u.currency)
              ] })
            ] }) : null,
            /* @__PURE__ */ p("div", { className: "ec-cart__summary-item", children: [
              /* @__PURE__ */ a("dt", { children: "Tax" }),
              /* @__PURE__ */ a("dd", { children: M(u.totals.tax, u.currency) })
            ] }),
            /* @__PURE__ */ p("div", { className: "ec-cart__summary-total", children: [
              /* @__PURE__ */ a("dt", { children: "Total" }),
              /* @__PURE__ */ a("dd", { children: M(u.totals.total, u.currency) })
            ] })
          ] })
        ] })
      ] })
    ] }) : null
  ] });
}
function j({ line: e, currency: n, pending: r, showImage: c, onQuantity: h, onRemove: i }) {
  return /* @__PURE__ */ p("tr", { "data-testid": "ec-cart-line", "data-pending": r || void 0, children: [
    c ? /* @__PURE__ */ a("td", { className: "ec-cart__cell-img", children: e.imageUrl ? /* @__PURE__ */ a("img", { src: e.imageUrl, alt: "" }) : null }) : null,
    /* @__PURE__ */ p("td", { children: [
      /* @__PURE__ */ a("p", { className: "ec-cart__line-name", children: e.name }),
      e.variant ? /* @__PURE__ */ a("p", { className: "ec-cart__line-variant", children: e.variant }) : null
    ] }),
    /* @__PURE__ */ a("td", { children: M(e.unitPrice, n) }),
    /* @__PURE__ */ a("td", { className: "ec-cart__cell-center", children: /* @__PURE__ */ a(G, { line: e, pending: r, onChange: h }) }),
    /* @__PURE__ */ a("td", { className: "ec-cart__cell-right", children: M(I(e), n) }),
    /* @__PURE__ */ a("td", { className: "ec-cart__cell-actions", children: /* @__PURE__ */ a(
      "button",
      {
        type: "button",
        className: "ec-cart__remove",
        "aria-label": `Remove ${e.name}`,
        disabled: r,
        onClick: i,
        children: "REMOVE"
      }
    ) })
  ] });
}
function G({ line: e, pending: n, onChange: r }) {
  return /* @__PURE__ */ p("div", { className: "ec-cart__counter", children: [
    /* @__PURE__ */ a(
      "button",
      {
        type: "button",
        "aria-label": `Decrease quantity of ${e.name}`,
        disabled: n,
        onClick: () => r(e.quantity - 1),
        children: e.quantity > 1 ? /* @__PURE__ */ a(Y, {}) : /* @__PURE__ */ a(H, {})
      }
    ),
    n ? /* @__PURE__ */ a("span", { className: "ec-cart__counter-spinner", children: /* @__PURE__ */ a("span", { className: "ec-cart__spinner", "aria-hidden": "true" }) }) : /* @__PURE__ */ a(
      "input",
      {
        type: "number",
        min: 0,
        max: P,
        step: 1,
        value: e.quantity,
        "aria-label": `Quantity of ${e.name}`,
        onKeyDown: (c) => {
          (c.key === "." || c.key === "e" || c.key === "E") && c.preventDefault();
        },
        onChange: (c) => {
          c.target.value !== "" && r(Number(c.target.value));
        }
      }
    ),
    /* @__PURE__ */ a(
      "button",
      {
        type: "button",
        "aria-label": `Increase quantity of ${e.name}`,
        disabled: n || e.quantity >= P,
        onClick: () => r(e.quantity + 1),
        children: /* @__PURE__ */ a(z, {})
      }
    )
  ] });
}
function K({ state: e, controller: n, cart: r, idBase: c }) {
  const h = r.promoCode;
  return /* @__PURE__ */ p("div", { className: "ec-cart__promocode", children: [
    /* @__PURE__ */ a("label", { className: "ec-cart__promocode-label", htmlFor: `${c}-promo`, children: "Promo Code" }),
    /* @__PURE__ */ p("div", { className: "ec-cart__promocode-input", children: [
      /* @__PURE__ */ p("div", { className: "ec-cart__promocode-box", children: [
        /* @__PURE__ */ a(
          "input",
          {
            id: `${c}-promo`,
            className: "ec-cart__input",
            type: "text",
            autoComplete: "off",
            value: h ?? e.promoInput,
            disabled: h !== null,
            "aria-invalid": e.promoError ? !0 : void 0,
            onChange: (i) => n.setPromoInput(i.target.value),
            onKeyDown: (i) => {
              i.key === "Enter" && !h && n.applyPromo();
            }
          }
        ),
        e.promoError ? /* @__PURE__ */ a("p", { className: "ec-cart__promocode-error", children: e.promoError }) : null
      ] }),
      e.applyingPromo ? /* @__PURE__ */ a("span", { className: "ec-cart__spinner", "aria-hidden": "true" }) : h ? /* @__PURE__ */ a(
        "button",
        {
          type: "button",
          className: "ec-cart__btn ec-cart__btn--secondary",
          onClick: () => void n.removePromo(),
          children: "REMOVE"
        }
      ) : /* @__PURE__ */ a(
        "button",
        {
          type: "button",
          className: "ec-cart__btn ec-cart__btn--primary",
          disabled: e.promoInput.trim().length < 1,
          onClick: () => void n.applyPromo(),
          children: "APPLY"
        }
      ),
      h && r.totals.discount > 0 ? /* @__PURE__ */ p("span", { className: "ec-cart__promocode-success", "data-testid": "ec-cart-promo", children: [
        "Promo ",
        h,
        " applied (−",
        M(r.totals.discount, r.currency),
        ")"
      ] }) : null
    ] })
  ] });
}
const b = {
  getCart: "platform/cart:get",
  addLine: "platform/cart:addLine",
  updateLineQuantity: "platform/cart:updateLineQuantity",
  removeLine: "platform/cart:removeLine",
  applyPromoCode: "platform/cart:applyPromo",
  removePromoCode: "platform/cart:removePromo"
}, X = (e) => e instanceof Error ? e.message : "Cart service request failed";
function se(e) {
  const n = async (r, c) => {
    try {
      return await e(r, c);
    } catch (h) {
      return { status: "error", errorMessage: X(h) };
    }
  };
  return {
    getCart: (r) => n(b.getCart, { context: r }),
    addLine: (r, c) => n(b.addLine, { context: r, ...c }),
    updateLineQuantity: (r, c) => n(b.updateLineQuantity, { context: r, ...c }),
    removeLine: (r, c) => n(b.removeLine, { context: r, ...c }),
    applyPromoCode: (r, c) => n(b.applyPromoCode, { context: r, ...c }),
    removePromoCode: (r) => n(b.removePromoCode, { context: r })
  };
}
const J = [
  { sku: "sku-filter", name: "Whole-home water filter", unitPrice: 89900 },
  { sku: "sku-softener", name: "Water softener system", variant: "40,000 grain", unitPrice: 129900 },
  { sku: "sku-uv", name: "UV purifier add-on", unitPrice: 34900 },
  { sku: "sku-cartridge", name: "Replacement cartridge (2-pack)", unitPrice: 4900 }
], Z = [
  { code: "SAVE10", percentOff: 10 },
  { code: "WELCOME5", percentOff: 5 }
];
function ne(e = {}) {
  const n = e.catalog ?? J, r = e.promos ?? Z, c = e.taxRate ?? 0.08, h = () => new Promise((s) => setTimeout(s, e.latencyMs ?? 0));
  let i = [], u = null;
  const g = (s, l) => {
    const d = n.find((v) => v.sku === s);
    if (!d) return `mock: unknown sku ${s}`;
    const f = i.find((v) => v.sku === s);
    return f ? f.quantity += l : i.push({
      id: `line-${s}`,
      sku: d.sku,
      name: d.name,
      ...d.variant ? { variant: d.variant } : {},
      quantity: l,
      unitPrice: d.unitPrice
    }), null;
  };
  for (const s of e.initialLines ?? []) g(s.sku, s.quantity);
  const _ = () => {
    const s = Q(i), l = r.find((v) => v.code === u), d = l ? Math.round(s * l.percentOff / 100) : 0, f = Math.round((s - d) * c);
    return {
      id: "cart-mock",
      currency: "USD",
      lines: i.map((v) => ({ ...v })),
      promoCode: u,
      totals: { subtotal: s, discount: d, tax: f, total: s - d + f }
    };
  };
  return {
    async getCart(s) {
      return await h(), e.failGetCart ? { status: "error", errorMessage: "mock: cart unavailable" } : { status: "success", cart: _() };
    },
    async addLine(s, l) {
      if (await h(), e.failMutations) return { status: "error", errorMessage: "mock: cart mutation unavailable" };
      const d = N(l.quantity);
      if (d) return { status: "error", errorMessage: `mock: ${d}` };
      const f = g(l.sku, l.quantity);
      return f ? { status: "error", errorMessage: f } : { status: "success", cart: _() };
    },
    async updateLineQuantity(s, l) {
      if (await h(), e.failMutations) return { status: "error", errorMessage: "mock: cart mutation unavailable" };
      const d = i.find((v) => v.id === l.lineId);
      if (!d) return { status: "error", errorMessage: `mock: unknown line ${l.lineId}` };
      const f = N(l.quantity);
      return f ? { status: "error", errorMessage: `mock: ${f}` } : (d.quantity = l.quantity, { status: "success", cart: _() });
    },
    async removeLine(s, l) {
      return await h(), e.failMutations ? { status: "error", errorMessage: "mock: cart mutation unavailable" } : i.some((d) => d.id === l.lineId) ? (i = i.filter((d) => d.id !== l.lineId), { status: "success", cart: _() }) : { status: "error", errorMessage: `mock: unknown line ${l.lineId}` };
    },
    async applyPromoCode(s, l) {
      if (await h(), e.failPromo) return { status: "error", errorMessage: "mock: promo service unavailable" };
      const d = r.find((f) => f.code.toLowerCase() === l.code.trim().toLowerCase());
      return d ? (u = d.code, { status: "success", accepted: !0, cart: _() }) : { status: "success", accepted: !1, errorMessage: `"${l.code}" is not a valid promo code` };
    },
    async removePromoCode(s) {
      return await h(), e.failPromo ? { status: "error", errorMessage: "mock: promo service unavailable" } : (u = null, { status: "success", cart: _() });
    }
  };
}
function oe(e = {}) {
  return {
    runtime: "mock",
    identity: { organizationId: "org-mock", accountId: "acct-mock", ...e.identity },
    session: { origin: "REACT_STOREFRONT", quoteId: "quote-mock", ...e.session },
    ...e.security ? { security: e.security } : {},
    ...e.runtime ? { runtime: e.runtime } : {}
  };
}
export {
  b as CART_EXECUTOR_METHODS,
  ae as CartPanel,
  P as QUANTITY_MAX,
  q as QUANTITY_MIN,
  re as cartItemCount,
  Q as computeSubtotal,
  W as createCartController,
  se as createExecutorCartService,
  ne as createMockCartService,
  oe as createMockRuntimeContext,
  M as formatMoney,
  I as lineTotal,
  N as quantityIssue,
  B as useCartController,
  U as withOptimisticTotals
};
//# sourceMappingURL=index.js.map
