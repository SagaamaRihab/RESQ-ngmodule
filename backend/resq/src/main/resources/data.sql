-- =====================================================
-- NODI (Nodes)
-- =====================================================

-- -------------------------
-- Edificio D
-- -------------------------
INSERT INTO nodes (label) VALUES
                              ('D_ENTRANCE'),
                              ('D_PORTINERIA'),
                              ('D_AULA_MAGNA'),
                              ('D_AULA_MINORE'),
                              ('D_EXIT_EAST'),
                              ('D_EXIT_SOUTH'),
                              ('D_STAIRS')
    ON CONFLICT (label) DO NOTHING;

-- -------------------------
-- Edificio B - Piano Interrato
-- -------------------------
INSERT INTO nodes (label) VALUES
                              ('B_I_ENTRANCE'),
                              ('B_I_12'),
                              ('B_I_13'),
                              ('B_I_14'),
                              ('B_I_EXIT')
    ON CONFLICT (label) DO NOTHING;

-- -------------------------
-- Edificio B - Piano Rialzato (nodi minimi)
-- -------------------------
INSERT INTO nodes (label) VALUES
                              ('B_R_17'),
                              ('B_R_18')
    ON CONFLICT (label) DO NOTHING;

-- -------------------------
-- Edificio B - Primo Piano
-- -------------------------
INSERT INTO nodes (label) VALUES
                              ('B_P_INGRESSO'),
                              ('B_P_22'),
                              ('B_P_23'),
                              ('B_P_24'),
                              ('B_P_25'),
                              ('B_P_EXIT')
    ON CONFLICT (label) DO NOTHING;

-- -------------------------
-- Edificio A (tutti i piani)
-- -------------------------
INSERT INTO nodes (label) VALUES
                              -- Piano Terra
                              ('A_T_ENTRANCE'),
                              ('A_T_HALL'),
                              ('A_T_STAIRS'),
                              ('A_T_BIBLIOTECA'),
                              ('A_T_SALA_STUDIO'),

                              -- Primo Piano
                              ('A_1_STAIRS'),
                              ('A_1_HALL'),
                              ('A_1_AULA_3'),
                              ('A_1_AULA_4'),

                              -- Secondo Piano
                              ('A_2_STAIRS'),
                              ('A_2_HALL'),
                              ('A_2_AULA_7'),
                              ('A_2_AULA_8'),
                              ('A_2_AULA_9'),
                              ('A_2_AULA_10')
    ON CONFLICT (label) DO NOTHING;


-- =====================================================
-- CORRIDOI (orizzontali)
-- =====================================================

-- -------------------------
-- Edificio D (ID 100–199)
-- -------------------------
INSERT INTO corridors (id, from_node, to_node, weight, blocked) VALUES
                                                                    (101, 'D_ENTRANCE',    'D_PORTINERIA',  1.0, false),
                                                                    (102, 'D_PORTINERIA',  'D_AULA_MAGNA',  1.5, false),
                                                                    (103, 'D_PORTINERIA',  'D_AULA_MINORE', 1.5, false),
                                                                    (104, 'D_AULA_MAGNA',  'D_EXIT_SOUTH',  2.0, false),
                                                                    (105, 'D_AULA_MINORE', 'D_EXIT_EAST',   2.0, false)
    ON CONFLICT (id) DO NOTHING;

-- -------------------------
-- Edificio B - Piano Interrato (ID 200–299)
-- -------------------------
INSERT INTO corridors (id, from_node, to_node, weight, blocked) VALUES
                                                                    (201, 'B_I_ENTRANCE', 'B_I_12',   1.0, false),
                                                                    (202, 'B_I_12',       'B_I_13',   1.0, false),
                                                                    (203, 'B_I_13',       'B_I_14',   1.0, false),
                                                                    (204, 'B_I_14',       'B_I_EXIT', 1.0, false)
    ON CONFLICT (id) DO NOTHING;

-- -------------------------
-- Edificio B - Piano Rialzato (ID 300–399)
-- -------------------------
INSERT INTO corridors (id, from_node, to_node, weight, blocked) VALUES
    (301, 'B_R_17', 'B_R_18', 1.0, false)
    ON CONFLICT (id) DO NOTHING;

-- -------------------------
-- Edificio B - Primo Piano (ID 400–499)
-- -------------------------
INSERT INTO corridors (id, from_node, to_node, weight, blocked) VALUES
                                                                    (401, 'B_P_INGRESSO', 'B_P_22',   1.0, false),
                                                                    (402, 'B_P_22',       'B_P_23',   1.0, false),
                                                                    (403, 'B_P_23',       'B_P_24',   1.0, false),
                                                                    (404, 'B_P_24',       'B_P_25',   1.0, false),
                                                                    (405, 'B_P_25',       'B_P_EXIT', 1.0, false)
    ON CONFLICT (id) DO NOTHING;

-- -------------------------
-- Edificio A - Corridoi orizzontali (ID 500–599)
-- -------------------------
INSERT INTO corridors (id, from_node, to_node, weight, blocked) VALUES
                                                                    -- Piano Terra
                                                                    (501, 'A_T_ENTRANCE',   'A_T_HALL',        1.0, false),
                                                                    (502, 'A_T_HALL',       'A_T_BIBLIOTECA',  1.0, false),
                                                                    (503, 'A_T_HALL',       'A_T_SALA_STUDIO', 1.0, false),
                                                                    (504, 'A_T_HALL',       'A_T_STAIRS',      1.0, false),

                                                                    -- Primo Piano
                                                                    (511, 'A_1_STAIRS',     'A_1_HALL',        1.0, false),
                                                                    (512, 'A_1_HALL',       'A_1_AULA_3',      1.0, false),
                                                                    (513, 'A_1_HALL',       'A_1_AULA_4',      1.0, false),

                                                                    -- Secondo Piano
                                                                    (521, 'A_2_STAIRS',     'A_2_HALL',        1.0, false),
                                                                    (522, 'A_2_HALL',       'A_2_AULA_7',      1.0, false),
                                                                    (523, 'A_2_HALL',       'A_2_AULA_8',      1.0, false),
                                                                    (524, 'A_2_HALL',       'A_2_AULA_9',      1.0, false),
                                                                    (525, 'A_2_HALL',       'A_2_AULA_10',     1.0, false)
    ON CONFLICT (id) DO NOTHING;


-- =====================================================
-- CORRIDOI VERTICALI (Edificio A)
-- Collegamento tra Secondo → Primo → Piano Terra
-- =====================================================
INSERT INTO corridors (id, from_node, to_node, weight, blocked) VALUES
                                                                    (531, 'A_2_STAIRS', 'A_1_STAIRS', 1.0, false),
                                                                    (532, 'A_1_STAIRS', 'A_T_STAIRS', 1.0, false)
    ON CONFLICT (id) DO NOTHING;


-- =====================================================
-- NODI MANCANTI (Edificio B)
-- Nodo di collegamento tra i piani
-- =====================================================
INSERT INTO nodes (label) VALUES
    ('B_R_ENTRANCE')
    ON CONFLICT (label) DO NOTHING;


-- =====================================================
-- CORRIDOI VERTICALI (Edificio B)
-- Collegamento Primo → Rialzato → Interrato
-- =====================================================
INSERT INTO corridors (id, from_node, to_node, weight, blocked) VALUES
                                                                    (451, 'B_P_INGRESSO', 'B_R_ENTRANCE', 1.0, false),
                                                                    (452, 'B_R_ENTRANCE', 'B_I_ENTRANCE', 1.0, false)
    ON CONFLICT (id) DO NOTHING;

-- Collegamento del nodo rialzato al corridoio del piano rialzato
INSERT INTO corridors (id, from_node, to_node, weight, blocked) VALUES
    (453, 'B_R_ENTRANCE', 'B_R_17', 1.0, false)
    ON CONFLICT (id) DO NOTHING;

BEGIN;

-- =====================================================
-- 1) AJOUTER LES NOUVEAUX LABELS (sans supprimer les anciens)
-- =====================================================

-- ---------- Edificio B - Interrato ----------
INSERT INTO nodes(label) VALUES
                             ('B_I_AULA_12'),
                             ('B_I_AULA_13'),
                             ('B_I_AULA_14')
    ON CONFLICT (label) DO NOTHING;

-- ---------- Edificio B - Rialzato ----------
INSERT INTO nodes(label) VALUES
                             ('B_R_AULA_17'),
                             ('B_R_AULA_18')
    ON CONFLICT (label) DO NOTHING;

-- ---------- Edificio B - Primo Piano ----------
INSERT INTO nodes(label) VALUES
                             ('B_P_AULA_22'),
                             ('B_P_AULA_23'),
                             ('B_P_AULA_24'),
                             ('B_P_AULA_25')
    ON CONFLICT (label) DO NOTHING;


-- ---------- Edificio D (aggiungo codice piano T per coerenza) ----------
-- NB: nel tuo frontend D è terra, quindi uso D_T_...
INSERT INTO nodes(label) VALUES
                             ('D_T_INGRESSO_PRINCIPALE'),
                             ('D_T_PORTINERIA'),
                             ('D_T_AULA_MAGNA'),
                             ('D_T_AULA_MINORE'),
                             ('D_T_EXIT_EAST'),
                             ('D_T_EXIT_SOUTH'),
                             ('D_T_STAIRS')
    ON CONFLICT (label) DO NOTHING;


-- =====================================================
-- 2) AGGIORNARE I CORRIDOI (from_node / to_node)
-- =====================================================

-- ---------- B - Interrato ----------
UPDATE corridors
SET from_node = 'B_I_AULA_12'
WHERE from_node = 'B_I_12';

UPDATE corridors
SET to_node = 'B_I_AULA_12'
WHERE to_node = 'B_I_12';

UPDATE corridors
SET from_node = 'B_I_AULA_13'
WHERE from_node = 'B_I_13';

UPDATE corridors
SET to_node = 'B_I_AULA_13'
WHERE to_node = 'B_I_13';

UPDATE corridors
SET from_node = 'B_I_AULA_14'
WHERE from_node = 'B_I_14';

UPDATE corridors
SET to_node = 'B_I_AULA_14'
WHERE to_node = 'B_I_14';


-- ---------- B - Rialzato ----------
UPDATE corridors
SET from_node = 'B_R_AULA_17'
WHERE from_node = 'B_R_17';

UPDATE corridors
SET to_node = 'B_R_AULA_17'
WHERE to_node = 'B_R_17';

UPDATE corridors
SET from_node = 'B_R_AULA_18'
WHERE from_node = 'B_R_18';

UPDATE corridors
SET to_node = 'B_R_AULA_18'
WHERE to_node = 'B_R_18';


-- ---------- B - Primo Piano ----------
UPDATE corridors
SET from_node = 'B_P_AULA_22'
WHERE from_node = 'B_P_22';

UPDATE corridors
SET to_node = 'B_P_AULA_22'
WHERE to_node = 'B_P_22';

UPDATE corridors
SET from_node = 'B_P_AULA_23'
WHERE from_node = 'B_P_23';

UPDATE corridors
SET to_node = 'B_P_AULA_23'
WHERE to_node = 'B_P_23';

UPDATE corridors
SET from_node = 'B_P_AULA_24'
WHERE from_node = 'B_P_24';

UPDATE corridors
SET to_node = 'B_P_AULA_24'
WHERE to_node = 'B_P_24';

UPDATE corridors
SET from_node = 'B_P_AULA_25'
WHERE from_node = 'B_P_25';

UPDATE corridors
SET to_node = 'B_P_AULA_25'
WHERE to_node = 'B_P_25';


-- ---------- D (terra) ----------
-- Entrata -> Ingresso Principale (match frontend "Ingresso Principale")
UPDATE corridors
SET from_node = 'D_T_INGRESSO_PRINCIPALE'
WHERE from_node = 'D_ENTRANCE';

UPDATE corridors
SET to_node = 'D_T_INGRESSO_PRINCIPALE'
WHERE to_node = 'D_ENTRANCE';

UPDATE corridors
SET from_node = 'D_T_PORTINERIA'
WHERE from_node = 'D_PORTINERIA';

UPDATE corridors
SET to_node = 'D_T_PORTINERIA'
WHERE to_node = 'D_PORTINERIA';

UPDATE corridors
SET from_node = 'D_T_AULA_MAGNA'
WHERE from_node = 'D_AULA_MAGNA';

UPDATE corridors
SET to_node = 'D_T_AULA_MAGNA'
WHERE to_node = 'D_AULA_MAGNA';

UPDATE corridors
SET from_node = 'D_T_AULA_MINORE'
WHERE from_node = 'D_AULA_MINORE';

UPDATE corridors
SET to_node = 'D_T_AULA_MINORE'
WHERE to_node = 'D_AULA_MINORE';

UPDATE corridors
SET from_node = 'D_T_EXIT_EAST'
WHERE from_node = 'D_EXIT_EAST';

UPDATE corridors
SET to_node = 'D_T_EXIT_EAST'
WHERE to_node = 'D_EXIT_EAST';

UPDATE corridors
SET from_node = 'D_T_EXIT_SOUTH'
WHERE from_node = 'D_EXIT_SOUTH';

UPDATE corridors
SET to_node = 'D_T_EXIT_SOUTH'
WHERE to_node = 'D_EXIT_SOUTH';

UPDATE corridors
SET from_node = 'D_T_STAIRS'
WHERE from_node = 'D_STAIRS';

UPDATE corridors
SET to_node = 'D_T_STAIRS'
WHERE to_node = 'D_STAIRS';


-- =====================================================
-- 3) (OPTIONNEL MAIS CONSEILLÉ) SUPPRIMER LES ANCIENS NODES
--    Après update des corridors, ils ne doivent plus être référencés
-- =====================================================

DELETE FROM nodes WHERE label IN (
                                  'B_I_12','B_I_13','B_I_14',
                                  'B_R_17','B_R_18',
                                  'B_P_22','B_P_23','B_P_24','B_P_25',
                                  'D_ENTRANCE','D_PORTINERIA','D_AULA_MAGNA','D_AULA_MINORE','D_EXIT_EAST','D_EXIT_SOUTH','D_STAIRS'
    );

COMMIT;
INSERT INTO nodes(label) VALUES
                             ('B_R_AULA_19'),
                             ('B_R_AULA_20'),
                             ('B_R_AULA_21'),
                             ('B_R_EXIT')
    ON CONFLICT (label) DO NOTHING;
INSERT INTO corridors (id, from_node, to_node, weight, blocked) VALUES
                                                                    (302, 'B_R_AULA_18', 'B_R_AULA_19', 1.0, false),
                                                                    (303, 'B_R_AULA_19', 'B_R_AULA_20', 1.0, false),
                                                                    (304, 'B_R_AULA_20', 'B_R_AULA_21', 1.0, false),
                                                                    (305, 'B_R_AULA_21', 'B_R_EXIT',    1.0, false)
    ON CONFLICT (id) DO NOTHING;
-- Fix corridor 453 to point to the new label
UPDATE corridors
SET to_node = 'B_R_AULA_17'
WHERE id = 453;


UPDATE corridors
SET from_node = 'B_R_AULA_17'
WHERE id = 453 AND from_node = 'B_R_17';
INSERT INTO corridors (id, from_node, to_node, weight, blocked) VALUES
                                                                    (302, 'B_R_AULA_18', 'B_R_AULA_19', 1.0, false),
                                                                    (303, 'B_R_AULA_19', 'B_R_AULA_20', 1.0, false),
                                                                    (304, 'B_R_AULA_20', 'B_R_AULA_21', 1.0, false),
                                                                    (305, 'B_R_AULA_21', 'B_R_EXIT',    1.0, false)
    ON CONFLICT (id) DO NOTHING;
BEGIN;


INSERT INTO nodes(label) VALUES
                             ('B_R_AULA_19'),
                             ('B_R_AULA_20'),
                             ('B_R_AULA_21'),
                             ('B_R_EXIT')
    ON CONFLICT (label) DO NOTHING;


INSERT INTO corridors (id, from_node, to_node, weight, blocked) VALUES
                                                                    (302, 'B_R_AULA_18', 'B_R_AULA_19', 1.0, false),
                                                                    (303, 'B_R_AULA_19', 'B_R_AULA_20', 1.0, false),
                                                                    (304, 'B_R_AULA_20', 'B_R_AULA_21', 1.0, false),
                                                                    (305, 'B_R_AULA_21', 'B_R_EXIT',    1.0, false)
    ON CONFLICT (id) DO NOTHING;

COMMIT;
INSERT INTO public.nodes(label) VALUES
                                    ('B_R_AULA_19'),
                                    ('B_R_AULA_20'),
                                    ('B_R_AULA_21'),
                                    ('B_R_EXIT')
    ON CONFLICT (label) DO NOTHING;