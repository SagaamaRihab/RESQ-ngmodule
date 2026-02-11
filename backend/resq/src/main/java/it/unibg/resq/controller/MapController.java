package it.unibg.resq.controller;

import it.unibg.resq.dto.CorridorDTO;
import it.unibg.resq.dto.MapDTO;
import it.unibg.resq.service.MapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<Void> block(@PathVariable Long id) {
        mapService.blockCorridor(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/corridor/{id}/unblock")
    public ResponseEntity<Void> unblock(@PathVariable Long id) {
        mapService.unblockCorridor(id);
        return ResponseEntity.noContent().build();
    }

    // =========================
    // SOLO CORRIDOI
    // =========================
    @GetMapping("/corridors")
    public List<CorridorDTO> getCorridors() {
        return mapService.getAllCorridors();
    }

    // =========================
    // 🗺️ MAPPA COMPLETA
    // =========================
    @GetMapping
    public MapDTO getMap() {
        return mapService.getMap();
    }

    // =========================
    // ✅ EVACUATION
    // =========================
    @GetMapping("/evacuation")
    public ResponseEntity<List<String>> getEvacuationPath(
            @RequestParam(name = "startNode") String startNode
    ) {
        if (startNode == null || startNode.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            List<String> path = mapService.computeEvacuationPath(startNode.trim());

            // Si ton service renvoie liste vide quand pas trouvé :
            if (path == null || path.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            return ResponseEntity.ok(path);

        } catch (IllegalArgumentException ex) {
            // ex: startNode non existant, ecc.
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
