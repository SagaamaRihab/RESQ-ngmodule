CREATE TABLE utente (
  id_utente SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  ruolo VARCHAR(20) NOT NULL
);

CREATE TABLE mappa (
  id_mappa SERIAL PRIMARY KEY,
  nome VARCHAR(100)
);


CREATE TABLE nodo (
  id_nodo SERIAL PRIMARY KEY,
  x DOUBLE PRECISION NOT NULL,
  y DOUBLE PRECISION NOT NULL,
  id_mappa INTEGER NOT NULL,
  CONSTRAINT fk_nodo_mappa
    FOREIGN KEY (id_mappa)
    REFERENCES mappa(id_mappa)
    ON DELETE CASCADE
);


CREATE TABLE arco (
  id_arco SERIAL PRIMARY KEY,
  accessibile BOOLEAN NOT NULL,
  id_mappa INTEGER NOT NULL,
  nodo_inizio INTEGER NOT NULL,
  nodo_fine INTEGER NOT NULL,
  CONSTRAINT fk_arco_mappa
    FOREIGN KEY (id_mappa)
    REFERENCES mappa(id_mappa)
    ON DELETE CASCADE,
  CONSTRAINT fk_arco_nodo_inizio
    FOREIGN KEY (nodo_inizio)
    REFERENCES nodo(id_nodo),
  CONSTRAINT fk_arco_nodo_fine
    FOREIGN KEY (nodo_fine)
    REFERENCES nodo(id_nodo)
);

CREATE TABLE posizione (
  id_posizione SERIAL PRIMARY KEY,
  id_utente INTEGER NOT NULL,
  id_nodo INTEGER NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  CONSTRAINT fk_posizione_utente
    FOREIGN KEY (id_utente)
    REFERENCES utente(id_utente)
    ON DELETE CASCADE,
  CONSTRAINT fk_posizione_nodo
    FOREIGN KEY (id_nodo)
    REFERENCES nodo(id_nodo)
);

CREATE TABLE sessione (
  id_sessione SERIAL PRIMARY KEY,
  id_utente INTEGER NOT NULL,
  scadenza TIMESTAMP NOT NULL,
  CONSTRAINT fk_sessione_utente
    FOREIGN KEY (id_utente)
    REFERENCES utente(id_utente)
    ON DELETE CASCADE
);

CREATE TABLE percorso (
  id_percorso SERIAL PRIMARY KEY,
  id_utente INTEGER NOT NULL,
  lunghezza_totale DOUBLE PRECISION,
  timestamp TIMESTAMP NOT NULL,
  CONSTRAINT fk_percorso_utente
    FOREIGN KEY (id_utente)
    REFERENCES utente(id_utente)
