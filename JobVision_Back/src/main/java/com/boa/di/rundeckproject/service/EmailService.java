package com.boa.di.rundeckproject.service;

import com.boa.di.rundeckproject.dto.ContactNotificationPreferenceDTO;
import com.boa.di.rundeckproject.dto.LogOutputDTO;
import com.boa.di.rundeckproject.model.Contact;
import com.boa.di.rundeckproject.service.contact.ContactGroupeService;
import com.boa.di.rundeckproject.service.log.LogOutputService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final LogOutputService logOutputService;
    private final ContactGroupeService contactGroupeService;
    private final String emailFrom;
    private final String fileTemplate;

    @Autowired
    public EmailService(JavaMailSender mailSender, LogOutputService logOutputService, ContactGroupeService contactGroupeService, @Value("${spring.mail.username}") String emailFrom, @Value("${template.mail}") String fileTemplate) {
        this.mailSender = mailSender;
        this.logOutputService = logOutputService;
        this.contactGroupeService = contactGroupeService;
        this.emailFrom = emailFrom;
        this.fileTemplate = fileTemplate;
    }

    private String loadTemplate(String templateName) throws IOException {
        String path = fileTemplate + templateName + ".html";
        return new String(Files.readAllBytes(Paths.get(path)));
    }

    public String envoyerNotificationParContacts(
            String status,
            Boolean attach,
            Long idExecution,
            String jobName,
            List<ContactNotificationPreferenceDTO> contacts,
            LocalDateTime localDateTime
    ) throws IOException {
        Set<String> emails = new HashSet<>();
        StringBuilder destinatairesInfo = new StringBuilder();
        Set<String> contactsUniques = new HashSet<>();
        Set<String> groupesUniques = new HashSet<>();

        for (ContactNotificationPreferenceDTO cnp : contacts) {
            if (!Boolean.TRUE.equals(cnp.getChannelEmail())) continue;

            boolean shouldNotify = switch (status.toLowerCase()) {
                case "onstart" -> Boolean.TRUE.equals(cnp.getNotifyOnStart());
                case "onsuccess" -> Boolean.TRUE.equals(cnp.getNotifyOnSuccess());
                case "onfailure" -> Boolean.TRUE.equals(cnp.getNotifyOnFailed());
                case "recovery" -> Boolean.TRUE.equals(cnp.getNotifyOnRecovery());
                default -> false;
            };

            if (!shouldNotify) continue;

            // Collecter les informations des contacts individuels
            if (cnp.getContact() != null && cnp.getContact().getEmail() != null) {
                emails.add(cnp.getContact().getEmail());
                String contactInfo = String.format("👤 %s %s (%s)", 
                    cnp.getContact().getPrenom() != null ? cnp.getContact().getPrenom() : "",
                    cnp.getContact().getNom() != null ? cnp.getContact().getNom() : "",
                    cnp.getContact().getEmail());
                contactsUniques.add(contactInfo);
            }

            // Collecter les informations des groupes
            if (cnp.getId_group_contact() != null) {
                List<Contact> contactsDuGroupe = contactGroupeService.getContactsByGroupeId(cnp.getId_group_contact());
                for (Contact contact : contactsDuGroupe) {
                    if (contact.getEmail() != null && !contact.getEmail().isBlank()) {
                        emails.add(contact.getEmail());
                    }
                }
                
                // Ajouter l'information du groupe
                if (cnp.getGroupe() != null) {
                    String groupeInfo = String.format("👥 Groupe: %s", 
                        cnp.getGroupe().getNameGroupe() != null ? cnp.getGroupe().getNameGroupe() : "Groupe inconnu");
                    if (cnp.getGroupe().getDescription() != null && !cnp.getGroupe().getDescription().isBlank()) {
                        groupeInfo += String.format(" - %s", cnp.getGroupe().getDescription());
                    }
                    groupesUniques.add(groupeInfo);
                }
            }
        }

        if (emails.isEmpty()) {
            System.out.println("📭 Aucun destinataire email trouvé pour le status '" + status + "'.");
            return "";
        }

        String safeJobName = (jobName != null && !jobName.isBlank()) ? jobName : "(Nom de job inconnu)";
        String subject = getSubject(status, safeJobName, localDateTime);
        String htmlBody = getTemplate(status, attach, idExecution, safeJobName, localDateTime, contactsUniques, groupesUniques);
        byte[] excelFile = (attach && !"onstart".equalsIgnoreCase(status)) ? generateExcelLogs(idExecution) : null;

        sendEmailWithAttachment(emails.toArray(new String[0]), subject, htmlBody,
                (excelFile != null && excelFile.length > 0) ? "logs_execution_" + idExecution + ".xls" : null, excelFile);

        return htmlBody;
    }

    public void sendEmailWithAttachment(String[] to, String subject, String htmlBody, String attachmentName, byte[] attachmentContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(emailFrom);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            if (attachmentContent != null && attachmentContent.length > 0 && attachmentName != null) {
                ByteArrayResource resource = new ByteArrayResource(attachmentContent);
                helper.addAttachment(attachmentName, resource);
            }

            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("❌ Erreur d'envoi d'email : " + e.getMessage());
        }
    }

    public String getTemplate(String status, Boolean attach, Long idExecution, String jobName,
                              LocalDateTime dateTime, Set<String> contactsUniques, Set<String> groupesUniques) throws IOException {

        // Sélection du template selon le statut
        String templateFile;
        switch (status != null ? status.toLowerCase() : "") {
            case "onstart": templateFile = "onstart"; break;
            case "onsuccess": templateFile = "onsuccess"; break;
            case "onfailure": templateFile = "onfailure"; break;
            case "recovery": templateFile = "recovery"; break;
            default: templateFile = "default";
        }

        String html = loadTemplate(templateFile);

        StringBuilder contactsHtml = new StringBuilder();
        if (!contactsUniques.isEmpty()) {
            contactsHtml.append("<div><h4>👤 Contacts individuels :</h4><ul>");
            for (String contact : contactsUniques) {
                contactsHtml.append("<li>").append(contact).append("</li>");
            }
            contactsHtml.append("</ul></div>");
        }

        StringBuilder groupesHtml = new StringBuilder();
        if (!groupesUniques.isEmpty()) {
            groupesHtml.append("<div><h4>👥 Groupes de contacts :</h4><ul>");
            for (String groupe : groupesUniques) {
                groupesHtml.append("<li>").append(groupe).append("</li>");
            }
            groupesHtml.append("</ul></div>");
        }

        // Générer section pièces jointes
        String attachHtml = "";
        if (!"onstart".equalsIgnoreCase(status) && Boolean.TRUE.equals(attach)) {
            attachHtml = "<div style=\"background-color:#e8f4fd; border:1px solid #2196f3; border-radius:5px; padding:15px; margin-bottom:20px;\">"
                    + "<p style=\"margin:0; color:#1976d2;\">📎 Les logs d'exécution sont joints au format Excel (.xls).</p></div>";
        }

        // Remplacer tous les placeholders
        html = html.replace("{{jobName}}", jobName != null ? jobName : "")
                .replace("{{idExecution}}", idExecution != null ? idExecution.toString() : "")
                .replace("{{dateTime}}", dateTime != null ? dateTime.toString().replace("T", " ") : "")
                .replace("{{status}}", status != null ? status.toUpperCase() : "INCONNU")
                .replace("{{contactsSection}}", contactsHtml.toString())
                .replace("{{groupesSection}}", groupesHtml.toString())
                .replace("{{attachSection}}", attachHtml);

        return html;
    }

    public String getSubject(String status, String jobName, LocalDateTime dateTime) {
        String formattedDate = dateTime != null
                ? " (" + dateTime.toString().replace("T", " ") + ")"
                : "";

        return switch (status != null ? status.toLowerCase() : "") {
            case "onstart"   -> "Job started: " + jobName + formattedDate;
            case "onsuccess" -> "Job completed successfully: " + jobName + formattedDate;
            case "onfailure" -> "Job failed: " + jobName + formattedDate;
            case "recovery"  -> "Job recovered after failure: " + jobName + formattedDate;
            default          -> "Job notification: " + jobName + formattedDate;
        };
    }

    public byte[] generateExcelLogs(Long idExecution) {
        List<LogOutputDTO> logs = logOutputService.getLogsByExecutionId(idExecution);
        if (logs.isEmpty()) return new byte[0];

        try (Workbook workbook = new HSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Execution Logs");
            
            // Créer le style pour l'en-tête
            CellStyle headerStyle = createHeaderStyle(workbook);
            
            // Créer l'en-tête
            Row headerRow = sheet.createRow(0);
            String[] headers = {"ID", "Heure Locale", "Heure Absolue", "Niveau", "Utilisateur", "Noeud", "Message"};
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 15 * 256); // Largeur de colonne
            }
            
            // Remplir les données
            for (int i = 0; i < logs.size(); i++) {
                LogOutputDTO log = logs.get(i);
                Row row = sheet.createRow(i + 1);
                
                // ID - peut être un nombre ou une chaîne
                if (log.getIdLogOutput() != null) {
                    try {
                        row.createCell(0).setCellValue(Long.parseLong(log.getIdLogOutput().toString()));
                    } catch (NumberFormatException e) {
                        row.createCell(0).setCellValue(log.getIdLogOutput().toString());
                    }
                } else {
                    row.createCell(0).setCellValue("");
                }
                
                // Autres champs - tous des chaînes
                row.createCell(1).setCellValue(log.getLocalTime() != null ? log.getLocalTime() : "");
                row.createCell(2).setCellValue(log.getAbsoluteTime() != null ? log.getAbsoluteTime() : "");
                row.createCell(3).setCellValue(log.getLogLevel() != null ? log.getLogLevel() : "");
                row.createCell(4).setCellValue(log.getUser() != null ? log.getUser() : "");
                row.createCell(5).setCellValue(log.getNodeName() != null ? log.getNodeName() : "");
                row.createCell(6).setCellValue(log.getLogMessage() != null ? log.getLogMessage() : "");
            }
            
            // Convertir en tableau de bytes
            try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
                workbook.write(outputStream);
                return outputStream.toByteArray();
            }
            
        } catch (IOException e) {
            System.err.println("❌ Erreur lors de la génération du fichier Excel : " + e.getMessage());
            return new byte[0];
        }
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        return style;
    }

    public boolean logsAvailable(Long idExecution) {
        List<LogOutputDTO> logs = logOutputService.getLogsByExecutionId(idExecution);
        return logs != null && !logs.isEmpty();
    }
}
