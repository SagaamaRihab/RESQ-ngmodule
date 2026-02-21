package it.unibg.resq.engine;

import java.util.*;

public class Graph {

    private final Map<GraphNode, List<GraphEdge>> adjacencyList = new HashMap<>();

    public void addNode(GraphNode node) {
        adjacencyList.putIfAbsent(node, new ArrayList<>());
    }

    public void addEdge(GraphEdge edge) {
        addNode(edge.getFrom());
        addNode(edge.getTo());
        adjacencyList.get(edge.getFrom()).add(edge);
    }

    public List<GraphEdge> getEdges(GraphNode node) {
        return adjacencyList.getOrDefault(node, List.of());
    }

    public Set<GraphNode> getNodes() {
        return adjacencyList.keySet();
    }
}
