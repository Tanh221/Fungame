USE fungame;

SELECT *
FROM (
    SELECT
        p.player_name                                           AS username,
        g.game_type                                             AS game,
        MAX(gs.score)                                           AS best_score,
        MIN(TIMESTAMPDIFF(SECOND, gs.start_time, gs.end_time)) AS best_time_seconds
    FROM game_sessions gs
    JOIN players p ON gs.player_id = p.player_id
    JOIN games   g ON gs.game_id   = g.game_id
    WHERE gs.state      = 'FINISHED'
      AND g.game_type   = '2048'
      AND gs.difficulty = 'medium'
    GROUP BY p.player_id, p.player_name, g.game_type
) ranked
ORDER BY best_score DESC, best_time_seconds ASC;


