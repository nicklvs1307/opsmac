import { useState } from 'react';

const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const handleOpen = (item = null) => {
    setEditingItem(item);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingItem(null);
  };

  return { isOpen, editingItem, handleOpen, handleClose };
};

export default useModal;
