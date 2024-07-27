package com.crackit.SpringSecurityJWT.user;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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

    private String Question;

    private String course;

    private String chapter;

    private String response;
}
