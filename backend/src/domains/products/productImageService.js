module.exports = () => {
  const uploadProductImage = async (filename) => {
    return `/uploads/${filename}`;
  };

  return {
    uploadProductImage,
  };
};
