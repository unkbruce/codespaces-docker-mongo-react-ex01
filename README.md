# BookLog

BookLog는 베스트셀러/스테디셀러 느낌의 초기 도서 50권을 제공하고, 사용자가 책을 검색/필터링하며 독서 상태, 별점, 메모를 관리할 수 있는 독서 기록 CRUD 앱입니다. GitHub Codespaces에서 Docker MongoDB 컨테이너를 띄운 뒤 React 프론트엔드와 Express 백엔드를 각각 실행하도록 구성했습니다.

## 기술 스택

- Frontend: Vite, React, CSS
- Backend: Node.js, Express
- Database: MongoDB
- ODM: Mongoose
- API 통신: fetch API
- DB 실행 방식: Docker MongoDB 컨테이너

## 주요 기능

- 도서 50권 seed 데이터 삽입
- 책 목록 조회
- 제목/저자 검색
- 독서 상태별 필터링
- 카테고리별 필터링
- 책 추가, 상세 조회, 수정, 삭제
- 전체/읽고 싶은 책/읽는 중/완독/중단 통계 표시
- 모바일 우선 반응형 카드 UI

## 폴더 구조

```text
booklog/
├─ backend/
│  ├─ server.js
│  ├─ seed.js
│  ├─ models/
│  │  └─ Book.js
│  ├─ routes/
│  │  └─ books.js
│  └─ package.json
│
├─ frontend/
│  ├─ index.html
│  ├─ vite.config.js
│  ├─ src/
│  │  ├─ main.jsx
│  │  ├─ App.jsx
│  │  ├─ App.css
│  │  └─ api/
│  │     └─ books.js
│  └─ package.json
│
└─ README.md
```

## 실행 방법

### 1. Docker로 MongoDB 실행

```bash
docker run -d --name mongodb-lab -p 27017:27017 mongo
```

이미 같은 이름의 컨테이너가 있다면 아래처럼 다시 시작할 수 있습니다.

```bash
docker start mongodb-lab
```

### 2. Backend 설치/실행

```bash
cd booklog/backend
npm install
npm run seed
npm run dev
```

백엔드는 기본적으로 `http://localhost:5000`에서 실행됩니다.

MongoDB 연결 주소 기본값은 아래와 같습니다.

```text
mongodb://localhost:27017/booklog
```

다른 주소를 사용하려면 `MONGO_URI` 환경변수를 설정하면 됩니다.

```bash
MONGO_URI=mongodb://localhost:27017/booklog npm run dev
```

### 3. Frontend 설치/실행

새 터미널을 열고 실행합니다.

```bash
cd booklog/frontend
npm install
npm run dev
```

프론트엔드는 기본적으로 `http://localhost:5173`에서 실행됩니다.

백엔드 주소를 바꾸고 싶다면 `VITE_API_BASE_URL` 환경변수를 사용할 수 있습니다.

```bash
VITE_API_BASE_URL=http://localhost:5000 npm run dev
```

## API 명세

### GET /books

책 목록을 조회합니다. query string으로 검색과 필터를 지원합니다.

Query parameters:

- `q`: 제목/저자 검색
- `status`: 독서 상태 필터 (`want`, `reading`, `done`, `paused`)
- `category`: 카테고리 필터

예시:

```bash
curl "http://localhost:5000/books?q=한강&status=want&category=국내%20소설"
```

### GET /books/:id

책 상세 정보를 조회합니다.

```bash
curl "http://localhost:5000/books/BOOK_ID"
```

### POST /books

책을 추가합니다.

```bash
curl -X POST "http://localhost:5000/books" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "새 책",
    "author": "홍길동",
    "category": "에세이",
    "status": "want",
    "rating": 0,
    "memo": "읽어보고 싶은 책",
    "startDate": "",
    "endDate": ""
  }'
```

### PUT /books/:id

책 정보를 수정합니다.

```bash
curl -X PUT "http://localhost:5000/books/BOOK_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "수정한 책 제목",
    "author": "홍길동",
    "category": "에세이",
    "status": "reading",
    "rating": 3.5,
    "memo": "읽는 중",
    "startDate": "2026-06-03",
    "endDate": ""
  }'
```

### DELETE /books/:id

책을 삭제합니다.

```bash
curl -X DELETE "http://localhost:5000/books/BOOK_ID"
```

## Book 모델

```js
{
  title: String,
  author: String,
  category: String,
  status: String,
  rating: Number,
  memo: String,
  startDate: String,
  endDate: String,
  createdAt: Date
}
```

`status` 값의 의미는 아래와 같습니다.

- `want`: 읽고 싶은 책
- `reading`: 읽는 중
- `done`: 완독
- `paused`: 중단

## 학습 포인트

- Vite + React 프로젝트 구조 이해
- React에서 `useState`, `useEffect`, `useMemo`로 화면 상태 관리
- fetch API로 REST API 호출
- Express Router로 API 계층 분리
- Mongoose Schema와 validation 사용
- MongoDB query string 검색/필터 구현
- seed script로 초기 데이터 구성
- Docker로 로컬 MongoDB 실행
- 백엔드와 프론트엔드 분리 실행 방식 이해
