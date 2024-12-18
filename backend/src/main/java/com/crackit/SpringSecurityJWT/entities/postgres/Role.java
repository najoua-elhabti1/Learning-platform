package com.crackit.SpringSecurityJWT.entities.postgres;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;

@RequiredArgsConstructor
public enum Role {
  ADMIN,
 Prof,
  Student;

  public List<SimpleGrantedAuthority> getAuthorities() {
    return List.of(new SimpleGrantedAuthority("ROLE_" + this.name()));
  }
}
