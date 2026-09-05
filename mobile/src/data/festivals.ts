export type Festival = {
  id: string;
  title: string;
  location: string;
  date: string;
  dday: string;
  gradient: [string, string, string];
};

export const festivals: Festival[] = [
  {
    id: '1',
    title: 'THE GRATEFUL CAMP 2026 - 신안',
    location: '짱뚱어해수욕장 일대',
    date: '2026-08-31',
    dday: 'D-4',
    gradient: ['#f2b9ff', '#9a4cff', '#1c1230'],
  },
  {
    id: '2',
    title: '2026 지리산 재즈페스티벌 - 구례',
    location: '지리산천은사',
    date: '2026-08-31',
    dday: 'D-4',
    gradient: ['#8a72ff', '#2b1a4f', '#090909'],
  },
  {
    id: '3',
    title: '2026 잔다리 페스타',
    location: '홍대 일대',
    date: '2026-08-31',
    dday: 'D-4',
    gradient: ['#ff9728', '#ff5a66', '#6f1c62'],
  },
  {
    id: '4',
    title: '2026 WITH STAGE & 시즌6',
    location: 'CKL스테이지',
    date: '2026-08-31',
    dday: 'D-4',
    gradient: ['#c13b7d', '#c13b7d', '#c13b7d'],
  },
  {
    id: '5',
    title: '2026 파주포크 페스티벌',
    location: '문산행복센터 대공연장, 임진각 평화누리 야외공연장',
    date: '2026-08-31',
    dday: 'D-4',
    gradient: ['#f3d1bf', '#b98b72', '#4a4a4a'],
  },
  {
    id: '6',
    title: '사운드 플래닛 페스티벌 2026 - 인천',
    location: '파라다이스시티',
    date: '2026-08-31',
    dday: 'D-5',
    gradient: ['#55bfff', '#2270b0', '#0e1f3d'],
  },
  {
    id: '7',
    title: '매들리 메들리 2026',
    location: '문화비축기지',
    date: '2026-08-31',
    dday: 'D-5',
    gradient: ['#4ec8b1', '#33ae86', '#137264'],
  },
  {
    id: '8',
    title: '사운드 플래닛 페스티벌 2026 <미드나잇 파티> - 인천',
    location: '클럽 크로마',
    date: '2026-08-31',
    dday: 'D-5',
    gradient: ['#9a47d8', '#8e33c0', '#521a79'],
  },
  {
    id: '9',
    title: 'VINYL ON TRACK 음악 페스티벌',
    location: '현대카드 UNDERSTAGE',
    date: '2026-08-31',
    dday: 'D-5',
    gradient: ['#111111', '#1f1f1f', '#000000'],
  },
  {
    id: '10',
    title: 'SIMF 신포 인터내셔널 뮤직 페스티벌 2026 - 인천',
    location: '인천맥주 호랑이',
    date: '2026-08-31',
    dday: 'D-5',
    gradient: ['#42c48a', '#2aa679', '#0f6e56'],
  },
  {
    id: '11',
    title: '서울 파크 뮤직 페스티벌',
    location: '서울대학교 음악대학',
    date: '2026-08-25~2026-08-27',
    dday: 'D-4',
    gradient: ['#4f69db', '#304bb8', '#21337f'],
  },
];
