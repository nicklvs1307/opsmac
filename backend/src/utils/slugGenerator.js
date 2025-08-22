const slugify = require('slugify');

const generateUniqueSlug = async (model, name, currentSlug = null) => {
  let baseSlug = slugify(name, { lower: true, strict: true });
  let uniqueSlug = baseSlug;
  let counter = 1;

  // If an existing slug is provided, and it matches the generated baseSlug, use it.
  // This prevents changing the slug unnecessarily on updates if the name hasn't changed significantly.
  if (currentSlug && currentSlug === baseSlug) {
    return currentSlug;
  }

  while (true) {
    const existingRecord = await model.findOne({ where: { slug: uniqueSlug } });
    if (!existingRecord) {
      return uniqueSlug;
    }
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }
};

module.exports = { generateUniqueSlug };
