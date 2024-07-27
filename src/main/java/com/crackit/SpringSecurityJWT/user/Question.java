package com.crackit.SpringSecurityJWT.user;



public class Question {
    private Integer numQuestion;
    private String question;

    private String response;

    public Question() {}

    // Constructeurs, getters et setters
    public Question(Integer numQuestion, String question, String response) {
        this.numQuestion = numQuestion;
        this.question = question;
        this.response = response;
    }

    public Integer getNumQuestion() {
        return numQuestion;
    }

    public String getQuestion() {
        return question;
    }


    public String getResponse() {
        return response;
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
