import { useEffect, useMemo, useState } from 'react';
import { createBook, deleteBook, getBooks, updateBook } from './api/books';

const STATUS_OPTIONS = [
  { value: 'want', label: '읽고 싶은 책' },
  { value: 'reading', label: '읽는 중' },
  { value: 'done', label: '완독' },
  { value: 'paused', label: '중단' },
];

const CATEGORY_OPTIONS = ['국내 소설', '해외 소설', '에세이', '자기계발', '경제경영', '인문', '고전', '과학'];

const EMPTY_FORM = {
  title: '',
  author: '',
  category: CATEGORY_OPTIONS[0],
  status: 'want',
  rating: 0,
  memo: '',
  startDate: '',
  endDate: '',
};

const getStatusLabel = (status) => STATUS_OPTIONS.find((option) => option.value === status)?.label || status;

const getStats = (books) => ({
  total: books.length,
  want: books.filter((book) => book.status === 'want').length,
  reading: books.filter((book) => book.status === 'reading').length,
  done: books.filter((book) => book.status === 'done').length,
  paused: books.filter((book) => book.status === 'paused').length,
});

function App() {
  const [books, setBooks] = useState([]);
  const [filters, setFilters] = useState({ q: '', status: '', category: '' });
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingBookId, setEditingBookId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const stats = useMemo(() => getStats(books), [books]);
  const isEditing = Boolean(editingBookId);

  const loadBooks = async () => {
    // 현재 검색어와 필터를 서버에 보내 조건에 맞는 책만 가져옵니다.
    setLoading(true);
    setErrorMessage('');

    try {
      const data = await getBooks(filters);
      setBooks(data);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, [filters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: name === 'rating' ? Number(value) : value,
    }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingBookId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    try {
      // 수정 중이면 PUT, 새 책이면 POST 요청을 보냅니다.
      if (isEditing) {
        await updateBook(editingBookId, form);
      } else {
        await createBook(form);
      }

      resetForm();
      await loadBooks();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleEdit = (book) => {
    // 수정 버튼을 누르면 선택한 책의 값을 폼에 채웁니다.
    setEditingBookId(book._id);
    setForm({
      title: book.title || '',
      author: book.author || '',
      category: book.category || CATEGORY_OPTIONS[0],
      status: book.status || 'want',
      rating: book.rating || 0,
      memo: book.memo || '',
      startDate: book.startDate || '',
      endDate: book.endDate || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (bookId) => {
    const confirmed = window.confirm('이 책을 삭제할까요?');

    if (!confirmed) {
      return;
    }

    try {
      await deleteBook(bookId);
      await loadBooks();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <main className="app">
      <section className="hero">
        <div>
          <p className="eyebrow">Reading CRUD App</p>
          <h1>BookLog</h1>
          <p className="hero-description">
            베스트셀러와 스테디셀러 50권을 시작점으로 검색, 필터링, 독서 상태, 별점, 메모를 관리하는 독서 기록 앱입니다.
          </p>
        </div>
      </section>

      <section className="stats-grid" aria-label="독서 통계">
        <article className="stat-card">
          <span>전체 책 수</span>
          <strong>{stats.total}</strong>
        </article>
        <article className="stat-card">
          <span>읽고 싶은 책</span>
          <strong>{stats.want}</strong>
        </article>
        <article className="stat-card">
          <span>읽는 중</span>
          <strong>{stats.reading}</strong>
        </article>
        <article className="stat-card">
          <span>완독</span>
          <strong>{stats.done}</strong>
        </article>
        <article className="stat-card">
          <span>중단</span>
          <strong>{stats.paused}</strong>
        </article>
      </section>

      <section className="workspace">
        <form className="book-form" onSubmit={handleSubmit}>
          <div className="section-title">
            <p>{isEditing ? '기록 수정' : '새 책 추가'}</p>
            <h2>{isEditing ? '책 정보를 수정하세요' : '독서 기록을 남겨보세요'}</h2>
          </div>

          <div className="form-grid">
            <label>
              제목
              <input name="title" value={form.title} onChange={handleFormChange} required placeholder="책 제목" />
            </label>
            <label>
              저자
              <input name="author" value={form.author} onChange={handleFormChange} placeholder="저자" />
            </label>
            <label>
              카테고리
              <select name="category" value={form.category} onChange={handleFormChange}>
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label>
              상태
              <select name="status" value={form.status} onChange={handleFormChange}>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              별점
              <input name="rating" type="number" min="0" max="5" step="0.5" value={form.rating} onChange={handleFormChange} />
            </label>
            <label>
              시작일
              <input name="startDate" type="date" value={form.startDate} onChange={handleFormChange} />
            </label>
            <label>
              완독일
              <input name="endDate" type="date" value={form.endDate} onChange={handleFormChange} />
            </label>
            <label className="memo-field">
              메모
              <textarea name="memo" value={form.memo} onChange={handleFormChange} rows="4" placeholder="기억하고 싶은 문장이나 생각" />
            </label>
          </div>

          <div className="form-actions">
            <button type="submit">{isEditing ? '수정 저장' : '책 추가'}</button>
            {isEditing && (
              <button type="button" className="secondary-button" onClick={resetForm}>
                취소
              </button>
            )}
          </div>
        </form>

        <section className="list-panel">
          <div className="section-title">
            <p>책 목록</p>
            <h2>나의 BookLog</h2>
          </div>

          <div className="filters">
            <input name="q" value={filters.q} onChange={handleFilterChange} placeholder="제목 또는 저자 검색" />
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">전체 상태</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <select name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="">전체 카테고리</option>
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {errorMessage && <p className="error-message">{errorMessage}</p>}
          {loading && <p className="empty-message">책 목록을 불러오는 중입니다.</p>}

          {!loading && books.length === 0 && <p className="empty-message">조건에 맞는 책이 없습니다.</p>}

          <div className="book-grid">
            {books.map((book) => (
              <article className="book-card" key={book._id}>
                <div className="book-card-header">
                  <div>
                    <span className={`status-badge status-${book.status}`}>{getStatusLabel(book.status)}</span>
                    <h3>{book.title}</h3>
                  </div>
                  <span className="rating" aria-label={`별점 ${book.rating}점`}>
                    {'★'.repeat(Math.floor(book.rating))}
                    {book.rating % 1 ? '½' : ''}
                    <small>{book.rating}</small>
                  </span>
                </div>

                <dl className="book-meta">
                  <div>
                    <dt>저자</dt>
                    <dd>{book.author || '-'}</dd>
                  </div>
                  <div>
                    <dt>카테고리</dt>
                    <dd>{book.category || '-'}</dd>
                  </div>
                  <div>
                    <dt>시작일</dt>
                    <dd>{book.startDate || '-'}</dd>
                  </div>
                  <div>
                    <dt>완독일</dt>
                    <dd>{book.endDate || '-'}</dd>
                  </div>
                </dl>

                <p className="memo">{book.memo || '메모가 없습니다.'}</p>

                <div className="card-actions">
                  <button type="button" className="secondary-button" onClick={() => handleEdit(book)}>
                    수정
                  </button>
                  <button type="button" className="danger-button" onClick={() => handleDelete(book._id)}>
                    삭제
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

export default App;
