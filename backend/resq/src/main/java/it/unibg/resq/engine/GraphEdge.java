package it.unibg.resq.engine;

public class GraphEdge {

    private final GraphNode from;
    private final GraphNode to;
    private final double weight;
    private final boolean blocked;

    public GraphEdge(GraphNode from, GraphNode to, double weight, boolean blocked) {
        this.from = from;
        this.to = to;
        this.weight = weight;
        this.blocked = blocked;
    }

    public GraphNode getFrom() {
        return from;
    }

    public GraphNode getTo() {
        return to;
    }

    public double getWeight() {
        return weight;
    }

    public boolean isBlocked() {
        return blocked;
    }
}
