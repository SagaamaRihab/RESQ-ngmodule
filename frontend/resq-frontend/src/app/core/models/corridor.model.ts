export interface Corridor {
  id: number;
  fromNode: string;
  toNode: string;
  weight: number;
  blocked: boolean;
}
