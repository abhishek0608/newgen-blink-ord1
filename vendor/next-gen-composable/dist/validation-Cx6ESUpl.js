const o = /^\d{5}(-\d{4})?$/, a = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, c = /* @__PURE__ */ new Set(["us", "usa", "united states", "united states of america"]), s = /* @__PURE__ */ new Set(["ca", "can", "canada"]), u = () => ({
  street: "",
  city: "",
  state: "",
  zip: "",
  country: ""
});
function n(t) {
  const e = t.trim().toLowerCase();
  return c.has(e) ? "US" : s.has(e) ? "CA" : t.trim();
}
function m(t, e) {
  const i = {}, r = n(t.country);
  return t.street.trim() || (i.street = "Street is required"), t.city.trim() || (i.city = "City is required"), t.country.trim() || (i.country = "Country is required"), r === "US" ? (t.state.trim() || (i.state = "State is required"), o.test(t.zip.trim()) || (i.zip = "Enter a valid US ZIP code (12345 or 12345-6789)")) : r === "CA" ? (t.state.trim() || (i.state = "Province is required"), a.test(t.zip.trim()) || (i.zip = "Enter a valid Canadian postal code (A1A 1A1)")) : (t.zip.trim() || (i.zip = "ZIP / postal code is required"), e === "install" && !t.state.trim() && (i.state = "State / province is required")), i;
}
function f(t) {
  const e = n(t.country), i = t.state.trim();
  return {
    street: t.street.trim(),
    city: t.city.trim(),
    state: i.length <= 3 ? i.toUpperCase() : i,
    zip: e === "CA" ? t.zip.trim().toUpperCase() : t.zip.trim(),
    country: e
  };
}
function p(t) {
  const e = [t.state, t.zip].filter((i) => i.trim() !== "").join(" ");
  return [t.street, t.city, e, t.country].map((i) => i.trim()).filter((i) => i !== "").join(", ");
}
export {
  n as a,
  u as e,
  p as f,
  f as n,
  m as v
};
//# sourceMappingURL=validation-Cx6ESUpl.js.map
