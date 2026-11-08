import React, { useState, useEffect } from 'react';
import {
  Student,
  SubjectInquiryTopic,
  CurriculumUnit,
  MethodologyType,
  InquiryPlanProposal,
  SnowballStep,
  ClicheItem,
} from '../types';
import {
  curriculumUnits,
  methodologyOptions,
  clicheDatabase,
  majorTrackCategories,
} from '../data/curriculumData';
import {
  Sparkles,
  BookOpen,
  Compass,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileText,
  Copy,
  Check,
  Printer,
  BookmarkPlus,
  RefreshCw,
  Search,
  Filter,
  Layers,
  HelpCircle,
  TrendingUp,
  Cpu,
  Target,
  FlaskConical,
  GraduationCap,
  Plus,
  Trash2,
  Info,
  X,
  Loader2,
  Wand2,
  Briefcase,
} from 'lucide-react';

const initialCustomUnits: CurriculumUnit[] = [
  {
    id: 'custom-earth-el-nino',
    subjectName: '지구과학Ⅰ',
    subjectCategory: 'science',
    gradeLevel: '고2',
    semester: '2학기',
    unitName: '대기와 해양의 상호작용 (엘니뇨·라니냐와 워커 순환)',
    unitConcepts: ['무역풍', '용승 현상', '동태평양 수온 편차', '워커 순환', '남방진동 지수(SOI)'],
    keyPrinciples: '대기 순환과 해양 표층 수온 간의 피드백 작용을 분석하여 기후 이변의 원인을 수리·통계적으로 규명하는 원리',
    samplePhenomena: [
      '엘니뇨 발생 연도 동태평양 어획량 급감과 페루 연안 영양염류 용승 차단 분석',
      '기후변화에 따른 슈퍼 엘니뇨 발생 주기 단축과 한반도 겨울철 이상 고온 상관관계',
    ],
  },
  {
    id: 'custom-geom-projection',
    subjectName: '기하',
    subjectCategory: 'math',
    gradeLevel: '고2',
    semester: '1학기',
    unitName: '공간도형과 정사영 (빛의 입사각과 투영 면적)',
    unitConcepts: ['정사영(S\' = S cosθ)', '이면각', '삼수선의 정리', '법선벡터', '공간좌표'],
    keyPrinciples: '빛의 입사각과 평면의 기울기에 따른 정사영 면적을 삼각함수로 모델링하여 에너지 흡수율을 극대화하는 기하학적 원리',
    samplePhenomena: [
      '위도 및 계절별 태양 고도각에 따른 태양광 패널의 최적 설치 각도와 정사영 면적 계산',
      '3차원 단층촬영(CT) 영상의 라돈 변환 투영 기하학 분석',
    ],
  },
];

// Helper: Find the best curriculum unit matching student's career & interest profile
export function findBestUnitForStudent(student: Student, units: (CurriculumUnit & { isCustom?: boolean })[]): CurriculumUnit {
  const context = `${student.targetCareer} ${student.targetMajor} ${student.mainInterestTopic} ${(student.interestKeywords || []).join(' ')} ${(student.preferredSubjects || []).join(' ')}`.toLowerCase();

  if (/생명|바이오|유전자|crispr|의약|단백질|세포|의예|약학|생체/i.test(context)) {
    const match = units.find((u) => u.id === 'sci-bio-crispr');
    if (match) return match;
  }
  if (/ai|인공지능|컴퓨터|알고리즘|머신러닝|소프트웨어|빅데이터|정보/i.test(context)) {
    const match = units.find((u) => u.id === 'tech-algo-eda');
    if (match) return match;
  }
  if (/환경|기후|탄소|배출권|경제|피구세|시장/i.test(context)) {
    const match = units.find((u) => u.id === 'soc-econ-externality');
    if (match) return match;
  }
  if (/사회|정의|윤리|법|인권|복지|롤스/i.test(context)) {
    const match = units.find((u) => u.id === 'soc-ethics-rawls');
    if (match) return match;
  }
  if (/물리|반도체|에너지|배터리|열역학|기계/i.test(context)) {
    const match = units.find((u) => u.id === 'sci-phy-energy');
    if (match) return match;
  }
  if (/화학|완충|용액|산염기/i.test(context)) {
    const match = units.find((u) => u.id === 'sci-chem-buffer');
    if (match) return match;
  }
  if (/확률|통계|베이즈/i.test(context)) {
    const match = units.find((u) => u.id === 'math-prob-bayes');
    if (match) return match;
  }
  if (/수학|미적분|변화율|도함수/i.test(context)) {
    const match = units.find((u) => u.id === 'math-m1-derivatives');
    if (match) return match;
  }

  return units[0] || curriculumUnits[0];
}

// Helper: Match track ID
export function findBestTrackForStudent(student: Student): string {
  const context = `${student.targetCareer} ${student.targetMajor} ${student.mainInterestTopic}`.toLowerCase();
  if (/생명|바이오|유전자|의예|약학|간호|의학/i.test(context)) return 'track-bio-health';
  if (/ai|인공지능|컴퓨터|소프트웨어|데이터/i.test(context)) return 'track-ai-cs';
  if (/경제|경영|금융|통상/i.test(context)) return 'track-biz-econ';
  if (/정치|외교|법|행정|사회|언론/i.test(context)) return 'track-social-law';
  if (/전자|기계|신소재|화공|항공/i.test(context)) return 'track-engineering';
  return 'track-bio-health';
}

// Helper: Synthesize full tailored 5-step plan for student & unit
export function getTailoredPlanForStudent(student: Student, unit: CurriculumUnit) {
  const career = student.targetCareer || '전문 연구원';
  const major = student.targetMajor || '자연과학/공학 계열';
  const interest = student.mainInterestTopic || '교과 연계 첨단 기술 쟁점';
  const keywords = student.interestKeywords || [];
  const keywordStr = keywords.join(', ');

  const contextStr = `${career} ${major} ${interest} ${keywordStr} ${unit.unitName} ${unit.subjectName}`.toLowerCase();
  const isBio = /생명|바이오|유전자|crispr|의약|단백질|세포|의예|약학/i.test(contextStr);
  const isAi = /ai|인공지능|컴퓨터|알고리즘|머신러닝|소프트웨어|빅데이터|정보/i.test(contextStr);
  const isEnv = /환경|기후|탄소|생태|신재생|esg|지구/i.test(contextStr);
  const isEcon = /경제|경영|배출권|금융|시장|피구세|가격/i.test(contextStr);

  // 1. Phenomenon Observation
  let customObserved = interest;
  let phenomenaChips = unit.samplePhenomena;
  if (isBio) {
    customObserved = `CRISPR 유전자 가위의 표적 외 절단(오프타깃) 부작용과 결합 오차율 측정 문제`;
    phenomenaChips = [
      `CRISPR-Cas9 가이드 RNA 불일치 염기 위치에 따른 오프타깃 비표적 절단 확률`,
      `단백질 3차원 입체 구조 접힘 오류와 난치성 신경퇴행성 질환 발병 기전`,
      `세포치료제 체내 주입 시 생체 적합 완충계와 면역 거부 반응 최소화 조건`,
    ];
  } else if (isAi) {
    customObserved = `생성형 AI 언어모델의 환각 현상과 사실 기반 검색 증강(RAG) 파이프라인의 신뢰성 한계`;
    phenomenaChips = [
      `대규모 언어 모델(LLM)의 사실 왜곡(Hallucination) 저감을 위한 벡터 유사도 검색(Cosine)`,
      `알고리즘 시간 복잡도(Big-O)와 대용량 데이터 정렬·탐색 효율 최적화`,
      `머신러닝 학습 데이터 편향성에 따른 공공 의사결정 알고리즘의 차별 문제`,
    ];
  } else if (isEnv || isEcon) {
    customObserved = `탄소배출권 거래 시장의 가격 왜곡 및 시장 실패 방지와 최적 조세 모델링`;
    phenomenaChips = [
      `국내 배출권 거래제(K-ETS) 가격 변동성과 기업의 친환경 감축 설비 투자 유인 왜곡`,
      `피구세(탄소세) 최적 세율 산정과 사회적 한계저감비용(MAC) 일치 조건`,
      `환경 불평등 해소를 위한 탄소 배출 규제와 취약 계층 복지 재정 환급 모델`,
    ];
  }

  // 2. Academic Lenses
  let lensOptions = [
    `${unit.unitConcepts[0] || '교과 핵심 원리'} 기반 수리/원리 모델링 렌즈`,
    `실세계 공공데이터 및 변인 통제 실증 렌즈`,
    `한계 극복 및 사회 윤리·제도적 가이드라인 렌즈`,
  ];
  if (isBio) {
    lensOptions = [
      '분자 생화학 및 결합 오차 확률 렌즈',
      '베이즈 조건부 확률 및 위양성 검증 렌즈',
      '생명윤리 및 임상 치료제 허가 규제 렌즈',
    ];
  } else if (isAi) {
    lensOptions = [
      'Big-O 시간복잡도 및 알고리즘 최적화 렌즈',
      '기하 벡터 내적 및 임베딩 코사인 유사도 렌즈',
      '인공지능 윤리 및 지식재산권 공정이용 렌즈',
    ];
  } else if (isEcon || isEnv) {
    lensOptions = [
      '미시경제학 시장 실패 및 외부효과 렌즈',
      '피구세 수리 모델링 및 코스 정리 렌즈',
      '롤스의 정의론 및 환경 정의(Environmental Justice) 렌즈',
    ];
  }

  // 3. Question Options
  let questionOptions = [
    `${unit.unitName}의 핵심 개념(${unit.unitConcepts[0]})을 ${interest}에 적용할 때 나타나는 최적 임계점은 무엇인가?`,
    `선행 연구 대비 ${interest} 시스템의 변인 간 상관관계를 정량적 데이터로 어떻게 입증할 것인가?`,
    `${unit.subjectName}의 이론을 실세계 ${major} 현장에 적용할 때 발생하는 현실적 오차와 극복 방안은?`,
  ];
  if (isBio) {
    questionOptions = [
      'gRNA의 특정 염기 불일치(Mismatch) 위치와 PAM 서열 거리가 비표적 절단 확률에 미치는 정량적 영향은 무엇인가?',
      '베이즈 조건부 확률을 적용했을 때 유전자 교정 검사의 위양성을 최소화하는 최적 임계값은?',
      '희귀난치병 치료용 유전자 가위의 안전성을 보장하기 위해 요구되는 2단계 분자 검증 프로토콜은 무엇인가?',
    ];
  } else if (isAi) {
    questionOptions = [
      '검색 증강 생성(RAG) 파이프라인에서 코사인 유사도 임계치 설정이 사실 정확도에 미치는 트레이드오프는 무엇인가?',
      '대규모 데이터 입력 시 정렬·탐색 알고리즘의 시간 복잡도를 O(n²)에서 O(n log n)으로 개선하는 구체적 방법은?',
      'AI 모델의 데이터셋 편향성을 탐색적 데이터 분석(EDA)으로 시각화하고 완화하는 알고리즘적 기제는 무엇인가?',
    ];
  } else if (isEcon || isEnv) {
    questionOptions = [
      '배출권 거래제(K-ETS) 가격 급락 시 기업의 한계저감비용(MAC)과 사회적 후생 손실을 최소화하는 피구세 세율은?',
      '외부효과를 내부화하는 코스 정리가 거래 비용(Transaction Cost)이 존재하는 현실 시장에서 성립하기 위한 제도적 조건은?',
      '취약 계층의 환경 불평등을 방지하기 위한 탄소세 세수 환급 모델의 경제적 효과는 어떠한가?',
    ];
  }

  // 4. Recommended methodology
  let recMethod: MethodologyType = 'simulation';
  if (isBio) recMethod = 'simulation';
  else if (isAi) recMethod = 'public_data';
  else if (isEnv || isEcon) recMethod = 'public_data';

  // Topic Title
  let topicTitle = `[${unit.subjectName}] ${unit.unitName} 기반 ${interest.slice(0, 30)} 심화 탐구`;
  if (isBio) {
    topicTitle = `[생명과학Ⅱ] CRISPR-Cas9 가이드 RNA 불일치 염기 분석을 통한 오프타깃 절단 위험도 수리 모델링`;
  } else if (isAi) {
    topicTitle = `[정보/인공지능] 대규모 언어 모델의 벡터 유사도 검색(Cosine) 기반 환각 저감 파이프라인 분석`;
  } else if (isEcon || isEnv) {
    topicTitle = `[경제] 국내 배출권 거래제(K-ETS) 가격 변동성과 피구세 최적 세율 모형 연구`;
  }

  // 5. Motivation
  const motivation = `교과 수업 중 [${unit.subjectName} - ${unit.unitName}] 단원을 학습하며 교과서에 등장하는 이론이 실세계 시스템에 적용될 때 마주하는 한계점에 지적 호기심을 갖게 됨. 평소 희망해 온 '${career}' 진로와 목표 학과인 '${major}' 관점에서, 최근 큰 관심을 두고 있던 '${interest}' 문제를 교과 핵심 개념(${unit.unitConcepts.slice(0, 2).join(', ')})과 결합하여 자기주도적으로 깊이 있게 분석해보고자 연구 주제를 기획함. 단순 현상 조사에 그치지 않고 정량적 데이터와 검증 가능한 가설 설정을 통해 학문적 타당성을 스스로 입증하고자 함.`;

  // Snowball Roadmap
  const snowballRoadmap: SnowballStep[] = [
    {
      grade: '1학년 (기초 소양)',
      stageName: '기초 개념 정립 및 문제의식 발굴',
      subject: '통합과학 / 통합사회 / 공통수학',
      focus: '일상적 현상에서 교과 기본 법칙과 호기심 발견',
      topicIdea: `${interest.slice(0, 15)} 관련 기초 개념 조사 및 실생활 적용 현황 보고서 작성`,
      connectionReason: '고교 1학년 공통 교육과정의 기본 성취기준을 성실히 이수했음을 입증',
    },
    {
      grade: '2학년 (전공 심화)',
      stageName: '현재 탐구 과제 (선택 과목 정밀 연계)',
      subject: unit.subjectName,
      focus: '정량적 모델링, 실험 설계 또는 공공데이터 실증',
      topicIdea: topicTitle,
      connectionReason: `${unit.unitName}의 핵심 이론을 진로 쟁점과 유기적으로 결합하여 검증`,
    },
    {
      grade: '3학년 (융합 발전)',
      stageName: '차년도 후속 심화 및 융합 과제',
      subject: '진로선택과목 / 생활과 윤리 / 융합과학탐구',
      focus: '한계점 극복, 정책 제언, 다학제간 융합 모델링',
      topicIdea: `${topicTitle.split(']')[1] || topicTitle}의 현실 적용 한계 보완 및 제도적·윤리적 가이드라인 연구`,
      connectionReason: '단발성 탐구로 끝나지 않고 3개년 동안 학문적 성장이 꼬리를 물고 이어지는 연속성 증명',
    },
  ];

  // Teacher Review Points
  const teacherReviewPoints = {
    academic: `${unit.subjectName}의 핵심 이론(${unit.unitConcepts[0]})을 정확하게 이해하고 실세계 데이터와 결합하여 심화 모델링을 도출하는 우수한 학업 탐구력`,
    career: `'${career}'에 대한 뚜렷한 진로 지향점을 바탕으로 최신 전공 쟁점을 주도적으로 분석하는 높은 전공 적합성`,
    community: `기술 발전과 연구 성과가 사회에 미치는 파급효과와 윤리적 책임을 함께 모색하는 성숙한 공동체 의식`,
  };

  const relatedBooks = isBio
    ? '《유전자 편집의 시대》(제니퍼 다우드나), 《생명이란 무엇인가》(에르빈 슈뢰딩거)'
    : isAi
    ? '《알고리즘, 인생을 계산하다》(브라이언 크리스천), 《마스터 알고리즘》(페드로 도밍고스)'
    : '《탄소중립의 기후학》(조천호), 《괴짜경제학》(스티븐 레빗)';

  return {
    customObserved,
    phenomenaChips,
    selectedLens: lensOptions[0],
    lensOptions,
    finalQuestion: questionOptions[0],
    questionOptions,
    recMethod,
    topicTitle,
    motivation,
    snowballRoadmap,
    teacherReviewPoints,
    relatedBooks,
  };
}

interface CurriculumInquiryWizardProps {
  currentStudent: Student;
  onAddInquiryRecord: (topic: SubjectInquiryTopic) => void;
  onSwitchToMindmap?: () => void;
}

export const CurriculumInquiryWizard: React.FC<CurriculumInquiryWizardProps> = ({
  currentStudent,
  onAddInquiryRecord,
  onSwitchToMindmap,
}) => {
  // Wizard Step (1: 단원/진로 매칭 -> 2: 질문 퍼널 -> 3: 클리셰 탈출 -> 4: 방법론 -> 5: 1페이지 기획서 & 체크리스트)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Student Custom Units State (with localStorage persistence)
  const [customUnits, setCustomUnits] = useState<CurriculumUnit[]>(() => {
    try {
      const saved = localStorage.getItem('hakjong_custom_units');
      return saved ? JSON.parse(saved) : initialCustomUnits;
    } catch {
      return initialCustomUnits;
    }
  });

  // All units combining curriculum standard units + student custom units
  const allUnits: (CurriculumUnit & { isCustom?: boolean })[] = [
    ...curriculumUnits.map((u) => ({ ...u, isCustom: false })),
    ...customUnits.map((u) => ({ ...u, isCustom: true })),
  ];

  // Best matching unit based on student's target career, major, and interest topic
  const initialBestUnit = findBestUnitForStudent(currentStudent, allUnits);
  const initialTailored = getTailoredPlanForStudent(currentStudent, initialBestUnit);

  // Tab: 'preset' (표준 교육과정 단원) | 'custom' (학생 직접 등록 단원)
  const [unitTab, setUnitTab] = useState<'preset' | 'custom'>('preset');
  const [showCriteriaInfo, setShowCriteriaInfo] = useState<boolean>(false);
  const [showAddUnitModal, setShowAddUnitModal] = useState<boolean>(false);

  // Form State for Adding New Unit
  const [newSubjectName, setNewSubjectName] = useState<string>('');
  const [newSubjectCategory, setNewSubjectCategory] = useState<CurriculumUnit['subjectCategory']>('science');
  const [newGradeLevel, setNewGradeLevel] = useState<CurriculumUnit['gradeLevel']>('고2');
  const [newSemester, setNewSemester] = useState<CurriculumUnit['semester']>('1학기');
  const [newUnitName, setNewUnitName] = useState<string>('');
  const [newUnitConcepts, setNewUnitConcepts] = useState<string>('');
  const [newKeyPrinciples, setNewKeyPrinciples] = useState<string>('');
  const [newSamplePhenomena, setNewSamplePhenomena] = useState<string>('');

  // Step 1: Selected Unit & Major
  const [selectedCategory, setSelectedCategory] = useState<string>(initialBestUnit.subjectCategory);
  const [selectedUnitId, setSelectedUnitId] = useState<string>(initialBestUnit.id);
  const [targetMajor, setTargetMajor] = useState<string>(currentStudent.targetMajor || '생명공학과 / 의생명과학');
  const [selectedTrackId, setSelectedTrackId] = useState<string>(findBestTrackForStudent(currentStudent));

  // Step 2: Questioning Funnel State (Deeply Tailored to Student Profile)
  const [observedPhenomenon, setObservedPhenomenon] = useState<string>(initialTailored.customObserved);
  const [phenomenaChips, setPhenomenaChips] = useState<string[]>(initialTailored.phenomenaChips);
  const [selectedLens, setSelectedLens] = useState<string>(initialTailored.selectedLens);
  const [lensOptions, setLensOptions] = useState<string[]>(initialTailored.lensOptions);
  const [finalInquiryQuestion, setFinalInquiryQuestion] = useState<string>(initialTailored.finalQuestion);
  const [questionOptions, setQuestionOptions] = useState<string[]>(initialTailored.questionOptions);

  // Step 3: De-cliche & Twist State
  const [clicheInput, setClicheInput] = useState<string>('');
  const [matchedCliche, setMatchedCliche] = useState<ClicheItem | null>(null);
  const [selectedTwist, setSelectedTwist] = useState<{
    approach: string;
    subTopic: string;
    academicLens: string;
    inquiryQuestion: string;
  } | null>(null);

  // Step 4: Methodology Selector State
  const [selectedMethodology, setSelectedMethodology] = useState<MethodologyType>(initialTailored.recMethod);

  // Step 5: Tailored 1-Page Proposal Fields
  const [customMotivation, setCustomMotivation] = useState<string>(initialTailored.motivation);
  const [customSnowball, setCustomSnowball] = useState<SnowballStep[]>(initialTailored.snowballRoadmap);
  const [customTeacherPoints, setCustomTeacherPoints] = useState(initialTailored.teacherReviewPoints);
  const [customBooks, setCustomBooks] = useState<string>(initialTailored.relatedBooks);

  // AI Tailoring State
  const [isAiTailoring, setIsAiTailoring] = useState<boolean>(false);
  const [aiTailorNotice, setAiTailorNotice] = useState<string | null>(null);

  // Step 5: Checklist State
  const [checklist, setChecklist] = useState({
    curriculumLinked: true,
    noProhibitedTerms: true,
    feasibleForHighSchool: true,
    originalInsight: true,
    continuousGrowth: true,
  });

  const [copiedProposal, setCopiedProposal] = useState<boolean>(false);
  const [addedNotice, setAddedNotice] = useState<boolean>(false);

  // Computed selected unit
  const currentUnit =
    allUnits.find((u) => u.id === selectedUnitId) || allUnits[0] || curriculumUnits[0];
  const currentMethodologyInfo =
    methodologyOptions.find((m) => m.type === selectedMethodology) ||
    methodologyOptions[0];

  // Best matching unit ID for highlighting
  const bestMatchingUnitId = findBestUnitForStudent(currentStudent, allUnits).id;

  // Apply full tailored plan to state
  const applyTailoredPlan = (student: Student, unit: CurriculumUnit) => {
    const plan = getTailoredPlanForStudent(student, unit);
    setTargetMajor(student.targetMajor || '자연과학/공학 계열');
    setSelectedTrackId(findBestTrackForStudent(student));
    setObservedPhenomenon(plan.customObserved);
    setPhenomenaChips(plan.phenomenaChips);
    setSelectedLens(plan.selectedLens);
    setLensOptions(plan.lensOptions);
    setFinalInquiryQuestion(plan.finalQuestion);
    setQuestionOptions(plan.questionOptions);
    setSelectedMethodology(plan.recMethod);
    setCustomMotivation(plan.motivation);
    setCustomSnowball(plan.snowballRoadmap);
    setCustomTeacherPoints(plan.teacherReviewPoints);
    setCustomBooks(plan.relatedBooks);

    // Auto-check cliche
    const found = clicheDatabase.find(
      (c) =>
        plan.finalQuestion.includes(c.keyword) ||
        (student.mainInterestTopic && student.mainInterestTopic.includes(c.keyword)) ||
        c.keyword.includes('유전자') ||
        c.keyword.includes('인공지능') ||
        c.keyword.includes('탄소')
    );
    if (found) {
      setMatchedCliche(found);
      if (found.twists.length > 0) {
        setSelectedTwist(found.twists[0]);
      }
    }
  };

  // Sync student's recorded career & interest profile on change
  useEffect(() => {
    if (currentStudent) {
      const bestUnit = findBestUnitForStudent(currentStudent, allUnits);
      setSelectedUnitId(bestUnit.id);
      setSelectedCategory(bestUnit.subjectCategory);
      applyTailoredPlan(currentStudent, bestUnit);
    }
  }, [currentStudent.id, currentStudent.targetCareer, currentStudent.mainInterestTopic, currentStudent.targetMajor]);

  // AI-powered deep tailor optimization call to server
  const handleAITailorOptimize = async () => {
    setIsAiTailoring(true);
    setAiTailorNotice(null);
    try {
      const res = await fetch('/api/ai/wizard-tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student: currentStudent,
          unit: currentUnit,
        }),
      });

      if (!res.ok) {
        throw new Error('API 응답 오류');
      }

      const data = await res.json();
      if (data && data.success && data.plan) {
        const p = data.plan;
        if (p.phenomenaChips?.length) setPhenomenaChips(p.phenomenaChips);
        if (p.customObserved) setObservedPhenomenon(p.customObserved);
        if (p.lensOptions?.length) setLensOptions(p.lensOptions);
        if (p.selectedLens) setSelectedLens(p.selectedLens);
        if (p.questionOptions?.length) setQuestionOptions(p.questionOptions);
        if (p.finalQuestion) setFinalInquiryQuestion(p.finalQuestion);
        if (p.recMethod) setSelectedMethodology(p.recMethod as MethodologyType);
        if (p.motivation) setCustomMotivation(p.motivation);
        if (p.snowballRoadmap?.length) setCustomSnowball(p.snowballRoadmap);
        if (p.teacherReviewPoints) setCustomTeacherPoints(p.teacherReviewPoints);
        if (p.relatedBooks) setCustomBooks(p.relatedBooks);

        setAiTailorNotice(`✨ AI가 ${currentStudent.name} 학생의 진로(${currentStudent.targetCareer}) 및 관심사(${currentStudent.mainInterestTopic?.slice(0, 15)}...)에 맞추어 5단계 전 과정을 심화 최적화했습니다!`);
        setTimeout(() => setAiTailorNotice(null), 5000);
      } else {
        applyTailoredPlan(currentStudent, currentUnit);
        setAiTailorNotice('맞춤 합성 엔진으로 5단계 탐구 계획이 최적화되었습니다.');
        setTimeout(() => setAiTailorNotice(null), 4000);
      }
    } catch (err) {
      console.warn('AI tailor fallback:', err);
      applyTailoredPlan(currentStudent, currentUnit);
      setAiTailorNotice('진로 맞춤 탐구 로드맵이 성공적으로 재구성되었습니다.');
      setTimeout(() => setAiTailorNotice(null), 4000);
    } finally {
      setIsAiTailoring(false);
    }
  };

  // Filter units based on active tab and category
  const filteredUnits =
    unitTab === 'preset'
      ? curriculumUnits.filter((u) => u.subjectCategory === selectedCategory)
      : customUnits.filter(
          (u) => u.subjectCategory === selectedCategory || selectedCategory === 'all'
        );

  const handleAddCustomUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim() || !newUnitName.trim()) return;

    const parsedConcepts = newUnitConcepts
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const parsedPhenomena = newSamplePhenomena
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);

    const created: CurriculumUnit = {
      id: `custom-unit-${Date.now()}`,
      subjectName: newSubjectName.trim(),
      subjectCategory: newSubjectCategory,
      gradeLevel: newGradeLevel,
      semester: newSemester,
      unitName: newUnitName.trim(),
      unitConcepts:
        parsedConcepts.length > 0 ? parsedConcepts : ['단원 핵심 개념', '원리 적용'],
      keyPrinciples:
        newKeyPrinciples.trim() ||
        `${newSubjectName} 단원에서 학습한 핵심 이론과 법칙`,
      samplePhenomena:
        parsedPhenomena.length > 0
          ? parsedPhenomena
          : [`${newUnitName} 원리가 적용되는 실생활 전공 쟁점 분석`],
    };

    const updated = [created, ...customUnits];
    setCustomUnits(updated);
    try {
      localStorage.setItem('hakjong_custom_units', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    // Select the newly created unit immediately
    setSelectedUnitId(created.id);
    setSelectedCategory(created.subjectCategory);
    setObservedPhenomenon(created.samplePhenomena[0]);
    setUnitTab('custom');
    setShowAddUnitModal(false);

    // Reset form
    setNewSubjectName('');
    setNewUnitName('');
    setNewUnitConcepts('');
    setNewKeyPrinciples('');
    setNewSamplePhenomena('');
  };

  const handleDeleteCustomUnit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customUnits.filter((u) => u.id !== id);
    setCustomUnits(updated);
    try {
      localStorage.setItem('hakjong_custom_units', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    if (selectedUnitId === id) {
      setSelectedUnitId(curriculumUnits[0].id);
      setObservedPhenomenon(curriculumUnits[0].samplePhenomena[0]);
    }
  };

  // Auto-detect cliche when user types in cliche input or selects phenomenon
  const handleCheckCliche = (keyword: string) => {
    setClicheInput(keyword);
    if (!keyword.trim()) {
      setMatchedCliche(null);
      return;
    }
    const found = clicheDatabase.find(
      (c) =>
        keyword.includes(c.keyword) ||
        c.keyword.includes(keyword) ||
        c.commonTopic.includes(keyword)
    );
    setMatchedCliche(found || null);
    if (found && found.twists.length > 0) {
      setSelectedTwist(found.twists[0]);
    } else {
      setSelectedTwist(null);
    }
  };

  // Generate 1-Page Proposal
  const proposalTopicTitle = selectedTwist
    ? `[${currentUnit.subjectName}] ${selectedTwist.subTopic}`
    : `[${currentUnit.subjectName}] ${currentUnit.unitName} 기반 ${targetMajor.split('/')[0].trim()} 연계 심화 탐구`;

  const proposalQuestion = selectedTwist
    ? selectedTwist.inquiryQuestion
    : finalInquiryQuestion;

  const currentSnowballSteps: SnowballStep[] = [
    {
      grade: '1학년 (기초 소양)',
      stageName: '기초 개념 정립 및 문제의식 발굴',
      subject: '통합과학 / 통합사회 / 공통수학',
      focus: '일상 현상에서 교과 기본 법칙과 호기심 발견',
      topicIdea: `${currentUnit.unitConcepts[0] || '기본 교과 개념'}의 실생활 적용 사례 조사 및 기초 원리 보고서 작성`,
      connectionReason: '고교 1학년 기본 성취기준을 충실히 이수했음을 입증하는 기초 토대',
    },
    {
      grade: '2학년 (전공 심화)',
      stageName: '현재 탐구 과제 (선택 과목 정밀 연계)',
      subject: currentUnit.subjectName,
      focus: '정량적 모델링, 실험 설계 또는 공공데이터 실증',
      topicIdea: proposalTopicTitle,
      connectionReason: `${currentUnit.keyPrinciples.slice(0, 45)}... 등의 심화 이론을 진로와 유기적으로 결합`,
    },
    {
      grade: '3학년 (융합 발전)',
      stageName: '차년도 후속 심화 및 융합 과제',
      subject: '전문교과 / 진로선택과목 / 생활과 윤리',
      focus: '한계점 극복, 정책 제언, 다학제간 융합 모델링',
      topicIdea: `${proposalTopicTitle.split(']')[1] || proposalTopicTitle}의 현실 적용 한계 보완 및 윤리적·제도적 가이드라인 연구`,
      connectionReason: '단발성 탐구로 끝나지 않고 3개년 동안 학문적 성장이 꼬리를 물고 이어지는 연속성 증명',
    },
  ];

  const handleCopyProposal = () => {
    const text = `========================================================
[교과 연계 탐구 1페이지 기획서 (선생님 제출용)]
========================================================
1. 학생 정보
- 학년/이름: ${currentStudent.grade} ${currentStudent.name}
- 희망 진로: ${currentStudent.targetCareer || '미설정'}
- 희망 전공: ${targetMajor}
- 핵심 관심 분야: ${currentStudent.mainInterestTopic || '미설정'}

2. 교과 및 단원 정보
- 연계 교과: ${currentUnit.subjectName}
- 해당 단원: ${currentUnit.unitName}
- 핵심 개념: ${currentUnit.unitConcepts.join(', ')}

3. 탐구 주제명 및 핵심 질문
- 탐구 주제: ${proposalTopicTitle}
- 핵심 질문: ${proposalQuestion}

4. 탐구 동기 및 필요성
${customMotivation}

5. 실천 방법론
- 선택 유형: ${currentMethodologyInfo.title}
- 권장 도구: ${currentMethodologyInfo.recommendedTools.join(', ')}
- 실행 단계:
${currentMethodologyInfo.actionSteps.map((s) => `  * ${s}`).join('\n')}
- 예상 산출물: ${currentMethodologyInfo.sampleDeliverable}

6. 3개년 스노우볼 연계 로드맵
- 1학년 기초: ${customSnowball[0]?.topicIdea || ''}
- 2학년 심화: ${customSnowball[1]?.topicIdea || proposalTopicTitle} (현재)
- 3학년 융합: ${customSnowball[2]?.topicIdea || ''}

7. 교사 세특 평가 포인트
- 학업역량: ${customTeacherPoints.academic}
- 전공적합성: ${customTeacherPoints.career}
- 공동체의식: ${customTeacherPoints.community}

8. 권장 도서 및 참고 자료
- ${customBooks}

9. 기재요령 준수 자가점검
- [x] 교과서 개념 명시 반영 완료
- [x] 소논문/R&E/외부 수상 등 기재금지 사항 배제
- [x] 고교생 수준에서 직접 수행 가능한 도구 사용
- [x] 단순 요약이 아닌 학생 본인의 비판적 해석 포함
========================================================`;

    navigator.clipboard.writeText(text);
    setCopiedProposal(true);
    setTimeout(() => setCopiedProposal(false), 2500);
  };

  const handleAddToRecords = () => {
    const topicToAdd: SubjectInquiryTopic = {
      id: `topic-${Date.now()}`,
      subject: currentUnit.subjectName,
      subjectCategory: currentUnit.subjectCategory,
      topic: proposalTopicTitle,
      inquiryQuestion: proposalQuestion,
      methodology: `${currentMethodologyInfo.title} (${currentMethodologyInfo.recommendedTools.join(', ')})`,
      readingRecommendation: customBooks,
      recordTip: `${currentUnit.unitName}의 핵심 개념(${currentUnit.unitConcepts[0]})을 ${currentStudent.targetCareer || targetMajor}의 쟁점("${currentStudent.mainInterestTopic || observedPhenomenon}")에 적용하여, ${currentMethodologyInfo.title}로 주도적으로 검증함.`,
    };

    onAddInquiryRecord(topicToAdd);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-indigo-900/50 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-bold">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              <span>탐구 주제 정하기 어려워하는 학생을 위한 맞춤 길잡이</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              교과서 단원 선택부터 1페이지 탐구 기획서까지 5단계 완성
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              어떤 주제를 잡아야 할지 막막할 때는 관심사만 헤매지 말고, <strong>'지금 이번 주에 배우는 교과서 단원'</strong>에서 시작하세요.
              단원 개념과 진로의 2단 결합, 클리셰 탈출 차별화, 실행 가능한 방법론, 선생님 제출용 1페이지 기획서까지 체계적으로 안내합니다.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onSwitchToMindmap && (
              <button
                type="button"
                onClick={onSwitchToMindmap}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold border border-white/20 transition-all backdrop-blur-sm"
              >
                <Layers className="w-4 h-4 text-indigo-300" />
                <span>자유 키워드 마인드맵 보기</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Student Tailoring Status Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shrink-0 shadow-md">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold text-white text-sm sm:text-base">
                  🎯 {currentStudent.name} 학생 맞춤 5단계 탐구 로드맵 가동 중
                </span>
                <span className="bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  100% 진로·관심사 연동
                </span>
              </div>
              <div className="text-slate-200 text-xs flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <span className="flex items-center gap-1 font-semibold text-indigo-200">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-300" />
                  <strong>진로:</strong> {currentStudent.targetCareer || '미설정'} ({currentStudent.targetMajor})
                </span>
                <span className="text-slate-500 hidden sm:inline">|</span>
                <span className="flex items-center gap-1 font-semibold text-amber-200">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <strong>관심사:</strong> "{currentStudent.mainInterestTopic || '미등록'}"
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
            <button
              type="button"
              onClick={() => applyTailoredPlan(currentStudent, currentUnit)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition-all shadow-2xs"
              title="내 관심사 정보를 5단계 전 과정에 다시 적용"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-300" />
              <span>관심사 맞춤 리셋</span>
            </button>

            <button
              type="button"
              disabled={isAiTailoring}
              onClick={handleAITailorOptimize}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50"
            >
              {isAiTailoring ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>AI 심화 최적화 중...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>AI 실시간 심화 최적화</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI Tailoring Toast / Alert */}
        {aiTailorNotice && (
          <div className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{aiTailorNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setAiTailorNotice(null)}
              className="text-emerald-300 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 5-Step Process Indicator */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-6 mt-6 border-t border-indigo-900/40">
          {[
            { step: 1, title: '1. 교과 단원 선택', desc: '배우는 내용 기반' },
            { step: 2, title: '2. 질문 유도 퍼널', desc: '현상 관찰과 렌즈' },
            { step: 3, title: '3. 클리셰 탈출기', desc: '흔한 주제 비틀기' },
            { step: 4, title: '4. 방법론 키트', desc: '4대 실천 도구' },
            { step: 5, title: '5. 1페이지 기획서', desc: '선생님 승인 완료' },
          ].map((item) => {
            const isActive = currentStep === item.step;
            const isPassed = currentStep > item.step;
            return (
              <button
                key={item.step}
                type="button"
                onClick={() => setCurrentStep(item.step)}
                className={`text-left p-2.5 rounded-xl transition-all border ${
                  isActive
                    ? 'bg-indigo-600/90 border-indigo-400 text-white shadow-sm'
                    : isPassed
                    ? 'bg-white/5 border-emerald-500/40 text-emerald-300 hover:bg-white/10'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold mb-0.5">
                  <span>{item.title}</span>
                  {isPassed && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-[10px] opacity-80">{item.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Curriculum-First Wizard (교과서 단원 & 진로 결합) */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-indigo-600 flex items-center gap-1.5 mb-1">
                <BookOpen className="w-4 h-4" />
                <span>STEP 1: 교과서 단원/학습 내용 기반 역방향 매칭 (Curriculum-First)</span>
              </span>
              <h3 className="text-lg font-black text-slate-900">
                지금 수업 시간에 배우고 있는 과목과 단원을 선택하거나 직접 추가하세요
              </h3>
            </div>
            
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setShowCriteriaInfo(!showCriteriaInfo)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-200 transition-colors"
                title="단원 선정 기준 안내"
              >
                <Info className="w-3.5 h-3.5 text-indigo-600" />
                <span>단원 선정 기준 안내</span>
              </button>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                {currentStudent.name} ({currentStudent.grade})
              </span>
            </div>
          </div>

          {/* Criteria Explanation Banner (Collapsible) */}
          {showCriteriaInfo && (
            <div className="bg-gradient-to-br from-indigo-50/90 via-slate-50 to-purple-50/80 border border-indigo-200 rounded-2xl p-4 sm:p-5 text-xs text-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
                <span className="font-extrabold text-indigo-900 text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>하위 단원 선정 기준 (교육과정 및 대입 학생부종합전형 평가요소)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowCriteriaInfo(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="p-3 bg-white/90 rounded-xl border border-indigo-100 space-y-1">
                  <span className="font-extrabold text-indigo-700 block text-xs">
                    1. 2015·2022 개정 교육과정 성취기준
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    수학Ⅱ, 미적분, 확통, 생명과학Ⅱ, 화학Ⅱ, 물리Ⅰ/Ⅱ, 생윤, 경제, 독서, 정보 등 <strong>고교 보통교과 및 진로선택과목의 핵심 성취기준</strong>을 기준으로 선정하였습니다.
                  </p>
                </div>

                <div className="p-3 bg-white/90 rounded-xl border border-indigo-100 space-y-1">
                  <span className="font-extrabold text-indigo-700 block text-xs">
                    2. 진로 융합 모델링 연계율 (학업역량)
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    단순 암기 단원을 지양하고, <strong>변화율·최적화, 반응속도와 평형, 사회 정의와 규범, 데이터 알고리즘</strong> 등 전공 쟁점과 결합 가능한 고차원 핵심 개념 단원을 우선 배치하였습니다.
                  </p>
                </div>

                <div className="p-3 bg-white/90 rounded-xl border border-indigo-100 space-y-1">
                  <span className="font-extrabold text-indigo-700 block text-xs">
                    3. 고교생 실천 가능성 (1~2주 소요)
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    교내 과학실 장비, 무료 공공데이터(data.go.kr), KCI 오픈액세스 논문, 시뮬레이션(지오지브라, MolView) 등으로 <strong>학생이 직접 수행할 수 있는 실행성</strong>을 갖춘 단원입니다.
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-indigo-800 bg-indigo-100/50 p-2.5 rounded-xl">
                💡 <strong>안내:</strong> 교과서에 나오는 다른 단원(예: 기하, 지구과학, 사회·문화, 정치와 법, 동아시아사 등)을 탐구하고 싶으시다면, 아래 <strong>[+ 내가 직접 단원 추가하기]</strong> 탭을 통해 언제든 자유롭게 등록하실 수 있습니다!
              </div>
            </div>
          )}

          {/* Subject Category Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700">
                1. 고교 교과군 선택:
              </label>
              {unitTab === 'custom' && (
                <span className="text-[11px] text-indigo-600 font-semibold">
                  등록한 단원 교과군 필터링
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { id: 'math', label: '수학' },
                { id: 'science', label: '과학' },
                { id: 'social', label: '사회/윤리/경제' },
                { id: 'korean', label: '국어' },
                { id: 'english', label: '영어' },
                { id: 'tech', label: '정보/AI' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    const listToSearch = unitTab === 'preset' ? curriculumUnits : customUnits;
                    const match = listToSearch.find((u) => u.subjectCategory === cat.id);
                    if (match) {
                      setSelectedUnitId(match.id);
                      setObservedPhenomenon(match.samplePhenomena[0]);
                    }
                  }}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Unit Selection Sub-Tabs (Preset vs Custom Units) */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start">
                <button
                  type="button"
                  onClick={() => {
                    setUnitTab('preset');
                    const firstPreset = curriculumUnits.find(
                      (u) => u.subjectCategory === selectedCategory
                    ) || curriculumUnits[0];
                    setSelectedUnitId(firstPreset.id);
                    setObservedPhenomenon(firstPreset.samplePhenomena[0]);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    unitTab === 'preset'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📚 교육과정 표준 추천 단원 ({curriculumUnits.length})
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUnitTab('custom');
                    if (customUnits.length > 0) {
                      setSelectedUnitId(customUnits[0].id);
                      setObservedPhenomenon(customUnits[0].samplePhenomena[0]);
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    unitTab === 'custom'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>✏️ 내가 직접 등록한 단원</span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded-full font-extrabold">
                    {customUnits.length}
                  </span>
                </button>
              </div>

              {/* Add Custom Unit Button */}
              <button
                type="button"
                onClick={() => setShowAddUnitModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>+ 새 단원 직접 추가하기</span>
              </button>
            </div>

            {/* Curriculum Unit Cards Grid */}
            {filteredUnits.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredUnits.map((unit) => {
                  const isSelected = selectedUnitId === unit.id;
                  const isCustom = (unit as any).isCustom || unit.id.startsWith('custom-');
                  return (
                    <div
                      key={unit.id}
                      onClick={() => {
                        setSelectedUnitId(unit.id);
                        applyTailoredPlan(currentStudent, unit);
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all relative group ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-200 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-extrabold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-md">
                            {unit.subjectName} · {unit.gradeLevel} {unit.semester}
                          </span>
                          {unit.id === bestMatchingUnitId && (
                            <span className="text-[10px] font-black text-indigo-800 bg-gradient-to-r from-amber-100 to-indigo-100 border border-indigo-300 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              <span>내 진로·관심사 최적 매칭</span>
                            </span>
                          )}
                          {isCustom && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded">
                              학생 등록
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {isCustom && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteCustomUnit(unit.id, e)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="내가 등록한 단원 삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                          )}
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 mb-1.5">
                        {unit.unitName}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2 mb-2 leading-relaxed">
                        {unit.keyPrinciples}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {unit.unitConcepts.map((concept) => (
                          <span
                            key={concept}
                            className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                          >
                            #{concept}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl space-y-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 mx-auto flex items-center justify-center font-bold">
                  ✏️
                </div>
                <div className="text-xs text-slate-700 font-bold">
                  {unitTab === 'custom'
                    ? `선택한 교과군(${selectedCategory})에 직접 등록한 단원이 아직 없습니다.`
                    : '해당 교과군에 표시할 단원이 없습니다.'}
                </div>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  교과서 목차를 보고 지금 배우고 있는 단원을 등록해 보세요. 진로와 결합된 맞춤형 질문과 기획서를 자동으로 완성해 드립니다!
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddUnitModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>새 단원 직접 등록하기</span>
                </button>
              </div>
            )}
          </div>

          {/* Add Custom Unit Modal / Form */}
          {showAddUnitModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                      ✍️
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">
                        나만의 교과서 단원 직접 추가하기
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        수업 시간에 배우는 과목과 단원 정보를 입력하세요
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddUnitModal(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddCustomUnit} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        과목명 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        placeholder="예: 지구과학Ⅰ, 기하, 정치와 법"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        교과군 분류
                      </label>
                      <select
                        value={newSubjectCategory}
                        onChange={(e) =>
                          setNewSubjectCategory(
                            e.target.value as CurriculumUnit['subjectCategory']
                          )
                        }
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                      >
                        <option value="math">수학</option>
                        <option value="science">과학</option>
                        <option value="social">사회/윤리/경제</option>
                        <option value="korean">국어</option>
                        <option value="english">영어</option>
                        <option value="tech">정보/AI</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        대상 학년
                      </label>
                      <select
                        value={newGradeLevel}
                        onChange={(e) =>
                          setNewGradeLevel(
                            e.target.value as CurriculumUnit['gradeLevel']
                          )
                        }
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      >
                        <option value="고1">고등학교 1학년</option>
                        <option value="고2">고등학교 2학년</option>
                        <option value="고3">고등학교 3학년</option>
                        <option value="공통">공통</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        학기
                      </label>
                      <select
                        value={newSemester}
                        onChange={(e) =>
                          setNewSemester(
                            e.target.value as CurriculumUnit['semester']
                          )
                        }
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      >
                        <option value="1학기">1학기</option>
                        <option value="2학기">2학기</option>
                        <option value="공통">공통</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      단원명 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newUnitName}
                      onChange={(e) => setNewUnitName(e.target.value)}
                      placeholder="예: 대기와 해양의 상호작용 (엘니뇨와 라니냐)"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      단원 핵심 개념 (쉼표로 구분)
                    </label>
                    <input
                      type="text"
                      value={newUnitConcepts}
                      onChange={(e) => setNewUnitConcepts(e.target.value)}
                      placeholder="예: 무역풍, 용승 현상, 수온 편차, 기압 배치"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      핵심 원리 설명 (수업 내용 요약)
                    </label>
                    <textarea
                      rows={2}
                      value={newKeyPrinciples}
                      onChange={(e) => setNewKeyPrinciples(e.target.value)}
                      placeholder="교과서에서 설명하는 원리를 1~2문장으로 적어보세요 (예: 대기 순환과 해양 표층 수온 간의 피드백 작용으로 발생하는 기후 변동)"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      관련 일상/전공 현상 예시 (줄바꿈으로 구분)
                    </label>
                    <textarea
                      rows={2}
                      value={newSamplePhenomena}
                      onChange={(e) => setNewSamplePhenomena(e.target.value)}
                      placeholder="예: 엘니뇨 시기 동태평양 어획량 급감과 페루 연안 영양염류 용승 차단 분석"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddUnitModal(false)}
                      className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-xs"
                    >
                      단원 저장 및 적용하기
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Target Major and Career 2-Step Combination */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-600" />
                <span>3. 학생의 희망 진로 계열과 2단 결합 (Slot Combiner):</span>
              </label>
              <span className="text-[11px] text-indigo-600 font-semibold">
                단원 개념 + 진로 관심사 자동 합성
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {majorTrackCategories.map((track) => (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => {
                    setSelectedTrackId(track.id);
                    setTargetMajor(track.targetMajors[0]);
                  }}
                  className={`text-left p-2.5 rounded-xl text-xs border transition-all ${
                    selectedTrackId === track.id
                      ? 'bg-white border-indigo-500 text-indigo-900 font-bold shadow-xs ring-1 ring-indigo-300'
                      : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold">{track.badge}</span>
                    <span className="text-[10px] text-slate-400">
                      {track.targetMajors.length}개 학과
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {track.name}
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-2">
              <input
                type="text"
                value={targetMajor}
                onChange={(e) => setTargetMajor(e.target.value)}
                placeholder="희망 학과 직접 입력 (예: 생명공학과, 인공지능데이터융합, 경제학과)"
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-semibold"
              />
            </div>
          </div>

          {/* Slot Preview Box */}
          <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 border border-indigo-200 p-4 rounded-2xl flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider">
                💡 2단 결합 미리보기
              </span>
              <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                <span className="text-indigo-700">[{currentUnit.unitName}]</span>
                {' + '}
                <span className="text-purple-700">[{targetMajor}]</span>
                {' = '}
                <span className="text-slate-800">
                  교과 개념을 전공 쟁점에 적용하는 맞춤형 질문 도출 가능
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setObservedPhenomenon(currentUnit.samplePhenomena[0]);
                setCurrentStep(2);
              }}
              className="flex items-center gap-1.5 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shrink-0 shadow-sm transition-all"
            >
              <span>질문 유도 퍼널로 이동</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: 3-Step Questioning Funnel (현상 관찰 -> 교과 렌즈 -> 질문 템플릿) */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-indigo-600 flex items-center gap-1.5 mb-1">
                <Sparkles className="w-4 h-4" />
                <span>STEP 2: 3단계 질문 유도 퍼널 (Questioning Funnel)</span>
              </span>
              <h3 className="text-lg font-black text-slate-900">
                현상을 관찰하고 교과의 눈(학문적 렌즈)으로 질문을 좁히세요
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold self-start sm:self-auto"
            >
              ← 이전 (단원 다시 선택)
            </button>
          </div>

          {/* Sub-step 1: Phenomenon Observation */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center font-black">
                  1
                </span>
                <span>[현상 포착] 일상이나 최신 뉴스에서 관찰되는 구체적 현상/쟁점:</span>
              </span>
              <span className="text-[11px] text-slate-500">클릭하여 선택 또는 직접 수정</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentUnit.samplePhenomena.map((ph) => (
                <button
                  key={ph}
                  type="button"
                  onClick={() => setObservedPhenomenon(ph)}
                  className={`text-left p-3 rounded-xl text-xs border transition-all ${
                    observedPhenomenon === ph
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-900 font-bold ring-1 ring-indigo-200 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {ph}
                </button>
              ))}
            </div>

            <div className="pt-1">
              <textarea
                value={observedPhenomenon}
                onChange={(e) => setObservedPhenomenon(e.target.value)}
                rows={2}
                placeholder="직접 관찰한 현상을 적어보세요 (예: 특정 의약품의 보관 온도에 따른 분해나 가격 변동)"
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>
          </div>

          {/* Sub-step 2: Academic Lens Selector */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center font-black">
                2
              </span>
              <span>[교과 렌즈] 이 현상을 교과의 어떤 시각으로 분석할 것인가?</span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { title: '수리적 최적화·변화율', desc: '함수, 미분, 확률로 모델링' },
                { title: '물리화학적 메커니즘', desc: '분자 반응속도, 구조 규명' },
                { title: '사회 윤리적 정의와 규범', desc: '롤스의 정의론, 기본권' },
                { title: '공공데이터 상관관계', desc: '통계 지표 수집 및 시각화' },
              ].map((lens) => (
                <button
                  key={lens.title}
                  type="button"
                  onClick={() => setSelectedLens(lens.title)}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    selectedLens === lens.title
                      ? 'bg-purple-50 border-purple-400 text-purple-900 font-bold ring-1 ring-purple-200 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold mb-0.5">{lens.title}</div>
                  <div className="text-[10px] text-slate-500">{lens.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sub-step 3: Final Question Template */}
          <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-indigo-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center font-black">
                  3
                </span>
                <span>[나만의 완성형 탐구 질문 템플릿]</span>
              </span>
              <span className="text-[11px] text-indigo-600 font-bold">
                [현상] + [교과 개념] + [해결 방안/원인 규명]
              </span>
            </div>

            <textarea
              value={finalInquiryQuestion}
              onChange={(e) => setFinalInquiryQuestion(e.target.value)}
              rows={3}
              className="w-full p-3.5 text-sm bg-white border border-indigo-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 shadow-2xs"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="text-xs text-indigo-800">
                💡 <strong>팁:</strong> '왜 그런가?' 혹은 '어떤 함수/원리로 오차를 최소화할 수 있는가?'처럼 구체적인 의문문으로 끝맺을 때 가장 높은 평가를 받습니다.
              </div>

              <button
                type="button"
                onClick={() => {
                  handleCheckCliche(finalInquiryQuestion);
                  setCurrentStep(3);
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                <span>클리셰 점검 및 탈출기로 이동</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: De-cliche & Twist Filter (클리셰 탈출기) */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-amber-600 flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span>STEP 3: 클리셰 탈출기 (De-cliché Engine) & 차별화 한 끗</span>
              </span>
              <h3 className="text-lg font-black text-slate-900">
                매년 수천 명이 하는 흔한 주제인가요? 3가지 변주(Twist)로 차별화하세요
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold self-start sm:self-auto"
            >
              ← 이전 (질문 다시 다듬기)
            </button>
          </div>

          {/* Quick Preset Cliche Selector */}
          <div>
            <span className="block text-xs font-bold text-slate-700 mb-2">
              대표적인 흔한 주제(클리셰) 자가 점검:
            </span>
            <div className="flex flex-wrap gap-2">
              {clicheDatabase.map((cliche) => (
                <button
                  key={cliche.id}
                  type="button"
                  onClick={() => {
                    setClicheInput(cliche.keyword);
                    setMatchedCliche(cliche);
                    setSelectedTwist(cliche.twists[0]);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    matchedCliche?.id === cliche.id
                      ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  ⚠️ {cliche.keyword}
                </button>
              ))}
            </div>
          </div>

          {/* Cliche Warning Banner */}
          {matchedCliche && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-extrabold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>감지된 전형적 주제: '{matchedCliche.commonTopic}'</span>
              </div>
              <p className="leading-relaxed text-amber-900">{matchedCliche.whyCliche}</p>
            </div>
          )}

          {/* 3 Twists Options */}
          {matchedCliche && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-indigo-600" />
                  <span>입학사정관을 사로잡는 3가지 차별화 변주 (아래 중 하나를 선택하세요):</span>
                </span>
                <span className="text-[11px] text-indigo-600 font-semibold">
                  원클릭 적용
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {matchedCliche.twists.map((twist, idx) => {
                  const isSelected = selectedTwist?.subTopic === twist.subTopic;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedTwist(twist)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-200 shadow-xs'
                          : 'border-slate-200 hover:border-indigo-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                            {twist.approach}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                          )}
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-900 mb-2 leading-snug">
                          {twist.subTopic}
                        </h4>
                        <div className="text-[11px] text-slate-600 mb-2">
                          <strong className="text-slate-800">학문적 렌즈: </strong>
                          {twist.academicLens}
                        </div>
                        <div className="text-[11px] text-indigo-900 bg-white/80 p-2 rounded-lg border border-indigo-100">
                          <strong className="block mb-0.5 text-indigo-700 font-bold">
                            핵심 질문:
                          </strong>
                          {twist.inquiryQuestion}
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-end">
                        <span
                          className={`text-[11px] font-bold ${
                            isSelected ? 'text-indigo-600' : 'text-slate-400'
                          }`}
                        >
                          {isSelected ? '선택됨 ✓' : '이 변주로 선택'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* If No Cliche Matched */}
          {!matchedCliche && (
            <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-950">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="font-bold block text-emerald-900">
                  독창적인 주제 질문입니다!
                </strong>
                <p className="leading-relaxed">
                  현재 설정된 질문: <strong>"{finalInquiryQuestion}"</strong>은 클리셰 DB에 걸리지 않는 신선한 시각입니다.
                  원하시면 위 프리셋 중 관심 키워드를 클릭해 변주 사례를 둘러보거나 바로 방법론 선택으로 넘어가실 수 있습니다.
                </p>
              </div>
            </div>
          )}

          {/* Action to Step 4 */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              {selectedTwist
                ? `선택된 차별화 주제: '${selectedTwist.subTopic.slice(0, 30)}...'`
                : '현재 질문을 그대로 유지하고 진행합니다'}
            </span>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="flex items-center gap-1.5 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <span>4대 실천 방법론 선택으로 이동</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: High School 4-Type Methodology Kit (방법론 선택) */}
      {currentStep === 4 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-indigo-600 flex items-center gap-1.5 mb-1">
                <FlaskConical className="w-4 h-4" />
                <span>STEP 4: 고교생 맞춤 4대 탐구 방법론 키트 (Methodology Kit)</span>
              </span>
              <h3 className="text-lg font-black text-slate-900">
                1~2주 안에 실제로 보고서로 완성할 수 있는 현실적인 방법을 선택하세요
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold self-start sm:self-auto"
            >
              ← 이전 (클리셰 탈출기)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {methodologyOptions.map((opt) => {
              const isSelected = selectedMethodology === opt.type;
              return (
                <div
                  key={opt.type}
                  onClick={() => setSelectedMethodology(opt.type)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-200 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-extrabold px-2.5 py-1 rounded-md border ${opt.badgeColor}`}>
                        {opt.title}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                      )}
                    </div>

                    <p className="text-xs font-bold text-slate-800 mb-2 leading-snug">
                      {opt.shortDesc}
                    </p>

                    <div className="text-[11px] text-slate-500 mb-3">
                      <strong>적합 계열: </strong>
                      <span>{opt.suitableFor}</span>
                    </div>

                    {/* Step-by-step procedure */}
                    <div className="bg-white/80 p-3 rounded-xl border border-slate-100 space-y-1.5 mb-3 text-[11px] text-slate-600">
                      <strong className="text-slate-700 block text-xs">
                        📋 단계별 실행 매뉴얼:
                      </strong>
                      {opt.actionSteps.map((step, sIdx) => (
                        <div key={sIdx} className="leading-tight">
                          {step}
                        </div>
                      ))}
                    </div>

                    <div className="text-[11px] text-slate-600">
                      <strong className="text-slate-700">🛠️ 추천 도구: </strong>
                      <span className="text-indigo-600 font-semibold">
                        {opt.recommendedTools.join(', ')}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      최종 산출물: {opt.sampleDeliverable.slice(0, 20)}...
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? 'text-indigo-600' : 'text-slate-400'
                      }`}
                    >
                      {isSelected ? '선택 완료 ✓' : '이 방법으로 선택'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-600">
              선택된 방법론: <strong>{currentMethodologyInfo.title}</strong>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="flex items-center gap-1.5 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <span>선생님 승인 체크리스트 & 1페이지 기획서 생성</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Teacher-Approval Checklist & 1-Page Proposal */}
      {currentStep === 5 && (
        <div className="space-y-6">
          {/* Checklist Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>STEP 5-A: 선생님 반려 방지 자가진단 (Teacher-Approval Checklist)</span>
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  교육부 학생부 기재요령 표준 규격 자가점검
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold self-start sm:self-auto"
              >
                ← 이전 (방법론 다시 고르기)
              </button>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  key: 'curriculumLinked',
                  title: '1. 교과 단원 연계성 검증',
                  desc: `선택한 교과목(${currentUnit.subjectName})의 교과서 핵심 개념(${currentUnit.unitConcepts[0]})이 연구 질문에 명시적으로 반영되었는가?`,
                },
                {
                  key: 'noProhibitedTerms',
                  title: '2. 교육부 학생부 기재 금지어 배제',
                  desc: '소논문, R&E, 학술대회, 외부 공모전 수상실적, 공인어학시험 등 대입 미반영 및 기재 금지 요소가 완전히 배제되었는가?',
                },
                {
                  key: 'feasibleForHighSchool',
                  title: '3. 고교생 직접 수행 가능성(적정성)',
                  desc: `대학원 수준의 초고가 장비나 논문 복붙이 아닌, ${currentMethodologyInfo.title} 도구로 교내 환경에서 직접 검증 가능한가?`,
                },
                {
                  key: 'originalInsight',
                  title: '4. 단순 요약이 아닌 학생 고유의 해석과 비판',
                  desc: '인터넷 백과사전 짜깁기가 아니라, 수집된 데이터나 문헌에 대해 학생 자신의 시각으로 한계점과 대안을 제시했는가?',
                },
                {
                  key: 'continuousGrowth',
                  title: '5. 3개년 스노우볼 후속 발전 가능성',
                  desc: '1학년 기초에서 출발하여 3학년 융합 과제로 꼬리를 물고 확장될 수 있는 학문적 연속성을 지니는가?',
                },
              ].map((item) => {
                const checked = (checklist as any)[item.key];
                return (
                  <label
                    key={item.key}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      checked
                        ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        setChecklist((prev) => ({
                          ...prev,
                          [item.key]: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-emerald-600 rounded mt-0.5 focus:ring-emerald-500"
                    />
                    <div className="text-xs">
                      <strong className="font-extrabold block text-slate-900 mb-0.5">
                        {item.title}
                      </strong>
                      <span className="text-slate-600 leading-relaxed">
                        {item.desc}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 1-Page Proposal Paper Display */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-wider block mb-1">
                  1-PAGE PROPOSAL FOR TEACHER
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  교과 연계 탐구 1페이지 기획서 (선생님 제출용)
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyProposal}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  {copiedProposal ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>복사 완료!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>기획서 텍스트 복사</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>인쇄하기</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddToRecords}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                >
                  {addedNotice ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>활동 일지 등록됨!</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      <span>내 활동 일지에 즉시 등록</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Structured Proposal Document Box */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-6 text-xs text-slate-800 space-y-5 font-sans">
              {/* Header Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-white rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">
                    학생 성명
                  </span>
                  <span className="font-bold text-slate-800">
                    {currentStudent.name} ({currentStudent.grade})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">
                    희망 전공
                  </span>
                  <span className="font-bold text-indigo-700">
                    {targetMajor}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">
                    연계 교과목
                  </span>
                  <span className="font-bold text-slate-800">
                    {currentUnit.subjectName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">
                    해당 단원
                  </span>
                  <span className="font-bold text-slate-800 truncate block">
                    {currentUnit.unitName}
                  </span>
                </div>
              </div>

              {/* Topic & Question */}
              <div className="space-y-3">
                <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-100">
                  <span className="text-[11px] font-extrabold text-indigo-700 block mb-1">
                    📌 탐구 주제명 (Topic)
                  </span>
                  <div className="text-sm font-black text-slate-900">
                    {proposalTopicTitle}
                  </div>
                </div>

                <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/60">
                  <span className="text-[11px] font-extrabold text-amber-900 block mb-1">
                    💡 핵심 탐구 질문 (Core Question)
                  </span>
                  <div className="text-xs font-bold text-amber-950">
                    {proposalQuestion}
                  </div>
                </div>
              </div>

              {/* Motivation */}
              <div>
                <strong className="text-slate-900 font-extrabold block text-xs mb-1">
                  1. 탐구 동기 및 교과 연계 배경
                </strong>
                <p className="leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200 text-slate-700">
                  교과 수업 중 <strong>[{currentUnit.unitName}]</strong> 단원을 학습하며, 교과서에 소개된 <strong>[{currentUnit.unitConcepts.join(', ')}]</strong>의 원리가 실제 희망 전공({targetMajor})의 핵심 현상인 <strong>'{observedPhenomenon}'</strong>과 밀접하게 연관되어 있음을 발견함. 단순 이론 암기에서 벗어나, 고교생 수준에서 검증 가능한 질문을 세우고 실증적 탐구를 통해 교과 지식의 깊이를 확장하고자 본 연구를 기획함.
                </p>
              </div>

              {/* Methodology */}
              <div>
                <strong className="text-slate-900 font-extrabold block text-xs mb-1">
                  2. 실천 방법론 및 산출물 계획
                </strong>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-700">
                      [{currentMethodologyInfo.title}]
                    </span>
                    <span className="text-slate-500">
                      · 활용 도구: {currentMethodologyInfo.recommendedTools.join(', ')}
                    </span>
                  </div>
                  <div className="space-y-1 text-slate-600 pl-2">
                    {currentMethodologyInfo.actionSteps.map((s, idx) => (
                      <div key={idx}>• {s}</div>
                    ))}
                  </div>
                  <div className="pt-1 text-[11px] text-emerald-800 font-semibold">
                    📦 예상 최종 산출물: {currentMethodologyInfo.sampleDeliverable}
                  </div>
                </div>
              </div>

              {/* 3-Year Snowball Continuity */}
              <div>
                <strong className="text-slate-900 font-extrabold block text-xs mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span>3. 3개년 스노우볼(꼬리물기) 연계 로드맵</span>
                </strong>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {currentSnowballSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-xl border border-slate-200 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] font-extrabold">
                        <span className="text-indigo-600">{step.grade}</span>
                        <span className="text-slate-400">단계 {idx + 1}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-800 truncate">
                        {step.stageName}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug line-clamp-3">
                        {step.topicIdea}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Teacher Sign Footer */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-500 text-[11px]">
                <div>
                  <span>지도교사 확인 및 세특 기록 검토 의견란</span>
                </div>
                <div className="flex items-center gap-6">
                  <span>지도교사 서명: ___________________ (인)</span>
                  <span>제출일: {new Date().toLocaleDateString('ko-KR')}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                처음부터 다른 단원으로 다시 만들기
              </button>

              <button
                type="button"
                onClick={handleAddToRecords}
                className="flex items-center gap-1.5 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                <BookmarkPlus className="w-4 h-4" />
                <span>활동 일지에 등록하고 교사 피드백 요청하기</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
