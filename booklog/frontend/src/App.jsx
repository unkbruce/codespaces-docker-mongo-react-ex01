import { useEffect, useMemo, useState } from 'react';
import { createBook, deleteBook, getBooks, updateBook } from './api/books';

const STATUS_OPTIONS = [
  { value: 'want', label: '읽고 싶은 책' },
  { value: 'reading', label: '읽는 중' },
  { value: 'done', label: '완독' },
  { value: 'paused', label: '중단' },
];

const CATEGORY_OPTIONS = ['국내 소설', '해외 소설', '에세이', '자기계발', '경제경영', '인문', '고전', '과학'];

const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'rating', label: '별점 높은순' },
  { value: 'title', label: '제목순' },
  { value: 'endDate', label: '완독일순' },
];

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

const PAGE_SIZE = 9;

const STATUS_STYLE = {
  want: 'bg-amber-100 text-amber-800 ring-amber-200',
  reading: 'bg-teal-100 text-teal-800 ring-teal-200',
  done: 'bg-lime-100 text-lime-800 ring-lime-200',
  paused: 'bg-rose-100 text-rose-800 ring-rose-200',
};

const fieldClass =
  'mt-1 w-full rounded-lg border border-stone-200 bg-white/95 px-3 py-2.5 text-sm text-book-ink outline-none transition placeholder:text-stone-400 focus:border-book-green focus:ring-4 focus:ring-teal-100';

const primaryButtonClass =
  'inline-flex min-h-10 items-center justify-center rounded-lg bg-book-green px-4 text-sm font-bold text-white shadow-sm transition hover:bg-book-greenDark focus:outline-none focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-50';

const subtleButtonClass =
  'inline-flex min-h-10 items-center justify-center rounded-lg bg-emerald-50 px-4 text-sm font-bold text-book-ink ring-1 ring-inset ring-emerald-100 transition hover:bg-emerald-100 focus:outline-none focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-50';

const dangerButtonClass =
  'inline-flex min-h-10 items-center justify-center rounded-lg bg-rose-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-100';

const getStatusLabel = (status) => STATUS_OPTIONS.find((option) => option.value === status)?.label || status;

const getStats = (books) => ({
  total: books.length,
  want: books.filter((book) => book.status === 'want').length,
  reading: books.filter((book) => book.status === 'reading').length,
  done: books.filter((book) => book.status === 'done').length,
  paused: books.filter((book) => book.status === 'paused').length,
});

const getDateTime = (value) => {
  const time = new Date(value || 0).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const sortBooks = (books, sortBy) => {
  const sortedBooks = [...books];

  sortedBooks.sort((a, b) => {
    if (sortBy === 'rating') {
      return Number(b.rating || 0) - Number(a.rating || 0) || a.title.localeCompare(b.title, 'ko');
    }

    if (sortBy === 'title') {
      return a.title.localeCompare(b.title, 'ko');
    }

    if (sortBy === 'endDate') {
      return getDateTime(b.endDate) - getDateTime(a.endDate) || a.title.localeCompare(b.title, 'ko');
    }

    return getDateTime(b.createdAt) - getDateTime(a.createdAt);
  });

  return sortedBooks;
};

function App() {
  const [books, setBooks] = useState([]);
  const [filters, setFilters] = useState({ q: '', status: '', category: '' });
  const [sortBy, setSortBy] = useState('latest');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingBookId, setEditingBookId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const stats = useMemo(() => getStats(books), [books]);
  const isEditing = Boolean(editingBookId);
  const sortedBooks = useMemo(() => sortBooks(books, sortBy), [books, sortBy]);
  const totalPages = Math.max(1, Math.ceil(sortedBooks.length / PAGE_SIZE));
  const pageNumbers = useMemo(() => Array.from({ length: totalPages }, (_, index) => index + 1), [totalPages]);
  const paginatedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return sortedBooks.slice(startIndex, startIndex + PAGE_SIZE);
  }, [sortedBooks, currentPage]);

  const statCards = [
    { label: '전체 책 수', value: stats.total, color: 'text-book-green' },
    { label: '읽고 싶은 책', value: stats.want, color: 'text-amber-700' },
    { label: '읽는 중', value: stats.reading, color: 'text-teal-700' },
    { label: '완독', value: stats.done, color: 'text-lime-700' },
    { label: '중단', value: stats.paused, color: 'text-rose-700' },
  ];

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

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setCurrentPage(1);
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const handleSortChange = (event) => {
    setCurrentPage(1);
    setSortBy(event.target.value);
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
      setCurrentPage(1);
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
    <main className="min-h-screen px-4 py-6 text-book-ink sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="hero-banner overflow-hidden rounded-lg bg-[linear-gradient(120deg,rgba(22,44,43,0.94),rgba(130,79,45,0.72)),url('https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center px-6 py-10 shadow-soft sm:px-8 sm:py-14">
          <p className="text-xs font-extrabold uppercase tracking-normal text-amber-200">Reading Log App</p>
          <h1 className="mt-2 text-5xl font-black tracking-normal text-book-paper sm:text-6xl">BookLog</h1>
          <p className="hero-description mt-4 max-w-2xl text-sm leading-7 text-stone-100 sm:text-base">
            베스트셀러와 스테디셀러 50권을 기반으로 책을 검색하고, 독서 상태와 별점, 메모를 관리할 수 있는 독서 기록 앱입니다.
          </p>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" aria-label="독서 통계">
          {statCards.map((card) => (
            <article key={card.label} className="rounded-lg border border-white/80 bg-white/90 p-4 shadow-sm ring-1 ring-stone-200/70 backdrop-blur">
              <span className="text-xs font-bold text-book-muted">{card.label}</span>
              <strong className={`mt-2 block text-3xl font-black ${card.color}`}>{card.value}</strong>
            </article>
          ))}
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[360px_1fr] xl:grid-cols-[390px_1fr]">
          <form className="compact-book-form rounded-lg border border-stone-200/80 bg-white/90 p-5 shadow-soft lg:sticky lg:top-5 lg:self-start" onSubmit={handleSubmit}>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-normal text-book-amber">{isEditing ? '기록 수정' : '새 책 추가'}</p>
              <h2 className="mt-1 text-xl font-black tracking-normal text-book-ink">{isEditing ? '책 정보를 수정하세요' : '독서 기록을 남겨보세요'}</h2>
            </div>

            <div className="compact-form-grid mt-5 grid gap-3">
              <div className="compact-row compact-row-two">
                <label className="text-sm font-bold text-book-muted">
                  제목
                  <input className={fieldClass} name="title" value={form.title} onChange={handleFormChange} required placeholder="책 제목" />
                </label>
                <label className="text-sm font-bold text-book-muted">
                  저자
                  <input className={fieldClass} name="author" value={form.author} onChange={handleFormChange} placeholder="저자" />
                </label>
              </div>
              <div className="compact-row compact-row-three">
                <label className="text-sm font-bold text-book-muted">
                  카테고리
                  <select className={fieldClass} name="category" value={form.category} onChange={handleFormChange}>
                    {CATEGORY_OPTIONS.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-bold text-book-muted">
                  상태
                  <select className={fieldClass} name="status" value={form.status} onChange={handleFormChange}>
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-bold text-book-muted">
                  별점
                  <input className={fieldClass} name="rating" type="number" min="0" max="5" step="0.5" value={form.rating} onChange={handleFormChange} />
                </label>
              </div>
              <div className="compact-row compact-row-two">
                <label className="text-sm font-bold text-book-muted">
                  시작일
                  <input className={fieldClass} name="startDate" type="date" value={form.startDate} onChange={handleFormChange} />
                </label>
                <label className="text-sm font-bold text-book-muted">
                  완독일
                  <input className={fieldClass} name="endDate" type="date" value={form.endDate} onChange={handleFormChange} />
                </label>
              </div>
              <label className="text-sm font-bold text-book-muted">
                메모
                <textarea className={`${fieldClass} min-h-24 resize-y`} name="memo" value={form.memo} onChange={handleFormChange} rows="4" placeholder="기억하고 싶은 문장이나 생각" />
              </label>
            </div>

            <div className="compact-form-actions mt-5 flex flex-wrap gap-2">
              <button className={primaryButtonClass} type="submit">
                {isEditing ? '수정 저장' : '책 추가'}
              </button>
              {isEditing && (
                <button type="button" className={subtleButtonClass} onClick={resetForm}>
                  취소
                </button>
              )}
            </div>
          </form>

          <section>
            <div className="rounded-lg border border-stone-200/80 bg-white/80 p-4 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-normal text-book-amber">책 목록</p>
                  <h2 className="mt-1 text-2xl font-black tracking-normal text-book-ink">나의 BookLog</h2>
                </div>
                <p className="text-sm font-semibold text-book-muted">
                  {books.length}권 중 {paginatedBooks.length}권 표시
                </p>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
                <input className={fieldClass} name="q" value={filters.q} onChange={handleFilterChange} placeholder="제목 또는 저자 검색" />
                <select className={fieldClass} name="status" value={filters.status} onChange={handleFilterChange}>
                  <option value="">전체 상태</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                <select className={fieldClass} name="category" value={filters.category} onChange={handleFilterChange}>
                  <option value="">전체 카테고리</option>
                  {CATEGORY_OPTIONS.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <select className={fieldClass} value={sortBy} onChange={handleSortChange} aria-label="정렬 조건">
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {errorMessage && <p className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 ring-1 ring-rose-100">{errorMessage}</p>}
            {loading && <p className="mt-4 rounded-lg bg-white/80 px-4 py-3 text-sm font-bold text-book-muted ring-1 ring-stone-200">책 목록을 불러오는 중입니다.</p>}
            {!loading && books.length === 0 && <p className="mt-4 rounded-lg bg-white/80 px-4 py-3 text-sm font-bold text-book-muted ring-1 ring-stone-200">조건에 맞는 책이 없습니다.</p>}

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {paginatedBooks.map((book) => (
                <article key={book._id} className="flex min-h-[260px] flex-col rounded-lg border border-stone-200/80 bg-white/95 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold ring-1 ring-inset ${STATUS_STYLE[book.status] || STATUS_STYLE.want}`}>
                        {getStatusLabel(book.status)}
                      </span>
                      <h3 className="mt-2 line-clamp-2 text-base font-black leading-6 tracking-normal text-book-ink">{book.title}</h3>
                    </div>
                    <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-black text-book-amber ring-1 ring-amber-100">
                      {Number(book.rating || 0).toFixed(1)} / 5
                    </span>
                  </div>

                  <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                    <div className="min-w-0">
                      <dt className="text-xs font-extrabold text-stone-400">저자</dt>
                      <dd className="truncate font-semibold text-book-ink">{book.author || '-'}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs font-extrabold text-stone-400">카테고리</dt>
                      <dd className="truncate font-semibold text-book-ink">{book.category || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-extrabold text-stone-400">시작일</dt>
                      <dd className="font-semibold text-book-ink">{book.startDate || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-extrabold text-stone-400">완독일</dt>
                      <dd className="font-semibold text-book-ink">{book.endDate || '-'}</dd>
                    </div>
                  </dl>

                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-book-muted">{book.memo || '메모가 없습니다.'}</p>

                  <div className="mt-auto flex gap-2 pt-4">
                    <button type="button" className={`${subtleButtonClass} flex-1`} onClick={() => handleEdit(book)}>
                      수정
                    </button>
                    <button type="button" className={`${dangerButtonClass} flex-1`} onClick={() => handleDelete(book._id)}>
                      삭제
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {books.length > 0 && (
              <nav className="mt-5 flex flex-wrap items-center justify-center gap-2" aria-label="페이지네이션">
                <button className={subtleButtonClass} type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1}>
                  이전
                </button>
                {pageNumbers.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    className={`inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-black transition focus:outline-none focus:ring-4 focus:ring-teal-100 ${
                      currentPage === pageNumber
                        ? 'bg-book-green text-white shadow-sm'
                        : 'bg-white/90 text-book-muted ring-1 ring-inset ring-stone-200 hover:bg-stone-50'
                    }`}
                    onClick={() => setCurrentPage(pageNumber)}
                    aria-current={currentPage === pageNumber ? 'page' : undefined}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button className={subtleButtonClass} type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages}>
                  다음
                </button>
              </nav>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

export default App;
