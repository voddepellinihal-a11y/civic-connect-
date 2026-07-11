package com.jalalert.service;

import com.jalalert.entity.Complaint;
import com.jalalert.entity.Priority;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendUrgentAlert(Complaint complaint) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo("admin@civicconnect.gov");
            message.setSubject("[URGENT] Complaint #" + complaint.getId() + " - " + complaint.getTitle());
            message.setText("An urgent complaint has been submitted:\n\n"
                    + "Title: " + complaint.getTitle() + "\n"
                    + "Category: " + complaint.getCategory() + "\n"
                    + "Description: " + complaint.getDescription() + "\n"
                    + "Department: " + complaint.getAssignedDepartment() + "\n\n"
                    + "Immediate action required.");
            mailSender.send(message);
            log.info("Urgent alert email sent for complaint #{}", complaint.getId());
        } catch (Exception e) {
            log.error("Failed to send urgent email for complaint #{}: {}", complaint.getId(), e.getMessage());
        }
    }

    @Async
    public void sendConfirmationEmail(Complaint complaint, String userEmail) {
        if (userEmail == null || userEmail.isBlank()) return;

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(userEmail);
            message.setSubject("Complaint #" + complaint.getId() + " - Submission Confirmed");
            message.setText("Your complaint has been submitted successfully.\n\n"
                    + "Complaint ID: " + complaint.getId() + "\n"
                    + "Title: " + complaint.getTitle() + "\n"
                    + "Status: " + complaint.getStatus() + "\n"
                    + "Priority: " + complaint.getPriority() + "\n"
                    + "Assigned Department: " + complaint.getAssignedDepartment() + "\n\n"
                    + "You can track your complaint at /dashboard?id=" + complaint.getId());
            mailSender.send(message);
            log.info("Confirmation email sent for complaint #{}", complaint.getId());
        } catch (Exception e) {
            log.error("Failed to send confirmation email for complaint #{}: {}", complaint.getId(), e.getMessage());
        }
    }
}
