import { useState, useEffect } from 'react';

const usePagination = (initialItemsPerPage = 10) => {
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [totalPages, setTotalPages] = useState(1);

  // Reset page to 1 when itemsPerPage changes
  useEffect(() => {
    setPage(1);
  }, [itemsPerPage]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return {
    page,
    setPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    setTotalPages,
    handlePageChange,
  };
};

export default usePagination;
