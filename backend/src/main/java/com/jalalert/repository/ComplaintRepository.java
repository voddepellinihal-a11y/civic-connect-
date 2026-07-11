package com.jalalert.repository;

import com.jalalert.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByCategory(String category);
    List<Complaint> findByStatus(String status);
    long countByStatus(String status);
    long countByCategory(String category);
    List<Complaint> findByUserIdOrderByCreatedAtDesc(Long userId);
}
