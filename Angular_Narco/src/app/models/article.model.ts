export interface Article {
  id?: number;
  etat?: string;
  description?: string;
  prix?: number;
  dateExtraction?: Date;
  idBodyPart?: {
    id: number;
    nameBodyPart?: string;
    name?: string;
    description?: string;
  };
}
