package com.crackit.SpringSecurityJWT.user;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Cours {
    @Id
    @GeneratedValue
    private int id;

    private String CourseName;

    private String description;


}
