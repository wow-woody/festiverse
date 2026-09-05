# 설정 가이드

## 1. Supabase 프로젝트 만들기
1. https://supabase.com 에서 무료 계정 생성 후 새 프로젝트 생성.
2. 프로젝트 대시보드 좌측 메뉴 **SQL Editor** 로 이동, [supabase/schema.sql](supabase/schema.sql) 파일 내용을 전체 복사해서 붙여넣고 실행.
3. 좌측 메뉴 **Project Settings > API** 에서 `Project URL`과 `anon public` 키를 복사해둠.

## 2. 관리자 로그인 계정 만들기
1. Supabase 대시보드 **Authentication > Users** 로 이동.
2. "Add user"로 본인 이메일/비밀번호를 admin 계정으로 하나 생성 (Auto Confirm User 체크).
3. 이 계정으로만 관리자 웹에 로그인해서 데이터를 올리고 지울 수 있음.

## 3. 모바일 앱 연결
1. `mobile/.env.example`을 복사해서 `mobile/.env` 생성.
2. 1번에서 복사한 URL/anon key를 채워넣음.
3. 실행:
   ```
   cd mobile
   npm run start
   ```
   Expo Go 앱(App Store/Play Store)으로 QR코드를 스캔해서 실제 폰에서 테스트.

## 4. 관리자 웹 연결
1. `admin/config.example.js`을 복사해서 `admin/config.js` 생성.
2. 1번에서 복사한 URL/anon key를 채워넣음.
3. `admin/index.html`을 더블클릭해서 브라우저로 열거나, 로컬 서버로 실행 (예: VSCode Live Server 확장).
4. 2번에서 만든 계정으로 로그인 → 축제/공연 추가·수정·삭제 테스트.

## 5. 배포 (나중에)
- 관리자 웹: Vercel/Netlify에 `admin/` 폴더 그대로 올리면 끝 (빌드 과정 없음).
- 모바일 앱: `npx eas build` (EAS 계정 필요) → 앱스토어/플레이스토어 제출은 `npx eas submit`.

## 데이터 구조
- `festivals`: 축제 (이름, 장소, 시작일, 종료일, 커버 이미지)
- `performances`: 공연 (소속 축제, 아티스트, 무대, 시작/종료 시각)

앱은 `festivals`와 `performances`를 **읽기만** 하고, 관리자 웹에서 로그인한 사람만 **쓰기**가 가능하도록 RLS(행 단위 보안)가 설정되어 있음.
