package it.unibg.resq.controller;

import it.unibg.resq.dto.SigninRequest;
import it.unibg.resq.dto.SignupRequest;
import it.unibg.resq.security.JwtService;
import it.unibg.resq.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map; // ✅ IMPORT MANCANTE

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService; // ✅ CAMPO MANCANTE

    // =====================
    // SIGNUP
    // =====================
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        authService.signup(request);
        return ResponseEntity.ok("User registered successfully");
    }

    // =====================
    // SIGNIN
    // =====================
    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestBody SigninRequest request) {

        String token = authService.signin(request);
        String role = jwtService.extractRole(token);

        return ResponseEntity.ok(
                Map.of(
                        "token", token,
                        "role", role
                )
        );
    }
}
