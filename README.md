# DeskPick

노션의 DeskPick PRD v0.2와 첨부 목업을 바탕으로 만든 React 웹앱입니다.

## 실행

```sh
npm install
npm run dev
```

브라우저에서 `http://127.0.0.1:5173`을 엽니다. 처음 시작할 때는 빈 책상이며, ‘예시 배치로 시작해보기’로 목업 구성을 불러올 수 있습니다.

```sh
npm test
npm run build
npm run preview
```

## 구성

- React 19 · TypeScript · Vite · Tailwind CSS
- React Router 기반 홈, 제품 탐색, 제품 상세, 2D 책상 배치
- Supabase Auth와 기존 `public.desk_setups` 테이블 사용
- 목업의 따뜻한 색감과 SVG 일러스트 유지
- 마우스/터치 드래그, 방향키 이동, 숫자 좌표 입력
- 같은 제품 여러 개 배치, 총가격, 경계 초과 안내
- 이메일 가입/로그인/확인 메일 재전송/비밀번호 복구 및 재설정
- 회원당 구성 1개 저장, 덮어쓰기 확인, 미리보기/불러오기/삭제
- 편집 중인 구성은 sessionStorage에 보관하며 로그인/화면 이동/같은 탭 새로고침 시 유지

## 연결 정보

`.env.example`을 참고해 `.env.local`에 설정합니다. 현재 작업 폴더에는 사용자가 제공한 프로젝트 URL과 공개 키를 설정했습니다. 이 파일은 Git에서 제외됩니다.

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_PUBLIC_KEY
```

브라우저용 키는 publishable key입니다. secret/service_role 키를 `VITE_*` 변수에 넣지 마세요. 데이터 접근은 DB의 RLS 정책이 제한합니다.

이미 실행한 SQL을 다시 만들거나 변경할 필요는 없습니다. 앱은 다음 컬럼을 사용합니다.

```text
user_id, desk_width_mm, desk_depth_mm, items, created_at, updated_at
```

`items`의 각 항목은 `{ instance_id, product_id, x_mm, y_mm }`입니다. 좌표는 실제 mm 기준이며 생성일/수정일은 DB가 관리합니다. 기존 계정에 다른 형식의 구성이 있거나 알 수 없는 상품 ID가 있으면 로드 오류를 표시하고 현재 작업은 유지합니다.

## Supabase 대시보드에서 확인할 설정

Authentication → URL Configuration에서 로컬 개발용 Redirect URL을 등록합니다.

```text
http://127.0.0.1:5173/auth/callback
http://localhost:5173/auth/callback
```

개발 중 Site URL은 실제 사용하는 로컬 주소로, 공개 배포 후에는 공개 사이트 주소로 설정하세요. 배포 도메인의 `/auth/callback`도 Redirect URL에 추가해야 합니다. 이메일 확인과 비밀번호 복구는 이 주소로 돌아옵니다. 설정을 바꾸었다면 새 확인 메일을 사용하세요.

프로젝트의 이메일 가입 허용, 이메일 확인 정책, SMTP 발송 설정을 확인하세요. 공개 키만으로 대시보드 설정을 바꿀 수 없으므로 이 설정은 자동 변경하지 않았습니다.

## 회원 탈퇴

회원 탈퇴용 서버 코드는 `supabase/functions/delete-account/index.ts`에 있습니다. **아직 서버에 배포하지 않았습니다.** 로컬 앱의 계정 메뉴는 이 함수를 호출하며, 함수가 없거나 실패하면 계정 삭제 성공으로 표시하지 않습니다.

프로젝트 관리자 권한으로 다음 함수를 배포해야 실제 탈퇴가 동작합니다.

```sh
supabase functions deploy delete-account --project-ref YOUR_PROJECT_REF
```

함수는 Authorization 헤더의 사용자 토큰을 `auth.getUser(token)`으로 검증하고, 검증된 본인 ID만 삭제합니다. 요청 본문에서 삭제 대상 ID를 받지 않습니다. `verify_jwt = false`는 함수 내부에서 직접 토큰을 검증하기 위한 설정이며, 인증 없이 삭제를 허용하지 않습니다. 서버의 기본 `SUPABASE_URL`과 `SUPABASE_SERVICE_ROLE_KEY` 환경변수를 사용합니다. 회원 삭제 시 기존 외래키 `ON DELETE CASCADE`로 책상 구성도 삭제됩니다.

## 상품 데이터와 이미지

`src/data/products.json`에는 목업의 **예시 제품 12개, 6개 카테고리**가 들어 있습니다. 가격/설치 치수는 검증된 실상품 정보가 아닙니다. 예시임을 화면에 표시하고 판매처 버튼을 비활성화했습니다.

실제 제품으로 교체할 때 ID를 안정적으로 유지하고 이름·가격·설치 가로/깊이·추천 이유·상품 이미지 사용 권한을 확인하세요. `seller_url`에는 판매처의 해당 상품 상세 URL을, `seller_name`에는 판매처명을, `price_checked_at`에는 가격 확인 날짜를 넣습니다. 모니터는 정면 화면 치수가 아니라 받침대 등의 점유 면적을 사용합니다. 예시용 안내 문구도 실상품 데이터로 전환할 때 함께 수정해야 합니다.

- 제품 일러스트: 사용자가 제공한 노션 목업에서 가져온 SVG
- 홈 사진: 목업에서 사용한 [Unsplash 사진](https://images.unsplash.com/photo-1497215728101-856f4ea42174), `public/images/workspace.jpg`
- 글꼴: Google Fonts Noto Sans KR, 네트워크 실패 시 시스템 글꼴 사용
- 원본 목업: `reference/`에 보관하며 앱 빌드에 포함하지 않음

## 배포 준비

Cloudflare Pages에서 빌드 명령은 `npm run build`, 출력 폴더는 `dist`입니다. 빌드 환경변수에 위 두 `VITE_*` 값을 설정합니다. `public/_redirects`는 React Router의 직접 URL 접근을 처리합니다.

정식 공개 전 실제 상품 데이터, 회원별 RLS 교차 접근 테스트, 이메일 확인·복구, 탈퇴 함수 배포, 운영자/문의처를 포함한 개인정보 정책 확정이 필요합니다. 현재 `/privacy`는 개발 단계의 데이터 처리 안내입니다. 이 작업에서 사이트를 외부에 공개 배포하지 않았습니다.

## 검증 범위

- 타입 검사와 프로덕션 빌드
- 데이터 형식/경계/중복 배치/가격 계산 테스트
- 계정 변경 차단, 저장 요청 형식, 조회/삭제 사용자 범위, 서버 실패 처리 테스트(모의 SDK)
- 실제 Supabase의 공개 설정 API 연결 및 비회원 테이블 접근 차단 확인(읽기 전용)
- 실제 브라우저에서 제품 필터, 상세→배치, 중복 배치, 합계, 좌표 조정, 새로고침 유지, 로그인 안내 확인
- **미검증:** 실제 회원 두 계정으로 저장·불러오기·RLS 교차 차단, 메일 수신/복구, 탈퇴 함수 실행

읽기 전용 연결 점검은 `node scripts/check-connection.mjs`로 다시 실행할 수 있습니다. 이 명령은 사용자를 만들거나 이메일을 보내거나 DB를 수정하지 않습니다.

## 기준 문서

- [PRD](https://app.notion.com/p/3ffa23689f7d80b38405f6d7c1fe42e8)
- [목업](https://app.notion.com/p/400a23689f7d81af88c7f341bc4342ce)
- [Supabase React 연결](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)
- [Supabase Edge Functions 인증](https://supabase.com/docs/guides/functions/auth)
