package it.unibg.resq.service;

import it.unibg.resq.dto.SigninRequest;
import it.unibg.resq.dto.SignupRequest;
import it.unibg.resq.model.Role;
import it.unibg.resq.model.User;
import it.unibg.resq.repository.UserRepository;
import it.unibg.resq.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    // 🔐 chiave segreta per ADMIN
    private static final String ADMIN_SECRET = "RESQ_ADMIN_2026";

    // =======================
    // SIGNUP
    // =======================
    public void signup(SignupRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email already registered"
            );
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Username already taken"
            );
        }


        // 🔐 controllo ADMIN
        if ("ADMIN".equals(request.getRole())) {

            if (request.getAdminKey() == null ||
                    !request.getAdminKey().equals(ADMIN_SECRET)) {

                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Admin key missing or invalid"
                );
            }
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.valueOf(request.getRole())); // ✅ ENUM

        userRepository.save(user);
    }

    // =======================
    // SIGNIN
    // =======================
    public String signin(SigninRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User not found"
                        )
                );

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash())) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid credentials"
            );
        }

        return jwtService.generateToken(user);
    }
}
