package it.unibg.resq.engine;

import java.util.*;

public class DijkstraStrategy implements PathFindingStrategy {

    @Override
    public List<GraphNode> findPath(Graph graph, GraphNode start, GraphNode end) {

        Map<GraphNode, Double> distances = new HashMap<>();
        Map<GraphNode, GraphNode> parent = new HashMap<>();
        PriorityQueue<GraphNode> queue = new PriorityQueue<>(
                Comparator.comparingDouble(distances::get)
        );

        for (GraphNode node : graph.getNodes()) {
            distances.put(node, Double.MAX_VALUE);
        }
        distances.put(start, 0.0);
        queue.add(start);

        while (!queue.isEmpty()) {
            GraphNode current = queue.poll();

            if (current.equals(end)) {
                return buildPath(parent, start, end);
            }

            for (GraphEdge edge : graph.getEdges(current)) {
                if (edge.isBlocked()) continue;

                GraphNode neighbor = edge.getTo();
                double newDist = distances.get(current) + edge.getWeight();

                if (newDist < distances.get(neighbor)) {
                    distances.put(neighbor, newDist);
                    parent.put(neighbor, current);
                    queue.add(neighbor);
                }
            }
        }
        return List.of();
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
