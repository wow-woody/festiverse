import { mockFestivals } from '@/data/mockFestivals';
import type { Performance } from '@/types/festival';

// 낮 12시(정오)부터 시작하는 임시 타임테이블 템플릿.
// 실제 라인업 정보가 아니라 화면/알림/겹침 기능 확인용 더미 데이터이며,
// 모든 축제의 start_date~end_date 매일에 동일하게 복사해서 채워넣음
// (시작일 하루치만 채우면 오늘이 2일차/3일차인 축제는 NOW 표시가 안 뜨는 문제가 있었음).
const TEMPLATE: Array<{
  stage: string;
  artist: string;
  genre: string;
  startMin: number;
  endMin: number;
  headliner?: boolean;
}> = [
  { stage: 'Main Stage', artist: '한여름밤', genre: 'POP', startMin: 0, endMin: 60 },
  { stage: 'Main Stage', artist: '푸른수요일', genre: 'INDIE', startMin: 90, endMin: 150 },
  { stage: 'Main Stage', artist: '블랙아웃', genre: 'ROCK', startMin: 180, endMin: 240 },
  { stage: 'Main Stage', artist: '스텔라파도', genre: 'EDM', startMin: 270, endMin: 330 },
  { stage: 'Main Stage', artist: '오로라레인', genre: 'HIP-HOP', startMin: 360, endMin: 450, headliner: true },
  { stage: 'Main Stage', artist: '마지막불꽃', genre: 'ROCK', startMin: 480, endMin: 570, headliner: true },

  { stage: 'Sub Stage', artist: '여름소나기', genre: 'ACOUSTIC', startMin: 30, endMin: 90 },
  { stage: 'Sub Stage', artist: '분홍고래', genre: 'R&B', startMin: 120, endMin: 180 },
  { stage: 'Sub Stage', artist: '네온파도', genre: 'HOUSE', startMin: 210, endMin: 270 },
  { stage: 'Sub Stage', artist: '달빛유령', genre: 'TECHNO', startMin: 300, endMin: 360 },
  { stage: 'Sub Stage', artist: '레드시그널', genre: 'BASS', startMin: 390, endMin: 450 },
  { stage: 'Sub Stage', artist: '자정버스', genre: 'HOUSE', startMin: 480, endMin: 540 },

  { stage: 'Forest Stage', artist: '이슬비', genre: 'AMBIENT', startMin: 0, endMin: 50 },
  { stage: 'Forest Stage', artist: '초록우산', genre: 'FOLK', startMin: 70, endMin: 120 },
  { stage: 'Forest Stage', artist: '숲의소리', genre: 'CHILL', startMin: 150, endMin: 210 },
  { stage: 'Forest Stage', artist: '별자리여행', genre: 'DOWNTEMPO', startMin: 240, endMin: 300 },
  { stage: 'Forest Stage', artist: '코발트비', genre: 'LIVE BAND', startMin: 330, endMin: 420, headliner: true },
];

const DAY_START_MIN = 12 * 60; // 낮 12시

// 타임존 표기 없는 "로컬 시각" ISO 문자열로 만들어서, 어느 기기/브라우저에서 열어도
// 항상 화면에 "12:00"부터 시작하는 것처럼 보이게 함 (실제 시간대 변환 없이 달력 계산만 수행).
function toLocalIso(dateStr: string, minutesFromMidnight: number) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d, 0, 0, 0, 0);
  date.setMinutes(date.getMinutes() + minutesFromMidnight);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

function eachDateBetween(startDate: string, endDate: string): string[] {
  const [sy, sm, sd] = startDate.split('-').map(Number);
  const [ey, em, ed] = endDate.split('-').map(Number);
  const cursor = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);
  const pad = (n: number) => String(n).padStart(2, '0');
  const dates: string[] = [];

  while (cursor <= end) {
    dates.push(`${cursor.getFullYear()}-${pad(cursor.getMonth() + 1)}-${pad(cursor.getDate())}`);
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function buildLineup(festivalId: string, startDate: string, endDate: string): Performance[] {
  return eachDateBetween(startDate, endDate).flatMap((dateStr) =>
    TEMPLATE.map((slot, index) => ({
      id: `${festivalId}-${dateStr}-perf-${index + 1}`,
      festival_id: festivalId,
      artist_name: slot.artist,
      genre: slot.genre,
      stage: slot.stage,
      start_time: toLocalIso(dateStr, DAY_START_MIN + slot.startMin),
      end_time: toLocalIso(dateStr, DAY_START_MIN + slot.endMin),
      headliner: slot.headliner ?? false,
    }))
  );
}

export const mockPerformancesByFestivalId: Record<string, Performance[]> = Object.fromEntries(
  mockFestivals.map((festival) => [
    festival.id,
    buildLineup(festival.id, festival.start_date, festival.end_date),
  ])
);
