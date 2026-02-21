package it.unibg.resq.dto;

public record CorridorDTO(
        Long id,
        String fromNode,
        String toNode,
        double weight,
        boolean blocked
) {}

