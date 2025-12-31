package it.unibg.resq.engine;

import lombok.Setter;

import java.util.List;

public class GraphEngine {

    @Setter
    private PathFindingStrategy strategy;

    public List<Node> computePath(Graph graph, Node start, Node end) {
        if (strategy == null) {
            throw new IllegalStateException("PathFindingStrategy non impostata");
        }
        return strategy.findPath(graph, start, end);
    }
}
