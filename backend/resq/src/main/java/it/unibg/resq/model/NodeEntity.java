package it.unibg.resq.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "nodes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NodeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String label;

    @Column(name = "display_name")
    private String displayName;

    @Column(nullable = false)
    private String building;   // A, B, D

    @Column(nullable = false)
    private String floor;      // T, P, S, B, R
}