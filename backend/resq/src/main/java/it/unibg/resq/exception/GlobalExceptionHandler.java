package it.unibg.resq.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NodeNotFoundException.class)
    public ResponseEntity<?> handleNode(NodeNotFoundException ex) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(NoPathFoundException.class)
    public ResponseEntity<?> handlePath(NoPathFoundException ex) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", ex.getMessage()));
    }
}
