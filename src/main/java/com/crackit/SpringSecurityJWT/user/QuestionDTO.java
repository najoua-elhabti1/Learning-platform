package com.crackit.SpringSecurityJWT.user;public class QuestionDTO {

    private String chapter;

    private int numQuestion;
    private String question;
    private String response;

    // Constructor
    public QuestionDTO(String chapter, int numQuestion, String question, String response) {
        this.chapter = chapter;

        this.numQuestion = numQuestion;
        this.question = question;
        this.response = response;
    }

    // Getters
    public String getChapter() {
        return chapter;
    }


    public String getChapterName() { return chapter; }
    public int getNumQuestion() {
        return numQuestion;
    }

    public String getResponseText() { return response; }
    public String getQuestion() {
        return question;
    }

    public String getQuestionText() { return question; }

    public String getResponse() {
        return response;
    }

    // Setters (if needed)
    public void setChapter(String chapter) {
        this.chapter = chapter;
    }



    public void setNumQuestion(int numQuestion) {
        this.numQuestion = numQuestion;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public void setResponse(String response) {
        this.response = response;
    }

}
