package com.crackit.SpringSecurityJWT.secured;

import com.crackit.SpringSecurityJWT.service.EmailService;
import com.crackit.SpringSecurityJWT.service.FileService;
import com.crackit.SpringSecurityJWT.service.StudentService;
import com.crackit.SpringSecurityJWT.service.UserService;
import com.crackit.SpringSecurityJWT.user.Student;
import com.crackit.SpringSecurityJWT.user.User;
import com.crackit.SpringSecurityJWT.user.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.logging.Logger;

@RestController
@RequestMapping("/crackit/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final FileService excelService;
    private final StudentService studentService;
    private final UserService userService;
    private final EmailService emailService;
    private static final Logger logger = Logger.getLogger(AdminController.class.getName());

    @Autowired
    public AdminController(FileService excelService, StudentService studentService, UserService userService, EmailService emailService) {
        this.excelService = excelService;
        this.studentService = studentService;
        this.userService = userService;
        this.emailService = emailService;
    }

    @GetMapping
    public String getAdmin() {
        return "Secured Endpoint :: GET - Admin controller";
    }

    @PostMapping
    public String post() {
        return "Secured Endpoint :: POST - Admin controller";
    }

    @PostMapping("/import")
    public ResponseEntity<Map<String, String>> importExcelFile(@RequestParam("file") MultipartFile file) {
        Map<String, String> response = new HashMap<>();
        if (file.isEmpty()) {
            response.put("message", "Failed to upload file. File is empty.");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            List<Student> students = excelService.readExcelFile(file);
            studentService.registerStudents(students);

            response.put("message", "File uploaded successfully and students registered.");
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            logger.severe("Failed to upload file: " + e.getMessage());
            response.put("message", "Failed to upload file. " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/register-users")
    public ResponseEntity<Map<String, String>> registerUsersAndSendEmails() {
        Map<String, String> response = new HashMap<>();
        try {
            List<Student> students = studentService.getAllStudents();

            for (Student student : students) {
                String password = generateRandomPassword();
                User user = new User();
                user.setEmail(student.getEmail());
                user.setPassword(password);
                user.setFirstName(student.getFirstName());
                user.setLastName(student.getLastName());
                user.setRole(Role.Student); // Ensure Role enum is properly set
                userService.registerUser(user);

                emailService.sendEmail(
                        student.getEmail(),
                        "Application Learning by doing Account Registration",
                        "Bonjour Mme/Mr. "+student.getLastName()+ student.getFirstName()+"," +
                                "\n\nMerci de trouver ci-joint votre login et mot de passe pour accéder à la plateforme learning by doing."+
                                "\n\nlogin: " + student.getEmail() + "\nMot de passe: " + password+
                                "\nLien : " + "\n\nNB: Merci de réinitialiser votre mot de passe\n" +
                                "\n" +
                                "bien cordialement,"
                );
            }

            response.put("message", "Users registered and emails sent successfully.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.severe("Failed to register users and send emails: " + e.getMessage());
            response.put("message", "Failed to register users and send emails. " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private String generateRandomPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        Random random = new Random();
        StringBuilder password = new StringBuilder();
        for (int i = 0; i < 10; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }
        return password.toString();
    }
}
