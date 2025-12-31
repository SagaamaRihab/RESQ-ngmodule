package it.unibg.resq.engine;

import java.util.*;

public class DijkstraStrategy implements PathFindingStrategy {

    @Override
    public List<Node> findPath(Graph graph, Node start, Node end) {

        Map<Node, Double> distances = new HashMap<>();
        Map<Node, Node> parent = new HashMap<>();
        PriorityQueue<Node> queue = new PriorityQueue<>(
                Comparator.comparingDouble(distances::get)
        );

        for (Node node : graph.getNodes()) {
            distances.put(node, Double.MAX_VALUE);
        }
        distances.put(start, 0.0);
        queue.add(start);

        while (!queue.isEmpty()) {
            Node current = queue.poll();

            if (current.equals(end)) {
                return buildPath(parent, start, end);
            }

            for (Edge edge : graph.getEdges(current)) {
                if (edge.isBlocked()) continue;

                Node neighbor = edge.getTo();
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

    private List<Node> buildPath(Map<Node, Node> parent, Node start, Node end) {
        List<Node> path = new LinkedList<>();
        Node current = end;

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
