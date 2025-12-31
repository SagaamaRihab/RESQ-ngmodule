package it.unibg.resq.controller;

import it.unibg.resq.service.MapService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/map")
@RequiredArgsConstructor
public class MapController {

    private final MapService mapService;

    @PutMapping("/corridor/{id}/block")
    public void block(@PathVariable Long id) {
        mapService.blockCorridor(id);
    }

    @PutMapping("/corridor/{id}/unblock")
    public void unblock(@PathVariable Long id) {
        mapService.unblockCorridor(id);
    }
}
