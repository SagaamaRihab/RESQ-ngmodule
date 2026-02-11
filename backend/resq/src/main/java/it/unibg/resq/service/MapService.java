package it.unibg.resq.service;

import it.unibg.resq.dto.CorridorDTO;
import it.unibg.resq.dto.MapDTO;
import it.unibg.resq.dto.NodeDTO;
import it.unibg.resq.repository.CorridorRepository;
import it.unibg.resq.repository.NodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

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
    // SOLO CORRIDOI
    // =========================
    public List<CorridorDTO> getAllCorridors() {
        return corridorRepository.findAll().stream()
                .map(c -> new CorridorDTO(
                        c.getId(),
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
                        c.getId(),
                        c.getFromNode(),
                        c.getToNode(),
                        c.getWeight(),
                        c.isBlocked()
                ))
                .toList();

        return new MapDTO(nodes, corridors);
    }

    // =========================
    // ✅ EVACUATION (Dijkstra)
    // =========================
    public List<String> computeEvacuationPath(String startNode) {
        if (startNode == null || startNode.trim().isEmpty()) return List.of();
        startNode = startNode.trim();

        // 1) Vérifier que le noeud existe
        Set<String> allNodes = nodeRepository.findAll().stream()
                .map(n -> n.getLabel())
                .collect(Collectors.toSet());

        if (!allNodes.contains(startNode)) {
            // startNode inexistant => pas de chemin
            return List.of();
        }

        // 2) Définir les EXIT (ex: ...EXIT..., ...USCITA...)
        List<String> exits = allNodes.stream()
                .filter(l -> {
                    String u = l.toUpperCase(Locale.ROOT);
                    return u.contains("EXIT") || u.contains("USCITA");
                })
                .toList();

        if (exits.isEmpty()) {
            // pas d'exit définie dans la DB
            return List.of();
        }

        // 3) Charger les corridors NON bloqués et construire un graphe bidirectionnel
        var corridors = corridorRepository.findAll().stream()
                .filter(c -> !c.isBlocked())
                .toList();

        Map<String, List<Edge>> graph = new HashMap<>();
        for (var c : corridors) {
            String a = c.getFromNode();
            String b = c.getToNode();

            // weight peut être Double (nullable) ou double (non-null)
            double w = 1.0;
            try {
                // si getWeight() renvoie Double
                Double ww = (Double) (Object) c.getWeight();
                if (ww != null) w = ww;
            } catch (ClassCastException e) {
                // sinon c'est un double primitif
                w = c.getWeight();
            }

            graph.computeIfAbsent(a, k -> new ArrayList<>()).add(new Edge(b, w));
            graph.computeIfAbsent(b, k -> new ArrayList<>()).add(new Edge(a, w));
        }

        // 4) Dijkstra depuis startNode
        Map<String, Double> dist = new HashMap<>();
        Map<String, String> prev = new HashMap<>();
        PriorityQueue<State> pq = new PriorityQueue<>(Comparator.comparingDouble(s -> s.d));

        dist.put(startNode, 0.0);
        pq.add(new State(startNode, 0.0));

        while (!pq.isEmpty()) {
            State cur = pq.poll();
            if (cur.d > dist.getOrDefault(cur.node, Double.POSITIVE_INFINITY)) continue;

            for (Edge e : graph.getOrDefault(cur.node, List.of())) {
                double nd = cur.d + e.w;
                if (nd < dist.getOrDefault(e.to, Double.POSITIVE_INFINITY)) {
                    dist.put(e.to, nd);
                    prev.put(e.to, cur.node);
                    pq.add(new State(e.to, nd));
                }
            }
        }

        // 5) Trouver l'exit atteignable la + proche
        String bestExit = null;
        double bestDist = Double.POSITIVE_INFINITY;

        for (String ex : exits) {
            double d = dist.getOrDefault(ex, Double.POSITIVE_INFINITY);
            if (d < bestDist) {
                bestDist = d;
                bestExit = ex;
            }
        }

        if (bestExit == null || bestDist == Double.POSITIVE_INFINITY) {
            // aucune exit atteignable
            return List.of();
        }

        // 6) Reconstruire le chemin
        LinkedList<String> path = new LinkedList<>();
        String cur = bestExit;
        while (cur != null) {
            path.addFirst(cur);
            if (cur.equals(startNode)) break;
            cur = prev.get(cur);
        }

        if (path.isEmpty() || !path.getFirst().equals(startNode)) {
            return List.of();
        }

        return path;
    }

    // ====== helpers ======
    private record Edge(String to, double w) {}
    private record State(String node, double d) {}
}
