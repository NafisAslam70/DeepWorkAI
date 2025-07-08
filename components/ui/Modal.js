// components/Modal.js

import React from 'react';
import ReactModal from 'react-modal';

ReactModal.setAppElement('#__next'); // Required for accessibility with modals in Next.js

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    borderRadius: '15px',
    padding: '25px',
    width: '80%',
    maxWidth: '400px', // Adjusted for a smaller modal width
    border: 'none',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)', // Subtle shadow for elevation
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Slightly darker overlay
    zIndex: '50',
  },
};

const Modal = ({ isOpen, onRequestClose, children }) => {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
    >
      {children}
    </ReactModal>
  );
};

export default Modal;
