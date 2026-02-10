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
