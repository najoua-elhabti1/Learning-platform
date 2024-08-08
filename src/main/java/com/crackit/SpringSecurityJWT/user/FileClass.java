package com.crackit.SpringSecurityJWT.user;

import java.util.List;

public class FileClass {
    private String id;
    private String chapter;
    private String contentType;
    private String objectifs;
    private String plan;
    private String introduction;
    private String conclusion;
    private boolean isVisible;
    private String pptFilePath;
    private List<Question> questions;

    public FileClass(String id, String chapter, String contentType, String objectifs, String plan, String introduction, String conclusion, boolean isVisible, String pptFilePath, List<Question> questions) {
        this.id = id;
        this.chapter = chapter;
        this.contentType = contentType;
        this.objectifs = objectifs;
        this.plan = plan;
        this.introduction = introduction;
        this.conclusion = conclusion;
        this.isVisible = isVisible;
        this.pptFilePath = pptFilePath;
        this.questions = questions;
    }

    public FileClass() {
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getChapter() {
        return chapter;
    }

    public void setChapter(String chapter) {
        this.chapter = chapter;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public String getObjectifs() {
        return objectifs;
    }

    public void setObjectifs(String objectifs) {
        this.objectifs = objectifs;
    }

    public String getPlan() {
        return plan;
    }

    public void setPlan(String plan) {
        this.plan = plan;
    }

    public String getIntroduction() {
        return introduction;
    }

    public void setIntroduction(String introduction) {
        this.introduction = introduction;
    }

    public String getConclusion() {
        return conclusion;
    }

    public void setConclusion(String conclusion) {
        this.conclusion = conclusion;
    }

    public boolean isVisible() {
        return isVisible;
    }


    public String getPptFilePath() {
        return pptFilePath;
    }

    public void setPptFilePath(String pptFilePath) {
        this.pptFilePath = pptFilePath;
    }

    public List<Question> getQuestions() {
        return questions;
    }

    public void setQuestions(List<Question> questions) {
        this.questions = questions;
    }

    public void setIsVisible(boolean isVisible) {
        this.isVisible=isVisible;
    }
}
