package com.crackit.SpringSecurityJWT.user;

import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Question {
    @Id
    private Integer numQuestion;

    @Lob
    @Column(length = 100000)
    private String question;

    private String course;

    private String chapter;
    @Lob
    @Column(length = 100000)
    private String response;

    @Lob
    @Column(length = 100000)
    private String imageContent;



}
