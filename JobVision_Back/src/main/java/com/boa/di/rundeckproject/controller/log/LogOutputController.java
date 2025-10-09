package com.boa.di.rundeckproject.controller.log;

import com.boa.di.rundeckproject.dto.LogFilterDTO;
import com.boa.di.rundeckproject.dto.LogOutputDTO;
import com.boa.di.rundeckproject.dto.LogOutputViewDTO;
import com.boa.di.rundeckproject.error.ErrorDetail;
import com.boa.di.rundeckproject.model.LogCountsResponse;
import com.boa.di.rundeckproject.service.log.LogOutputService;
import com.boa.di.rundeckproject.success.SuccessDetail;
import com.boa.di.rundeckproject.util.ExcelExportUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/logs")
public class LogOutputController {

    private final LogOutputService logOutputService;

    @Autowired
    public LogOutputController(LogOutputService logOutputService) {
        this.logOutputService = logOutputService;
    }

    @GetMapping("/node/name/{nodeName}")
    public ResponseEntity<?> getLogsByNode(@PathVariable String nodeName, HttpServletRequest request) {
        long timestamp = System.currentTimeMillis();
        String path = request.getRequestURI();

        try {
            List<LogOutputDTO> logs = logOutputService.getLogsByNodeNameDTO(nodeName);
            SuccessDetail success = new SuccessDetail(
                    200,
                    "Logs récupérés avec succès",
                    timestamp,
                    path,
                    logs
            );
            return ResponseEntity.ok(success);
        } catch (IllegalArgumentException e) {
            ErrorDetail error = new ErrorDetail(
                    404,
                    "Node non trouvé",
                    timestamp,
                    path,
                    e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            ErrorDetail error = new ErrorDetail(
                    500,
                    "Erreur serveur",
                    timestamp,
                    path,
                    e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/node/id/{idNode}")
    public ResponseEntity<?> getLogsByIdNode(@PathVariable String idNode, HttpServletRequest request) {
        long timestamp = System.currentTimeMillis();
        String path = request.getRequestURI();

        try {
            List<LogOutputDTO> logs = logOutputService.getLogsByIdNodeDTO(idNode);
            SuccessDetail success = new SuccessDetail(
                    200,
                    "Logs récupérés avec succès",
                    timestamp,
                    path,
                    logs
            );
            return ResponseEntity.ok(success);
        } catch (IllegalArgumentException e) {
            ErrorDetail error = new ErrorDetail(
                    404,
                    "Node non trouvé",
                    timestamp,
                    path,
                    e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            ErrorDetail error = new ErrorDetail(
                    500,
                    "Erreur serveur",
                    timestamp,
                    path,
                    e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/output")
    public List<LogOutputDTO> getLogs(@RequestParam String nodeName, @RequestParam Long executionId, @RequestParam String stepCtx) {
        return logOutputService.getLogsByNodeNameAndExecutionId(nodeName, executionId, stepCtx);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<LogOutputViewDTO>> getRecentLogs() {
        return ResponseEntity.ok(logOutputService.getRecentLogs());
    }

    @PostMapping("/search")
    public ResponseEntity<List<LogOutputViewDTO>> searchLogs(@RequestBody LogFilterDTO filter) {
        List<LogOutputViewDTO> logs = logOutputService.getFilteredLogs(filter);
        return ResponseEntity.ok(logs);
    }

    @GetMapping(value = "/{executionId}/export", produces = "application/vnd.ms-excel")
    public ResponseEntity<byte[]> exportLogsXls(@PathVariable Long executionId) {
        List<LogOutputDTO> logs = logOutputService.getLogsByExecutionId(executionId);

        try (Workbook workbook = new HSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Logs Execution");

            Row header = sheet.createRow(0);
            String[] headers = {
                    "idLogOutput", "logMessage", "logLevel", "stepCtx", "stepNumber", "createdAt",
                    "absoluteTime", "localTime", "user", "nodeId", "nodeName", "executionId", "executionIdRundeck", "status"
            };

            for (int i = 0; i < headers.length; i++) {
                header.createCell(i).setCellValue(headers[i]);
            }

            int rowIdx = 1;
            for (LogOutputDTO log : logs) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(safeDouble(log.getIdLogOutput()));
                row.createCell(1).setCellValue(safeString(log.getLogMessage()));
                row.createCell(2).setCellValue(safeString(log.getLogLevel()));
                row.createCell(3).setCellValue(safeString(log.getStepCtx()));
                row.createCell(4).setCellValue(safeDouble(log.getStepNumber()));
                row.createCell(5).setCellValue(safeString(log.getCreatedAt()));
                row.createCell(6).setCellValue(safeString(log.getAbsoluteTime()));
                row.createCell(7).setCellValue(safeString(log.getLocalTime()));
                row.createCell(8).setCellValue(safeString(log.getUser()));
                row.createCell(9).setCellValue(safeDouble(log.getNodeId()));
                row.createCell(10).setCellValue(safeString(log.getNodeName()));
                row.createCell(11).setCellValue(safeDouble(log.getExecutionId()));
                row.createCell(12).setCellValue(safeDouble(log.getExecutionIdRundeck()));
                row.createCell(13).setCellValue(safeString(log.getStatus()));
            }

            workbook.write(out);
            byte[] bytes = out.toByteArray();

            HttpHeaders headersExcel = new HttpHeaders();
            headersExcel.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"logs_execution_" + executionId + ".xls\"");
            headersExcel.setContentType(MediaType.parseMediaType("application/vnd.ms-excel"));
            headersExcel.setContentLength(bytes.length);

            return new ResponseEntity<>(bytes, headersExcel, HttpStatus.OK);
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la génération du fichier Excel", e);
        }
    }

    @GetMapping(value = "/export/{executionId}", produces = "application/vnd.ms-excel")
    public ResponseEntity<byte[]> exportLogsXls2(@PathVariable Long executionId) {
        List<LogOutputDTO> logs = logOutputService.getLogsByExecutionId(executionId);

        try (Workbook workbook = new HSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Logs Execution");

            Row header = sheet.createRow(0);
            String[] headers = {
                    "idLogOutput", "logMessage", "logLevel", "stepCtx", "stepNumber", "createdAt",
                    "absoluteTime", "localTime", "user", "nodeId", "nodeName", "executionId", "executionIdRundeck", "status"
            };

            for (int i = 0; i < headers.length; i++) {
                header.createCell(i).setCellValue(headers[i]);
            }

            int rowIdx = 1;
            for (LogOutputDTO log : logs) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(safeDouble(log.getIdLogOutput()));
                row.createCell(1).setCellValue(safeString(log.getLogMessage()));
                row.createCell(2).setCellValue(safeString(log.getLogLevel()));
                row.createCell(3).setCellValue(safeString(log.getStepCtx()));
                row.createCell(4).setCellValue(safeDouble(log.getStepNumber()));
                row.createCell(5).setCellValue(safeString(log.getCreatedAt()));
                row.createCell(6).setCellValue(safeString(log.getAbsoluteTime()));
                row.createCell(7).setCellValue(safeString(log.getLocalTime()));
                row.createCell(8).setCellValue(safeString(log.getUser()));
                row.createCell(9).setCellValue(safeDouble(log.getNodeId()));
                row.createCell(10).setCellValue(safeString(log.getNodeName()));
                row.createCell(11).setCellValue(safeDouble(log.getExecutionId()));
                row.createCell(12).setCellValue(safeDouble(log.getExecutionIdRundeck()));
                row.createCell(13).setCellValue(safeString(log.getStatus()));
            }

            workbook.write(out);
            byte[] bytes = out.toByteArray();

            HttpHeaders headersExcel = new HttpHeaders();
            headersExcel.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"logs_execution_" + executionId + ".xls\"");
            headersExcel.setContentType(MediaType.parseMediaType("application/vnd.ms-excel"));
            headersExcel.setContentLength(bytes.length);

            return new ResponseEntity<>(bytes, headersExcel, HttpStatus.OK);
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la génération du fichier Excel", e);
        }
    }

    @GetMapping("/export-recent")
    public ResponseEntity<byte[]> exportRecentLogsXls() {
        List<LogOutputViewDTO> recentLogs = logOutputService.getRecentLogs();

        try (Workbook workbook = new HSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Recent Logs");

            Row headerRow = sheet.createRow(0);
            String[] headers = {
                    "ID", "Message", "Level", "StepCtx", "StepNumber", "CreatedAt", "AbsoluteTime",
                    "LocalTime", "User", "NodeId", "NodeName", "ExecutionId"
            };
            for (int i = 0; i < headers.length; i++) {
                headerRow.createCell(i).setCellValue(headers[i]);
            }

            int rowIdx = 1;
            for (LogOutputViewDTO log : recentLogs) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(safeDouble(log.getIdLogOutput()));
                row.createCell(1).setCellValue(safeString(log.getLogMessage()));
                row.createCell(2).setCellValue(safeString(log.getLogLevel()));
                row.createCell(3).setCellValue(safeString(log.getStepCtx()));
                row.createCell(4).setCellValue(safeDouble(log.getStepNumber()));
                row.createCell(5).setCellValue(safeString(log.getCreatedAt()));
                row.createCell(6).setCellValue(safeString(log.getAbsoluteTime()));
                row.createCell(7).setCellValue(safeString(log.getLocalTime()));
                row.createCell(8).setCellValue(safeString(log.getUser()));
                row.createCell(9).setCellValue(safeDouble(log.getIdNode()));
                row.createCell(10).setCellValue(safeString(log.getNodename()));
                row.createCell(11).setCellValue(safeDouble(log.getIdExecution()));
            }

            workbook.write(out);
            byte[] xlsBytes = out.toByteArray();

            HttpHeaders headersHttp = new HttpHeaders();
            headersHttp.setContentType(MediaType.parseMediaType("application/vnd.ms-excel"));
            headersHttp.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"recent_logs.xls\"");
            headersHttp.setContentLength(xlsBytes.length);

            return new ResponseEntity<>(xlsBytes, headersHttp, HttpStatus.OK);

        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la génération du fichier Excel", e);
        }
    }


    @GetMapping("/output/{executionId}")
    public ResponseEntity<List<LogOutputDTO>> getLogs(@PathVariable Long executionId) {
        List<LogOutputDTO> logs = logOutputService.getLogsByExecutionIdRun(executionId);
        if (logs.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/export-filter")
    public ResponseEntity<byte[]> exportLogsXls(
            @RequestParam(required = false) String logLevel,
            @RequestParam(required = false) String user,
            @RequestParam(required = false) String jobName,
            @RequestParam(required = false) String hostname,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        boolean noFilter = (logLevel == null || logLevel.isEmpty()) &&
                (user == null || user.isEmpty()) &&
                (jobName == null || jobName.isEmpty()) &&
                (hostname == null || hostname.isEmpty()) &&
                (startDate == null || startDate.isEmpty()) &&
                (endDate == null || endDate.isEmpty());

        List<LogOutputViewDTO> logs;
        if (noFilter) {
            logs = logOutputService.getRecentLogs();
        } else {
            LogFilterDTO filter = new LogFilterDTO();
            filter.setLogLevel(logLevel);
            filter.setUser(user);
            filter.setJobName(jobName);
            filter.setHostname(hostname);

            DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
            if (startDate != null && !startDate.isEmpty()) {
                filter.setStartDate(LocalDateTime.parse(startDate, formatter));
            }
            if (endDate != null && !endDate.isEmpty()) {
                filter.setEndDate(LocalDateTime.parse(endDate, formatter));
            }

            logs = logOutputService.getFilteredLogs(filter);
        }

        byte[] xlsBytes = ExcelExportUtil.exportLogsToXls(logs);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.ms-excel"));
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"logs.xls\"");
        headers.setContentLength(xlsBytes.length);

        return new ResponseEntity<>(xlsBytes, headers, HttpStatus.OK);
    }


    @GetMapping("/counts")
    public ResponseEntity<LogCountsResponse> getLogCounts() {
        LogCountsResponse counts = logOutputService.getLogCounts();
        return ResponseEntity.ok(counts);
    }

    private String safeString(Object obj) {
        return obj != null ? obj.toString() : "";
    }

    private double safeDouble(Number num) {
        return num != null ? num.doubleValue() : 0.0;
    }

}
