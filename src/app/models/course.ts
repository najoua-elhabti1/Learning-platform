export interface FileClass {
  questions: [];
  _id: string;
  chapter: string;
  contentType: string;
  objectifs: string;
  plan: string;
  introduction: string;
  conclusion: string;
  pptFilePath: string;
  visible:boolean;
}

export interface CoursDocument {
  id: string;
  courseName: string;
  chapters: FileClass[];
}
