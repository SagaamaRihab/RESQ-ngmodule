package it.unibg.resq.controller;

import it.unibg.resq.dto.LoginRequest;
import it.unibg.resq.dto.LoginResponse;
import it.unibg.resq.model.User;
import it.unibg.resq.repository.UserRepository;
import it.unibg.resq.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request) {

        String token = authService.login(request.username(), request.password());
        User user = userRepository.findByUsername(request.username()).orElseThrow();

        return ResponseEntity.ok(
                new LoginResponse(token, user.getRole().name())
        );
    }
}
