import React, { useEffect, useState } from 'react';
import { Users, Search, Shield, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { adminApi } from '../services/admin';
import { User, UserRole } from '../types/auth';

interface AdminUsersPageProps {
  currentUser: User | null;
}

export const AdminUsersPage: React.FC<AdminUsersPageProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getUsers({
        search: search || undefined,
        role: roleFilter || undefined,
      });
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const handleToggleStatus = async (userToUpdate: User) => {
    setError(null);
    setSuccess(null);
    if (userToUpdate.id === currentUser?.id && userToUpdate.is_active) {
      setError('You cannot deactivate your own account.');
      return;
    }

    try {
      const newStatus = !userToUpdate.is_active;
      await adminApi.updateUserStatus(userToUpdate.id, newStatus);
      setSuccess(`Updated status for ${userToUpdate.name} to ${newStatus ? 'Active' : 'Inactive'}`);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update user status');
    }
  };

  const handleRoleChange = async (userToUpdate: User, newRole: UserRole) => {
    setError(null);
    setSuccess(null);
    if (userToUpdate.id === currentUser?.id && newRole !== 'ADMIN') {
      setError('You cannot revoke your own administrative role.');
      return;
    }

    try {
      await adminApi.updateUserRole(userToUpdate.id, newRole);
      setSuccess(`Updated role for ${userToUpdate.name} to ${newRole}`);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update user role');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/50 text-blue-300 text-xs font-semibold mb-2">
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          <span>User Access Control</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Users & Roles</h1>
        <p className="text-xs text-slate-400">Manage user authorization, activation status, and role privileges</p>
      </div>

      {error && (
        <div className="bg-rose-950/60 border border-rose-800 text-rose-300 p-3 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 p-3 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user name or email..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 w-full md:w-auto"
        >
          <option value="">All Roles</option>
          <option value="USER">USER / INSPECTOR</option>
          <option value="INSPECTOR">INSPECTOR</option>
          <option value="ADMIN">ADMINISTRATOR</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-800/40">
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                        <span>{u.name}</span>
                        {isSelf && (
                          <span className="text-[10px] bg-blue-900/60 text-blue-300 font-mono px-2 py-0.5 rounded border border-blue-700/50">
                            YOU
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 text-xs font-mono">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <select
                          value={u.role}
                          disabled={isSelf}
                          onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
                          className="bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 font-mono px-2 py-1 focus:outline-none disabled:opacity-60"
                        >
                          <option value="USER">USER</option>
                          <option value="INSPECTOR">INSPECTOR</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold border ${
                            u.is_active
                              ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50'
                              : 'bg-rose-900/60 text-rose-300 border-rose-700/50'
                          }`}
                        >
                          {u.is_active ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>ACTIVE</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-400" />
                              <span>INACTIVE</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-xs font-mono">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={isSelf && u.is_active}
                          className={`px-3 py-1 rounded text-xs font-semibold border transition-colors ${
                            u.is_active
                              ? 'bg-rose-950/60 text-rose-300 border-rose-800 hover:bg-rose-900 disabled:opacity-40'
                              : 'bg-emerald-950/60 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                          }`}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs">No users match your criteria.</div>
        )}
      </div>
    </div>
  );
};
