CREATE OR REPLACE VIEW service_daily_summary_view AS
SELECT
    sds.id_summary AS id,
    sds.date_summary,
    COALESCE(sds.total_executions, 0) AS total_executions,
    COALESCE(sds.successful_executions, 0) AS successful_executions,
    COALESCE(sds.avg_response_time_ms, 0) AS avg_response_time_ms,
    COALESCE(sds.success_rate_percent, 0) AS success_rate_percent,
    COALESCE(sds.error_rate_percent, 0) AS error_rate_percent,
    COALESCE(sds.status, 'UNKNOWN') AS status,
    s.id_service AS service_id,
    s.name AS service_name,
    s.description AS service_description
FROM
    service s
        LEFT JOIN
    service_daily_summary sds ON s.id_service = sds.id_service;

create or replace view service_summary_grouped_view as
select `s`.`id_service`                                         AS `service_id`,
       `s`.`name`                                               AS `service_name`,
       `s`.`description`                                        AS `service_description`,
       max(`sds`.`date_summary`)                                AS `date_summary`,
       count(`sds`.`id_summary`)                                AS `days_reported`,
       sum(coalesce(`sds`.`total_executions`, 0))               AS `total_executions`,
       sum(coalesce(`sds`.`successful_executions`, 0))          AS `total_successful_executions`,
       round(avg(coalesce(`sds`.`avg_response_time_ms`, 0)), 0) AS `avg_response_time_ms`,
       round(case
                 when count(`sds`.`id_summary`) > 0 then sum(coalesce(`sds`.`successful_executions`, 0)) * 100.0 /
                                                         nullif(sum(coalesce(`sds`.`total_executions`, 0)), 0)
                 else 0 end, 0)                                 AS `success_rate_percent`,
       round(case
                 when count(`sds`.`id_summary`) > 0 then
                     sum(coalesce(`sds`.`total_executions`, 0) - coalesce(`sds`.`successful_executions`, 0)) * 100.0 /
                     nullif(sum(coalesce(`sds`.`total_executions`, 0)), 0)
                 else 0 end, 0)                                 AS `error_rate_percent`,
       case
           when count(`sds`.`id_summary`) = 0 then 'UNKNOWN'
           when sum(coalesce(`sds`.`successful_executions`, 0)) * 100.0 /
                nullif(sum(coalesce(`sds`.`total_executions`, 0)), 0) >= 95 and
                sum(coalesce(`sds`.`total_executions`, 0) - `sds`.`successful_executions`) * 100.0 /
                nullif(sum(coalesce(`sds`.`total_executions`, 0)), 0) < 5 then 'healthy'
           when sum(coalesce(`sds`.`successful_executions`, 0)) * 100.0 /
                nullif(sum(coalesce(`sds`.`total_executions`, 0)), 0) >= 75 then 'warning'
           else 'critical' end                                  AS `service_status`
from (`service` `s` left join `service_daily_summary` `sds`
      on (`s`.`id_service` = `sds`.`id_service`))
group by `s`.`id_service`, `s`.`name`, `s`.`description`;


CREATE OR REPLACE VIEW node_statistics_view AS
SELECT
    (SELECT COUNT(*) FROM node WHERE enabled_ = TRUE) AS total_enabled_nodes,
    (SELECT COUNT(DISTINCT n.id_node)
     FROM node n
              JOIN node_filter nf ON nf.filter_node LIKE CONCAT('%', n.nodename, '%')
    ) AS nodes_in_filters,
    (SELECT COUNT(DISTINCT j.id_job)
     FROM job j
              JOIN node_filter nf ON j.id_node_filter = nf.id_node_filter
              JOIN node n ON nf.filter_node LIKE CONCAT('%', n.nodename, '%')
     WHERE n.enabled_ = TRUE
    ) AS jobs_on_active_nodes,
    (SELECT COUNT(DISTINCT os_family_)
     FROM node
    ) AS distinct_os_families;

CREATE OR REPLACE VIEW job_last_execution_view AS
SELECT
    j.id_job,
    j.name AS job_name,
    p.name AS project_name,
    s.name AS service_name,
    em.id_execution AS last_execution_id,
    em.execution_id_rundeck,
    em.date_started,
    em.duration_ms,
    em.status,
    j.isDeleted
FROM job j
         JOIN project p ON j.id_project = p.id
         LEFT JOIN service s ON p.id_service = s.id_service
         LEFT JOIN (
    SELECT em1.id_job, em1.id_execution, em1.date_started, em1.duration_ms, em1.status, em1.execution_id_rundeck
    FROM execution_my em1
             JOIN (
        SELECT id_job, MAX(date_started) AS latest
        FROM execution_my
        GROUP BY id_job
    ) em2 ON em1.id_job = em2.id_job AND em1.date_started = em2.latest
) em ON j.id_job = em.id_job;


CREATE OR REPLACE VIEW service_details_view AS
SELECT
    s.id_service,
    s.name AS service_name,
    s.description AS service_description,

    p.id AS project_id,
    p.name AS project_name,
    p.description AS project_description,
    p.state AS project_state,
    p.date_created,
    p.last_updated,

    j.id_job,
    j.uuid AS job_uuid,
    j.name AS job_name,
    j.description AS job_description,
    j.execution_enabled,
    j.schedule_enabled,
    j.created_at AS job_created_at,
    j.updated_at AS job_updated_at,
    j.log_level,
    j.priority,
    j.cron_expression,
    j.is_deleted

FROM service s
         LEFT JOIN project p ON p.id_service = s.id_service
         LEFT JOIN job j ON j.id_project = p.id;


create or replace view log_output_view as
select `lo`.`id_log_output` AS `id_log_output`,
       `lo`.`log_message`   AS `log_message`,
       `lo`.`log_level`     AS `log_level`,
       `lo`.`step_ctx`      AS `step_ctx`,
       `lo`.`step_number`   AS `step_number`,
       `lo`.`created_at_`   AS `created_at_`,
       `lo`.`absolute_time` AS `absolute_time`,
       `lo`.`local_time`    AS `local_time`,
       `lo`.`id_execution`  AS `id_execution`,
       `lo`.`user_`         AS `user_`,
       `n`.`id_node`        AS `id_node`,
       `n`.`nodename`       AS `nodename`,
       `n`.`hostname`       AS `hostname`,
       `j`.`id_job`         AS `id_job`,
       `j`.`name`           AS `job_name`,
       `j`.`description`    AS `job_description`,
       `j`.`is_deleted`    AS `job_deleted`
from (((`log_output` `lo` join `node` `n`
        on ((`lo`.`id_node` = `n`.`id_node`))) left join `execution_my` `e`
       on ((`lo`.`id_execution` = `e`.`id_execution`))) left join `job` `j`
      on ((`e`.`id_job` = `j`.`id_job`)));


create or replace view notification_details_view as
select `cnp`.`id_contact_notification_preference` AS `id_contact_notification_preference`,
       `c`.`id_contact`                           AS `id_contact`,
       `c`.`nom`                                  AS `contact_nom`,
       `c`.`prenom`                               AS `contact_prenom`,
       `c`.`email`                                AS `email`,
       `c`.`telephone`                            AS `telephone`,
       `g`.`id_groupe`                            AS `id_groupe`,
       `g`.`name_groupe`                          AS `name_groupe`,
       `g`.`description`                          AS `groupe_description`,
       `cnp`.`notify_on_failed`                   AS `notify_on_failed`,
       `cnp`.`notify_on_recovery`                 AS `notify_on_recovery`,
       `cnp`.`notify_on_success`                  AS `notify_on_success`,
       `cnp`.`notify_on_start`                    AS `notify_on_start`,
       `cnp`.`channel_email`                      AS `channel_email`,
       `cnp`.`channel_sms`                        AS `channel_sms`,
       (case
            when ((`cnp`.`id_contact` is not null) and (`cnp`.`id_groupe` is null)) then 'INDIVIDUEL'
            when ((`cnp`.`id_contact` is null) and (`cnp`.`id_groupe` is not null)) then 'GROUPE'
            when ((`cnp`.`id_contact` is not null) and (`cnp`.`id_groupe` is not null)) then 'MIXTE'
            else 'INCONNU' end)                   AS `type_preference`
from ((`contact_notification_preference` `cnp` left join `contact` `c`
       on ((`cnp`.`id_contact` = `c`.`id_contact`))) left join `groupe` `g`
      on ((`cnp`.`id_groupe` = `g`.`id_groupe`)));


create or replace view notification_log_details_view as
select `nl`.`id_log_notification`               AS `id_log_notification`,
       `nl`.`status_job`                        AS `status_job`,
       `nl`.`message`                           AS `message`,
       `nl`.`channel`                           AS `channel`,
       `nl`.`sent_at`                           AS `sent_at`,
       `nl`.`is_sent`                           AS `is_sent`,
       `nl`.`type_notification`                 AS `type_notification`,
       `e`.`id_execution`                       AS `id_execution`,
       `e`.`execution_id_rundeck`               AS `execution_id_rundeck`,
       `e`.`status`                             AS `execution_status`,
       `e`.`date_started`                       AS `date_started`,
       `e`.`date_ended`                         AS `date_ended`,
       `j`.`id_job`                             AS `id_job`,
       `j`.`name`                               AS `job_name`,
       `p`.`id_contact_notification_preference` AS `id_contact_notification_preference`,
       `p`.`notify_on_start`                    AS `notify_on_start`,
       `p`.`notify_on_failed`                   AS `notify_on_failed`,
       `p`.`notify_on_recovery`                 AS `notify_on_recovery`,
       `p`.`notify_on_success`                  AS `notify_on_success`,
       `p`.`channel_email`                      AS `channel_email`,
       `p`.`channel_sms`                        AS `channel_sms`,
       `c`.`id_contact`                         AS `contact_id`,
       `c`.`nom`                                AS `contact_nom`,
       `c`.`prenom`                             AS `contact_prenom`,
       `c`.`email`                              AS `contact_email`,
       `c`.`telephone`                          AS `contact_telephone`,
       `g`.`id_groupe`                          AS `groupe_id`,
       `g`.`name_groupe`                        AS `groupe_name`,
       `g`.`description`                        AS `groupe_description`
from (((((`notification_log` `nl` join `execution_my` `e`
          on ((`nl`.`id_execution` = `e`.`id_execution`))) join `job` `j`
         on ((`nl`.`id_job` = `j`.`id_job`))) join `contact_notification_preference` `p`
        on ((`nl`.`id_contact_notification_preference` =
             `p`.`id_contact_notification_preference`))) left join `contact` `c`
       on ((`p`.`id_contact` = `c`.`id_contact`))) left join `groupe` `g`
      on ((`p`.`id_groupe` = `g`.`id_groupe`)));