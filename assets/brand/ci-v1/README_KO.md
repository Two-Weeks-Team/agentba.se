# AgentBase CI Kit / 브랜드 아이덴티티 에셋

**Version:** 1.0 (2026-10-12)
**Brand spelling:** `AgentBase` (A와 B만 대문자)
**Approved symbol:** 두 눈을 가진 A 캐릭터와 뒤쪽 B 동료가 결합된 심벌.

## 중요
이 심벌은 이 대화에서 명함 제작에 승인된 **래스터 심벌(431 × 319)**에서
직접 윤곽선을 벡터화한 복원본입니다. 등록된 원본 `.ai` 마스터가 제공된 것은 아니므로
공식 원도안과의 100% 수학적 일치까지 보증하지는 않습니다. **새 캐릭터를 디자인하지 않았습니다.**
CI 패키지의 SVG는 심벌·텍스트 모두 경로(path)로 만들어져 별도 폰트 설치 없이 사용 가능합니다.

## 기본 색상
- Primary Ink: `#111111` (RGB 17, 17, 17)
- White: `#FFFFFF` (RGB 255, 255, 255)
- Muted text: `#707477` (보조용)
- Surface: `#F5F5F3` (보조용)

## 파일 구조
- `01_Master_Vector`: 모든 마스터 SVG (투명 배경, 블랙/화이트). 변경 없이 사용하세요.
- `02_Logos_PNG`: 일반 이미지용 투명 PNG 로고, 확대 마스터 포함.
- `03_Favicon`: SVG favicon, ICO 다중 해상도, PNG 16~128px.
- `04_App_PWA`: 앱 아이콘 1024px, Apple Touch 180px, 192/512 PWA, maskable, manifest.
- `05_Social`: 아바타(400/512), OG 이미지(1200×630) 다크·라이트.
- `06_Brand_Guide`: 한글 CI 가이드 PDF와 에셋 시트 PNG.
- `07_Web_Starter`: HTML/CSS 적용 예제.

## 빠른 적용
웹 프로젝트에서 해당 파일들을 `/assets/agentbase/` 등에 복사한 다음:

```html
<link rel="icon" href="/assets/agentbase/03_Favicon/favicon.svg" type="image/svg+xml">
<link rel="alternate icon" href="/assets/agentbase/03_Favicon/favicon.ico">
<link rel="apple-touch-icon" href="/assets/agentbase/04_App_PWA/apple-touch-icon-180.png">
<link rel="manifest" href="/assets/agentbase/04_App_PWA/site.webmanifest">
<meta name="theme-color" content="#111111">
<meta property="og:image" content="https://agentba.se/assets/agentbase/05_Social/AgentBase_OG_Dark_1200x630.png">
<img src="/assets/agentbase/01_Master_Vector/AgentBase_Horizontal_Black.svg" alt="AgentBase">
```

주의: PWA `site.webmanifest`에 명시된 앱 아이콘 경로는 manifest 파일을 기준으로 **상대 경로**입니다.
CDN 구조에 따라 아이콘 URL을 조정하세요. 웹 URL은 배포 예시이며 실제 경로는 배포 환경에 맞춰야 합니다.

## Logo rules
1. 눈 두 개 및 A/B 사이의 틈을 삭제하지 마세요.
2. 심벌 비율을 변경하거나 회전, 그림자·그라디언트를 추가하지 마세요.
3. 검정 로고는 밝은 배경, 흰 로고는 어두운 배경에 사용하세요.
4. 보호 여백은 최소 눈의 지름 하나. 인쇄용 심벌은 8mm 이상을 권장합니다.
5. 공식 워드마크는 `AgentBase`이며 SVG 내 글자는 path입니다.

## 외부 폰트
워드마크 생성시 Inter Display Bold를 참조했고, 본문 타이포그래피는 Inter Regular,
한국어에는 Noto Sans KR 또는 NanumBarunGothic을 권장합니다. **폰트 파일은 포함하지 않습니다.**

## 추가 확인
최종 인쇄·등록 상표 전에는 법률적 상표 중복 조사와 인쇄 테스트를 별도 진행하세요.
