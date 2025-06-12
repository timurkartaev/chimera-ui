import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [modalContent, setModalContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const elRef = useRef(null);

  if (!elRef.current) {
    elRef.current = document.createElement('div');
    elRef.current.setAttribute('id', 'modal-root');
  }

  useEffect(() => {
    let modalRoot = document.getElementById('modal-container');
    if (!modalRoot) {
      modalRoot = document.body;
    }
    modalRoot.appendChild(elRef.current);
    return () => modalRoot.removeChild(elRef.current);
  }, []);

  const showModal = (contentOrLoader) => {
    // If function: assume it’s an async loader
    if (typeof contentOrLoader === 'function') {
      setIsLoading(true);
      contentOrLoader().then((content) => {
        setModalContent(() => content);
        setIsLoading(false);
      });
    } else {
      setModalContent(() => contentOrLoader);
    }
  };

  const closeModal = () => {
    setModalContent(null);
    setIsLoading(false);
  };

  const modalBody = isLoading ? (
    <div className="flex justify-center items-center h-32">
      <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
    </div>
  ) : (
    <div
      className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative"
      onClick={(e) => e.stopPropagation()}
    >
      {modalContent}
    </div>
  );

  return (
    <ModalContext.Provider value={{ showModal, closeModal }}>
      {children}
      {(isLoading || modalContent) &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm"
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
          >

            {modalBody}

          </div>,
          elRef.current
        )}
    </ModalContext.Provider>
  );
}

export const useModal = () => useContext(ModalContext);
