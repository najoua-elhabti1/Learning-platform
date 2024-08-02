package com.crackit.SpringSecurityJWT.user;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "_questionReponse")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class QuestionReponse {
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

    private String imagePath;
    @Lob
    @Column(length = 100000)
    private String imageContent;
}
