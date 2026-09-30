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
      <div className="border-b border-sand-300/60 pb-5">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sand-200 border border-sand-300 text-slate-800 text-xs font-semibold mb-2">
          <Shield className="w-3.5 h-3.5 text-forest-700" />
          <span>User Access Control</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">System Users & Roles</h1>
        <p className="text-sm text-slate-600 mt-1">Manage user authorization, activation status, and role privileges across the organization.</p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-900 p-3.5 rounded-lg text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-sage-100 border border-sage-300 text-forest-900 p-3.5 rounded-lg text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-forest-700" />
          <span>{success}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white border border-sand-300/80 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user name or email..."
            className="w-full pl-10 pr-4 py-2 bg-sand-50/60 border border-sand-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-forest-700"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3.5 py-2 bg-sand-50/60 border border-sand-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-forest-700 w-full md:w-auto font-sans"
        >
          <option value="">All Roles</option>
          <option value="USER">USER / INSPECTOR</option>
          <option value="INSPECTOR">INSPECTOR</option>
          <option value="ADMIN">ADMINISTRATOR</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-sand-300/80 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-700"></div>
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-sand-200 text-[11px] font-semibold uppercase tracking-wider text-slate-600 bg-sand-100/60">
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200 text-sm">
                {users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="hover:bg-sand-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2 font-sans">
                        <span>{u.name}</span>
                        {isSelf && (
                          <span className="text-[10px] bg-forest-800 text-white font-mono px-2 py-0.5 rounded">
                            YOU
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs font-mono">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <select
                          value={u.role}
                          disabled={isSelf}
                          onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
                          className="bg-sand-50 border border-sand-300 rounded text-xs text-slate-800 font-mono px-2 py-1 focus:outline-none disabled:opacity-60"
                        >
                          <option value="USER">USER</option>
                          <option value="INSPECTOR">INSPECTOR</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold border ${
                            u.is_active
                              ? 'bg-sage-100 text-forest-800 border-sage-300'
                              : 'bg-rose-100 text-rose-900 border-rose-300'
                          }`}
                        >
                          {u.is_active ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-forest-700" />
                              <span>ACTIVE</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>INACTIVE</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs font-mono">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={isSelf && u.is_active}
                          className={`px-3 py-1 rounded-md text-xs font-semibold border transition-colors ${
                            u.is_active
                              ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100 disabled:opacity-40'
                              : 'bg-sage-100 text-forest-900 border-sage-300 hover:bg-sage-200'
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
          <div className="text-center py-12 text-slate-500 text-xs italic">No users match your criteria.</div>
        )}
      </div>
    </div>
  );
};

