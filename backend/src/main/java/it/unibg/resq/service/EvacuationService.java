package it.unibg.resq.service;

import it.unibg.resq.dto.CorridorDTO;
import it.unibg.resq.engine.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class EvacuationService {

    private final GraphEngine engine = new GraphEngine();

    public List<Node> calculateRoute(
            String startNodeId,
            String endNodeId,
            boolean weighted,
            List<CorridorDTO> corridors
    ) {

        Graph graph = new Graph();
        Map<String, Node> nodes = new HashMap<>();

        // Creazione nodi e archi a partire dai DTO
        for (CorridorDTO c : corridors) {

            nodes.putIfAbsent(c.from(), new Node(c.from()));
            nodes.putIfAbsent(c.to(), new Node(c.to()));

            graph.addEdge(new Edge(
                    nodes.get(c.from()),
                    nodes.get(c.to()),
                    c.weight(),
                    c.blocked()
            ));
        }

        // Scelta dinamica dell'algoritmo (Strategy Pattern)
        engine.setStrategy(
                weighted ? new DijkstraStrategy() : new BfsStrategy()
        );

        return engine.computePath(
                graph,
                nodes.get(startNodeId),
                nodes.get(endNodeId)
        );
    }
}
