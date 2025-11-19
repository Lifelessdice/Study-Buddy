function userLinks(userId) {
  return {
    self: { href: `/api/v1/users/${userId}`, method: "GET" },
    update: { href: `/api/v1/users/${userId}`, method: "PATCH" },
    delete: { href: `/api/v1/users/${userId}`, method: "DELETE" }
  };
}

function paginationLinks(baseUrl, page, limit, totalPages) {
  const links = {
    self: { href: `${baseUrl}?page=${page}&limit=${limit}` }
  };

  if (page < totalPages) {
    links.next = { href: `${baseUrl}?page=${page + 1}&limit=${limit}` };
  }
  if (page > 1) {
    links.prev = { href: `${baseUrl}?page=${page - 1}&limit=${limit}` };
  }

  return links;
}

module.exports = { userLinks, paginationLinks };
