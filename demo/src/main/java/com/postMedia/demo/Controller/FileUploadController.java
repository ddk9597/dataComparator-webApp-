package com.postMedia.demo.Controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.util.Map;

@RestController
@RequestMapping("/compare")
public class FileUploadController {

    @PostMapping("/uploadFile")
    public ResponseEntity<Map<String, Object>> compareFiles(
            @RequestParam("fileA") MultipartFile fileA,
            @RequestParam("fileB") MultipartFile fileB) {

        Map<String, Object> response;
        File savedFileA = null;
        File savedFileB = null;

        try {
            savedFileA = File.createTempFile("fileA_", ".xlsx");
            savedFileB = File.createTempFile("fileB_", ".xlsx");

            fileA.transferTo(savedFileA);
            fileB.transferTo(savedFileB);

            String scriptPath = new File("src/main/resources/static/comparator/ver001/ver001_0.py").getAbsolutePath();
            ProcessBuilder processBuilder = new ProcessBuilder("python", scriptPath, savedFileA.getAbsolutePath(), savedFileB.getAbsolutePath());
            processBuilder.environment().put("PYTHONIOENCODING", "utf-8");
            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();

            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            StringBuilder output = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line);
            }

            System.out.println("Python Output: " + output); // Python 출력 확인용 로그 추가

            int exitCode = process.waitFor();
            if (exitCode == 0) {
                ObjectMapper objectMapper = new ObjectMapper();
                response = objectMapper.readValue(output.toString(), Map.class);
            } else {
                response = Map.of("status", "error", "message", "Python script failed with exit code " + exitCode);
            }

        } catch (Exception e) {
            response = Map.of("status", "error", "message", e.getMessage());
        } finally {
            if (savedFileA != null && savedFileA.exists()) savedFileA.delete();
            if (savedFileB != null && savedFileB.exists()) savedFileB.delete();
        }

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}



