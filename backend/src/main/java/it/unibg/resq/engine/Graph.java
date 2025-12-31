package it.unibg.resq.engine;

import java.util.*;

public class Graph {

    private final Map<Node, List<Edge>> adjacencyList = new HashMap<>();

    public void addNode(Node node) {
        adjacencyList.putIfAbsent(node, new ArrayList<>());
    }

    public void addEdge(Edge edge) {
        addNode(edge.getFrom());
        addNode(edge.getTo());
        adjacencyList.get(edge.getFrom()).add(edge);
    }

    public List<Edge> getEdges(Node node) {
        return adjacencyList.getOrDefault(node, Collections.emptyList());
    }

    public Set<Node> getNodes() {
        return adjacencyList.keySet();
    }
}
