package it.unibg.resq.exception;

public class NoPathFoundException extends RuntimeException {

    public NoPathFoundException() {
        super("Nessun percorso disponibile");
    }
}
