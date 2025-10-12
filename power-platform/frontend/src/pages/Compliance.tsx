import { useState, useEffect } from 'react'
import { runs, compliance } from '../lib/api'

export default function Compliance() {
  const [availableRuns, setAvailableRuns] = useState<any[]>([])
  const [selectedRun, setSelectedRun] = useState('')
  const [selectedRulesets, setSelectedRulesets] = useState<string[]>(['ieee_1547'])
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const rulesets = [
    { id: 'ieee_1547', name: 'IEEE 1547-2018', description: 'Interconnection Standard' },
    { id: 'ul_1741', name: 'UL 1741 SA', description: 'Inverter Safety' },
    { id: 'iec_61000', name: 'IEC 61000', description: 'EMC Limits' },
  ]

  useEffect(() => {
    loadRuns()
  }, [])

  const loadRuns = async () => {
    try {
      const { data } = await runs.list()
      setAvailableRuns(data.filter((r: any) => r.status === 'completed'))
    } catch (error) {
      console.error('Failed to load runs:', error)
    }
  }

  const handleCheck = async () => {
    if (!selectedRun) {
      alert('Please select a run')
      return
    }

    setLoading(true)
    try {
      const { data } = await compliance.check(parseInt(selectedRun), selectedRulesets)
      setResults(data.compliance_results)
    } catch (error) {
      console.error('Compliance check failed:', error)
      alert('Compliance check failed')
    } finally {
      setLoading(false)
    }
  }

  const toggleRuleset = (id: string) => {
    if (selectedRulesets.includes(id)) {
      setSelectedRulesets(selectedRulesets.filter((r) => r !== id))
    } else {
      setSelectedRulesets([...selectedRulesets, id])
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Compliance Check</h1>
        <p className="mt-2 text-gray-600">
          Validate simulation results against industry standards
        </p>
      </div>

      {/* Configuration */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuration</h2>

        <div className="space-y-4">
          <div>
            <label className="label">Select Simulation Run</label>
            <select
              value={selectedRun}
              onChange={(e) => setSelectedRun(e.target.value)}
              className="input"
            >
              <option value="">Choose a run...</option>
              {availableRuns.map((run) => (
                <option key={run.id} value={run.id}>
                  {run.topology} - Run #{run.id} (
                  {new Date(run.created_at).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Standards to Check</label>
            <div className="space-y-2">
              {rulesets.map((ruleset) => (
                <label key={ruleset.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedRulesets.includes(ruleset.id)}
                    onChange={() => toggleRuleset(ruleset.id)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-3">
                    <span className="font-medium text-gray-900">{ruleset.name}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      {ruleset.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleCheck}
            disabled={loading || !selectedRun || selectedRulesets.length === 0}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Run Compliance Check'}
          </button>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {Object.entries(results).map(([rulesetId, rulesetResults]: [string, any]) => (
            <div key={rulesetId} className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {rulesets.find((r) => r.id === rulesetId)?.name}
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    rulesetResults.overall_passed
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {rulesetResults.overall_passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>

              <div className="mb-4 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Pass Rate</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {rulesetResults.pass_rate.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Passed Rules</p>
                  <p className="text-2xl font-bold text-green-600">
                    {rulesetResults.summary.passed}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Failed Rules</p>
                  <p className="text-2xl font-bold text-red-600">
                    {rulesetResults.summary.failed}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Rule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Measured
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Limit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Margin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Result
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rulesetResults.rule_results.map((rule: any, index: number) => (
                      <tr key={index} className={rule.passed ? '' : 'bg-red-50'}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {rule.rule_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {rule.measured.toFixed(3)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {typeof rule.limit === 'number'
                            ? rule.limit.toFixed(3)
                            : rule.limit}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {rule.margin.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded ${
                              rule.passed
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {rule.passed ? 'PASS' : 'FAIL'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
