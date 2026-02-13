package it.unibg.resq.service;

import it.unibg.resq.engine.*;
import it.unibg.resq.model.Corridor;
import it.unibg.resq.repository.CorridorRepository;
import it.unibg.resq.dto.*;

import it.unibg.resq.exception.NoPathFoundException;
import it.unibg.resq.exception.NodeNotFoundException;

import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.util.*;

@Slf4j
@Service
public class EvacuationPathService {


    private final CorridorRepository corridorRepository;

    public EvacuationPathService(CorridorRepository corridorRepository) {
        this.corridorRepository = corridorRepository;
    }

    // =========================================================
    // 1️⃣ EVACUAZIONE DA DATABASE (caso reale)
    // =========================================================
    public List<String> calculateEvacuationPath(String startLabel) {

        // 🔵 LOG: inizio operazione
        log.info("Avvio calcolo evacuazione dal nodo: {}", startLabel);

        List<Corridor> corridors = corridorRepository.findAll();

        Graph graph = new Graph();
        Map<String, GraphNode> nodes = new HashMap<>();

        // Costruzione grafo
        for (Corridor c : corridors) {

            nodes.putIfAbsent(c.getFromNode(), new GraphNode(c.getFromNode()));
            nodes.putIfAbsent(c.getToNode(), new GraphNode(c.getToNode()));

            GraphNode from = nodes.get(c.getFromNode());
            GraphNode to   = nodes.get(c.getToNode());

            graph.addEdge(new GraphEdge(from, to, c.getWeight(), c.isBlocked()));
            graph.addEdge(new GraphEdge(to, from, c.getWeight(), c.isBlocked()));
        }

        // Nodo iniziale
        GraphNode start = nodes.get(startLabel);

        if (start == null) {

            // 🔴 LOG: errore nodo non trovato
            log.error("Nodo iniziale non trovato: {}", startLabel);

            throw new NodeNotFoundException(startLabel);
        }

        // Individua le uscite
        List<GraphNode> exits = nodes.values().stream()
                .filter(n ->
                        n.getId().contains("EXIT") ||
                                n.getId().endsWith("_ENTRANCE")
                )
                .toList();

        // Motore + strategia
        GraphEngine engine = new GraphEngine();
        engine.setStrategy(new DijkstraStrategy());

        List<GraphNode> bestPath = List.of();
        double bestCost = Double.MAX_VALUE;

        // Cerca percorso migliore verso ogni uscita
        for (GraphNode exit : exits) {

            // 🟡 LOG: uscita in valutazione (debug)
            log.debug("Valuto uscita: {}", exit.getId());

            List<GraphNode> path =
                    engine.computePath(graph, start, exit);

            if (!path.isEmpty()) {

                double cost = calculateCost(path, graph);

                // 🟢 LOG: percorso trovato per questa uscita
                log.debug("Percorso trovato per {} con costo {}",
                        exit.getId(), cost);

                if (cost < bestCost) {
                    bestCost = cost;
                    bestPath = path;
                }
            }
            else {
                // 🟠 LOG: nessun percorso per questa uscita
                log.debug("Nessun percorso verso {}", exit.getId());
            }
        }

        // Nessun percorso trovato
        if (bestPath.isEmpty()) {

            // 🔴 LOG: fallimento globale
            log.warn("Nessun percorso di evacuazione disponibile da {}", startLabel);

            throw new NoPathFoundException();
        }

        // 🟢 LOG: successo finale
        log.info("Percorso evacuazione calcolato. Costo: {}", bestCost);

        return bestPath.stream()
                .map(GraphNode::getId)
                .toList();
    }


    // =========================================================
    // 2️⃣ ROUTE GENERICA DA DTO
    // =========================================================
    public RouteResponse calculateRoute(RouteRequest request) {

        Graph graph = new Graph();
        Map<String, GraphNode> nodes = new HashMap<>();

        for (CorridorDTO c : request.corridors()) {

            nodes.putIfAbsent(c.fromNode(), new GraphNode(c.fromNode()));
            nodes.putIfAbsent(c.toNode(), new GraphNode(c.toNode()));

            GraphNode from = nodes.get(c.fromNode());
            GraphNode to   = nodes.get(c.toNode());

            graph.addEdge(new GraphEdge(from, to, c.weight(), c.blocked()));
            graph.addEdge(new GraphEdge(to, from, c.weight(), c.blocked()));
        }

        GraphNode start = nodes.get(request.startNodeId());
        GraphNode end   = nodes.get(request.endNodeId());

        if (start == null || end == null) {
            throw new NodeNotFoundException("Start o End non valido");
        }

        // Motore + strategia
        GraphEngine engine = new GraphEngine();
        engine.setStrategy(new DijkstraStrategy());

        List<GraphNode> path =
                engine.computePath(graph, start, end);

        if (path.isEmpty()) {
            throw new NoPathFoundException();
        }

        return new RouteResponse(
                path.stream()
                        .map(GraphNode::getId)
                        .toList()
        );
    }

    // =========================================================
    // 🔧 COSTO PERCORSO
    // =========================================================
    private double calculateCost(List<GraphNode> path, Graph graph) {

        double cost = 0.0;

        for (int i = 0; i < path.size() - 1; i++) {

            GraphNode from = path.get(i);
            GraphNode to   = path.get(i + 1);

            for (GraphEdge e : graph.getEdges(from)) {

                if (e.getTo().equals(to)) {
                    cost += e.getWeight();
                    break;
                }
            }
        }

        return cost;
    }
}
