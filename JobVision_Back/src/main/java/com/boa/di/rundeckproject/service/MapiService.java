package com.boa.di.rundeckproject.service;

import com.boa.di.rundeckproject.dto.ContactNotificationPreferenceDTO;
import com.boa.di.rundeckproject.model.Contact;
import com.boa.di.rundeckproject.model.MapiToken;
import com.boa.di.rundeckproject.repository.MapiTokenRepository;
import com.boa.di.rundeckproject.service.contact.ContactGroupeService;
import okhttp3.*;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class MapiService {
    @Autowired
    private MapiTokenRepository tokenRepository;

    @Autowired
    private final CloudflareTunnelService tunnelService;

    @Value("${mapi.base-url}")
    private String baseUrl;

    @Value("${mapi.username}")
    private String username;

    @Value("${mapi.password}")
    private String password;

    @Autowired
    private ContactGroupeService contactGroupeService;

    private String token;

    public MapiService(CloudflareTunnelService tunnelService) {
        this.tunnelService = tunnelService;
    }


    private String getTokenFromDb() {
        return tokenRepository.findAll()
                .stream()
                .findFirst()
                .map(MapiToken::getTokenValue)
                .orElse(null);
    }

    private void saveOrUpdateToken(String newToken) {
        MapiToken mapiToken = tokenRepository.findAll()
                .stream()
                .findFirst()
                .orElse(new MapiToken());

        mapiToken.setTokenValue(newToken);
        mapiToken.setLastUpdate(LocalDateTime.now());
        tokenRepository.save(mapiToken);
    }

    public void authenticate() throws IOException {
        OkHttpClient client = new OkHttpClient().newBuilder().build();

        RequestBody body = new MultipartBody.Builder()
                .setType(MultipartBody.FORM)
                .addFormDataPart("Username", username)
                .addFormDataPart("Password", password)
                .build();

        Request request = new Request.Builder()
                .url(baseUrl + "/api/authentication/login")
                .post(body)
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (response.isSuccessful() && response.body() != null) {
                String responseBody = response.body().string();
                JSONObject json = new JSONObject(responseBody);
                token = json.getString("token");

                saveOrUpdateToken(token);
                System.out.println("Token récupéré : " + token);
            } else {
                throw new IOException("Erreur d'authentification : " + response.code() + " - " + response.message());
            }
        }
    }

    /**
     * Envoi d’un fichier Excel/CSV pour SMS en masse avec gestion du token expiré
     */
    public String sendBulkSms(String filePath) throws IOException {
        return sendBulkSmsWithRetry(filePath, true);
    }

    /**
     * Méthode interne avec retry si token expiré
     */
    private String sendBulkSmsWithRetry(String filePath, boolean retry) throws IOException {
        OkHttpClient client = new OkHttpClient().newBuilder().build();

        RequestBody body = new MultipartBody.Builder()
                .setType(MultipartBody.FORM)
                .addFormDataPart(
                        "File",
                        new File(filePath).getName(),
                        RequestBody.create(
                                MediaType.parse("application/octet-stream"),
                                new File(filePath)
                        )
                )
                .build();

        Request request = new Request.Builder()
                .url(baseUrl + "/api/msg/sendBulkSms")
                .post(body)
                .addHeader("Authorization", getTokenFromDb())
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (response.isSuccessful() && response.body() != null) {
                return response.body().string();
            } else if (response.code() == 401 && retry) {
                // Token expiré → rafraîchir et réessayer une fois
                authenticate();
                return sendBulkSmsWithRetry(filePath, false);
            } else {
                throw new IOException("Erreur lors de l'envoi SMS : " + response.code() + " - " + response.message());
            }
        }
    }

    /**
     * Envoi de notifications SMS par contacts avec gestion des préférences
     */
    public String envoyerSMS(
            String status,
            Long idExecution,
            String jobName,
            List<ContactNotificationPreferenceDTO> contacts,
            LocalDateTime localDateTime
    ) {
        Set<String> phoneNumbers = new HashSet<>();
        Set<String> contactsUniques = new HashSet<>();
        Set<String> groupesUniques = new HashSet<>();

        // Filtrer les contacts qui ont le canal SMS activé
        for (ContactNotificationPreferenceDTO cnp : contacts) {
            if (!Boolean.TRUE.equals(cnp.getChannelSms())) continue;

            boolean shouldNotify = switch (status.toLowerCase()) {
                case "onstart" -> Boolean.TRUE.equals(cnp.getNotifyOnStart());
                case "onsuccess" -> Boolean.TRUE.equals(cnp.getNotifyOnSuccess());
                case "onfailure" -> Boolean.TRUE.equals(cnp.getNotifyOnFailed());
                case "recovery" -> Boolean.TRUE.equals(cnp.getNotifyOnRecovery());
                default -> false;
            };

            if (!shouldNotify) continue;

            // Collecter les numéros de téléphone des contacts individuels
            if (cnp.getContact() != null && cnp.getContact().getTelephone() != null && !cnp.getContact().getTelephone().isBlank()) {
                phoneNumbers.add(formatPhoneNumber(cnp.getContact().getTelephone()));
                String contactInfo = String.format("👤 %s %s (%s)",
                        cnp.getContact().getPrenom() != null ? cnp.getContact().getPrenom() : "",
                        cnp.getContact().getNom() != null ? cnp.getContact().getNom() : "",
                        cnp.getContact().getTelephone());
                contactsUniques.add(contactInfo);
            }

            // Collecter les numéros de téléphone des groupes
            if (cnp.getId_group_contact() != null) {
                List<Contact> contactsDuGroupe = contactGroupeService.getContactsByGroupeId(cnp.getId_group_contact());
                for (Contact contact : contactsDuGroupe) {
                    if (contact.getTelephone() != null && !contact.getTelephone().isBlank()) {
                        phoneNumbers.add(formatPhoneNumber(contact.getTelephone()));
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

        if (phoneNumbers.isEmpty()) {
            System.out.println("📱 Aucun destinataire SMS trouvé pour le status '" + status + "'.");
            return "";
        }

        String safeJobName = (jobName != null && !jobName.isBlank()) ? jobName : "(Nom de job inconnu)";
        String smsMessage = getSmsTemplate(status, idExecution, safeJobName, localDateTime, contactsUniques, groupesUniques);

        // Envoyer les SMS
        try {
            for (String phoneNumber : phoneNumbers) {
                sendSingleSms(phoneNumber, smsMessage);
            }
            System.out.println("📱 SMS envoyés avec succès à " + phoneNumbers.size() + " destinataire(s)");
        } catch (IOException e) {
            System.err.println("❌ Erreur lors de l'envoi des SMS : " + e.getMessage());
        }

        return smsMessage;
    }

    /**
     * Envoi d'un SMS individuel
     */
    public void sendSingleSms(String phoneNumber, String message) throws IOException {
        OkHttpClient client = new OkHttpClient();

        RequestBody body = new MultipartBody.Builder()
                .setType(MultipartBody.FORM)
                .addFormDataPart("Recipient", phoneNumber)
                .addFormDataPart("Message", message)
                .addFormDataPart("Channel", "sms")
                .build();

        Request request = new Request.Builder()
                .url(baseUrl + "/api/msg/send")
                .post(body)
                .addHeader("Authorization", getTokenFromDb()) // token obtenu via authenticate()
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (response.isSuccessful()) {
                System.out.println("SMS envoyé avec succès !");
            } else if (response.code() == 401) {
                authenticate();
                sendSingleSms(phoneNumber, message);
            } else {
                throw new IOException("Erreur lors de l'envoi SMS : " + response.code() + " - " + response.message());
            }
        }
    }

    /**
     * Génération du template SMS selon le statut
     */
    private String getSmsTemplate(String status, Long idExecution, String jobName, LocalDateTime dateTime,
                                  Set<String> contactsUniques, Set<String> groupesUniques) {

        String shortStatus;
        switch (status != null ? status.toLowerCase() : "") {
            case "onstart": shortStatus = "Démarré"; break;
            case "onsuccess": shortStatus = "Terminé"; break;
            case "onfailure": shortStatus = "Échoué"; break;
            case "recovery": shortStatus = "Rétabli"; break;
            default: shortStatus = "Info"; break;
        }

        StringBuilder message = new StringBuilder();
        message.append("Job ").append(jobName)
                .append(" : ").append(shortStatus)
                .append(", ").append(formatDateTime(dateTime));

        if (idExecution != null) {
            String logUrl = tunnelService.getPublicUrl() + "/api/logs/export/" + idExecution;
            message.append(", Logs: ").append(logUrl);
        }

        return message.toString();
    }


    /**
     * Formatage du numéro de téléphone
     */
    private String formatPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.isBlank()) {
            return "";
        }

        // Nettoyer le numéro (supprimer espaces, tirets, etc.)
        String cleanNumber = phoneNumber.replaceAll("[\\s\\-\\(\\)]", "");

        // Ajouter l'indicatif +261 si ce n'est pas déjà présent
        if (!cleanNumber.startsWith("+")) {
            if (cleanNumber.startsWith("261")) {
                cleanNumber = "+" + cleanNumber;
            } else if (cleanNumber.startsWith("0")) {
                cleanNumber = "+261" + cleanNumber.substring(1);
            } else {
                cleanNumber = "+261" + cleanNumber;
            }
        }

        return cleanNumber;
    }

    private String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) {
            return "Date inconnue";
        }
        return dateTime.toString().replace("T", " ");
    }
}
