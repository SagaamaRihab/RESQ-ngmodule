package it.unibg.resq.controller;

import it.unibg.resq.dto.RouteRequest;
import it.unibg.resq.dto.RouteResponse;
import it.unibg.resq.engine.Node;
import it.unibg.resq.service.EvacuationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evacuation")
@RequiredArgsConstructor
public class EvacuationController {

    private final EvacuationService evacuationService;

    @PostMapping("/route")
    public RouteResponse calculateRoute(@RequestBody RouteRequest request) {

        List<Node> path = evacuationService.calculateRoute(
                request.startNodeId(),
                request.endNodeId(),
                request.weighted(),
                request.corridors()
        );

        List<String> pathIds = path.stream()
                .map(Node::getId)
                .toList();

        return new RouteResponse(pathIds);
    }
}
