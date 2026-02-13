package it.unibg.resq.controller;

import it.unibg.resq.dto.ChangePasswordRequest;
import it.unibg.resq.model.User;
import it.unibg.resq.security.JwtService;
import it.unibg.resq.service.UserService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final JwtService jwtService;
    private final UserService userService;

    @PutMapping("/me/password")
    public ResponseEntity<?> changeMyPassword(
            @RequestBody ChangePasswordRequest request,
            Authentication authentication
    ) {

        Object principal = authentication.getPrincipal();

        String email;

        if (principal instanceof User) {
            email = ((User) principal).getEmail();
        } else {
            email = principal.toString();
        }

        // ✅ Cambia password
        userService.changePassword(email, request);

        // ✅ Recupera user dal DB
        User user = userService.getByEmail(email);

        // ✅ Token nuovo con USER
        String newToken = jwtService.generateToken(user);

        return ResponseEntity.ok(
                Map.of("token", newToken)
        );
    }

}
