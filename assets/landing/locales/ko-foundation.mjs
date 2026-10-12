const copy = {
  'Facts': '사실', 'Concrete evidence': '구체적인 근거', 'Cite facts and supporting material.': '사실과 이를 뒷받침하는 자료를 제시합니다.',
  'Intuition': '직관', 'An intuitive read': '직관적인 해석', 'Consider the emotional and intuitive response.': '감정적이고 직관적인 반응을 살펴봅니다.',
  'Upside': '가능성', 'Potential value': '잠재적 가치', 'Look for value and the optimistic upside.': '가치와 긍정적인 가능성을 찾습니다.',
  'Risks': '위험', 'A critical review': '비판적인 검토', 'Inspect weaknesses, risks and missing rigor.': '약점, 위험, 엄밀하지 못한 부분을 검토합니다.',
  'Ideas': '아이디어', 'Other possibilities': '다른 가능성', 'Propose alternatives and creative angles.': '대안과 창의적인 관점을 제안합니다.',
  'Synthesis': '종합', 'A balanced view': '균형 잡힌 시각', 'Bring the perspectives into a balanced judgment.': '여러 관점을 종합하여 균형 잡힌 판단을 내립니다.',
  'ingest → plan': '자료 수집 → 계획', 'Start with something to inspect.': '검토할 자료에서 시작합니다.',
  'Input': '입력', 'Output': '출력', 'Submission + evaluation rubric': '제출물 + 평가 기준', 'Evidence references + review criteria': '근거 자료 + 검토 기준',
  'assessments → audit': '평가 → 감사', 'Check the judgment itself.': '판단 자체를 점검합니다.', 'Evidence thresholds + calibration': '근거 기준 + 판단 보정',
  'Bounded corrections when supported': '근거가 있을 때 범위 내에서 수정', 'audit → report': '감사 → 보고',
  'Keep the reasons with the result.': '결과에 이유를 함께 남깁니다.', 'Audited assessments': '감사를 거친 평가', 'Report + inspectable decision trace': '보고서 + 확인 가능한 판단 기록',
  'Glasshat interactive architecture': 'Glasshat 인터랙티브 구조도', 'Interactive architecture · evaluation prototype': '인터랙티브 구조도 · 평가 프로토타입',
  'Select a review stage or specialist perspective': '검토 단계 또는 전문 관점 선택', 'Material + rubric': '자료 + 평가 기준', 'Parallel specialist perspectives': '병렬로 검토하는 전문 관점',
  'Audit': '감사', 'Report': '보고', 'Review + correct': '검토 + 수정', 'Result + reasons': '결과 + 근거',
  'Illustrated architecture trace': '구조 흐름 예시', 'Illustrated trace': '흐름 예시', 'Select any node to inspect it.': '노드를 선택해 내용을 확인하세요.',
  'Follow the review': '검토 흐름 따라가기', 'Follow the review →': '다음 검토 단계 →', 'Review again ↺': '처음부터 다시 검토 ↺',
  'Assessment + supporting rationale': '평가 + 판단 근거',
  'Editorial': '에디토리얼', 'Terminal': '터미널', 'Playful': '경쾌한 스타일',
  'Define the mood question, recommendation card and reading order.': '기분을 묻는 질문, 추천 카드, 읽는 순서를 정의합니다.',
  'Define the prompt, input states and recommendation response.': '프롬프트, 입력 상태, 추천 응답을 정의합니다.',
  'Define the mood selector, reveal state and motion fallback.': '기분 선택기, 결과 표시 상태, 모션 대체 방식을 정의합니다.',
  'Sample interface': '예시 화면', 'A little less deciding.': '고민은 조금 덜고.', 'Make room for lunch.': '점심을 위한\n여유를.',
  'Something warm. Something simple.': '따뜻하고, 간단하게.', 'The warm bowl': '따뜻한 한 그릇',
  '> mood: low effort': '> 기분: 간편하게', '> preference: something warm': '> 취향: 따뜻한 음식', 'Lunch, sorted.': '점심,\n해결.',
  'Noodle bowl.': '국수\n한 그릇.', 'One idea to take away.': '바로 선택할 수 있는 한 가지.',
  'Let your mood choose.': '기분에 따라 골라보세요.', 'A good lunch hunch.': '오늘 점심,\n좋은 예감.', 'Today feels cozy': '오늘은 포근한 기분',
  'Your lunch hunch': '오늘의 점심 예감', 'Warm & bowlful': '따뜻한\n한 그릇',
  'PreviewForge interactive design selection': 'PreviewForge 인터랙티브 디자인 선택', 'Interactive design study · LunchPull sample concepts': '인터랙티브 디자인 탐색 · LunchPull 예시 시안',
  'Choose a LunchPull visual direction': 'LunchPull 디자인 방향 선택', 'Illustrative choice record': '선택 기록 예시', 'Next → specification': '다음 → 명세 작성',
  'Sample choice record': '선택 기록 예시', 'Download choice ↓': '선택 기록 내려받기 ↓', 'Download the sample chosen_preview.json file': '예시 chosen_preview.json 파일 내려받기',
  'This browser cannot download the file. The complete sample record is displayed above.': '이 브라우저에서는 파일을 내려받을 수 없습니다. 전체 예시 기록이 위에 표시되어 있습니다.',
  'Sample choice record prepared for download.': '예시 선택 기록의 다운로드를 준비했습니다.',
};
for (const name of ['Evidence','Audit','Report']) copy[`Inspect ${name.toLowerCase()} stage`] = `${copy[name] || '근거'} 단계 살펴보기`;
for (const name of ['Facts','Intuition','Upside','Risks','Ideas','Synthesis']) {
  copy[`Inspect ${name.toLowerCase()} perspective`] = `${copy[name]} 관점 살펴보기`;
  copy[`parallel review / ${name.toLowerCase()}`] = `병렬 검토 / ${copy[name]}`;
}
for (const name of ['Editorial','Terminal','Playful']) {
  copy[`${name.toLowerCase()} LunchPull sample interface`] = `${copy[name]} LunchPull 예시 화면`;
  copy[`${name} selected. The sample choice record and specification handoff are updated.`] = `${copy[name]} 선택. 예시 선택 기록과 명세 인계 내용이 갱신되었습니다.`;
}
export default copy;
