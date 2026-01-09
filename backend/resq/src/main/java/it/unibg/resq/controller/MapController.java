package it.unibg.resq.controller;

import it.unibg.resq.dto.CorridorDTO;
import it.unibg.resq.dto.MapDTO;
import it.unibg.resq.service.MapService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/map")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class MapController {

    private final MapService mapService;

    // =========================
    // BLOCCO / SBLOCCO CORRIDOI
    // =========================
    @PutMapping("/corridor/{id}/block")
    public void block(@PathVariable Long id) {
        mapService.blockCorridor(id);
    }

    @PutMapping("/corridor/{id}/unblock")
    public void unblock(@PathVariable Long id) {
        mapService.unblockCorridor(id);
    }

    // =========================
    // SOLO CORRIDOI
    // =========================
    @GetMapping("/corridors")
    public List<CorridorDTO> getCorridors() {
        return mapService.getAllCorridors();
    }

    // =========================
    // 🗺️ MAPPA COMPLETA (STEP 2)
    // =========================
    @GetMapping
    public MapDTO getMap() {
        return mapService.getMap();
    }
}
