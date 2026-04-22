
DROP DATABASE IF EXISTS fungame;

CREATE DATABASE IF NOT EXISTS fungame

USE fungame;

CREATE TABLE IF NOT EXISTS players (
    player_id     VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
    player_name   VARCHAR(100) NOT NULL,
    gender        VARCHAR(20),
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS games (
    game_id    VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
    game_type  VARCHAR(50)  NOT NULL UNIQUE   -- '2048','Sudoku','Minesweeper','Nonogram','Snake','Wordle'
);


CREATE TABLE IF NOT EXISTS daily_challenges (
    challenge_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    game_id      VARCHAR(36) NOT NULL,
    date         DATE        NOT NULL,
    UNIQUE KEY uq_game_date (game_id, date),
    CONSTRAINT fk_dc_game FOREIGN KEY (game_id) REFERENCES games(game_id)
);


CREATE TABLE IF NOT EXISTS game_sessions (
    session_id   VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
    player_id    VARCHAR(36)  NOT NULL,
    game_id      VARCHAR(36)  NOT NULL,
    difficulty   ENUM('easy','medium','hard') NOT NULL DEFAULT 'medium',
    state        ENUM('IDLE','PLAYING','PAUSED','FINISHED') NOT NULL DEFAULT 'IDLE',
    score        INT          NOT NULL DEFAULT 0,
    start_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time     DATETIME,
    CONSTRAINT fk_gs_player FOREIGN KEY (player_id) REFERENCES players(player_id),
    CONSTRAINT fk_gs_game   FOREIGN KEY (game_id)   REFERENCES games(game_id)
);


CREATE TABLE IF NOT EXISTS game_results (
    result_id    VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    session_id   VARCHAR(36) NOT NULL UNIQUE,
    player_id    VARCHAR(36) NOT NULL,
    score        INT         NOT NULL DEFAULT 0,
    time_seconds INT         NOT NULL DEFAULT 0,   -- duration in seconds
    difficulty   ENUM('easy','medium','hard') NOT NULL,
    date         DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_gr_session FOREIGN KEY (session_id) REFERENCES game_sessions(session_id),
    CONSTRAINT fk_gr_player  FOREIGN KEY (player_id)  REFERENCES players(player_id)
);

CREATE TABLE IF NOT EXISTS game_progress (
    progress_id  VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
    session_id   VARCHAR(36)  NOT NULL,
    player_id    VARCHAR(36)  NOT NULL,
    game_id      VARCHAR(36)  NOT NULL,
    state        ENUM('IDLE','PLAYING','PAUSED','FINISHED') NOT NULL DEFAULT 'PAUSED',
    time_seconds INT          NOT NULL DEFAULT 0,
    is_completed TINYINT(1)   NOT NULL DEFAULT 0,
    saved_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_gp_session FOREIGN KEY (session_id) REFERENCES game_sessions(session_id),
    CONSTRAINT fk_gp_player  FOREIGN KEY (player_id)  REFERENCES players(player_id),
    CONSTRAINT fk_gp_game    FOREIGN KEY (game_id)    REFERENCES games(game_id)
);


CREATE TABLE IF NOT EXISTS leaderboard (
    leaderboard_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    game_id        VARCHAR(36) NOT NULL,
    player_id      VARCHAR(36) NOT NULL,
    result_id      VARCHAR(36) NOT NULL,
    score          INT         NOT NULL DEFAULT 0,
    time_seconds   INT         NOT NULL DEFAULT 0,
    difficulty     ENUM('easy','medium','hard') NOT NULL,
    recorded_at    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_lb_result (result_id),
    CONSTRAINT fk_lb_game   FOREIGN KEY (game_id)   REFERENCES games(game_id),
    CONSTRAINT fk_lb_player FOREIGN KEY (player_id) REFERENCES players(player_id),
    CONSTRAINT fk_lb_result FOREIGN KEY (result_id) REFERENCES game_results(result_id)
);