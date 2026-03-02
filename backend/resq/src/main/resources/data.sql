-- =====================================================
-- NODES
-- =====================================================

INSERT INTO nodes (display_name, label) VALUES

-- =======================
-- EDIFICIO A
-- =======================

-- Piano Terra
('Main Entrance', 'A_T_ENTRANCE'),
('Hall', 'A_T_HALL'),
('Stairs (Ground)', 'A_T_STAIRS'),
('Library', 'A_T_BIBLIOTECA'),
('Study Room', 'A_T_SALA_STUDIO'),

-- Primo Piano
('Stairs (First)', 'A_1_STAIRS'),
('Hall (First)', 'A_1_HALL'),
('Aula 3', 'A_1_AULA_3'),
('Aula 4', 'A_1_AULA_4'),

-- Secondo Piano
('Stairs (Second)', 'A_2_STAIRS'),
('Hall (Second)', 'A_2_HALL'),
('Aula 7', 'A_2_AULA_7'),
('Aula 8', 'A_2_AULA_8'),
('Aula 9', 'A_2_AULA_9'),
('Aula 10', 'A_2_AULA_10'),

-- =======================
-- EDIFICIO B
-- =======================

-- Interrato
('Entrance (Basement)', 'B_I_ENTRANCE'),
('Aula 12', 'B_I_AULA_12'),
('Aula 13', 'B_I_AULA_13'),
('Aula 14', 'B_I_AULA_14'),
('Basement Exit', 'B_I_EXIT'),

-- Rialzato
('Rialzato Entrance', 'B_R_ENTRANCE'),
('Aula 17', 'B_R_AULA_17'),
('Aula 18', 'B_R_AULA_18'),
('Aula 19', 'B_R_AULA_19'),
('Aula 20', 'B_R_AULA_20'),
('Aula 21', 'B_R_AULA_21'),
('Rialzato Exit', 'B_R_EXIT'),

-- Primo Piano
('First Floor Entrance', 'B_P_INGRESSO'),
('Aula 22', 'B_P_AULA_22'),
('Aula 23', 'B_P_AULA_23'),
('Aula 24', 'B_P_AULA_24'),
('Aula 25', 'B_P_AULA_25'),
('First Floor Exit', 'B_P_EXIT'),

-- =======================
-- EDIFICIO D
-- =======================

('Ingresso Principale', 'D_T_INGRESSO_PRINCIPALE'),
('Portineria', 'D_T_PORTINERIA'),
('Aula Magna', 'D_T_AULA_MAGNA'),
('Aula Minore', 'D_T_AULA_MINORE'),
('Exit East', 'D_T_EXIT_EAST'),
('Exit South', 'D_T_EXIT_SOUTH'),
('Stairs D', 'D_T_STAIRS')

ON CONFLICT (label) DO NOTHING;


-- =====================================================
-- CORRIDORS
-- =====================================================
INSERT INTO corridors
(id, from_node, to_node, weight, blocked, building)
VALUES
(501, 'A_T_ENTRANCE', 'A_T_HALL', 1.0, false, 'A'),
(502, 'A_T_HALL', 'A_T_BIBLIOTECA', 1.0, false, 'A'),
(503, 'A_T_HALL', 'A_T_SALA_STUDIO', 1.0, false, 'A'),
(504, 'A_T_HALL', 'A_T_STAIRS', 1.0, false, 'A'),
(511, 'A_1_STAIRS', 'A_1_HALL', 1.0, false, 'A'),
(512, 'A_1_HALL', 'A_1_AULA_3', 1.0, false, 'A'),
(513, 'A_1_HALL', 'A_1_AULA_4', 1.0, false, 'A'),
(521, 'A_2_STAIRS', 'A_2_HALL', 1.0, false, 'A'),
(522, 'A_2_HALL', 'A_2_AULA_7', 1.0, false, 'A'),
(523, 'A_2_HALL', 'A_2_AULA_8', 1.0, false, 'A'),
(524, 'A_2_HALL', 'A_2_AULA_9', 1.0, false, 'A'),
(525, 'A_2_HALL', 'A_2_AULA_10', 1.0, false, 'A'),
(531, 'A_2_STAIRS', 'A_1_STAIRS', 1.0, false, 'A'),
(532, 'A_1_STAIRS', 'A_T_STAIRS', 1.0, false, 'A'),

(201, 'B_I_ENTRANCE', 'B_I_AULA_12', 1.0, false, 'B'),
(202, 'B_I_AULA_12', 'B_I_AULA_13', 1.0, false, 'B'),
(203, 'B_I_AULA_13', 'B_I_AULA_14', 1.0, false, 'B'),
(204, 'B_I_AULA_14', 'B_I_EXIT', 1.0, false, 'B'),
(301, 'B_R_ENTRANCE', 'B_R_AULA_17', 1.0, false, 'B'),
(302, 'B_R_AULA_17', 'B_R_AULA_18', 1.0, false, 'B'),
(303, 'B_R_AULA_18', 'B_R_AULA_19', 1.0, false, 'B'),
(304, 'B_R_AULA_19', 'B_R_AULA_20', 1.0, false, 'B'),
(305, 'B_R_AULA_20', 'B_R_AULA_21', 1.0, false, 'B'),
(306, 'B_R_AULA_21', 'B_R_EXIT', 1.0, false, 'B'),
(401, 'B_P_INGRESSO', 'B_P_AULA_22', 1.0, false, 'B'),
(402, 'B_P_AULA_22', 'B_P_AULA_23', 1.0, false, 'B'),
(403, 'B_P_AULA_23', 'B_P_AULA_24', 1.0, false, 'B'),
(404, 'B_P_AULA_24', 'B_P_AULA_25', 1.0, false, 'B'),
(405, 'B_P_AULA_25', 'B_P_EXIT', 1.0, false, 'B'),
(451, 'B_P_INGRESSO', 'B_R_ENTRANCE', 1.0, false, 'B'),
(452, 'B_R_ENTRANCE', 'B_I_ENTRANCE', 1.0, false, 'B'),

(101, 'D_T_INGRESSO_PRINCIPALE', 'D_T_PORTINERIA', 1.0, false, 'D'),
(102, 'D_T_PORTINERIA', 'D_T_AULA_MAGNA', 1.5, false, 'D'),
(103, 'D_T_PORTINERIA', 'D_T_AULA_MINORE', 1.5, false, 'D'),
(104, 'D_T_AULA_MAGNA', 'D_T_EXIT_SOUTH', 2.0, false, 'D'),
(105, 'D_T_AULA_MINORE', 'D_T_EXIT_EAST', 2.0, false, 'D')


ON CONFLICT (id) DO NOTHING;