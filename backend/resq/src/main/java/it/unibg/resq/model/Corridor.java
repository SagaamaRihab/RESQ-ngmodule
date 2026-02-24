package it.unibg.resq.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "corridors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Corridor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "from_node", nullable = false)
    private String fromNode;

    @Column(name = "to_node", nullable = false)
    private String toNode;

    @Column(nullable = false)
    private double weight;

    @Column(nullable = false)
    private boolean blocked;
}
