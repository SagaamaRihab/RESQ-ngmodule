package it.unibg.resq.repository;

import it.unibg.resq.model.NodeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NodeRepository extends JpaRepository<NodeEntity, Long> {

    Optional<NodeEntity> findByLabel(String label);
}
