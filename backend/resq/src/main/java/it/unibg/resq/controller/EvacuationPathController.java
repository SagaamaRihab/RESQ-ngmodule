package it.unibg.resq.controller;

import it.unibg.resq.dto.EvacuationPathResponse;
import it.unibg.resq.dto.RouteRequest;
import it.unibg.resq.dto.RouteResponse;
import it.unibg.resq.service.EvacuationPathService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evacuation")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class EvacuationPathController {

    private final EvacuationPathService evacuationPathService;

    // =========================
    // 🚨 EVACUAZIONE DA DATABASE
    // =========================
    @GetMapping("/from/{start}")
    public EvacuationPathResponse getEvacuationPath(@PathVariable String start) {

        List<String> path = evacuationPathService.calculateEvacuationPath(start);

        if (path.isEmpty()) {
            return new EvacuationPathResponse(
                    path,
                    "Nessuna via di evacuazione disponibile"
            );
        }

        return new EvacuationPathResponse(
                path,
                "Percorso di evacuazione calcolato con successo"
        );
    }

    // =========================
    // 🧭 ROUTE GENERICA (DTO)
    // =========================
    @PostMapping("/route")
    public RouteResponse calculateRoute(@RequestBody RouteRequest request) {
        return evacuationPathService.calculateRoute(request);
    }
}
