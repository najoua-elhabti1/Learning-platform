package com.crackit.SpringSecurityJWT.user;

import java.util.List;

public class ChapterDetailsResponse {
    private final String chapter;
    private final String objectifs;
    private final String plan;
    private final String introduction;
    private final String conclusion;
    private boolean isVisible;
    private List<Question> questions;  // Ajouter ce champ

    public ChapterDetailsResponse(String chapter, String objectifs, String plan, String introduction, String conclusion, boolean isVisible, List<Question> questions) {
        this.chapter = chapter;
        this.objectifs = objectifs;
        this.plan = plan;
        this.introduction = introduction;
        this.conclusion = conclusion;
        this.isVisible = isVisible;
        this.questions = questions;  // Initialiser ce champ
    }

    // Getters nécessaires pour la sérialisation JSON
    public String getChapter() {
        return chapter;
    }

    public String getObjectifs() {
        return objectifs;
    }

    public String getPlan() {
        return plan;
    }

    public String getIntroduction() {
        return introduction;
    }

    public String getConclusion() {
        return conclusion;
    }

    public boolean isVisible() {
        return isVisible;
    }

    public List<Question> getQuestions() {  // Ajouter ce getter
        return questions;
    }
}
