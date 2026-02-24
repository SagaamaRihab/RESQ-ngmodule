package it.unibg.resq.dto;

import java.util.List;

public record EvacuationPathResponse(
        List<String> path,
        String message
) {}
