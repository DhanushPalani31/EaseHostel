/**
 * buildPaginationMeta – standard pagination metadata builder
 * used in sendPaginated responses.
 */
export const buildPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page:       Number(page),
    limit:      Number(limit),
    totalPages,
    hasNextPage: Number(page) < totalPages,
    hasPrevPage: Number(page) > 1
  };
};

/**
 * parseQueryPagination – safely extracts page & limit from req.query
 * enforces sane defaults and prevents limit abuse.
 */
export const parseQueryPagination = (query, defaultLimit = 12, maxLimit = 50) => {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit) || defaultLimit));
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
};
