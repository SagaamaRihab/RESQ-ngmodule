package it.unibg.resq.dto;

import java.util.List;

public record MapDTO(
        List<NodeDTO> nodes,
        List<CorridorDTO> corridors
) {}
