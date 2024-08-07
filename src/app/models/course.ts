export interface FileClass {
  _id: string;
  chapter: string;
  contentType: string;
  objectifs: string;
  plan: string;
  introduction: string;
  conclusion: string;
  pptFilePath: string;
}

export interface CoursDocument {
  id: string;
  courseName: string;
  chapters: FileClass[];
}
