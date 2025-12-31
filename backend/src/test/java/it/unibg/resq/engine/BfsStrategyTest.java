package it.unibg.resq.engine;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class BfsStrategyTest {

    @Test
    void bfsFindsPathWhenCorridorsAreOpen() {

        Node a = new Node("A");
        Node b = new Node("B");
        Node c = new Node("C");

        Graph graph = new Graph();
        graph.addEdge(new Edge(a, b, 1, false));
        graph.addEdge(new Edge(b, c, 1, false));

        BfsStrategy bfs = new BfsStrategy();
        List<Node> path = bfs.findPath(graph, a, c);

        assertEquals(3, path.size());
        assertEquals(a, path.get(0));
        assertEquals(c, path.get(2));
    }

    @Test
    void bfsReturnsEmptyPathIfBlocked() {

        Node a = new Node("A");
        Node b = new Node("B");

        Graph graph = new Graph();
        graph.addEdge(new Edge(a, b, 1, true)); // bloccato

        BfsStrategy bfs = new BfsStrategy();
        List<Node> path = bfs.findPath(graph, a, b);

        assertTrue(path.isEmpty());
    }
}
