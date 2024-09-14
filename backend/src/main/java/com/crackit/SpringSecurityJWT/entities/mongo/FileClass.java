package com.crackit.SpringSecurityJWT.entities.mongo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
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



}
