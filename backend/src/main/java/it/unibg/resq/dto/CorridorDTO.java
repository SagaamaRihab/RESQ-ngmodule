package it.unibg.resq.dto;

public record CorridorDTO(
        String from,
        String to,
        double weight,
        boolean blocked
) {}
