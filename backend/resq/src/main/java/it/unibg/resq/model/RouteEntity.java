package it.unibg.resq.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "routes")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class RouteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String startNode;
    private String endNode;

    @Lob
    private String path; // percorso serializzato
}
