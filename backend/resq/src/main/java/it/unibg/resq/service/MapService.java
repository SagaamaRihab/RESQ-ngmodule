package it.unibg.resq.service;

import it.unibg.resq.dto.*;
import it.unibg.resq.engine.*;
import it.unibg.resq.model.Corridor;
import it.unibg.resq.repository.CorridorRepository;
import it.unibg.resq.repository.NodeRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class MapService {

    private final CorridorRepository corridorRepository;
    private final NodeRepository nodeRepository;

    // =========================
    // BLOCCO / SBLOCCO CORRIDOI
    // =========================
    public void blockCorridor(Long id) {

        log.info("Blocco corridoio ID={}", id);

        corridorRepository.findById(id).ifPresent(c -> {
            c.setBlocked(true);
            corridorRepository.save(c);
        });
    }

    public void unblockCorridor(Long id) {

        log.info("Sblocco corridoio ID={}", id);

        corridorRepository.findById(id).ifPresent(c -> {
            c.setBlocked(false);
            corridorRepository.save(c);
        });
    }

    // =========================
    // SOLO CORRIDOI
    // =========================
    public List<CorridorDTO> getAllCorridors() {

        log.debug("Recupero lista corridoi");

        return corridorRepository.findAll().stream()
                .map(c -> new CorridorDTO(
                        c.getId(),
                        c.getFromNode(),
                        c.getToNode(),
                        c.getWeight(),
                        c.isBlocked()
                ))
                .toList();
    }

    // =========================
    // 🗺️ MAPPA COMPLETA
    // =========================
    public MapDTO getMap() {

        log.debug("Recupero mappa completa");

        List<NodeDTO> nodes = nodeRepository.findAll().stream()
                .map(n -> new NodeDTO(n.getLabel()))
                .toList();

        List<CorridorDTO> corridors = corridorRepository.findAll().stream()
                .map(c -> new CorridorDTO(
                        c.getId(),
                        c.getFromNode(),
                        c.getToNode(),
                        c.getWeight(),
                        c.isBlocked()
                ))
                .toList();

        return new MapDTO(nodes, corridors);
    }

    // =========================
    // ✅ EVACUATION (Strategy)
    // =========================
    public List<String> computeEvacuationPath(String startNode) {

        log.info("Richiesta percorso evacuazione da nodo: {}", startNode);

        if (startNode == null || startNode.isBlank()) {
            log.warn("Nodo iniziale nullo o vuoto");
            return List.of();
        }

        startNode = startNode.trim();

        // Verifica nodo esistente
        boolean exists = nodeRepository
                .findByLabel(startNode)
                .isPresent();

        if (!exists) {
            log.warn("Nodo non trovato: {}", startNode);
            return List.of();
        }

        // Costruzione grafo dai corridoi NON bloccati
        List<Corridor> corridors = corridorRepository.findAll();

        Graph graph = new Graph();
        Map<String, GraphNode> nodes = new HashMap<>();

        for (Corridor c : corridors) {

            if (c.isBlocked()) continue;

            nodes.putIfAbsent(
                    c.getFromNode(),
                    new GraphNode(c.getFromNode())
            );

            nodes.putIfAbsent(
                    c.getToNode(),
                    new GraphNode(c.getToNode())
            );

            GraphNode from = nodes.get(c.getFromNode());
            GraphNode to   = nodes.get(c.getToNode());

            graph.addEdge(new GraphEdge(from, to, c.getWeight(), false));
            graph.addEdge(new GraphEdge(to, from, c.getWeight(), false));
        }

        GraphNode start = nodes.get(startNode);

        if (start == null) {
            log.error("Nodo iniziale non presente nel grafo: {}", startNode);
            return List.of();
        }

        // Individua EXIT
        List<GraphNode> exits = nodes.values().stream()
                .filter(n -> {
                    String id = n.getId().toUpperCase();
                    return id.contains("EXIT") || id.contains("USCITA");
                })
                .toList();

        if (exits.isEmpty()) {
            log.warn("Nessuna uscita trovata nel sistema");
            return List.of();
        }

        // Motore + Strategia
        GraphEngine engine = new GraphEngine();
        engine.setStrategy(new DijkstraStrategy());

        List<GraphNode> bestPath = List.of();
        double bestCost = Double.MAX_VALUE;

        for (GraphNode exit : exits) {

            log.debug("Valutazione uscita: {}", exit.getId());

            List<GraphNode> path =
                    engine.computePath(graph, start, exit);

            if (!path.isEmpty()) {

                double cost = calculateCost(path, graph);

                log.debug("Costo percorso verso {} = {}", exit.getId(), cost);

                if (cost < bestCost) {
                    bestCost = cost;
                    bestPath = path;
                }
            }
        }

        if (bestPath.isEmpty()) {
            log.warn("Nessun percorso disponibile da {}", startNode);
            return List.of();
        }

        log.info("Percorso trovato da {} con costo {}", startNode, bestCost);

        return bestPath.stream()
                .map(GraphNode::getId)
                .toList();
    }

    // =========================
    // COSTO
    // =========================
    private double calculateCost(
            List<GraphNode> path,
            Graph graph
    ) {

        double cost = 0;

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
