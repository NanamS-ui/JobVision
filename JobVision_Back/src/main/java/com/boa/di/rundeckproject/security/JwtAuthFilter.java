package com.boa.di.rundeckproject.security;

import com.boa.di.rundeckproject.model.UserAuth;
import com.boa.di.rundeckproject.repository.BlacklistedTokenRepository;
import com.boa.di.rundeckproject.repository.UserAuthRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final BlacklistedTokenRepository blacklistedTokenRepository;
    private final UserAuthRepository userAuthRepository;

    public JwtAuthFilter(JwtUtil jwtUtil,
                         BlacklistedTokenRepository blacklistedTokenRepository,
                         UserAuthRepository userAuthRepository) {
        this.jwtUtil = jwtUtil;
        this.blacklistedTokenRepository = blacklistedTokenRepository;
        this.userAuthRepository = userAuthRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getServletPath();


        if (path.equals("/api/auth/login")
                || path.equals("/api/users/create")
                || path.startsWith("/api/logs/export/")) {
            filterChain.doFilter(request, response);
            return;
        }


        String token = null;
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        } else if (request.getCookies() != null) {
            for (var cookie : request.getCookies()) {
                if ("jwt".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        if (token == null || blacklistedTokenRepository.existsByToken(token) || !jwtUtil.validateToken(token)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Token invalide ou expiré\"}");
            return;
        }

        String matricule = jwtUtil.getUsernameFromToken(token);
        UserAuth user = userAuthRepository.findByMatricule(matricule).orElse(null);
        if (user == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        UserAuthDetails userDetails = new UserAuthDetails(user);
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        SecurityContextHolder.getContext().setAuthentication(authentication);

        filterChain.doFilter(request, response);
    }

}
