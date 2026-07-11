export type Capture = {
  id: string;
  note: string;
  students: string[];
  tags: string[];
  evidenceType: string;
  timestamp: string;
  summary: string;
  followUp?: boolean;
  primaryStudent: string;
};
