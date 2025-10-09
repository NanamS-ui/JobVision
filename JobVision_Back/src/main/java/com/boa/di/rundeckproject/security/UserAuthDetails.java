package com.boa.di.rundeckproject.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import com.boa.di.rundeckproject.model.UserAuth;
import java.util.Collection;
import java.util.List;

public class UserAuthDetails implements UserDetails {

    private final UserAuth userAuth;

    public UserAuthDetails(UserAuth userAuth) {
        this.userAuth = userAuth;
    }

    public UserAuth getUserAuth() {
        return userAuth;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + userAuth.getRole().getVal()));
    }

    @Override
    public String getPassword() {
        return userAuth.getPassword();
    }

    @Override
    public String getUsername() {
        return userAuth.getMatricule();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return userAuth.isActive();
    }
}
