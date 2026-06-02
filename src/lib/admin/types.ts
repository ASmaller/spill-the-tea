export const NEW_TAG = "new";

// TODO: storage pipeline. Picked Files are captured locally and only
// `filename` is set. `url` is populated once a real upload lands.
export type PhotoRef = {
  filename: string;
  url?: string;
};

export type TeaStat = {
  id: string;
  name: string;
  tags: string[];
  rating: number | null;
  votes: number;
  distribution: [number, number, number, number, number];
  photo?: PhotoRef;
};

export type TeaForm = {
  name: string;
  tags: string[];
  photo: PhotoRef | null;
};

// TODO: Move to database and allow admin user to update
export const TAG_OPTIONS = [
  "eco",
  "exotic",
] as const;

export type Comment = {
  id: number;
  userId?: string;
  tea: {
    id: number;
    name: string;
  };
  rating: number;
  comment: string;
  when: string;
  postedAt?: string;
  tags: string[];
};

export type TrendSeries = {
  name: string;
  color: string;
  data: number[];
};

export type TrendFootnote = {
  label: string;
  value: string;
  sub: string;
  tone: string;
};

export type TagBarItem = {
  label: string;
  count: number;
  color?: string;
};

export type Kpi = {
  label: string;
  value: string;
  trend: string;
  sub: string;
  spark: number[];
  color: string;
};
