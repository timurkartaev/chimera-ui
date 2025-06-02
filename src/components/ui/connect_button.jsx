import React, { useState } from 'react';
import { AuthPopup } from './auth_popup';
import { Button } from './button'; // Assuming you have a Button component
export function ConnectButton({ integration_name }) {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setShowPopup(true)}
        className="text-sm px-3 py-1.5"
      >
        Connect
      </Button>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              ×
            </button>
            <AuthPopup integration_name={integration_name} onClose={() => setShowPopup(false)}/>
          </div>
        </div>
      )}
    </>
  );
}
