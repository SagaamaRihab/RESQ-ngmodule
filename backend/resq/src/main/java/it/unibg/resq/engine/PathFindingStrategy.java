package it.unibg.resq.engine;

import java.util.List;

public interface PathFindingStrategy {

    List<GraphNode> findPath(Graph graph, GraphNode start, GraphNode end);
}
