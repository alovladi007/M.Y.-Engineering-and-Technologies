import React, { useState, useEffect } from 'react';
import { users as usersApi, orgs as orgsApi } from '../lib/api';
import { useStore } from '../lib/store';

interface User {
  id: number;
  email: string;
  name: string;
  provider: string;
  role: string;
}

interface Org {
  id: number;
  name: string;
  description?: string;
}

interface Member {
  user_id: number;
  org_id: number;
  role: string;
  user_email: string;
  user_name: string;
}

export const Admin: React.FC = () => {
  const { orgId } = useStore();

  const [users, setUsers] = useState<User[]>([]);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'orgs' | 'members'>('users');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab, orgId]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const { data } = await usersApi.list();
        setUsers(data);
      } else if (activeTab === 'orgs') {
        const { data } = await orgsApi.list();
        setOrgs(data);
      } else if (activeTab === 'members' && orgId) {
        const { data } = await orgsApi.listMembers(parseInt(orgId));
        setMembers(data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Administration
        </h1>
        <p className="text-gray-400">
          Manage users, organizations, and permissions
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white hover:bg-gray-750'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('orgs')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'orgs'
                ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white hover:bg-gray-750'
            }`}
          >
            Organizations
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'members'
                ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white hover:bg-gray-750'
            }`}
          >
            Organization Members
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading...</div>
          ) : (
            <>
              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                          Provider
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                          Role
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-750">
                          <td className="px-6 py-4 text-sm text-white">{user.id}</td>
                          <td className="px-6 py-4 text-sm text-white">{user.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-300">{user.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-300">{user.provider}</td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                user.role === 'admin'
                                  ? 'bg-red-900 text-red-200'
                                  : user.role === 'engineer'
                                  ? 'bg-blue-900 text-blue-200'
                                  : 'bg-gray-600 text-gray-200'
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {users.length === 0 && (
                    <div className="text-center text-gray-400 py-8">No users found</div>
                  )}
                </div>
              )}

              {/* Organizations Tab */}
              {activeTab === 'orgs' && (
                <div className="grid gap-4">
                  {orgs.map((org) => (
                    <div key={org.id} className="bg-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {org.name}
                      </h3>
                      {org.description && (
                        <p className="text-sm text-gray-400">{org.description}</p>
                      )}
                      <div className="mt-4 text-xs text-gray-500">
                        Organization ID: {org.id}
                      </div>
                    </div>
                  ))}

                  {orgs.length === 0 && (
                    <div className="text-center text-gray-400 py-8">No organizations found</div>
                  )}
                </div>
              )}

              {/* Members Tab */}
              {activeTab === 'members' && (
                <div>
                  {!orgId ? (
                    <div className="text-center text-gray-400 py-8">
                      Please select an organization to view members
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-900">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                              Role
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {members.map((member) => (
                            <tr key={member.user_id} className="hover:bg-gray-750">
                              <td className="px-6 py-4 text-sm text-white">
                                {member.user_name}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-300">
                                {member.user_email}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    member.role === 'admin'
                                      ? 'bg-red-900 text-red-200'
                                      : member.role === 'engineer'
                                      ? 'bg-blue-900 text-blue-200'
                                      : 'bg-gray-600 text-gray-200'
                                  }`}
                                >
                                  {member.role}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {members.length === 0 && (
                        <div className="text-center text-gray-400 py-8">
                          No members in this organization
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
