import { useCallback, useEffect, useState } from 'react'
import { sf } from '../lib/salesforce'

// Declarative SOQL for components:
//
//   const { records, loading, error, refetch } = useSfQuery(
//     'SELECT Id, Name FROM Product2 ORDER BY Name LIMIT 20'
//   )
//
// Pass null/undefined as soql to skip fetching (e.g. while inputs are empty).
export function useSfQuery(soql, { all = false } = {}) {
  const [state, setState] = useState({ data: null, loading: Boolean(soql), error: null })

  const run = useCallback(async () => {
    if (!soql) return
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const data = await sf.query(soql, { all })
      setState({ data, loading: false, error: null })
    } catch (err) {
      setState({ data: null, loading: false, error: err.message })
    }
  }, [soql, all])

  useEffect(() => {
    run()
  }, [run])

  return {
    data: state.data,
    records: state.data?.records ?? [],
    loading: state.loading,
    error: state.error,
    refetch: run,
  }
}
