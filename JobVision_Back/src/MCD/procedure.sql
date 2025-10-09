DELIMITER //

CREATE PROCEDURE update_service_daily_summary(IN exec_id BIGINT)
BEGIN
  DECLARE v_service_id INT;
  DECLARE v_date DATE;

  -- Obtenir id_service et date
SELECT p.id_service, DATE(e.date_started)
INTO v_service_id, v_date
FROM execution_my e
    JOIN project p ON p.id = e.id_project
WHERE e.id_execution = exec_id;

-- Supprimer l'ancien résumé s'il existe pour ce service et ce jour
DELETE FROM service_daily_summary
WHERE id_service = v_service_id AND date_summary = v_date;

-- Insérer un nouveau résumé
INSERT INTO service_daily_summary (
    id_service,
    date_summary,
    total_executions,
    successful_executions,
    avg_response_time_ms,
    success_rate_percent,
    error_rate_percent,
    status
)
SELECT
    v_service_id,
    v_date,
    COUNT(*) AS total_execs,
    SUM(CASE WHEN e.status = 'SUCCEEDED' THEN 1 ELSE 0 END) AS successful_execs,
    ROUND(AVG(e.duration_ms), 2) AS avg_response,
    ROUND(SUM(e.status = 'SUCCEEDED') / COUNT(*) * 100, 2) AS success_rate,
    ROUND(SUM(e.status != 'SUCCEEDED') / COUNT(*) * 100, 2) AS error_rate,
    CASE
        WHEN (SUM(e.status = 'SUCCEEDED') / COUNT(*)) * 100 >= 95 AND (SUM(e.status != 'SUCCEEDED') / COUNT(*)) * 100 < 5 THEN 'healthy'
        WHEN (SUM(e.status = 'SUCCEEDED') / COUNT(*)) * 100 >= 75 THEN 'warning'
        ELSE 'critical'
        END AS service_status
FROM execution_my e
         JOIN project p ON p.id = e.id_project
WHERE p.id_service = v_service_id AND DATE(e.date_started) = v_date;
END;
//

DELIMITER ;