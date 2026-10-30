# DeskPick

**구매 전에 내 책상에 배치해 보는 데스크테리어 웹앱.**

제품 사진과 치수만으로 공간을 가늠하기 어려운 문제를 해결하기 위해, 실제 mm 단위의 책상 크기와 제품 설치 면적을 같은 축척으로 비교합니다. 제품을 탐색하고 2D 책상에 배치한 뒤 나만의 구성을 계정에 저장할 수 있습니다.

[서비스 바로가기](https://deskpick.pages.dev) · [사용 가이드](https://deskpick.pages.dev/guide)

개인 포트폴리오 프로젝트이며, 상품 구매와 결제는 외부 판매처에서 진행합니다.

## 주요 기능

- **제품 탐색:** 카테고리·검색·정렬, 제품 상세 정보, 공식 판매처 링크와 확인일 기준 가격
- **2D 책상 배치:** 책상 가로·깊이 설정, 동일 제품 여러 개 추가, 마우스·터치 이동, 방향키 이동 및 좌표 입력
- **편집 도구:** 90° 회전, 실행 취소·다시 실행, 가운데 정렬, 책상 경계 초과 안내, 예상 가격 합계
- **내 책상 저장:** 회원당 구성 1개 저장, 덮어쓰기 확인, 미리보기·불러오기·삭제, 실패 시 재시도
- **회원 기능:** 이메일 가입·인증·로그인, 인증 메일 재발송, 비밀번호 복구·재설정, 회원 탈퇴
- **반응형 화면:** 데스크톱·모바일 레이아웃, 회원가입 필수 약관 동의, 이용약관·개인정보 처리방침

## 주요 화면

| 화면 | 경로 | 역할 |
| --- | --- | --- |
| 홈 | `/` | 서비스 소개와 제품 탐색 진입 |
| 제품 목록 | `/products` | 검색·분류·정렬 |
| 제품 상세 | `/products/:id` | 치수·가격·출처 확인 및 배치 추가 |
| 책상 꾸미기 | `/studio` | 배치 편집과 계정 저장 |
| 마이페이지 | `/account` | 저장한 책상 및 계정 관리 |
| 로그인·회원가입 | `/login`, `/signup` | 이메일 인증 기반 계정 접근 |
| 비밀번호 찾기 | `/forgot-password` | 재설정 메일 요청 |
| 인증 콜백 | `/auth/callback` | 인증 링크 처리 및 비밀번호 재설정 |
| 사용 가이드 | `/guide` | 배치·저장 방법 안내 |
| 정책 | `/terms`, `/privacy` | 이용 조건과 개인정보 처리 안내 |

이메일 확인 안내, 저장·삭제 확인, 빈 상태와 오류 안내는 관련 화면 안에서 표시합니다. 존재하지 않는 경로에는 404 화면을 제공합니다.

## 기술 구성

| 영역 | 사용 기술 |
| --- | --- |
| 화면 | React 19, TypeScript, React Router 7 |
| 빌드·스타일 | Vite 7, CSS, Tailwind CSS 4, Lucide 아이콘 |
| 인증·데이터 | Supabase Auth, PostgreSQL, RLS |
| 서버 기능 | Supabase Edge Function — 회원 탈퇴 |
| 테스트 | Vitest |
| 배포 | Cloudflare Pages, GitHub main 연동 |

### 구현에서 고려한 점

- **화면 좌표와 실제 치수 분리:** mm 단위로 데이터를 저장하고 화면 크기에 맞춰 렌더링합니다. 90°·270° 회전 시 가로와 깊이를 바꿔 경계를 판정합니다.
- **임시 편집과 계정 저장 분리:** 현재 배치는 `sessionStorage`로 같은 탭의 새로고침에 유지합니다. 계정 저장은 별도 요청으로 처리하며, 실패해도 현재 편집 내용은 유지합니다.
- **의미 있는 실행 취소:** 드래그 중의 여러 변경을 한 번의 편집으로 묶고, 최대 50단계의 이전 상태를 보관합니다. 편집 이력은 새로고침 후 복원하지 않습니다.
- **회원별 접근 제한:** 데이터 요청에 사용자 범위를 적용하고 DB의 RLS 정책으로 본인 데이터만 접근하도록 구성합니다. 계정이 바뀐 뒤 이전 요청의 결과를 잘못 표시하지 않도록 처리합니다.
- **서버에서 회원 탈퇴 검증:** Edge Function이 사용자 토큰을 검증한 뒤 본인 계정만 삭제합니다. 관리자 키는 브라우저에 포함하지 않습니다.

## 로컬 실행

```sh
npm ci
cp .env.example .env.local
```

`.env.local`에 본인의 Supabase 프로젝트 값을 입력합니다.

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_PUBLIC_KEY
```

```sh
npm run dev
```

개발 서버: `http://127.0.0.1:5173`

```sh
npm test          # 단위 테스트
npm run build    # 타입 검사 및 프로덕션 빌드
npm run preview  # 빌드 결과 로컬 확인
```

`VITE_*` 값은 브라우저에 포함됩니다. secret 또는 service_role 키를 넣지 마세요. `.env.local`은 Git에서 제외됩니다.

### Supabase 설정

이 저장소는 기존 `public.desk_setups` 테이블에 연결하며, DB 생성용 마이그레이션은 포함하지 않습니다. 새 프로젝트에서는 테이블과 정책을 별도로 준비해야 합니다.

- 컬럼: `user_id`, `desk_width_mm`, `desk_depth_mm`, `items`, `created_at`, `updated_at`
- `user_id`: 회원당 1개 구성의 기본 키, `auth.users` 삭제 시 cascade
- `items`: `{ instance_id, product_id, x_mm, y_mm, rotation? }` 배열. 회전은 0·90·180·270도이며 생략 시 0도
- 본인 행만 조회·추가·수정·삭제할 수 있는 RLS 정책과 비회원 접근 제한 필요
- 생성·수정 시각은 DB에서 관리

Authentication → URL Configuration에 환경별 콜백을 등록합니다.

```text
http://127.0.0.1:5173/auth/callback
http://localhost:5173/auth/callback
https://YOUR_DEPLOYMENT_DOMAIN/auth/callback
```

Site URL은 배포 도메인으로 설정하고, 이메일 가입·인증 및 메일 발송 설정을 확인합니다.

회원 탈퇴 함수를 새 Supabase 프로젝트에 설치하려면:

```sh
supabase functions deploy delete-account --project-ref YOUR_PROJECT_REF
```

`supabase/config.toml`의 `verify_jwt = false`는 함수 내부에서 `auth.getUser(token)`으로 직접 인증하기 위한 설정입니다. 요청 본문으로 삭제 대상 ID를 받지 않습니다. 함수는 서버의 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`를 사용합니다.

## 배포

Cloudflare Pages 설정:

- 빌드 명령: `npm run build`
- 출력 폴더: `dist`
- 환경변수: 위 두 `VITE_*` 값
- 운영 브랜치: `main`

연결된 저장소의 main에 푸시하면 빌드와 배포가 실행됩니다. `public/_redirects`는 하위 경로 직접 접근을 처리합니다. Supabase 함수 배포는 프런트엔드 배포와 별도입니다.

## 상품과 이미지

현재 상품 데이터는 `src/data/products.json`의 실제 상품 15개입니다. 과거 예시 상품은 기존 저장 구성 호환을 위해 별도로 유지합니다.

- [가격·치수 확인 기록](docs/product-sources.md)
- [제품 이미지 출처 기록](docs/product-image-sources.json)
- 제품 목록·상세에는 사진, 시뮬레이터에는 설치 면적을 나타내는 도형 사용
- 홈 이미지: `public/images/workspace.jpg`의 Unsplash 사진
- 원본 참고 자료: `reference/` — 앱 빌드에 포함하지 않음

가격·재고는 실시간 정보가 아닙니다. 높이, 하중, 케이블 여유 및 제품 간 겹침 등 모든 설치 조건을 계산하지 않습니다. 제품 사진의 출처 기록은 재사용 허가를 의미하지 않으며, 제3자 이미지에 대한 사용 권한 확인은 남아 있습니다.

## 검증과 남은 확인

Vitest는 배치 데이터·가격 계산·회전·편집 이력, 모의 SDK를 통한 저장 요청과 사용자 범위, 회원 탈퇴 요청 인증·실패 처리를 검증합니다.

2026-10-30 배포 화면에서 확인:

- 이용약관 직접 접근 및 회원가입 약관 링크
- 미동의 체크박스의 필수 입력 검증 상태와 정렬
- 390px 화면의 가로 넘침 여부
- 예시 배치 추가·회전 및 새로고침 후 배치 유지
- 비회원 저장 요청 시 로그인 안내

실제 휴대폰의 터치 조작과 Safari, 이메일 수신부터 비밀번호 재설정까지의 전체 흐름, 두 회원 계정 간 데이터 접근 차단은 별도 점검 대상입니다. 모의 SDK 테스트나 브라우저 크기 변경을 실제 기기·운영 DB 검증으로 간주하지 않습니다.

## 폴더 구조

```text
src/
  pages/          화면별 컴포넌트
  components/     인증·저장·캔버스·상품 등 공통 UI
  lib/            배치 계산, 편집 이력, Supabase 연결과 테스트
  data/           상품 및 이전 상품 데이터
  context.tsx     인증·편집 상태 관리
supabase/functions/delete-account/  회원 탈퇴 함수와 테스트
docs/             상품 출처와 참고 화면
public/           이미지와 배포 리다이렉트 설정
```
