const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const request = async (path, options = {}) => {
  // 모든 API 요청이 같은 방식으로 에러를 처리하도록 공통 함수로 묶었습니다.
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API 요청 중 오류가 발생했습니다.');
  }

  return data;
};

export const getBooks = (filters = {}) => {
  const params = new URLSearchParams();

  // 값이 있는 검색/필터만 query string에 포함합니다.
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.append(key, value);
    }
  });

  const queryString = params.toString();
  return request(`/books${queryString ? `?${queryString}` : ''}`);
};

export const createBook = (book) =>
  request('/books', {
    method: 'POST',
    body: JSON.stringify(book),
  });

export const updateBook = (id, book) =>
  request(`/books/${id}`, {
    method: 'PUT',
    body: JSON.stringify(book),
  });

export const deleteBook = (id) =>
  request(`/books/${id}`, {
    method: 'DELETE',
  });
