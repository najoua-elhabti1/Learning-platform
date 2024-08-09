package com.crackit.SpringSecurityJWT.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.io.File;
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
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }
}
