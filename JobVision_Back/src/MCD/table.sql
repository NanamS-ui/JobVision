DROP TABLE IF EXISTS notification_log, log_output, historique_execution,
    notification_my, contact_notification_preference, contact_groupe,
    contact, groupe, errorhandler, workflowstep_my, workflow_option,
    workflow_my, job, node_project, node, node_filter, ssh_path,
    user_auth, role, service_daily_summary, service, blacklisted_tokens, run, project;

CREATE TABLE service(
    id_service INT auto_increment,
    name VARCHAR(255)  NOT NULL,
    description VARCHAR(255) ,
    PRIMARY KEY(id_service)
);

create table service_daily_summary
(
    id_summary            bigint auto_increment
        primary key,
    date_summary          date                                    null,
    total_executions      int                                     null,
    successful_executions varchar(50)                             null,
    avg_response_time_ms  float                                   null,
    success_rate_percent  float                                   null,
    error_rate_percent    float                                   null,
    status                enum ('healthy', 'warning', 'critical') null,
    id_service            int                                     null,
    constraint service_daily_summary_ibfk_1
        foreign key (id_service) references service (id_service)
);


ALTER table project add column id_service int;
ALTER table project add constraint fk_project_service foreign key (id_service) references service (id_service);

-- create table project
-- (
--     id           bigint auto_increment
--         primary key,
--     version      bigint       not null,
--     date_created datetime(6)  not null,
--     last_updated datetime(6)  not null,
--     name         varchar(255) not null,
--     description  varchar(255) null,
--     state        varchar(255) null,
--     id_service   int          null,
--     constraint UC_PROJECTNAME_COL
--         unique (name),
--     constraint fk_project_service
--         foreign key (id_service) references service (id_service)
-- );

CREATE TABLE role(
     id_role INT auto_increment,
     val VARCHAR(50)  NOT NULL,
     description VARCHAR(255) ,
     PRIMARY KEY(id_role)
);

CREATE TABLE user_auth(
  id_user INT auto_increment,
  matricule VARCHAR(50)  NOT NULL,
  password VARCHAR(255)  NOT NULL,
  active BOOLEAN NOT NULL,
  id_service INT,
  id_role INT,
  PRIMARY KEY(id_user),
  FOREIGN KEY(id_service) REFERENCES service(id_service),
  FOREIGN KEY(id_role) REFERENCES role(id_role)
);

create table ssh_path
(
    id_ssh_path         bigint auto_increment
        primary key,
    key_storage         varchar(50)  not null,
    key_type            varchar(50)  not null,
    ssh_port            varchar(50)  null,
    name_key_private    varchar(50)  null,
    password            varchar(50)  null,
    private_key_content text         null,
    name                varchar(255) null
);

create table node
(
    id_node      bigint auto_increment
        primary key,
    nodename     varchar(50)                            not null,
    hostname     varchar(50)                            not null,
    username     varchar(50)                            not null,
    os_family_   varchar(50)                            null,
    os_name_     varchar(50)                            null,
    os_arch_     varchar(50)                            null,
    tags_        varchar(50)                            null,
    description_ text                                   null,
    enabled_     tinyint(1) default 1                   null,
    created_at_  datetime   default current_timestamp() null,
    updated_at_  datetime   default current_timestamp() null,
    id_ssh_path  bigint                                 not null,
    constraint node_ibfk_1
        foreign key (id_ssh_path) references ssh_path (id_ssh_path)
);

create table node_project
(
    id_node    bigint not null,
    id_project bigint not null,
    primary key (id_node, id_project),
    constraint node_project_ibfk_1
        foreign key (id_node) references node (id_node),
    constraint node_project_ibfk_2
        foreign key (id_project) references project (id)
);

create table node_filter
(
    id_node_filter bigint auto_increment
        primary key,
    filter_node    text null
);

create table job
(
    id_job            bigint auto_increment
        primary key,
    uuid              varchar(50)                           not null,
    name              varchar(100)                          not null,
    description       text                                  null,
    log_level         varchar(50) default 'INFO'            null,
    execution_enabled tinyint(1)  default 1                 null,
    schedule_enabled  tinyint(1)  default 1                 null,
    created_at        datetime    default CURRENT_TIMESTAMP null,
    updated_at        datetime    default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    id_node_filter    bigint                                not null,
    id_project        bigint                                not null,
    cron_expression   varchar(255)                          null,
    priority          tinyint(1)  default 0                 null,
    constraint job_ibfk_1
        foreign key (id_node_filter) references node_filter (id_node_filter),
    constraint job_ibfk_2
        foreign key (id_project) references project (id)
);

create table workflow_my
(
    id_workflow bigint auto_increment
        primary key,
    strategy    varchar(50) default 'node-first' null,
    keepgoing   tinyint(1)  default 1            null,
    description text                             null,
    id_job      bigint                           null,
    threadcount int                              null,
    constraint fk_workflow_job
        foreign key (id_job) references job (id_job)
            on delete cascade
);

CREATE TABLE workflow_option (
      id_option BIGINT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      required BOOLEAN DEFAULT FALSE,
      default_value VARCHAR(255),
      allowed_values TEXT,
      multivalued BOOLEAN DEFAULT FALSE,
      secure BOOLEAN DEFAULT FALSE,
      value_exposed BOOLEAN DEFAULT TRUE,
      regex VARCHAR(255),
      id_workflow BIGINT NOT NULL,
      CONSTRAINT fk_option_workflow
          FOREIGN KEY (id_workflow) REFERENCES workflow_my(id_workflow)
              ON DELETE CASCADE
);

create table workflowstep_my
(
    id_workflow_step_my  bigint auto_increment
        primary key,
    step_number          int                     not null,
    description          text                    null,
    plugin_type          varchar(100)            null,
    command              text                    null,
    node_step            tinyint(1)  default 1   null,
    keepgoing_on_success tinyint(1)  default 1   null,
    keepgoing_on_failure varchar(50) default '0' null,
    name                 varchar(255)            null,
    script               text                    null,
    script_type          varchar(20)             null,
    args                 varchar(50)             null,
    file_path            text                    null,
    interpreter          text                    null,
    id_workflow          bigint                  not null,
    job_ref              varchar(255)            null,
    constraint fk_workflowstep_workflow
        foreign key (id_workflow) references workflow_my (id_workflow)
            on delete cascade
);

CREATE TABLE errorhandler (
      id_errorhandler BIGINT AUTO_INCREMENT PRIMARY KEY,
      id_job BIGINT NOT NULL,
      id_workflow_step_my BIGINT NULL,
      handler_type VARCHAR(50) NOT NULL,
      handler_command TEXT NULL,
      handler_description VARCHAR(255) NULL,
      continue_on_error BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_errorhandler_job FOREIGN KEY (id_job) REFERENCES job(id_job) ON DELETE CASCADE,
      CONSTRAINT fk_errorhandler_step FOREIGN KEY (id_workflow_step_my) REFERENCES workflowstep_my(id_workflow_step_my) ON DELETE CASCADE
);


CREATE TABLE groupe (
    id_groupe BIGINT AUTO_INCREMENT,
    name_groupe VARCHAR(150) NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id_groupe)
);

CREATE TABLE contact (
     id_contact BIGINT AUTO_INCREMENT,
     nom VARCHAR(100),
     prenom VARCHAR(100),
     email VARCHAR(150),
     telephone VARCHAR(50),
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     PRIMARY KEY(id_contact)
);

CREATE TABLE contact_groupe (
    id BIGINT AUTO_INCREMENT,
    id_contact BIGINT,
    id_groupe BIGINT,
    PRIMARY KEY(id),
    FOREIGN KEY(id_contact) REFERENCES contact(id_contact) ON DELETE CASCADE,
    FOREIGN KEY(id_groupe) REFERENCES groupe(id_groupe) ON DELETE CASCADE
);

CREATE TABLE contact_notification_preference(
    id_contact_notification_preference BIGINT AUTO_INCREMENT ,
    notify_on_failed BOOLEAN DEFAULT FALSE,
    notify_on_recovery BOOLEAN DEFAULT FALSE,
    notify_on_success BOOLEAN DEFAULT FALSE,
    notify_on_start BOOLEAN DEFAULT FALSE,
    channel_email BOOLEAN DEFAULT TRUE,
    channel_sms BOOLEAN DEFAULT FALSE,
    id_groupe BIGINT,
    id_contact BIGINT,
    PRIMARY KEY(id_contact_notification_preference),
    FOREIGN KEY(id_groupe) REFERENCES groupe(id_groupe) ON DELETE CASCADE,
    FOREIGN KEY(id_contact) REFERENCES contact(id_contact) ON DELETE CASCADE
);

CREATE TABLE notification_my(
    id_notification BIGINT auto_increment,
    event_type VARCHAR(50)  NOT NULL,
    channel VARCHAR(50)  default 'email',
    subject VARCHAR(255) ,
    message TEXT,
    is_enabled BOOLEAN DEFAULT TRUE,
    attach_log BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    id_contact_notification_preference BIGINT,
    id_job BIGINT,
    PRIMARY KEY(id_notification),
    FOREIGN KEY(id_contact_notification_preference) REFERENCES contact_notification_preference(id_contact_notification_preference) ON DELETE CASCADE,
    FOREIGN KEY(id_job) REFERENCES job(id_job) ON DELETE CASCADE
);

create table execution_my
(
    id_execution         bigint auto_increment
        primary key,
    execution_id_rundeck bigint                                 not null,
    status               varchar(50)                            null,
    description          text                                   null,
    date_started         datetime   default current_timestamp() not null,
    date_ended           datetime                               null,
    arg                  text                                   null,
    created_at           datetime   default current_timestamp() not null,
    duration_ms          bigint                                 null,
    username             varchar(50)                            null,
    id_project           bigint                                 not null,
    id_job               bigint                                 null,
    processed            tinyint(1) default 0                   null,
    constraint execution_id_rundeck
        unique (execution_id_rundeck),
    constraint execution_my_ibfk_1
        foreign key (id_project) references project (id),
    constraint execution_my_ibfk_2
        foreign key (id_job) references job (id_job)
            on delete cascade
);

create table notification_log
(
    id_log_notification                bigint auto_increment
        primary key,
    status_job                         varchar(255)         null,
    message                            text                 null,
    channel                            varchar(10)          null,
    sent_at                            datetime             null,
    is_sent                            tinyint(1) default 0 null,
    type_notification                  varchar(50)          null,
    id_execution                       bigint               null,
    id_contact_notification_preference bigint               null,
    id_job                             bigint               null,
    constraint uq_notification
        unique (id_execution, id_contact_notification_preference, type_notification),
    constraint uq_unique_log
        unique (id_execution, id_contact_notification_preference, type_notification),
    constraint fk_notification_log_job
        foreign key (id_job) references job (id_job) ON DELETE CASCADE,
    constraint notification_log_ibfk_1
        foreign key (id_execution) references execution_my (id_execution) ON DELETE CASCADE,
    constraint notification_log_ibfk_2
        foreign key (id_contact_notification_preference) references contact_notification_preference (id_contact_notification_preference) ON DELETE CASCADE
);


create table log_output
(
    id_log_output bigint auto_increment
        primary key,
    log_message   text                                 not null,
    log_level     varchar(50)                          null,
    step_ctx      varchar(50)                          null,
    step_number   int                                  null,
    created_at_   datetime default current_timestamp() not null,
    absolute_time datetime                             null,
    local_time    time                                 null,
    id_node       bigint                               not null,
    id_execution  bigint                               null,
    user_         varchar(50)                          null,
    constraint log_output_ibfk_1
        foreign key (id_node) references node (id_node)
            on delete cascade,
    constraint log_output_ibfk_2
        foreign key (id_execution) references execution_my (id_execution)
            on delete cascade
);

create table historique_execution
(
    id_historique        bigint auto_increment
        primary key,
    execution_id_rundeck bigint                               not null,
    id_job               bigint                               null,
    id_node              bigint                               not null,
    step_ctx             varchar(50)                          null,
    status               varchar(50)                          null,
    status_step          varchar(50)                          null,
    log_message          text                                 null,
    archive              tinyint(1) default 0                 null,
    processed            tinyint(1) default 0                 null,
    date_execution       datetime   default CURRENT_TIMESTAMP null,
    date_started         datetime                             null,
    date_ended           datetime                             null,
    duration             bigint                               null,
    constraint uq_hist_exec
        unique (execution_id_rundeck, id_node, step_ctx)
);

create table blacklisted_tokens
(
    token       varchar(500) not null
        primary key,
    expiry_date timestamp    not null
);

CREATE TABLE run (
     id BIGINT AUTO_INCREMENT PRIMARY KEY,
     project_name VARCHAR(255) NOT NULL,
     command TEXT NOT NULL,
     node_ids TEXT NOT NULL,
     execution_id BIGINT,
     status VARCHAR(50) DEFAULT 'PENDING',
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
