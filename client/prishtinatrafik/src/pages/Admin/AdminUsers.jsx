// client/src/pages/Admin/AdminUsers.jsx
import React, { useState } from "react";
import {
  Search,
  MoreVertical,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Calendar,
  Trash2,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import API from "../../services/api";

const ROLE_COLORS = {
  admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  user: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  inspector: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

const ROLE_LABELS = {
  admin: "Administrator",
  user: "Përdorues",
  inspector: "Inspektor",
};

export default function AdminUsers({ users, onUpdateRole, onDeleteUser }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showRoleMenu, setShowRoleMenu] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoleChange = async (userId, newRole) => {
    await onUpdateRole(userId, newRole);
    setShowRoleMenu(null);
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`A jeni i sigurt që dëshironi të fshini përdoruesin "${userName}"?`)) {
      return;
    }

    setDeleting(true);
    try {
      const response = await API.delete(`/admin/users/${userId}`);
      if (response.status === 200) {
        toast.success(`Përdoruesi u fshi me sukses`);
        onDeleteUser(userId);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Gabim gjatë fshirjes së përdoruesit");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* Header me search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Gjithsej: {filteredUsers.length} përdorues
          </span>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Kërko përdorues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Cards - Responsive */}
      <div className="space-y-2">
        {filteredUsers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">Nuk u gjetën përdorues</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-3 md:p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Informacionet e përdoruesit */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.name || user.fullname}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {user.email}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      Regjistruar: {new Date(user.created_at).toLocaleDateString("sq-AL")}
                    </p>
                  </div>
                </div>

                {/* Roli dhe veprimet */}
                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[user.role] || ROLE_COLORS.user}`}
                  >
                    {ROLE_LABELS[user.role] || "Përdorues"}
                  </span>

                  <div className="relative">
                    <button
                      onClick={() => setShowRoleMenu(showRoleMenu === user.id ? null : user.id)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      disabled={deleting}
                    >
                      <MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>

                    {showRoleMenu === user.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                        <div className="py-1">
                          <button
                            onClick={() => handleRoleChange(user.id, "user")}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                          >
                            <UserCheck className="w-4 h-4" />
                            Përdorues
                          </button>
                          <button
                            onClick={() => handleRoleChange(user.id, "inspector")}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                          >
                            <Shield className="w-4 h-4" />
                            Inspektor
                          </button>
                          <button
                            onClick={() => handleRoleChange(user.id, "admin")}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                          >
                            <Shield className="w-4 h-4" />
                            Administrator
                          </button>
                          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name || user.email)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Fshij përdoruesin
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}