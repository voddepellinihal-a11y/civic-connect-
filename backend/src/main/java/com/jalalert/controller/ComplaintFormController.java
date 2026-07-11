package com.jalalert.controller;

import com.jalalert.dto.ComplaintRequestDTO;
import com.jalalert.entity.Complaint;
import com.jalalert.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ComplaintFormController {

    private final ComplaintService complaintService;

    private static final String UPLOAD_DIR = "uploads";

    @PostMapping("/submit")
    public String submitComplaint(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false) MultipartFile file,
            RedirectAttributes redirectAttributes) {

        ComplaintRequestDTO request = ComplaintRequestDTO.builder()
                .title(title)
                .description(description)
                .category(category)
                .latitude(latitude)
                .longitude(longitude)
                .build();

        Complaint complaint = complaintService.saveComplaint(request);

        if (file != null && !file.isEmpty()) {
            try {
                String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
                Path uploadPath = Paths.get(UPLOAD_DIR);
                Files.createDirectories(uploadPath);
                Files.copy(file.getInputStream(), uploadPath.resolve(filename));
                log.info("File uploaded: {}", filename);
            } catch (IOException e) {
                log.error("File upload failed", e);
                redirectAttributes.addFlashAttribute("error", "File upload failed: " + e.getMessage());
            }
        }

        redirectAttributes.addFlashAttribute("success", "Complaint submitted successfully! ID: " + complaint.getId());
        redirectAttributes.addFlashAttribute("complaintId", complaint.getId());
        return "redirect:/dashboard?id=" + complaint.getId();
    }
}
