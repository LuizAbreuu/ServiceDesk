import { useState } from 'react';
import { Plus, Pencil, PowerOff, Trash2, Users } from 'lucide-react';
import { useUsers, useTeams, useToggleUserStatus, useDeleteUser } from '../hooks/useUsers';
import Modal from '../components/ui/Modal';
import UserForm from '../components/users/UserForm';
import type { User } from '../types';

// Badge de perfil
const ROLE_STYLES: Record<string, string> = {
  Admin:   'bg-purple-100 text-purple-700',
  Manager: 'bg-green-100 text-green-700',
  Agent:   'bg-blue-100 text-blue-700',
  User:    'bg-gray-100 text-gray-600',
};
const ROLE_LABELS: Record<string, string> = {
  Admin: 'Admin', Manager: 'Gestor', Agent: 'Agente', User: 'Usuário',
};

function avatarColor(name: string) {
  const colors = [
    'bg-purple-100 text-purple-700', 'bg-blue-100 text-blue-700',
    'bg-teal-100 text-teal-700',     'bg-orange-100 text-orange-700',
    'bg-red-100 text-red-700',       'bg-green-100 text-green-700',
  ];
  return colors[name.charCodeAt(0) % colors.length];
}

function UserRow({ user, onEdit }: { user: User; onEdit: (u: User) => void }) {
  const { mutate: toggleStatus, isPending: isToggling } = useToggleUserStatus();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
  const isPending = isToggling || isDeleting;
  const initials = user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  const isActive = (user as User & { isActive?: boolean }).isActive !== false;

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* Avatar + Nome */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${avatarColor(user.name)}`}>
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{user.name}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        </div>
      </td>

      {/* Perfil */}
      <td className="px-4 py-3">
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ROLE_STYLES[user.role]}`}>
          {ROLE_LABELS[user.role]}
        </span>
      </td>

      {/* Time */}
      <td className="px-4 py-3 text-xs text-gray-500">
        {user.teamId ?? '— sem time'}
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
          isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
        }`}>
          {isActive ? 'Ativo' : 'Inativo'}
        </span>
      </td>

      {/* Ações */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(user)}
            className="p-1.5 rounded-md border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
            title="Editar"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => toggleStatus({ id: user.id, active: isActive })}
            disabled={isPending}
            className={`p-1.5 rounded-md border transition-colors ${
              isActive
                ? 'border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600'
                : 'border-green-100 text-green-400 hover:bg-green-50 hover:text-green-600'
            }`}
            title={isActive ? 'Desativar' : 'Reativar'}
          >
            <PowerOff size={13} />
          </button>
          <button
            onClick={() => {
              if (window.confirm('Tem certeza que deseja excluir este usuário definitivamente?')) {
                deleteUser(user.id);
              }
            }}
            disabled={isPending}
            className="p-1.5 rounded-md border border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Excluir"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function TeamsTab() {
  const { data: teams = [], isLoading } = useTeams();

  if (isLoading) return <div className="animate-pulse space-y-3">
    {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
  </div>;

  return (
    <div className="grid grid-cols-2 gap-4">
      {teams.map((team) => (
        <div key={team.id} className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">{team.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {team.members.length} agentes · {team.openTickets} chamados abertos
              </p>
            </div>
            <button className="p-1.5 rounded-md border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors">
              <Pencil size={12} />
            </button>
          </div>
          <div className="flex items-center gap-1.5 mt-3">
            {team.members.slice(0, 5).map((m) => (
              <div
                key={m.id}
                title={m.name}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${avatarColor(m.name)}`}
              >
                {m.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
              </div>
            ))}
            {team.members.length > 5 && (
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                +{team.members.length - 5}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function UsersPage() {
  const [tab, setTab] = useState<'users' | 'teams'>('users');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data: users = [], isLoading } = useUsers();

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase())
      || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Usuários & Times</h1>
          <p className="text-sm text-gray-500">{users.length} usuários cadastrados</p>
        </div>
        <button
          onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-[#1a1a2e] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#2d2d4e] transition-colors"
        >
          <Plus size={16} />
          Novo Usuário
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['users', 'teams'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              tab === t ? 'bg-[#1a1a2e] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users size={14} />
            {t === 'users' ? 'Usuários' : 'Times'}
          </button>
        ))}
      </div>

      {tab === 'users' ? (
        <>
          {/* Filtros */}
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#6c63ff] bg-white"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-white outline-none"
            >
              <option value="">Todos os perfis</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Gestor</option>
              <option value="Agent">Agente</option>
              <option value="User">Usuário</option>
            </select>
          </div>

          {/* Tabela */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Usuário', 'Perfil', 'Time', 'Status', 'Ações'].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-gray-500 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-gray-100 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : filtered.map((user) => (
                      <UserRow
                        key={user.id}
                        user={user}
                        onEdit={(u) => { setEditingUser(u); setIsModalOpen(true); }}
                      />
                    ))
                }
              </tbody>
            </table>

            {!isLoading && filtered.length === 0 && (
              <div className="text-center py-10 text-sm text-gray-400">
                Nenhum usuário encontrado.
              </div>
            )}
          </div>
        </>
      ) : (
        <TeamsTab />
      )}

      {/* Modal criar/editar usuário */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}
      >
        <UserForm onSuccess={() => setIsModalOpen(false)} initialData={editingUser || undefined} />
      </Modal>
    </div>
  );
}