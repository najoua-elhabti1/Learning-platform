package com.crackit.SpringSecurityJWT.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
@Data
@Builder
@AllArgsConstructor
public class ChapterDetailsResponse {
    private final String id;

    private final String chapter;
    private final String objectifs;
    private final String plan;
    private final String introduction;
    private final String conclusion;
    private boolean isVisible;
    private List<Question> questions;




}
