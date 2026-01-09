package it.unibg.resq.engine;

import java.util.*;

public class BfsStrategy implements PathFindingStrategy {

    @Override
    public List<GraphNode> findPath(Graph graph, GraphNode start, GraphNode end) {

        Map<GraphNode, GraphNode> parent = new HashMap<>();
        Queue<GraphNode> queue = new LinkedList<>();
        Set<GraphNode> visited = new HashSet<>();

        queue.add(start);
        visited.add(start);

        while (!queue.isEmpty()) {
            GraphNode current = queue.poll();

            if (current.equals(end)) {
                return buildPath(parent, start, end);
            }

            for (GraphEdge edge : graph.getEdges(current)) {
                if (edge.isBlocked()) continue;

                GraphNode neighbor = edge.getTo();
                if (!visited.contains(neighbor)) {
                    visited.add(neighbor);
                    parent.put(neighbor, current);
                    queue.add(neighbor);
                }
            }
        }
        return List.of(); // nessun percorso
    }

    private List<GraphNode> buildPath(Map<GraphNode, GraphNode> parent, GraphNode start, GraphNode end) {
        List<GraphNode> path = new LinkedList<>();
        GraphNode current = end;

        while (current != null && !current.equals(start)) {
            path.add(0, current);
            current = parent.get(current);
        }

        if (current != null) {
            path.add(0, start);
        }
        return path;
    }
}
