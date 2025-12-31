package it.unibg.resq.engine;

import java.util.*;

public class BfsStrategy implements PathFindingStrategy {

    @Override
    public List<Node> findPath(Graph graph, Node start, Node end) {

        Map<Node, Node> parent = new HashMap<>();
        Queue<Node> queue = new LinkedList<>();
        Set<Node> visited = new HashSet<>();

        queue.add(start);
        visited.add(start);

        while (!queue.isEmpty()) {
            Node current = queue.poll();

            if (current.equals(end)) {
                return buildPath(parent, start, end);
            }

            for (Edge edge : graph.getEdges(current)) {
                if (edge.isBlocked()) continue;

                Node neighbor = edge.getTo();
                if (!visited.contains(neighbor)) {
                    visited.add(neighbor);
                    parent.put(neighbor, current);
                    queue.add(neighbor);
                }
            }
        }
        return List.of(); // nessun percorso
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
