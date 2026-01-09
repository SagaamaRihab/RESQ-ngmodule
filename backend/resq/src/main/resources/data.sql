-- PULIZIA (per evitare duplicati)
DELETE FROM corridors;
DELETE FROM nodes;

-- ======================
-- NODES - Piano 1
-- ======================
INSERT INTO nodes(label) VALUES
('A101'),('A102'),('A103'),('A104'),
('H1_P1'),('H2_P1'),
('S1_P1'),('S2_P1');

-- ======================
-- NODES - Piano Terra
-- ======================
INSERT INTO nodes(label) VALUES
('S1_PT'),('S2_PT'),
('E1_PT'),('E2_PT');

-- ======================
-- CORRIDORS
-- ======================
INSERT INTO corridors(from_node, to_node, weight, blocked) VALUES
('A101','H1_P1',1,false),
('A102','H1_P1',1,false),
('A103','H2_P1',1,false),
('A104','H2_P1',1,false),

('H1_P1','H2_P1',2,false),

('H1_P1','S1_P1',1,false),
('H2_P1','S2_P1',1,false),

('S1_P1','S1_PT',1,false),
('S2_P1','S2_PT',1,false),

('S1_PT','E1_PT',1,false),
('S2_PT','E2_PT',1,false);
