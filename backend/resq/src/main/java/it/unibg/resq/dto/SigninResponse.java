package it.unibg.resq.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SigninResponse {

    private String token;
    private Long id;
    private String username;
    private String email;
    private String role;
}
