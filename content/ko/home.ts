import type { HomeContent } from "../en/home";

/** A missing or misspelled key here is a compile error, not a silent fallback. */
export const home: HomeContent = {
  meta: {
    title: "AgentBase — 이 회사는 에이전트로 돌아갑니다",
    description:
      "AgentBase는 일상 운영을 소프트웨어 에이전트가 수행하는 제품을 만들고 운영합니다. 에이전트 22개, 6단계 워크플로, 7개의 승인 게이트, 그리고 끝까지 완주한 캠페인 한 건.",
    ogAlt: "AgentBase — 세계 지도 위의 에이전트 22개",
  },

  nav: {
    skip: "본문으로 건너뛰기",
    repo: "GitHub",
    localeLabel: "English",
    localeHref: "/",
  },

  hero: {
    eyebrow: "AgentBase — 서울",
    h1: "이 회사는 에이전트로 돌아갑니다.",
    sub: "일상 운영을 소프트웨어 에이전트가 수행하는 제품을 만들고 운영합니다. 아래는 그들이 무엇을 하고, 이미 무엇을 해냈는지입니다.",
    stats: [
      { value: "22", label: "플릿의 에이전트" },
      { value: "6", label: "단계 워크플로" },
      { value: "7", label: "승인 게이트" },
    ],
    swarmLegend:
      "사각형 하나가 캠페인 업무 한 단위입니다. 커서를 움직이면 흩어진 일이 대열을 이룹니다. 색 구성은 플릿을 그대로 반영합니다 — domain 16, meta 3, watchdog 3.",
    swarmHint: "이동 · 누르기 · 클릭",
  },

  fleet: {
    eyebrow: "01 — 플릿",
    h2: "이름이 붙은 스물두 개의 에이전트.",
    lede: "자유롭게 도는 루프가 아닙니다. 각각은 판단이 필요한 하위 작업을 위해 워크플로가 호출하는 함수입니다. 시스템 프롬프트, 선별된 도구 집합, 출력 계약, 비용 상한, 그리고 정의된 에스컬레이션 조건을 갖습니다.",
    groups: {
      domain: "Domain",
      meta: "Meta",
      watchdog: "Watchdog",
    },
    groupNotes: {
      domain: "캠페인 업무를 수행합니다.",
      meta: "수행하는 쪽을 배분하고, 채점하고, 조정합니다.",
      watchdog: "이탈과 비용, 신뢰 경계를 감시합니다.",
    },
  },

  ledger: {
    eyebrow: "02 — 대체 기록",
    h2: "사람이 앉아 있던 여덟 개의 자리.",
    lede: "왼쪽 열은 이 웹사이트가 만들어지기 전에 작성된 내부 에이전트 명세에서 그대로 인용했습니다. 더 그럴듯하게 다듬지 않았습니다. 실제 누군가의 업무처럼 읽히는 이유는, 실제로 그랬기 때문입니다.",
    wasLabel: "v1 · 사람",
    nowLabel: "v2 · 에이전트",
    footnote: "…그리고 사람 전임자가 아예 없던 일을 하는 에이전트 14개가 더 있습니다.",
    sourceNote: "social-seeding-v2의 에이전트 명세에서 인용.",
  },

  workflow: {
    eyebrow: "03 — 워크플로",
    h2: "자율성은 성격이 아니라 설정값입니다.",
    lede: "되돌릴 수 없는 모든 행동은 이름이 붙은 게이트 뒤에 있습니다. 게이트는 기본값이 켜짐입니다. 운영자가 워크스페이스 전체를 세 단계 사이에서 옮기고, 사람 없이 무엇이 진행될지는 모델의 기분이 아니라 그 설정이 결정합니다.",
    stagesTitle: "6단계",
    gatesTitle: "7개 게이트",
    levelsTitle: "3단계 자율성",
    hitl: "필수",
    defaultTag: "기본값",
  },

  pilot: {
    eyebrow: "04 — 실제로 돌았습니다",
    h2: "팀이 대개 포기하는 지점을 넘어간 캠페인 하나.",
    lede: "Wooliliwoo — 멕시코 시장의 K-뷰티. 플릿이 소싱하고, 쓰고, 보내고, 답장을 처리하고, 배송을 잡았습니다. 그리고 보통 버려지는 부분을 했습니다. 다시 돌아가 게시물을 찾아내고, 브리프와 대조해 검증하고, 리포트를 만들었습니다.",
    funnelTitle: "퍼널",
    stats: {
      verified: "검증된 포스팅",
      verifiedNote: "목표 10건 대비",
      views: "조회수",
      engagement: "참여율",
      unapproved: "승인 없이 나간 발신",
    },
  },

  economics: {
    eyebrow: "05 — 운영 레이어",
    h2: "$2,400·45시간이 $7.40·2시간이 되었습니다.",
    lede: "동일한 규모의 캠페인, 크리에이터 20명 기준입니다. 에이전시 열은 크리에이터 지출에 대한 관리 수수료와 수작업 운영 시간입니다. 우리 열은 계측된 에이전트·인프라 비용과 사람이 게이트에서 쓰는 시간입니다.",
    hoursLabel: "사람 투입 시간",
    costLabel: "운영 비용",
    excludedLabel: "이 비교에서 제외됨",
  },

  company: {
    eyebrow: "06 — 회사 자신",
    h2: "같은 규칙을 안쪽에도 적용합니다.",
    lede: "main에 병합하는 것이 곧 릴리스입니다. 사람이 배포 명령을 실행하지 않습니다. 에이전트 서비스 배포는 트래픽 0%의 카나리로 올라가고, 승격은 사람이 내리는 의도적 결정으로 남아 있습니다. 제품이 세워진 것과 같은 모양의 거버넌스입니다.",
    gatesTitle: "모든 풀 리퀘스트에서 도는 게이트",
    testsTitle: "병합을 막는 테스트 스위트",
    siteNote:
      "이 웹사이트도 그 루프 안에 있습니다. 이 페이지의 수치는 공개 리포지터리에 커밋된 JSON 스냅샷이고 서버에서 렌더링됩니다. 페이지 로드 이후에 불러오는 것은 없습니다.",
  },

  geo: {
    eyebrow: "07 — 활동 지역",
    h2: "캠페인 업무에 현지 사무실은 필요하지 않습니다.",
    operatingTitle: "운영",
    marketTitle: "시장 커버리지",
    marketNote: "도달 가능한 TikTok 사용자 규모 순.",
    hqTag: "본사",
  },

  footer: {
    wordmark: "agentba.se",
    line: "제품은 각자의 사이트에서 보여줍니다.",
    product: "socialseed.ing",
    repoLabel: "소스",
    contactLabel: "연락",
    machineLabel: "에이전트용",
    snapshot: "이 페이지의 수치는 다음 날짜의 스냅샷에서 왔습니다",
    rights: "AgentBase. 서울.",
  },
};
