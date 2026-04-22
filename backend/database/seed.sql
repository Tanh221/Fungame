

USE fungame;


INSERT INTO games (game_id, game_type) VALUES
    ('g-2048-0001', '2048'),
    ('g-sudo-0002', 'Sudoku'),
    ('g-mine-0003', 'Minesweeper'),
    ('g-nono-0004', 'Nonogram'),
    ('g-snak-0005', 'Snake'),
    ('g-word-0006', 'Wordle');


INSERT INTO players (player_id, player_name, gender, email, password_hash) VALUES
    ('p-0001', 'Alice',   'female', 'alice@example.com',   SHA2('password123', 256)),
    ('p-0002', 'Bob',     'male',   'bob@example.com',     SHA2('password456', 256)),
    ('p-0003', 'Charlie', 'male',   'charlie@example.com', SHA2('password789', 256)),
    ('p-0004', 'Diana',   'female', 'diana@example.com',   SHA2('passwordabc', 256));

INSERT INTO daily_challenges (challenge_id, game_id, date) VALUES
    ('dc-0001', 'g-2048-0001', CURDATE()),
    ('dc-0002', 'g-sudo-0002', CURDATE()),
    ('dc-0003', 'g-word-0006', CURDATE());

INSERT INTO game_sessions (session_id, player_id, game_id, difficulty, state, score, start_time, end_time) VALUES
    ('gs-0001', 'p-0001', 'g-2048-0001', 'medium', 'FINISHED', 4096, '2025-04-14 10:00:00', '2025-04-14 10:15:00'),
    ('gs-0002', 'p-0002', 'g-2048-0001', 'medium', 'FINISHED', 8192, '2025-04-14 11:00:00', '2025-04-14 11:20:00'),
    ('gs-0003', 'p-0003', 'g-2048-0001', 'medium', 'FINISHED', 2048, '2025-04-14 12:00:00', '2025-04-14 12:08:00'),
    ('gs-0004', 'p-0001', 'g-sudo-0002', 'hard',   'FINISHED', 950,  '2025-04-14 13:00:00', '2025-04-14 13:30:00'),
    ('gs-0005', 'p-0004', 'g-snak-0005', 'easy',   'FINISHED', 300,  '2025-04-14 14:00:00', '2025-04-14 14:05:00'),
    ('gs-0006', 'p-0002', 'g-word-0006', 'medium', 'FINISHED', 800,  '2025-04-14 15:00:00', '2025-04-14 15:07:00'),
    ('gs-0007', 'p-0001', 'g-2048-0001', 'medium', 'PLAYING',  1024, '2025-04-15 09:00:00', NULL);

INSERT INTO game_results (result_id, session_id, player_id, score, time_seconds, difficulty, date) VALUES
    ('gr-0001', 'gs-0001', 'p-0001', 4096, 900,  'medium', '2025-04-14 10:15:00'),
    ('gr-0002', 'gs-0002', 'p-0002', 8192, 1200, 'medium', '2025-04-14 11:20:00'),
    ('gr-0003', 'gs-0003', 'p-0003', 2048, 480,  'medium', '2025-04-14 12:08:00'),
    ('gr-0004', 'gs-0004', 'p-0001', 950,  1800, 'hard',   '2025-04-14 13:30:00'),
    ('gr-0005', 'gs-0005', 'p-0004', 300,  300,  'easy',   '2025-04-14 14:05:00'),
    ('gr-0006', 'gs-0006', 'p-0002', 800,  420,  'medium', '2025-04-14 15:07:00');

INSERT INTO leaderboard (leaderboard_id, game_id, player_id, result_id, score, time_seconds, difficulty) VALUES
    ('lb-0001', 'g-2048-0001', 'p-0002', 'gr-0002', 8192, 1200, 'medium'),
    ('lb-0002', 'g-2048-0001', 'p-0001', 'gr-0001', 4096, 900,  'medium'),
    ('lb-0003', 'g-2048-0001', 'p-0003', 'gr-0003', 2048, 480,  'medium'),
    ('lb-0004', 'g-sudo-0002', 'p-0001', 'gr-0004', 950,  1800, 'hard'),
    ('lb-0005', 'g-snak-0005', 'p-0004', 'gr-0005', 300,  300,  'easy'),
    ('lb-0006', 'g-word-0006', 'p-0002', 'gr-0006', 800,  420,  'medium');


INSERT INTO game_progress (progress_id, session_id, player_id, game_id, state, time_seconds, is_completed) VALUES
    ('gp-0001', 'gs-0007', 'p-0001', 'g-2048-0001', 'PLAYING', 540, 0);