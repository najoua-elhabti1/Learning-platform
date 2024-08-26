package com.crackit.SpringSecurityJWT.entities.postgres;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "student_activity")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StudentActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String studentId;
    private String courseId;
    private String actionType;
    private LocalDateTime timestamp;
    private Long duration; // For view duration
//    private Integer clickCount;
}
