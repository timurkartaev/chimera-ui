import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [modalContent, setModalContent] = useState(null);
  const elRef = useRef(null);

  if (!elRef.current) {
    elRef.current = document.createElement('div');
    elRef.current.setAttribute('id', 'modal-root');
  }

  useEffect(() => {
    let modalRoot = document.getElementById('modal-container');
    if (!modalRoot) {
      console.warn("No element with id 'modal-container' found in DOM.");
      modalRoot = document.body; // Fallback to body if not found
    }
    modalRoot.appendChild(elRef.current);
    return () => modalRoot.removeChild(elRef.current);
  }, []);

  const showModal = (content) => setModalContent(() => content);
  const closeModal = () => setModalContent(null);

  return (
    <ModalContext.Provider value={{ showModal, closeModal }}>
      {children}
      {modalContent &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm"
            onClick={closeModal} // close on backdrop click
            role="dialog"
            aria-modal="true"
          >
            <div
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative"
              onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
            >
              {modalContent}
            </div>
          </div>,
          elRef.current
        )}
    </ModalContext.Provider>
  );
}

export const useModal = () => useContext(ModalContext);
