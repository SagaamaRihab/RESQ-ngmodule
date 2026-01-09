package it.unibg.resq.service;

import it.unibg.resq.dto.*;
import it.unibg.resq.repository.CorridorRepository;
import it.unibg.resq.repository.NodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MapService {

    private final CorridorRepository corridorRepository;
    private final NodeRepository nodeRepository;

    // =========================
    // BLOCCO / SBLOCCO CORRIDOI
    // =========================
    public void blockCorridor(Long id) {
        corridorRepository.findById(id).ifPresent(c -> {
            c.setBlocked(true);
            corridorRepository.save(c);
        });
    }

    public void unblockCorridor(Long id) {
        corridorRepository.findById(id).ifPresent(c -> {
            c.setBlocked(false);
            corridorRepository.save(c);
        });
    }

    // =========================
    // SOLO CORRIDOI (se serve)
    // =========================
    public List<CorridorDTO> getAllCorridors() {
        return corridorRepository.findAll().stream()
                .map(c -> new CorridorDTO(
                        c.getFromNode(),
                        c.getToNode(),
                        c.getWeight(),
                        c.isBlocked()
                ))
                .toList();
    }

    // =========================
    // 🗺️ MAPPA COMPLETA
    // =========================
    public MapDTO getMap() {

        List<NodeDTO> nodes = nodeRepository.findAll().stream()
                .map(n -> new NodeDTO(n.getLabel()))
                .toList();

        List<CorridorDTO> corridors = corridorRepository.findAll().stream()
                .map(c -> new CorridorDTO(
                        c.getFromNode(),
                        c.getToNode(),
                        c.getWeight(),
                        c.isBlocked()
                ))
                .toList();

        return new MapDTO(nodes, corridors);
    }
}
