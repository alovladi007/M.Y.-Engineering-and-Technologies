import React, { useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import { orgs } from '../lib/api';

interface Org {
  id: number;
  name: string;
  description?: string;
}

export const OrgSwitcher: React.FC = () => {
  const [organizations, setOrganizations] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const { orgId, setOrgId } = useStore();

  useEffect(() => {
    loadOrgs();
  }, []);

  const loadOrgs = async () => {
    try {
      const { data } = await orgs.list();
      setOrganizations(data);

      // If no org selected but we have orgs, select the first one
      if (!orgId && data.length > 0) {
        setOrgId(data[0].id.toString());
      }
    } catch (error) {
      console.error('Failed to load organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrgChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOrgId(e.target.value);
  };

  if (loading) {
    return (
      <div className="text-sm text-gray-400">
        Loading orgs...
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="text-sm text-gray-400">
        No organizations
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        value={orgId || ''}
        onChange={handleOrgChange}
        className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="" disabled>Select Organization</option>
        {organizations.map((org) => (
          <option key={org.id} value={org.id}>
            {org.name}
          </option>
        ))}
      </select>
    </div>
  );
};
