package it.unibg.resq.dto;

import java.util.List;

public record RouteRequest(
        String startNodeId,
        String endNodeId,
        boolean weighted,
        List<CorridorDTO> corridors
) {}
