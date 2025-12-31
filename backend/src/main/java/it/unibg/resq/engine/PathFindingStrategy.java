package it.unibg.resq.engine;

import java.util.List;

public interface PathFindingStrategy {

    List<Node> findPath(Graph graph, Node start, Node end);
}
