-- =====================================================
-- USERS
-- =====================================================

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);


-- =====================================================
-- MAPS
-- =====================================================

CREATE TABLE maps (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    json_data TEXT
);


-- =====================================================
-- NODES
-- =====================================================

CREATE TABLE nodes (
    id BIGSERIAL PRIMARY KEY,
    display_name VARCHAR(255),
    label VARCHAR(255) NOT NULL UNIQUE
);


-- =====================================================
-- CORRIDORS
-- =====================================================

CREATE TABLE corridors (
    id BIGINT PRIMARY KEY,
    from_node VARCHAR(255) NOT NULL,
    to_node VARCHAR(255) NOT NULL,
    weight DOUBLE PRECISION NOT NULL,
    blocked BOOLEAN NOT NULL DEFAULT FALSE,
    building VARCHAR(10) NOT NULL,

    CONSTRAINT fk_corridor_from
        FOREIGN KEY (from_node)
        REFERENCES nodes(label)
        ON DELETE CASCADE,

    CONSTRAINT fk_corridor_to
        FOREIGN KEY (to_node)
        REFERENCES nodes(label)
        ON DELETE CASCADE
);


-- =====================================================
-- ROUTES (salvataggio percorsi calcolati)
-- =====================================================

CREATE TABLE routes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    start_node VARCHAR(255),
    end_node VARCHAR(255),
    total_weight DOUBLE PRECISION,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_route_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);