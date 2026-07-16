# Salesforce Gateway API

Base URL (production): `https://<your-app>.vercel.app/api/salesforce`
Base URL (local dev):  `http://localhost:5173/api/salesforce`

You do **not** need Salesforce credentials, tokens, or an org URL. This gateway
authenticates to Salesforce server-side; you only call the endpoints below.

All requests/responses are JSON. Errors always have the shape:

```json
{ "error": "human-readable message" }
```

with status `400` (bad request), `405` (wrong method), or `502` (Salesforce rejected the call).

---

## Health check

```
GET /connection
```

```json
{
  "connected": true,
  "instanceUrl": "https://ec-ord1-dev-ed.my.salesforce.com",
  "orgId": "00DA0000000cDUJMA2",
  "orgName": "Expedite Commerce",
  "orgType": "Developer Edition",
  "isSandbox": false
}
```

## Run a SOQL query

```
POST /query
Content-Type: application/json

{ "soql": "SELECT Id, Name FROM Account ORDER BY Name LIMIT 20" }
```

Response is the raw Salesforce query result:

```json
{ "totalSize": 2, "done": true, "records": [ { "Id": "001...", "Name": "Acme" } ] }
```

Add `"all": true` to auto-paginate past the ~2000-record page limit
(`records` then contains every row and `done` is always `true`).

## sObject CRUD

One endpoint, keyed on HTTP method. `type` is the sObject API name
(`Account`, `Product2`, `My_Custom_Object__c`, ...).

| Action   | Call |
|----------|------|
| Create   | `POST /sobject?type=Account` — body: `{ "Name": "Acme" }` |
| Retrieve | `GET /sobject?type=Account&id=001...&fields=Name,Industry` (`fields` optional) |
| Update   | `PATCH /sobject?type=Account&id=001...` — body: fields to change |
| Delete   | `DELETE /sobject?type=Account&id=001...` |
| Describe | `GET /sobject?type=Account&describe=1` — field metadata |

Create returns `201` with `{ "id": "001...", "success": true, "errors": [] }`.
Update/Delete return `{ "id": "001...", "success": true }`.

## Custom Apex REST

Call a class exposed with `@RestResource` (served by Salesforce under
`/services/apexrest`). The HTTP method you use is forwarded to Apex as-is; the
`path` query param is everything after `/services/apexrest` and must start
with `/`.

```
GET    /apex?path=/OrderService/001...
POST   /apex?path=/OrderService/        body: { ... }
PATCH  /apex?path=/OrderService/001     body: { ... }
DELETE /apex?path=/OrderService/001...
```

The response is whatever the Apex endpoint returns, passed through verbatim.

## Example (fetch)

```js
const BASE = 'https://<your-app>.vercel.app/api/salesforce'

// query
const { records } = await fetch(`${BASE}/query`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ soql: 'SELECT Id, Name FROM Product2 LIMIT 10' }),
}).then((r) => r.json())

// create
const { id } = await fetch(`${BASE}/sobject?type=Account`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ Name: 'Acme' }),
}).then((r) => r.json())
```

## Example (curl)

```bash
curl -X POST "$BASE/query" \
  -H 'Content-Type: application/json' \
  -d '{"soql":"SELECT Id, Name FROM Account LIMIT 5"}'

curl -X PATCH "$BASE/sobject?type=Account&id=001g800000UrKAbAAN" \
  -H 'Content-Type: application/json' \
  -d '{"Industry":"Retail"}'
```
