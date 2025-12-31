package it.unibg.resq.engine;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class Edge {

    private Node from;
    private Node to;
    private double weight;     // distanza / costo
    private boolean blocked;   // corridoio bloccato
}
