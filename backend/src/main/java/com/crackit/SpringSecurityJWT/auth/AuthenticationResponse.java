package com.crackit.SpringSecurityJWT.auth;

import com.crackit.SpringSecurityJWT.entities.postgres.Role;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationResponse {

    @JsonProperty("access_token")
    private String accessToken;
    @JsonProperty("role")
    private Role role;

    @JsonProperty("needsPasswordChange")
    private boolean needsPasswordChange;

}
