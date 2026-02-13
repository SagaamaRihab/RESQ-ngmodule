package it.unibg.resq.controller;

import it.unibg.resq.dto.ChangePasswordRequest;
import it.unibg.resq.model.User;
import it.unibg.resq.security.JwtService;
import it.unibg.resq.service.UserService;
import it.unibg.resq.dto.ChangeEmailRequest;
import java.util.Map;

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


    @PutMapping("/user/email")
    public ResponseEntity<?> changeMyEmail(
            @RequestBody ChangeEmailRequest request,
            Authentication authentication
    ) {

        Object principal = authentication.getPrincipal();

        String oldEmail;

        if (principal instanceof User) {
            oldEmail = ((User) principal).getEmail();
        } else {
            oldEmail = principal.toString();
        }

        // cambia email nel DB
        userService.changeEmail(oldEmail, request.getNewEmail());

        // recupera user aggiornato
        User updatedUser = userService.getByEmail(request.getNewEmail());

        // genera token con USER
        String newToken = jwtService.generateToken(updatedUser);

        return ResponseEntity.ok(
                Map.of("token", newToken)
        );
    }


    @DeleteMapping("/me")
    public ResponseEntity<?> deleteMyAccount(Authentication authentication) {

        Object principal = authentication.getPrincipal();

        String email;

        if (principal instanceof User) {
            email = ((User) principal).getEmail();
        } else {
            email = principal.toString();
        }

        userService.deleteByEmail(email);

        return ResponseEntity.ok(
                Map.of("message", "Account deleted")
        );
    }






}
