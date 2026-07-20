// HMH Catalog config-as-code — the single knob surface for the HMH Catalog
// page (ProductsHmhCatalog.jsx), split by what each section actually controls:
//
//   data — drives the composable's BACKGROUND CALLS. pageSize/loadCategories
//     are controller options; query/sort/categoryId are pushed through
//     controller.setQuery/setSort/setCategory after mount, so changing them
//     changes what the Salesforce search returns (order, filter, page size).
//     Sort must be one of the package's CatalogSort values:
//     'relevance' | 'price-asc' | 'price-desc' | 'name'.
//
//   card — display-only. Picks which CatalogProduct DTO fields the card shows
//     and the merchandising overlay (tier decorations, tags, monthly split).
//     Note: the Salesforce service returns a fixed DTO (sku, name,
//     description, price, currency, imageUrl, inStock) — field selection here
//     changes what renders, not the wire payload.

const FEATURES = {
  pitcher: { icon: 'ac_unit', label: 'Pitcher Fits Most Fridge Doors' },
  drinking: { icon: 'water_drop', label: 'Filtered Drinking Water' },
  bathing: { icon: 'shower', label: 'Cleaner Water For Bathing' },
}

// Presentation-only tier decoration, cycled across the products returned.
const TIERS = [
  {
    id: 'silver',
    tier: 'Silver',
    features: [FEATURES.pitcher, FEATURES.drinking],
    includes: ['1 Countertop', '1 Pitcher'],
  },
  {
    id: 'platinum',
    tier: 'Platinum',
    features: [FEATURES.pitcher, FEATURES.drinking, FEATURES.bathing],
    includes: ['1 Countertop', '1 Pitcher', '2 Shower Filters'],
  },
  {
    id: 'gold',
    tier: 'Gold',
    features: [FEATURES.pitcher, FEATURES.drinking, FEATURES.bathing],
    includes: ['1 Countertop', '1 Pitcher', '1 Shower Filter'],
  },
]

export const HMH_CATALOG_CONFIG = {
  data: {
    query: '', // initial search text (server-side filter)
    sort: 'price-asc', // server-side ordering of the catalog call
    categoryId: null, // server-side facet filter
    pageSize: 12,
    loadCategories: false, // skip the category-facet round-trip
  },
  card: {
    titleField: 'name', // CatalogProduct field for the card title
    subtitleField: 'sku', // secondary field under the title (null = hide)
    tags: ['Chlorine', 'VOCs', 'Lead', 'PFAS'],
    showMonthly: true,
    monthlyTermMonths: 12, // monthly = price / term
    popularIndex: 1, // which card gets the POPULAR ribbon (-1 = none)
    tiers: TIERS,
  },
}
