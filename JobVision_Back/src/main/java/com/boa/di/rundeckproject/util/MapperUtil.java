package com.boa.di.rundeckproject.util;

import com.boa.di.rundeckproject.dto.*;
import com.boa.di.rundeckproject.model.*;

import java.util.List;
import java.util.stream.Collectors;

public class MapperUtil {

    public static ProjectDTO toProjectDTO(Project project) {
        return new ProjectDTO(
                project.getId(),
                project.getVersion(),
                project.getDateCreated(),
                project.getLastUpdated(),
                project.getName(),
                project.getDescription(),
                project.getState()
        );
    }

    public static ServiceDTO toServiceDTO(Service service) {
        List<ProjectDTO> projectDTOs = null;
        if(service.getProjects() != null) {
            projectDTOs = service.getProjects().stream()
                    .map(MapperUtil::toProjectDTO)
                    .collect(Collectors.toList());
        }
        return new ServiceDTO(
                service.getId(),
                service.getName(),
                service.getDescription(),
                projectDTOs
        );
    }

    public static UserAuthDTO toUserAuthDTO(UserAuth user) {
        if (user == null) return null;

        UserAuthDTO dto = new UserAuthDTO();
        dto.setId(user.getId());
        dto.setMatricule(user.getMatricule());
        dto.setActive(user.getActive());
        dto.setName(user.getName());
        dto.setLastname(user.getLastname());
        dto.setEmail(user.getEmail());

        dto.setRole(toRoleDTO(user.getRole()));

        dto.setService(user.getService() != null ? toServiceDTO(user.getService()) : null);

        return dto;
    }


    public static RoleDTO toRoleDTO(Role role) {
        if (role == null) return null;

        RoleDTO dto = new RoleDTO();
        dto.setId(role.getId());
        dto.setVal(role.getVal());
        dto.setDescription(role.getDescription());
        return dto;
    }

    public static NodeDTO toDto(Node node) {
        if (node == null) return null;

        NodeDTO dto = new NodeDTO();
        dto.setId(node.getId());
        dto.setNodename(node.getNodename());
        dto.setHostname(node.getHostname());
        dto.setUsername(node.getUsername());
        dto.setOsFamily(node.getOsFamily());
        dto.setOsName(node.getOsName());
        dto.setOsArch(node.getOsArch());
        dto.setTags(node.getTags());
        dto.setDescription(node.getDescription());
        dto.setEnabled(node.getEnabled());
        dto.setCreatedAt(node.getCreatedAt());
        dto.setUpdatedAt(node.getUpdatedAt());

        // Convertir SshPath vers SshPathDTO
        dto.setSshPath(toSshPathDto(node.getSshPath()));

        // Mapper la liste des projets liés via NodeProject, gérer null
        if (node.getNodeProjects() == null) {
            dto.setProjects(null);
        } else {
            List<ProjectDTO> projects = node.getNodeProjects()
                    .stream()
                    .map(MapperUtil::toProjectDto)
                    .collect(Collectors.toList());
            dto.setProjects(projects);
        }

        return dto;
    }

    public static SshPathDTO toSshPathDto(SshPath sshPath) {
        if (sshPath == null) return null;

        SshPathDTO dto = new SshPathDTO();
        dto.setId(sshPath.getId());
        dto.setKeyStorage(sshPath.getKeyStorage());
        dto.setKeyType(sshPath.getKeyType());
        dto.setSshPort(sshPath.getSshPort());
        dto.setNameKeyPrivate(sshPath.getNameKeyPrivate());
        dto.setPassword(sshPath.getPassword());
        dto.setPrivateKeyContent(sshPath.getPrivateKeyContent());
        dto.setName(sshPath.getName());

        return dto;
    }

    private static ProjectDTO toProjectDto(NodeProject nodeProject) {
        if (nodeProject == null || nodeProject.getProject() == null) return null;

        Project project = nodeProject.getProject();
        ProjectDTO dto = new ProjectDTO();

        dto.setId(project.getId());
        dto.setVersion(project.getVersion());
        dto.setDateCreated(project.getDateCreated());
        dto.setLastUpdated(project.getLastUpdated());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setState(project.getState());

        return dto;
    }

    public static ErrorHandlerDTO mapperErrorHandlerDTO(ErrorHandler errorHandler) {
        if (errorHandler == null) {
            return null;
        }

        ErrorHandlerDTO dto = new ErrorHandlerDTO();
        dto.setId(errorHandler.getId());
        dto.setJobId(
                errorHandler.getJob() != null ? errorHandler.getJob().getId() : null
        );
        dto.setStepId(
                errorHandler.getStep() != null ? errorHandler.getStep().getId() : null
        );

        dto.setHandlerType(
                errorHandler.getHandlerType() != null
                        ? errorHandler.getHandlerType().name()
                        : null
        );

        dto.setHandlerCommand(errorHandler.getHandlerCommand());
        dto.setHandlerDescription(errorHandler.getHandlerDescription());
        dto.setContinueOnError(errorHandler.getContinueOnError());

        return dto;
    }


    public static LogOutputDTO toDTO(LogOutput entity) {
        LogOutputDTO dto = new LogOutputDTO();
        dto.setIdLogOutput(entity.getIdLogOutput());
        dto.setLogMessage(entity.getLogMessage());
        dto.setLogLevel(entity.getLogLevel());
        dto.setStepCtx(entity.getStepCtx());
        dto.setStepNumber(entity.getStepNumber());
        dto.setCreatedAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : null);
        dto.setAbsoluteTime(entity.getAbsoluteTime() != null ? entity.getAbsoluteTime().toString() : null);
        dto.setLocalTime(entity.getLocalTime() != null ? entity.getLocalTime().toString() : null);
        dto.setUser(entity.getUser());

        if (entity.getNode() != null) {
            dto.setNodeId(entity.getNode().getIdNode());
            dto.setNodeName(entity.getNode().getNodename());
        }

        if (entity.getIdExecution() != null) {
            dto.setExecutionId(entity.getIdExecution().getIdExecution());
            dto.setExecutionIdRundeck(entity.getIdExecution().getExecutionIdRundeck());
            dto.setStatus(entity.getIdExecution().getStatus());
        }

        return dto;
    }

    public static OptionDTO toMapperOption(Option option) {
        if (option == null) return null;

        OptionDTO dto = new OptionDTO();
        dto.setId(option.getId());
        dto.setName(option.getName());
        dto.setDescription(option.getDescription());
        dto.setRequired(option.isRequired());
        dto.setDefaultValue(option.getDefaultValue());
        dto.setAllowedValues(option.getAllowedValues());
        dto.setMultivalued(option.isMultivalued());
        dto.setSecure(option.isSecure());
        dto.setValueExposed(option.isValueExposed());
        dto.setRegex(option.getRegex());
        dto.setWorkflowId(option.getWorkflow().getId());

        return dto;
    }


    public static ContactDTO toDTO(Contact entity) {
        ContactDTO dto = new ContactDTO();
        dto.setId(entity.getId());
        dto.setNom(entity.getNom());
        dto.setPrenom(entity.getPrenom());
        dto.setEmail(entity.getEmail());
        dto.setTelephone(entity.getTelephone());
        return dto;
    }

    public static GroupeDTO toDTO(Groupe entity) {
        GroupeDTO dto = new GroupeDTO();
        dto.setId(entity.getId());
        dto.setNameGroupe(entity.getNameGroupe());
        dto.setDescription(entity.getDescription());

        return dto;
    }

    public static NotificationMyDTO toDTO(NotificationMy entity) {
        NotificationMyDTO dto = new NotificationMyDTO();
        dto.setId(entity.getId());
        dto.setIsEnabled(entity.getIsEnabled());
        dto.setAttachLog(entity.getAttachLog());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setJobId(entity.getJob() != null ? entity.getJob().getId() : null);
        return dto;
    }

    public static ContactNotificationPreferenceDTO mapEntityToDto(ContactNotificationPreference entity) {
        ContactNotificationPreferenceDTO dto = new ContactNotificationPreferenceDTO();
        dto.setId(entity.getId());
        dto.setNotifyOnFailed(entity.getNotifyOnFailed());
        dto.setNotifyOnRecovery(entity.getNotifyOnRecovery());
        dto.setNotifyOnSuccess(entity.getNotifyOnSuccess());
        dto.setNotifyOnStart(entity.getNotifyOnStart());
        dto.setChannelEmail(entity.getChannelEmail());
        dto.setChannelSms(entity.getChannelSms());

        if (entity.getGroupeContact() != null) {
            dto.setId_group_contact(entity.getGroupeContact().getId());
            GroupeDTO groupeDTO = MapperUtil.toDTO(entity.getGroupeContact());
            dto.setGroupe(groupeDTO);
        } else {
            dto.setId_group_contact(null);
        }

        if (entity.getContact() != null) {
            dto.setId_contact(entity.getContact().getId());

            ContactDTO contactDTO = MapperUtil.toDTO(entity.getContact());
            dto.setContact(contactDTO);
        } else {
            dto.setId_contact(null);
        }

        return dto;
    }
}
