package it.unibg.resq.engine;

import lombok.Setter;
import java.util.List;

public class GraphEngine {

    @Setter
    private PathFindingStrategy strategy;

    public List<GraphNode> computePath(Graph graph, GraphNode start, GraphNode end) {
        if (strategy == null) {
            throw new IllegalStateException("PathFindingStrategy non impostata");
        }
        return strategy.findPath(graph, start, end);
    }
}
