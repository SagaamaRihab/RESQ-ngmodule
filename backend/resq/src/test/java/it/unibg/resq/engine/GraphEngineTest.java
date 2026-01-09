package it.unibg.resq.engine;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class GraphEngineTest {

    @Test
    void engineDelegatesToStrategy() {

        GraphNode a = new GraphNode("A");
        GraphNode b = new GraphNode("B");

        Graph graph = new Graph();
        graph.addEdge(new GraphEdge(a, b, 1, false));

        GraphEngine engine = new GraphEngine();
        engine.setStrategy(new BfsStrategy());

        List<GraphNode> path = engine.computePath(graph, a, b);

        assertEquals(2, path.size());
    }

    @Test
    void engineThrowsExceptionIfStrategyMissing() {

        GraphEngine engine = new GraphEngine();

        assertThrows(IllegalStateException.class,
                () -> engine.computePath(null, null, null));
    }
}
