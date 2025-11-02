import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useAuthStore, useOnboardingStore } from '../store/useStore';

const DebugInfo = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const { user } = useAuthStore();
  const { formData } = useOnboardingStore();

  if (import.meta.env.PROD) return null; // Only show in development

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-700 text-sm font-mono"
      >
        🐛 Debug
      </button>

      {isOpen && (
        <div className="mt-2 bg-black/90 backdrop-blur-xl text-white p-4 rounded-lg shadow-2xl max-w-md overflow-auto max-h-96 text-xs font-mono">
          <h3 className="text-sm font-bold mb-2 text-purple-400">Debug Info</h3>
          
          <div className="space-y-2">
            <div>
              <p className="text-green-400">Wallet Connected:</p>
              <p className="ml-2">{isConnected ? '✅ Yes' : '❌ No'}</p>
            </div>

            <div>
              <p className="text-green-400">Address:</p>
              <p className="ml-2 break-all">{address || 'None'}</p>
            </div>

            <div>
              <p className="text-green-400">User in DB:</p>
              <p className="ml-2">{user ? `✅ ${user.name || 'No name'}` : '❌ Not found'}</p>
            </div>

            <div>
              <p className="text-green-400">Onboarding Data:</p>
              <div className="ml-2 bg-gray-800 p-2 rounded mt-1">
                <p>Role: {formData.role || '❌ Missing'}</p>
                <p>Name: {formData.name || '❌ Missing'}</p>
                <p>Skills: {formData.skills?.length || 0}</p>
                <p>Project: {formData.projectName || 'None'}</p>
              </div>
            </div>

            <div>
              <p className="text-green-400">LocalStorage:</p>
              <div className="ml-2 bg-gray-800 p-2 rounded mt-1 max-h-32 overflow-auto">
                <pre className="text-xs">
                  {JSON.stringify(
                    JSON.parse(localStorage.getItem('habit-onboarding') || '{}'),
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="mt-3 w-full bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs"
          >
            Clear All & Reload
          </button>
        </div>
      )}
    </div>
  );
};

export default DebugInfo;
