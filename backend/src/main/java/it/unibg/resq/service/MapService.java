package it.unibg.resq.service;

import it.unibg.resq.repository.CorridorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MapService {

    private final CorridorRepository corridorRepository;

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
}
