// Host-supplied identity for every composable panel.
// accountId = the "Ari Standard" account the demo user is signed in as.
export const IDENTITY = {
  organizationId: 'ec-ord1-dev-ed',
  accountId: import.meta.env.VITE_SF_ACCOUNT_ID || '001al00002KJ0TXAA1',
  contactId: import.meta.env.VITE_SF_CONTACT_ID || '003al00000o247uAAA',
}

// Storefront user type the panels pass on Salesforce cart/checkout calls.
export const USER_TYPE = 'AWSPortalUser'
