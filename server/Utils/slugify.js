function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

async function ensureUniqueSlug(doc, base, field = "slug") {
  const safeBase = base && base.trim() ? base.trim() : "item";
  let slug = safeBase;
  let suffix = 2;

  // Ensure uniqueness across collection, excluding current doc.
  while (await doc.constructor.exists({ [field]: slug, _id: { $ne: doc._id } })) {
    slug = `${safeBase}-${suffix}`;
    suffix += 1;
  }

  doc[field] = slug;
  return slug;
}

async function ensureDocSlug(doc, sourceValue, field = "slug") {
  if (!doc || doc[field]) return doc;
  const base = slugify(sourceValue);
  await ensureUniqueSlug(doc, base, field);
  await doc.save({ validateBeforeSave: false });
  return doc;
}

module.exports = { slugify, ensureUniqueSlug, ensureDocSlug };
