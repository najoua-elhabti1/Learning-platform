package com.crackit.SpringSecurityJWT.entities.mongo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "Courses")
public class CoursDocument {

    @Id
    private String id;
    private String courseName;
    private String niveau;
    private int level;
    @Field("fileDocuments")
    private List<FileClass> chapters;
    public FileClass getChapterByChapterName(String chapterName){
        for (FileClass f:
                chapters) {
            if(f.getChapter().equals(chapterName)){
                return f;
            }
        }
        return null;
    }
    public FileClass getChapterByChapterID(String chapterId){
        for (FileClass f:
                chapters) {
            if(f.getId().equals(chapterId)){
                return f;
            }
        }
        return null;
    }

}
