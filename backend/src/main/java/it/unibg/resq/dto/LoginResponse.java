package it.unibg.resq.dto;

public record LoginResponse(
        String token,
        String role
) {}
