// RuntimeContext the app passes to every composable — host supplies identity.
// accountId = the "Ari Standard" account the demo user is signed in as.
export const APP_CONTEXT = {
  runtime: 'custom',
  identity: {
    organizationId: 'ec-ord1-dev-ed',
    accountId: '0012G00002EKp9kQAD',
  },
  session: { origin: 'REACT_STOREFRONT' },
}
