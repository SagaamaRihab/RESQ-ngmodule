package it.unibg.resq.service;

import it.unibg.resq.dto.ChangePasswordRequest;
import it.unibg.resq.dto.UserPositionDto; // Import aggiunto
import it.unibg.resq.model.User;
import it.unibg.resq.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections; // Import aggiunto
import java.util.List;        // Import aggiunto

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // 
    // NUOVI METODI PER LA POSIZIONE (Iterazione 2)
    // 

    /**
     * Aggiorna la posizione dell'utente (Salvataggio nel DB)
     */
    public void updateUserLocation(String email, String nodeId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Qui dovresti avere un campo 'currentNodeId' nel tuo modello User
        // user.setCurrentNodeId(nodeId);
        userRepository.save(user);
    }

    /**
     * Recupera le posizioni di tutti gli utenti attivi per la mappa
     */
    public List<UserPositionDto> getActiveUserPositions() {
        // Per ora restituiamo una lista vuota per far compilare il progetto.
        // In seguito, implementeremo la logica per mappare gli utenti ai DTO.
        return Collections.emptyList();
    }

    // 
    // METODI ESISTENTI
    // 

    public User changePassword(String email, ChangePasswordRequest request) {

        if (request.getOldPassword() == null || request.getNewPassword() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing passwords");
        }

        if (request.getNewPassword().length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password too short");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return user;
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User not found"
                        )
                );
    }

    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public void changeEmail(String oldEmail, String newEmail) {

        User user = userRepository.findByEmail(oldEmail)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User not found"
                        ));

        user.setEmail(newEmail);

        userRepository.save(user);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User not found"
                        ));
    }

    public void deleteByEmail(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User not found"
                        ));

        userRepository.delete(user);
    }



    public User updateProfile(String email, User data) {

        User user = userRepository.findByEmail(email)
                .orElseThrow();

        user.setUsername(data.getUsername());
        user.setPhone(data.getPhone());
        user.setCourse(data.getCourse());
        user.setAbout(data.getAbout());

        return userRepository.save(user);
    }







}
