package it.unibg.resq.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "corridors")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class CorridorEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fromNode;
    private String toNode;

    private double weight;

    private boolean blocked;
}
