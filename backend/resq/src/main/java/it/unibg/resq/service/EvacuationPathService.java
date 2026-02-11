package it.unibg.resq.service;

import it.unibg.resq.engine.Graph;
import it.unibg.resq.engine.GraphNode;
import it.unibg.resq.engine.GraphEdge;
import it.unibg.resq.engine.PathFindingStrategy;
import it.unibg.resq.engine.DijkstraStrategy;

import it.unibg.resq.model.Corridor;
import it.unibg.resq.repository.CorridorRepository;

import it.unibg.resq.dto.RouteRequest;
import it.unibg.resq.dto.RouteResponse;
import it.unibg.resq.dto.CorridorDTO;

import org.springframework.stereotype.Service;

import java.util.*;

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

        List<Corridor> corridors = corridorRepository.findAll();

        Graph graph = new Graph();
        Map<String, GraphNode> nodes = new HashMap<>();

        for (Corridor c : corridors) {

            nodes.putIfAbsent(c.getFromNode(), new GraphNode(c.getFromNode()));
            nodes.putIfAbsent(c.getToNode(), new GraphNode(c.getToNode()));

            GraphNode from = nodes.get(c.getFromNode());
            GraphNode to   = nodes.get(c.getToNode());

            graph.addEdge(new GraphEdge(from, to, c.getWeight(), c.isBlocked()));
            graph.addEdge(new GraphEdge(to, from, c.getWeight(), c.isBlocked()));
        }

        GraphNode start = nodes.get(startLabel);
        if (start == null) {
            return List.of();
        }

        List<GraphNode> exits = nodes.values().stream()
                .filter(n ->
                        n.getId().contains("EXIT") ||
                                n.getId().endsWith("_ENTRANCE")
                )

                .toList();

        PathFindingStrategy strategy = new DijkstraStrategy();

        List<GraphNode> bestPath = List.of();
        double bestCost = Double.MAX_VALUE;

        for (GraphNode exit : exits) {
            List<GraphNode> path = strategy.findPath(graph, start, exit);
            if (!path.isEmpty()) {
                double cost = calculateCost(path, graph);
                if (cost < bestCost) {
                    bestCost = cost;
                    bestPath = path;
                }
            }
        }

        return bestPath.stream()
                .map(GraphNode::getId)
                .toList();
    }

    // =========================================================
    // 2️⃣ ROUTE GENERICA DA DTO (Postman / Frontend)
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

        PathFindingStrategy strategy = new DijkstraStrategy();
        List<GraphNode> path = strategy.findPath(graph, start, end);

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
