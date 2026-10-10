import { home as en, type HomeContent } from "../en/home";

/** A missing or misspelled key here is a compile error, not a silent fallback. */
export const home: HomeContent = {
  meta: {
    title: "AgentBase — 이 회사는 에이전트로 돌아갑니다",
    description: en.meta.description,
    ogTitle: en.meta.ogTitle,
    ogAlt: en.meta.ogAlt,
  },

  nav: {
    skip: "본문으로 건너뛰기",
    localeLabel: "English",
    localeHref: "/",
    contact: "문의",
  },

  hero: {
    eyebrow: en.hero.eyebrow,
    h1: "이 회사는 에이전트로 돌아갑니다.",
    sub: en.hero.sub,
    stats: [
      { value: "22", label: en.hero.stats[0]!.label },
      { value: "2", label: "사람" },
      { value: "7", label: "승인 게이트" },
    ],
    swarmLegend:
      "사각형 하나가 운영 업무 한 단위입니다. 커서를 움직이면 흩어진 일이 대열을 이룹니다. 색 구성은 플릿을 그대로 반영합니다 — domain 16, meta 3, watchdog 3.",
    swarmHint: "이동 · 누르기 · 클릭",
  },

  // Company verification copy stays in English on both pages.
  about: en.about,

  fleet: {
    eyebrow: "01 — 플릿",
    h2: en.fleet.h2,
    lede: "자유롭게 도는 루프가 아닙니다. 각각은 판단이 필요한 하위 작업을 위해 워크플로가 호출하는 함수입니다. 시스템 프롬프트, 선별된 도구 집합, 출력 계약, 비용 상한, 그리고 정의된 에스컬레이션 조건을 갖습니다.",
    groups: {
      domain: "Domain",
      meta: "Meta",
      watchdog: "Watchdog",
    },
    groupNotes: {
      domain: "운영 업무를 수행합니다.",
      meta: "수행하는 쪽을 배분하고, 채점하고, 조정합니다.",
      watchdog: "이탈과 비용, 신뢰 경계를 감시합니다.",
    },
  },

  ledger: {
    eyebrow: "02 — 대체 기록",
    h2: en.ledger.h2,
    lede: "왼쪽 열은 이 웹사이트가 만들어지기 전에 작성된 내부 에이전트 명세에서 그대로 인용했습니다. 더 그럴듯하게 다듬지 않았습니다. 실제 누군가의 업무처럼 읽히는 이유는, 실제로 그랬기 때문입니다 — 우리 업무였습니다.",
    wasLabel: "이전 · 사람",
    nowLabel: "이후 · 에이전트",
    footnote: en.ledger.footnote,
    sourceNote: "우리 에이전트 명세에서 인용.",
  },

  workflow: {
    eyebrow: "03 — 업무가 흐르는 방식",
    h2: "자율성은 성격이 아니라 설정값입니다.",
    lede: "업무는 이름이 붙은 단계를 지나고, 되돌릴 수 없는 모든 행동은 이름이 붙은 게이트 뒤에 있습니다. 게이트는 기본값이 켜짐입니다. 운영자가 워크스페이스 전체를 세 단계 사이에서 옮기고, 사람 없이 무엇이 진행될지는 모델의 기분이 아니라 그 설정이 결정합니다.",
    stagesTitle: "단계",
    gatesTitle: "게이트",
    levelsTitle: "자율성 단계",
    hitl: "필수",
    defaultTag: "기본값",
  },

  economics: {
    eyebrow: "04 — 운영 레이어",
    h2: en.economics.h2,
    lede: en.economics.lede,
    hoursLabel: "사람 투입 시간",
    costLabel: "운영 비용",
    excludedLabel: "이 비교에서 제외됨",
    cta: "이런 모양의 업무가 있다면 — 한 줄 보내기 →",
  },

  staffing: {
    eyebrow: "05 — 채용 대신 하는 일",
    h2: "우린 사람을 뽑지 않습니다. 에이전트를 개발합니다.",
    lede: "이건 인력이 어디로 가는지에 대한 이야기이지, 누가 책임지는지에 대한 이야기가 아닙니다. 두 사람이 이 회사를 운영하고, 사람이 결정하는 것과 플릿이 실행하는 것 사이의 경계는 문서로 적혀 있고 버전 관리되며 코드로 강제됩니다.",
    humanTitle: "사람에게 남는 것",
    human: [
      "되돌릴 수 없는 모든 것 — 예산 집행, 계약 체결, 게시물 최종 승인.",
      "자율성 단계를 정하고, 옮기는 일.",
      "다음에 무엇을 만들지 결정하는 일.",
      "이 페이지의 모든 내용. 아래에 이름 두 개가 있습니다.",
    ],
    agentTitle: "플릿이 맡는 것",
    agent: [
      "이 규모의 회사라면 사람을 뽑았을 운영 직무.",
      "스케줄에 따라 도는 일, 그리고 두 번 하고 싶지 않은 일.",
      "자기 출력에 대한 검사 — 채점, 비용, 이탈, 신뢰 경계.",
    ],
    requiredNote: "사람이 절대 위임할 수 없는 게이트: ",
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

  products: {
    eyebrow: "07 — 우리가 운영하는 제품",
    h2: "플릿은 제품이 아닙니다. 제품이 운영되는 방식입니다.",
    lede: "각 제품은 자기 사이트에서 자기 이야기를 합니다.",
  },

  lab: {
    eyebrow: "08 — 랩",
    h2: "두 사람이 그 밖에 출하한 것들.",
    lede: en.lab.lede,
    mentionsLabel: "작업대 위에 몇 개 더",
  },

  record: {
    eyebrow: "09 — 출전 기록",
    h2: "출전 기록 전부, 결과는 떨어진 그대로.",
    lede: en.record.lede,
    entriesLabel: "출전",
    results: {
      won: "1위",
      hm: "Honorable Mention",
      selected: "프로그램 선정",
      entered: "미수상",
      pending: en.record.results.pending,
    },
    pendingNote:
      en.record.pendingNote,
  },

  services: {
    eyebrow: "10 — 맡길 수 있는 것",
    h2: "플릿을 당신 업무에 붙이는 세 가지.",
    lede: "성과에 대한 약속이 아니라 계약 모양의 선택지입니다. 각각이 이 페이지에서 자기를 뒷받침하는 부분을 가리킵니다.",
    items: [
      {
        id: "run",
        name: "Run",
        body: en.services.items[0]!.body,
      },
      {
        id: "build",
        name: "Build",
        body: "우리 자리들을 대체한 방식 그대로, 당신 회사의 운영 자리 하나를 대체합니다: 이름 붙은 로스터, 출력 계약, 비용 상한, 기본값이 켜짐인 게이트. 01–06번이 명세입니다.",
      },
      {
        id: "prove",
        name: "Prove",
        body: "2주 안에 돌아가는 시스템: 고정된 범위, 고정된 2주, 끝에는 실제로 운영할 수 있는 물건. 출전 기록이 쌓인 그 리듬입니다 — 09번이 근거입니다.",
      },
    ],
    cta: "한 줄 보내기 →",
  },

  geo: {
    eyebrow: "11 — 활동 지역",
    h2: "운영 업무에 현지 사무실은 필요하지 않습니다.",
    operatingTitle: "운영",
    hqTag: "본사",
  },

  intake: {
    eyebrow: "12 — 인테이크",
    h2: "한 줄이면 충분합니다.",
    lede: "플릿에는 intake라는 에이전트가 있고, 한 줄을 유효한 브리프로 만드는 게 그 에이전트의 일입니다. 당신 업무에 대한 한 줄을 보내 주세요 — 일정대로 도는 일, 아무도 두 번 하기 싫은 일. 모든 한 줄은 두 창업자가 직접 읽습니다.",
    emailLabel: "회신 받을 주소",
    emailPlaceholder: "you@company.com",
    lineLabel: "한 줄",
    linePlaceholder: "매주 같은 리포트를 만드는 데 사람이 이틀을 씁니다.",
    submit: "한 줄 보내기",
    sent: "받았습니다. 사람이 답합니다.",
    error: "전송되지 않았습니다. 메일로 보내 주세요:",
    fallback: en.intake.fallback,
  },

  partners: {
    grants: "그랜트 & 프로그램",
    builtWith: "기술 스택",
  },

  footer: {
    wordmark: "agentba.se",
    line: "운영 업무를 소프트웨어 에이전트가 수행하는 회사. USA.",
    snapshot: "이 페이지의 수치는 커밋된 스냅샷에서 왔고, 가장 최근 것은",
    rights: en.footer.rights,
  },
};
