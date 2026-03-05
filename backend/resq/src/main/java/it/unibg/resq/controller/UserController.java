package it.unibg.resq.controller;

import it.unibg.resq.dto.ChangePasswordRequest;
import it.unibg.resq.dto.ChangeEmailRequest;
import it.unibg.resq.dto.UserPositionDto;
import it.unibg.resq.model.User;
import it.unibg.resq.security.JwtService;
import it.unibg.resq.service.UserService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final JwtService jwtService;
    private final UserService userService;

    // 
    // GESTIONE POSIZIONE (Per Mappa Admin)
    // 

    /**
     *  Per l'Admin: Recupera le posizioni di tutti gli utenti per visualizzare i punti sulla mappa
     * Nota: Questo metodo richiede che getActiveUserPositions() sia definito in UserService
     */
    @GetMapping("/active-locations")
    public ResponseEntity<List<UserPositionDto>> getAllUserLocations() {
        return ResponseEntity.ok(userService.getActiveUserPositions());
    }

    /**
     *  Per l'Utente: Invia la propria posizione (nodeId) quando entra in una stanza
     * Nota: Questo metodo richiede che updateUserLocation() sia definito in UserService
     */
    @PostMapping("/me/location")
    public ResponseEntity<?> updateMyLocation(
            @RequestBody Map<String, String> locationRequest,
            Authentication authentication
    ) {
        String email = getEmailFromAuthentication(authentication);
        String nodeId = locationRequest.get("nodeId");

        if (nodeId == null || nodeId.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "nodeId mancante"));
        }

        userService.updateUserLocation(email, nodeId);

        return ResponseEntity.ok(Map.of("message", "Posizione aggiornata con successo"));
    }

    // 
    // PROFILO E SICUREZZA (Esistente)
    // 

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        String email = getEmailFromAuthentication(authentication);
        User user = userService.getByEmail(email);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/me/password")
    public ResponseEntity<?> changeMyPassword(
            @RequestBody ChangePasswordRequest request,
            Authentication authentication
    ) {
        String email = getEmailFromAuthentication(authentication);

        userService.changePassword(email, request);
        User user = userService.getByEmail(email);
        String newToken = jwtService.generateToken(user);

        return ResponseEntity.ok(Map.of("token", newToken));
    }

    @PutMapping("/user/email")
    public ResponseEntity<?> changeMyEmail(
            @RequestBody ChangeEmailRequest request,
            Authentication authentication
    ) {
        String oldEmail = getEmailFromAuthentication(authentication);

        userService.changeEmail(oldEmail, request.getNewEmail());
        User updatedUser = userService.getByEmail(request.getNewEmail());
        String newToken = jwtService.generateToken(updatedUser);

        return ResponseEntity.ok(Map.of("token", newToken));
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> deleteMyAccount(Authentication authentication) {
        String email = getEmailFromAuthentication(authentication);
        userService.deleteByEmail(email);
        return ResponseEntity.ok(Map.of("message", "Account deleted"));
    }

    // 
    // UTILITY
    // 

    /**
     * Estrae l'email dall'oggetto Authentication per evitare ripetizioni di codice
     */
    private String getEmailFromAuthentication(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            return ((User) principal).getEmail();
        }
        return principal.toString();
    }



    @PutMapping("/me")
    public ResponseEntity<?> updateMyProfile(
            @RequestBody User updatedData,
            Authentication authentication
    ) {

        Object principal = authentication.getPrincipal();

        String email;

        if (principal instanceof User) {
            email = ((User) principal).getEmail();
        } else {
            email = principal.toString();
        }

        // aggiorna utente
        User updatedUser = userService.updateProfile(email, updatedData);

        return ResponseEntity.ok(updatedUser);
    }








}
