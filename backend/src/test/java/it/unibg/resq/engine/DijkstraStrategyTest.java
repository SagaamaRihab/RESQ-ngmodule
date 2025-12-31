package it.unibg.resq.engine;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class DijkstraStrategyTest {

    @Test
    void dijkstraChoosesShortestPath() {

        Node a = new Node("A");
        Node b = new Node("B");
        Node c = new Node("C");

        Graph graph = new Graph();
        graph.addEdge(new Edge(a, b, 1, false));
        graph.addEdge(new Edge(b, c, 1, false));
        graph.addEdge(new Edge(a, c, 10, false)); // più lungo

        DijkstraStrategy dijkstra = new DijkstraStrategy();
        List<Node> path = dijkstra.findPath(graph, a, c);

        assertEquals(3, path.size());
        assertEquals(b, path.get(1)); // passa da B
    }

    @Test
    void dijkstraIgnoresBlockedEdges() {

        Node a = new Node("A");
        Node c = new Node("C");

        Graph graph = new Graph();
        graph.addEdge(new Edge(a, c, 1, true)); // bloccato

        DijkstraStrategy dijkstra = new DijkstraStrategy();
        List<Node> path = dijkstra.findPath(graph, a, c);

        assertTrue(path.isEmpty());
    }
}
