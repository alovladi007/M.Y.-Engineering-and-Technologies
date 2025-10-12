import React, { useState, useEffect } from 'react';
import { compliance } from '../../lib/api';

interface Ruleset {
  name: string;
  description: string;
  rule_count?: number;
}

interface ComplianceSelectProps {
  value: string[];
  onChange: (rulesets: string[]) => void;
  disabled?: boolean;
}

export const ComplianceSelect: React.FC<ComplianceSelectProps> = ({ value, onChange, disabled }) => {
  const [rulesets, setRulesets] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRulesets();
  }, []);

  const loadRulesets = async () => {
    try {
      const { data } = await compliance.listRulesets();
      setRulesets(data.rulesets || []);
    } catch (error) {
      console.error('Failed to load rulesets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (ruleset: string) => {
    if (value.includes(ruleset)) {
      onChange(value.filter((r) => r !== ruleset));
    } else {
      onChange([...value, ruleset]);
    }
  };

  if (loading) {
    return <div className="text-gray-400">Loading rulesets...</div>;
  }

  const rulesetInfo: Record<string, { description: string; icon: string }> = {
    ieee_1547: {
      description: 'IEEE 1547-2018 - Interconnection and Interoperability of Distributed Energy Resources',
      icon: '⚡',
    },
    ul_1741: {
      description: 'UL 1741 SA - Inverters, Converters, Controllers and Interconnection System Equipment',
      icon: '🛡️',
    },
    iec_61000: {
      description: 'IEC 61000 - Electromagnetic Compatibility (EMC)',
      icon: '📊',
    },
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Select Compliance Rulesets
      </label>

      <div className="space-y-3">
        {rulesets.map((ruleset) => {
          const info = rulesetInfo[ruleset] || { description: ruleset, icon: '📋' };
          const isSelected = value.includes(ruleset);

          return (
            <div
              key={ruleset}
              onClick={() => !disabled && handleToggle(ruleset)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-900/20'
                  : 'border-gray-600 bg-gray-700 hover:border-gray-500'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-start">
                <div className="text-2xl mr-3">{info.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-medium">{ruleset.toUpperCase().replace('_', ' ')}</h4>
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-500'
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{info.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {value.length > 0 && (
        <div className="bg-green-900/20 border border-green-500 rounded-lg p-3">
          <p className="text-green-400 text-sm">
            {value.length} ruleset{value.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </div>
  );
};
