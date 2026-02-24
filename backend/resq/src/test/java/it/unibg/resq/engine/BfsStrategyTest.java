package it.unibg.resq.engine;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class BfsStrategyTest {

    @Test
    void bfsFindsPathWhenCorridorsAreOpen() {

        GraphNode a = new GraphNode("A");
        GraphNode b = new GraphNode("B");
        GraphNode c = new GraphNode("C");

        Graph graph = new Graph();
        graph.addEdge(new GraphEdge(a, b, 1, false));
        graph.addEdge(new GraphEdge(b, c, 1, false));

        BfsStrategy bfs = new BfsStrategy();
        List<GraphNode> path = bfs.findPath(graph, a, c);

        assertEquals(3, path.size());
        assertEquals(a, path.get(0));
        assertEquals(c, path.get(2));
    }

    @Test
    void bfsReturnsEmptyPathIfBlocked() {

        GraphNode a = new GraphNode("A");
        GraphNode b = new GraphNode("B");

        Graph graph = new Graph();
        graph.addEdge(new GraphEdge(a, b, 1, true)); // bloccato

        BfsStrategy bfs = new BfsStrategy();
        List<GraphNode> path = bfs.findPath(graph, a, b);

        assertTrue(path.isEmpty());
    }
}
