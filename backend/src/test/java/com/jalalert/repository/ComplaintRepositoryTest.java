package com.jalalert.repository;

import com.jalalert.entity.Complaint;
import com.jalalert.entity.Priority;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class ComplaintRepositoryTest {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Test
    void shouldSaveAndRetrieveComplaint() {
        Complaint complaint = Complaint.builder()
                .title("Pothole on Main St")
                .description("Large pothole near intersection")
                .category("Road")
                .latitude(40.7128)
                .longitude(-74.0060)
                .status("SUBMITTED")
                .priority(Priority.NORMAL)
                .build();

        Complaint saved = complaintRepository.save(complaint);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getTitle()).isEqualTo("Pothole on Main St");
        assertThat(saved.getStatus()).isEqualTo("SUBMITTED");
        assertThat(saved.getCreatedAt()).isNotNull();
    }

    @Test
    void shouldFindByCategory() {
        complaintRepository.save(Complaint.builder()
                .title("Broken Streetlight").category("Electricity")
                .status("SUBMITTED").priority(Priority.NORMAL).build());
        complaintRepository.save(Complaint.builder()
                .title("Garbage not collected").category("Sanitation")
                .status("SUBMITTED").priority(Priority.NORMAL).build());

        assertThat(complaintRepository.findByCategory("Electricity")).hasSize(1);
    }

    @Test
    void shouldCountByStatus() {
        complaintRepository.save(Complaint.builder()
                .title("Test 1").status("SUBMITTED").priority(Priority.NORMAL).build());
        complaintRepository.save(Complaint.builder()
                .title("Test 2").status("RESOLVED").priority(Priority.NORMAL).build());

        assertThat(complaintRepository.countByStatus("SUBMITTED")).isEqualTo(1);
        assertThat(complaintRepository.countByStatus("RESOLVED")).isEqualTo(1);
    }

    @Test
    void shouldSaveUrgentComplaint() {
        Complaint complaint = complaintRepository.save(Complaint.builder()
                .title("Gas Leak!")
                .description("Gas leak on 5th avenue")
                .category("Safety")
                .status("SUBMITTED")
                .priority(Priority.URGENT)
                .build());

        assertThat(complaint.getPriority()).isEqualTo(Priority.URGENT);
    }
}
