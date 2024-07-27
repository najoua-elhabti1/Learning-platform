package com.crackit.SpringSecurityJWT.user;

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
@Document(collection = "files")
public class FileDocument {

    @Id
    private String id;

    @Field("fileName")
    private String fileName;

    @Field("chapter")
    private String chapter;

    @Field("course")
    private String course;

    @Field("contentType")
    private String contentType;

    @Field("objectifs")
    private String objectifs;

    @Field("plan")
    private String plan;

    @Field("introduction")
    private String introduction;

    @Field("conclusion")
    private String conclusion;

    @Field("isVisible")
    private Boolean isVisible;

    @Field("data")
    private byte[] data;

    private List<Question> questions;

    public String getChapter() {
        return chapter;
    }

    public boolean getIsVisible() {
        return isVisible;
    }

    public void setIsVisible(boolean isVisible) {
        this.isVisible = isVisible;
    }

    public void setQuestions(List<Question> questions) {
        this.questions = questions;
    }

    public List<Question> getQuestions() {
        return questions;
    }
}
