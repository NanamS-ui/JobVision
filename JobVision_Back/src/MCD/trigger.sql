DROP TRIGGER IF EXISTS trg_after_insert_execution;
DELIMITER $$
CREATE TRIGGER trg_after_insert_execution
    AFTER INSERT ON execution
    FOR EACH ROW
BEGIN
    INSERT INTO execution_my (
        execution_id_rundeck,
        status,
        description,
        date_started,
        date_ended,
        arg,
        created_at,
        duration_ms,
        username,
        id_project,
        id_job
    )
    VALUES (
               NEW.id,
               CASE
                   WHEN NEW.status IS NULL THEN 'running'
                   ELSE NEW.status
                   END,
               NULL,
               NEW.date_started,
               NEW.date_completed,
               NEW.arg_string,
               NOW(),
               TIMESTAMPDIFF(MICROSECOND, NEW.date_started, NEW.date_completed) / 1000,
               NEW.rduser,
               (SELECT id FROM project WHERE name = NEW.project LIMIT 1),
           (SELECT id_job FROM job WHERE uuid = NEW.job_uuid LIMIT 1)
        );
    END$$

    DELIMITER ;

DROP TRIGGER IF EXISTS trg_after_update_execution;
DELIMITER $$
CREATE TRIGGER trg_after_update_execution
    AFTER UPDATE ON execution
    FOR EACH ROW
    BEGIN
    UPDATE execution_my
    SET
        status = CASE
                     WHEN NEW.status IS NULL THEN 'running'
                     ELSE NEW.status
            END,
        date_ended = NEW.date_completed,
        duration_ms = TIMESTAMPDIFF(MICROSECOND, NEW.date_started, NEW.date_completed) / 1000
    WHERE execution_id_rundeck = NEW.id;
END$$

DELIMITER ;

DROP TRIGGER IF EXISTS trg_execution_summary_insert;
DELIMITER //

    CREATE TRIGGER trg_execution_summary_insert
        AFTER INSERT ON execution_my
        FOR EACH ROW
    BEGIN
        CALL update_service_daily_summary(NEW.id_execution);
    END;
    //

    CREATE TRIGGER trg_execution_summary_update
        AFTER UPDATE ON execution_my
        FOR EACH ROW
    BEGIN
        CALL update_service_daily_summary(NEW.id_execution);
    END;
    //

DELIMITER ;

DROP TRIGGER IF EXISTS trg_after_log_insert;
DELIMITER $$

CREATE TRIGGER trg_after_log_insert
    AFTER INSERT ON log_output
    FOR EACH ROW
BEGIN
    DECLARE v_execution_id_rundeck BIGINT;
    DECLARE v_id_job BIGINT;
    DECLARE v_status VARCHAR(50);
    DECLARE v_date_started DATETIME;
    DECLARE v_date_ended DATETIME;
    DECLARE v_duration BIGINT;
    DECLARE v_created_at DATETIME;

    -- Récupérer les infos de l'exécution liée
            SELECT
                e.execution_id_rundeck,
                e.id_job,
                e.status,
                e.date_started,
                e.date_ended,
                e.duration_ms,
                e.created_at
            INTO
                v_execution_id_rundeck,
                v_id_job,
                v_status,
                v_date_started,
                v_date_ended,
                v_duration,
                v_created_at
            FROM execution_my e
            WHERE e.id_execution = NEW.id_execution;

            -- Insertion ou mise à jour
            INSERT INTO historique_execution (
                execution_id_rundeck,
                id_job,
                id_node,
                step_ctx,
                status,
                log_message,
                archive,
                date_execution,
                date_started,
                date_ended,
                duration
            )
            VALUES (
                       v_execution_id_rundeck,
                       v_id_job,
                       NEW.id_node,
                       NEW.step_ctx,
                       v_status,
                       NEW.log_message,
                       0,
                       v_created_at,
                       v_date_started,
                       v_date_ended,
                       v_duration
                   )
                ON DUPLICATE KEY UPDATE
                                     log_message = NEW.log_message,
                                     status = v_status,
                                     date_execution = v_created_at,
                                     date_started = v_date_started,
                                     date_ended = v_date_ended,
                                     duration = v_duration;
        END $$

DELIMITER ;


DROP TRIGGER IF EXISTS trg_after_execution_update;
DELIMITER $$
CREATE TRIGGER trg_after_execution_update
    AFTER UPDATE ON execution_my
    FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status
OR OLD.date_started <> NEW.date_started
OR OLD.date_ended <> NEW.date_ended
OR OLD.duration_ms <> NEW.duration_ms THEN

    UPDATE historique_execution
    SET
        status = NEW.status,
        date_started = NEW.date_started,
        date_ended = NEW.date_ended,
        duration = NEW.duration_ms
    WHERE execution_id_rundeck = NEW.execution_id_rundeck;
END IF;
END $$
DELIMITER ;

DELIMITER $$
    CREATE TRIGGER trg_after_log_update
        AFTER UPDATE ON log_output
        FOR EACH ROW
    BEGIN
        DECLARE v_created_at DATETIME;
    DECLARE v_execution_id_rundeck BIGINT;

    -- Récupérer les valeurs avant toute logique
        SELECT created_at, execution_id_rundeck
        INTO v_created_at, v_execution_id_rundeck
        FROM execution_my
        WHERE id_execution = NEW.id_execution;

        -- Mise à jour uniquement si le message a changé
        IF OLD.log_message <> NEW.log_message THEN
        UPDATE historique_execution
        SET
            log_message = NEW.log_message,
            date_execution = v_created_at
        WHERE execution_id_rundeck = v_execution_id_rundeck
          AND id_node = NEW.id_node
          AND step_ctx = NEW.step_ctx;
    END IF;
END $$

DELIMITER ;

DROP TRIGGER IF EXISTS trg_after_insert_execution_for_notification;
/*Notification*/
DELIMITER $$
CREATE TRIGGER trg_after_insert_execution_for_notification
    AFTER INSERT ON execution_my
    FOR EACH ROW
BEGIN
    DECLARE v_should_insert BOOLEAN;

    -- Si le statut est null ou "running", on considère que c’est ONSTART
    SET v_should_insert = (NEW.status IS NULL OR LOWER(NEW.status) = 'running');

    IF v_should_insert THEN
        INSERT INTO notification_log (
            status_job,
            message,
            channel,
            sent_at,
            is_sent,
            type_notification,
            id_execution,
            id_contact_notification_preference,
            id_job
        )
    SELECT
        'onstart',
        CONCAT('Job démarré : Execution ID = ', NEW.execution_id_rundeck),
        'EMAIL',
        NEW.created_at,
        FALSE,
        'onstart',
        NEW.id_execution,
        n.id_contact_notification_preference,
        NEW.id_job
    FROM notification_my n
    WHERE n.id_job = NEW.id_job
      AND NOT EXISTS (
        SELECT 1
        FROM notification_log l
        WHERE l.id_execution = NEW.id_execution
          AND l.id_contact_notification_preference = n.id_contact_notification_preference
          AND LOWER(l.type_notification) = 'onstart'
          AND l.status_job = 'onstart'
    );
END IF;
END$$

DELIMITER ;

DROP TRIGGER IF EXISTS trg_after_update_execution_for_notification;
DELIMITER $$

CREATE TRIGGER trg_after_update_execution_for_notification
    AFTER UPDATE ON execution_my
    FOR EACH ROW
BEGIN
    DECLARE v_type_notification VARCHAR(50);

    update_block: BEGIN

        IF NEW.status IS NULL OR LOWER(NEW.status) = 'running' THEN
            LEAVE update_block;
END IF;

IF OLD.status != NEW.status THEN
            IF LOWER(NEW.status) = 'succeeded' THEN
                SET v_type_notification = 'onsuccess';
            ELSEIF LOWER(NEW.status) = 'failed' THEN
                SET v_type_notification = 'onfailure';
            ELSEIF LOWER(NEW.status) = 'recovery' THEN
                SET v_type_notification = 'recovery';
ELSE
                LEAVE update_block;
END IF;

INSERT INTO notification_log (
    status_job,
    message,
    channel,
    sent_at,
    is_sent,
    type_notification,
    id_execution,
    id_contact_notification_preference,
    id_job
)
SELECT
    NEW.status,
    CONCAT('Mise à jour du job : ID = ', NEW.execution_id_rundeck),
    'EMAIL',
    NEW.date_ended,
    FALSE,
    v_type_notification,
    NEW.id_execution,
    n.id_contact_notification_preference,
    NEW.id_job
FROM notification_my n
WHERE n.id_job = NEW.id_job
  AND NOT EXISTS (
    SELECT 1
    FROM notification_log l
    WHERE l.id_execution = NEW.id_execution
      AND l.id_contact_notification_preference = n.id_contact_notification_preference
      AND l.type_notification = v_type_notification
      AND l.status_job = NEW.status
);
END IF;

END update_block;
END$$

DELIMITER ;