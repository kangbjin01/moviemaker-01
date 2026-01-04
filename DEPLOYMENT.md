# MovieMaker 배포 가이드

## 로컬 개발 환경

### 1. 의존성 설치
```bash
pnpm install
```

### 2. 환경 변수 설정
`.env` 파일 생성:
```env
DATABASE_URL=file:./dev.db
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_DEPLOYMENT_URL=http://localhost:3000
```

### 3. 데이터베이스 설정 (SQLite)
```bash
npx prisma migrate dev
```

### 4. 개발 서버 실행
```bash
pnpm dev
```

---

## Coolify 배포 (프로덕션)

### 1. PostgreSQL 스키마로 변경
배포 전에 Prisma 스키마를 PostgreSQL용으로 변경해야 합니다:

```bash
# 프로덕션 스키마로 복사
cp prisma/schema.production.prisma prisma/schema.prisma
```

또는 Dockerfile에서 자동으로 처리하도록 설정:

```dockerfile
# Dockerfile 빌드 단계에서 추가
RUN cp prisma/schema.production.prisma prisma/schema.prisma
```

### 2. Coolify 환경 변수 설정
Coolify 대시보드에서 다음 환경 변수를 설정하세요:

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL 연결 URL | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | 인증 시크릿 키 (랜덤 생성) | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | 앱 URL | `https://moviemaker.example.com` |
| `NEXT_PUBLIC_DEPLOYMENT_URL` | 공개 URL | `https://moviemaker.example.com` |

### 3. 배포 방법

#### Option A: Git 연동 (권장)
1. GitHub/GitLab 저장소에 코드 푸시
2. Coolify에서 Git 저장소 연결
3. 자동 배포 설정

#### Option B: Docker Compose
```bash
# 프로덕션 스키마로 변경
cp prisma/schema.production.prisma prisma/schema.prisma

# Docker Compose로 실행
docker-compose up -d
```

### 4. 데이터베이스 마이그레이션
배포 후 마이그레이션 실행:

```bash
# Coolify 콘솔에서 또는 docker exec로
npx prisma migrate deploy
```

---

## 환경별 데이터베이스

| 환경 | 데이터베이스 | 스키마 파일 |
|------|-------------|------------|
| 개발 (로컬) | SQLite | `schema.prisma` |
| 프로덕션 | PostgreSQL | `schema.production.prisma` |

---

## 트러블슈팅

### Prisma 클라이언트 오류
```bash
npx prisma generate
```

### 마이그레이션 충돌
```bash
# 개발 환경에서 DB 리셋
npx prisma migrate reset
```

### Docker 빌드 오류
```bash
# 캐시 없이 빌드
docker-compose build --no-cache
```

