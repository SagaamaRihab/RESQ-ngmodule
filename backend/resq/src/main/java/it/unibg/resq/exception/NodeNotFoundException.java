package it.unibg.resq.exception;

public class NodeNotFoundException extends RuntimeException {

    public NodeNotFoundException(String node) {
        super("Nodo non trovato: " + node);
    }
}
