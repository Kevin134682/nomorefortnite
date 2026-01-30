
export interface Game {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  iframeUrl: string;
  category: string;
  isHot?: boolean;
}

export type Category = 'All' | 'Action' | 'Puzzle' | 'Sports' | 'Arcade' | 'Strategy' | 'Adventure';
