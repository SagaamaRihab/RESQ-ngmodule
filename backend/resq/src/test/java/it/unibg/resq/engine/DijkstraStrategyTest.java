package it.unibg.resq.engine;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class DijkstraStrategyTest {

    @Test
    void dijkstraChoosesShortestPath() {

        GraphNode a = new GraphNode("A");
        GraphNode b = new GraphNode("B");
        GraphNode c = new GraphNode("C");

        Graph graph = new Graph();
        graph.addEdge(new GraphEdge(a, b, 1, false));
        graph.addEdge(new GraphEdge(b, c, 1, false));
        graph.addEdge(new GraphEdge(a, c, 10, false)); // più lungo

        DijkstraStrategy dijkstra = new DijkstraStrategy();
        List<GraphNode> path = dijkstra.findPath(graph, a, c);

        assertEquals(3, path.size());
        assertEquals(b, path.get(1)); // passa da B
    }

    @Test
    void dijkstraIgnoresBlockedEdges() {

        GraphNode a = new GraphNode("A");
        GraphNode c = new GraphNode("C");

        Graph graph = new Graph();
        graph.addEdge(new GraphEdge(a, c, 1, true)); // bloccato

        DijkstraStrategy dijkstra = new DijkstraStrategy();
        List<GraphNode> path = dijkstra.findPath(graph, a, c);

        assertTrue(path.isEmpty());
    }
}
