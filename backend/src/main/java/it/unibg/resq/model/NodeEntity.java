package it.unibg.resq.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "nodes")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class NodeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String label;
}
