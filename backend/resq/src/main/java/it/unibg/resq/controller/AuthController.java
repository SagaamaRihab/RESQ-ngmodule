package it.unibg.resq.controller;

import it.unibg.resq.dto.SigninRequest;
import it.unibg.resq.dto.SignupRequest;
import it.unibg.resq.security.JwtService;
import it.unibg.resq.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import it.unibg.resq.dto.SigninResponse;
import java.util.Map;
import org.springframework.web.server.ResponseStatusException;






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

        return ResponseEntity.ok(
                Map.of("message", "User registered successfully")
        );
    }


    // =====================
    // SIGNIN
    // =====================
    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestBody SigninRequest request) {

        var user = authService.authenticate(request);

        String token = jwtService.generateToken(user);

        return ResponseEntity.ok(
                new SigninResponse(
                        token,
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getRole().name()
                )
        );
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<?> handleResponseStatus(ResponseStatusException ex) {
        return ResponseEntity
                .status(ex.getStatusCode())
                .body(Map.of(
                        "error", ex.getStatusCode().toString(),
                        "message", ex.getReason()
                ));
    }


}
