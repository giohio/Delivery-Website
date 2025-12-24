import { useState } from 'react';
import { Building2, ChevronDown, User, Package, Truck } from 'lucide-react';
import { useRoleSwitch } from '../../services/roleSwitchService';

export default function RoleSwitcher() {
  const [showDropdown, setShowDropdown] = useState(false);
  const { roles, currentRoleId, loading, switchRole } = useRoleSwitch();

  if (loading || roles.length <= 1) {
    return null; // Don't show if only has 1 role
  }

  const roleIcons: { [key: number]: any } = {
    1: User,
    2: Building2,
    3: Truck,
    4: Package,
  };

  const roleColors: { [key: number]: string } = {
    1: 'bg-red-500',
    2: 'bg-blue-500',
    3: 'bg-green-500',
    4: 'bg-purple-500',
  };

  const currentRole = roles.find(r => r.role_id === currentRoleId);
  const CurrentIcon = currentRole ? roleIcons[currentRole.role_id] : User;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className={`w-8 h-8 ${roleColors[currentRoleId]} rounded-full flex items-center justify-center`}>
          <CurrentIcon className="w-5 h-5 text-white" />
        </div>
        <span className="font-medium text-gray-900">{currentRole?.role_name || 'Customer'}</span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
            <div className="p-3 border-b border-gray-200">
              <p className="text-xs text-gray-600 font-medium">Switch Role</p>
            </div>
            <div className="p-2">
              {roles.map((role) => {
                const Icon = roleIcons[role.role_id];
                const isActive = role.role_id === currentRoleId;
                
                return (
                  <button
                    key={role.role_id}
                    onClick={() => {
                      if (!isActive) {
                        switchRole(role.role_id);
                      }
                      setShowDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className={`w-10 h-10 ${roleColors[role.role_id]} rounded-full flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{role.role_name}</div>
                      {isActive && (
                        <div className="text-xs text-blue-600">Active</div>
                      )}
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
