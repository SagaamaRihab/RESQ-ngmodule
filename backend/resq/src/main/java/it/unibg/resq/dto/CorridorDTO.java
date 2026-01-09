package it.unibg.resq.dto;

public record CorridorDTO(
        String fromNode,
        String toNode,
        double weight,
        boolean blocked
) {}
