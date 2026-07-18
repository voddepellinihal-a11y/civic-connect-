package com.jalalert.config;

import com.jalalert.entity.*;
import com.jalalert.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ComplaintRepository complaintRepository;
    private final DepartmentRepository departmentRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("admin@civicconnect.gov")) {
            User admin = User.builder()
                    .fullName("System Administrator")
                    .email("admin@civicconnect.gov")
                    .phone("9000000000")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            log.info("Admin user seeded: admin@civicconnect.gov / admin123");
        }

        if (departmentRepository.count() == 0) {
            String[][] depts = {
                {"Water Supply", "water"},
                {"Roads & Transport", "road"},
                {"Sanitation & Hygiene", "sanitation"},
                {"Electricity", "electricity"},
                {"Street Lighting", "streetlight"},
                {"Waste Management", "garbage"},
                {"Gas Services", "gas"},
                {"Public Safety", "safety"},
                {"General", "other"}
            };
            for (String[] d : depts) {
                departmentRepository.save(Department.builder().name(d[0]).category(d[1]).build());
            }
            log.info("Seeded {} departments", depts.length);
        }

        if (complaintRepository.count() == 0) {
            User citizen = User.builder()
                    .fullName("Rajesh Kumar")
                    .email("rajesh@demo.com")
                    .phone("9876543210")
                    .password(passwordEncoder.encode("demo123"))
                    .role(Role.CITIZEN)
                    .build();
            userRepository.save(citizen);

            Object[][] complaints = {
                {"Contaminated Water in Banjara Hills", "The tap water in Banjara Hills Road No. 12 has turned brownish. Multiple houses affected. Children are getting sick.", "water", 17.4156, 78.4347, "SUBMITTED", "URGENT", "Water Supply", "/uploads/water-contamination.jpg"},
                {"Major Pothole on MG Road", "Large pothole near Mehdipatnam bus stop causing accidents. At least 3 bikes damaged this week.", "road", 17.3891, 78.4487, "IN_PROGRESS", "NORMAL", "Roads & Transport", "/uploads/pothole.jpg"},
                {"Overflowing Drain in Charminar Area", "Open drain near Charminar is overflowing with sewage. Foul smell spreading to nearby shops. Health hazard.", "sanitation", 17.3616, 78.4747, "SUBMITTED", "URGENT", "Sanitation & Hygiene", "/uploads/drain-overflow.jpg"},
                {"Street Lights Not Working in Jubilee Hills", "Entire stretch of Jubilee Hills Road No. 36 has no street lighting for past 2 weeks. Safety concern at night.", "streetlight", 17.4325, 78.4073, "IN_PROGRESS", "NORMAL", "Street Lighting", "/uploads/streetlight.jpg"},
                {"Water Logging in Ameerpet After Rain", "Heavy water logging in Ameerpet junction after every rainfall. Traffic comes to a standstill.", "water", 17.4399, 78.4480, "SUBMITTED", "NORMAL", "Water Supply", "/uploads/water-logging.jpg"},
                {"Garbage Dump Near Kukatpally", "Illegal garbage dump near Kukatpally JNTU Metro station. Piles of waste accumulating for 5 days.", "garbage", 17.4849, 78.3908, "RESOLVED", "NORMAL", "Waste Management", "/uploads/garbage-dump.jpg"},
                {"Broken Transformer in Secunderabad", "Transformer near Secunderabad railway station making loud noises. Sparks visible during evening hours.", "electricity", 17.4399, 78.4983, "SUBMITTED", "URGENT", "Electricity", "/uploads/transformer.jpg"},
                {"Leaking Water Pipeline in Ameerpet", "Major water pipeline leak on Ameerpet main road. Water wasting for 3 days. Road becoming slippery.", "water", 17.4350, 78.4430, "IN_PROGRESS", "NORMAL", "Water Supply", "/uploads/pipeline-leak.jpg"},
                {"Garbage Collection Irregular in Dilsukhnagar", "Municipal garbage collection skipped for over a week in Dilsukhnagar Colony. Bins overflowing.", "garbage", 17.3688, 78.5247, "SUBMITTED", "NORMAL", "Waste Management", "/uploads/garbage-collection.jpg"},
                {"Flooding in Madhapur After Pipe Burst", "Underground water pipe burst near Madhapur circle. Road flooded, vehicles stuck. Emergency repair needed.", "water", 17.4488, 78.3909, "SUBMITTED", "URGENT", "Water Supply", "/uploads/pipe-burst.jpg"},
            };

            for (Object[] c : complaints) {
                Complaint complaint = Complaint.builder()
                        .title((String) c[0])
                        .description((String) c[1])
                        .category((String) c[2])
                        .latitude((Double) c[3])
                        .longitude((Double) c[4])
                        .status((String) c[5])
                        .priority(Priority.valueOf((String) c[6]))
                        .assignedDepartment((String) c[7])
                        .filePath((String) c[8])
                        .userId(citizen.getId())
                        .build();
                Complaint saved = complaintRepository.save(complaint);

                statusHistoryRepository.save(StatusHistory.builder()
                        .complaint(saved)
                        .status(saved.getStatus())
                        .notes("Complaint submitted")
                        .build());

                if (!saved.getStatus().equals("SUBMITTED")) {
                    statusHistoryRepository.save(StatusHistory.builder()
                            .complaint(saved)
                            .status(saved.getStatus())
                            .notes("Status updated by admin")
                            .build());
                }
            }
            log.info("Seeded {} complaints across Hyderabad", complaints.length);
        }
    }
}
