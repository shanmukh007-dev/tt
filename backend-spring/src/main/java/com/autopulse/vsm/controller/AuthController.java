package com.autopulse.vsm.controller;

import com.autopulse.vsm.config.AuthInterceptor;
import com.autopulse.vsm.dto.LoginRequest;
import com.autopulse.vsm.dto.UserResponse;
import com.autopulse.vsm.model.User;
import com.autopulse.vsm.service.AuthService;
import com.autopulse.vsm.util.JwtUtil;
import com.autopulse.vsm.util.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    public AuthController(AuthService authService, JwtUtil jwtUtil) {
        this.authService = authService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public UserResponse login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        User user = authService.authenticate(request);
        String token = jwtUtil.generateToken(user.getId());

        ResponseCookie cookie = ResponseCookie.from(AuthInterceptor.COOKIE_NAME, token)
                .httpOnly(true)
                .path("/")
                .maxAge(Duration.ofDays(7))
                .sameSite("Lax")
                .secure(false)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return authService.toResponse(user);
    }

    @PostMapping("/logout")
    public Map<String, Boolean> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(AuthInterceptor.COOKIE_NAME, "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .secure(false)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return Map.of("success", true);
    }

    @GetMapping("/me")
    public UserResponse getCurrentUser(HttpServletRequest request) {
        User user = SecurityUtils.getAuthenticatedUser(request);
        return authService.toResponse(user);
    }
}
