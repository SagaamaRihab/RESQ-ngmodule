package it.unibg.resq.repository;

import it.unibg.resq.model.Corridor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CorridorRepository extends JpaRepository<Corridor, Long> {

    List<Corridor> findByBlockedFalse();
}
