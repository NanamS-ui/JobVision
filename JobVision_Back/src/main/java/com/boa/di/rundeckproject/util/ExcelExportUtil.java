package com.boa.di.rundeckproject.util;

import com.boa.di.rundeckproject.dto.LogOutputViewDTO;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;

import java.io.*;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class ExcelExportUtil {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm:ss");

    public static byte[] exportLogsToXls(List<LogOutputViewDTO> logs) {
        try (HSSFWorkbook workbook = new HSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Logs");

            // En-tête
            Row header = sheet.createRow(0);
            String[] headers = {
                    "ID", "Log Message", "Log Level", "Step Context", "Step Number",
                    "Created At", "Absolute Time", "Local Time", "Execution ID",
                    "User", "Node ID", "Node Name", "Host Name", "Job ID", "Job Name", "Job Description"
            };
            for (int i = 0; i < headers.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(headers[i]);
            }

            // Contenu
            int rowIdx = 1;
            for (LogOutputViewDTO log : logs) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(nullSafeLong(log.getIdLogOutput()));
                row.createCell(1).setCellValue(nullSafeString(log.getLogMessage()));
                row.createCell(2).setCellValue(nullSafeString(log.getLogLevel()));
                row.createCell(3).setCellValue(nullSafeString(log.getStepCtx()));
                row.createCell(4).setCellValue(nullSafeInt(log.getStepNumber()));
                row.createCell(5).setCellValue(formatDateTime(log.getCreatedAt()));
                row.createCell(6).setCellValue(formatDateTime(log.getAbsoluteTime()));
                row.createCell(7).setCellValue(formatTime(log.getLocalTime()));
                row.createCell(8).setCellValue(nullSafeLong(log.getIdExecution()));
                row.createCell(9).setCellValue(nullSafeString(log.getUser()));
                row.createCell(10).setCellValue(nullSafeLong(log.getIdNode()));
                row.createCell(11).setCellValue(nullSafeString(log.getNodename()));
                row.createCell(12).setCellValue(nullSafeString(log.getHostname()));
                row.createCell(13).setCellValue(nullSafeLong(log.getIdJob()));
                row.createCell(14).setCellValue(nullSafeString(log.getJobName()));
                row.createCell(15).setCellValue(nullSafeString(log.getJobDescription()));
            }

            workbook.write(out);
            return out.toByteArray();

        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de l'export XLS", e);
        }
    }

    private static String nullSafeString(Object obj) {
        return obj != null ? obj.toString() : "";
    }

    private static long nullSafeLong(Number num) {
        return num != null ? num.longValue() : 0L;
    }

    private static int nullSafeInt(Number num) {
        return num != null ? num.intValue() : 0;
    }

    private static String formatDateTime(java.time.LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DATE_TIME_FORMATTER) : "";
    }

    private static String formatTime(java.time.LocalTime time) {
        return time != null ? time.format(TIME_FORMATTER) : "";
    }
}
