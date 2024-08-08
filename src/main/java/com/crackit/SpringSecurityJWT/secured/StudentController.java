package com.crackit.SpringSecurityJWT.secured;

import com.crackit.SpringSecurityJWT.service.FileService;

import com.crackit.SpringSecurityJWT.user.CoursDocument;
import com.crackit.SpringSecurityJWT.user.Student;
import com.crackit.SpringSecurityJWT.user.repository.CourseRepository;
import com.crackit.SpringSecurityJWT.user.repository.StudentRepository;
import com.crackit.SpringSecurityJWT.user.repository.UserRepository;
import com.mongodb.client.gridfs.GridFSBucket;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import static com.mongodb.client.model.Filters.eq;

@RestController
@RequestMapping("/crackit/v1/student")
//@PreAuthorize("hasRole('Student')")
public class StudentController {



    @Value("${app.upload.dir}")
    private String uploadDir;

    private final GridFsTemplate gridFsTemplate;
    @Autowired
    private GridFSBucket gridFSBucket;

    @Autowired
    private StudentRepository studentRepository;
    private final FileService fileService;


    private static final Logger logger = LoggerFactory.getLogger(StudentController.class);

@Autowired
private CourseRepository courseRepository;
    @Autowired
    public StudentController(GridFsTemplate gridFsTemplate, FileService fileService) {
        this.gridFsTemplate = gridFsTemplate;
        this.fileService = fileService;

    }

    @GetMapping
    public String getMember() {
        return "Secured Endpoint :: GET - Student controller";
    }








    @PostMapping
    public String post() {
        return "POST:: management controller";
    }






    @GetMapping("/course_details")
    public ResponseEntity<CoursDocument> getCourseDetails(@RequestParam String courseName) {
        Optional<CoursDocument> courseOptional = courseRepository.findByCourseName(courseName);
        if (courseOptional.isPresent()) {
            CoursDocument course = courseOptional.get();
            // Assurez-vous que 'chapters' n'est jamais nul
            if (course.getChapters() == null) {
                course.setChapters(new ArrayList<>());
            }
            return ResponseEntity.status(HttpStatus.OK).body(course);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }






    @GetMapping("/all_courses")
    public ResponseEntity<List<CoursDocument>> getAllCourses(@RequestParam("username") String username) {
        logger.info("Username received from frontend: {}", username);

        if (username == null) {
            return ResponseEntity.badRequest().body(null);
        }

        Student student = studentRepository.findByEmail(username); // Utilisez l'email ou un autre identifiant
        if (student == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        int studentLevel = student.getLevel();

        List<CoursDocument> allCourses = courseRepository.findAll();

        // Filtrer les cours avec le même niveau que l'étudiant
        List<CoursDocument> filteredCourses = allCourses.stream()
                .filter(course -> course.getLevel() == studentLevel)
                .collect(Collectors.toList());

        return ResponseEntity.status(HttpStatus.OK).body(filteredCourses);
    }


//    @GetMapping("/download/{id}")
//    public ResponseEntity<Resource> downloadFile(@PathVariable String id) {
//        System.out.println(id);
//
//        FileDocument fileDocument = fileRepository.findById(id).orElseThrow(() -> new RuntimeException("File not found with id " + id));
//        GridFSFile gridFsFile = gridFsTemplate.findOne(new Query(Criteria.where("_id").is(id)));
//
//        System.out.println(gridFsFile);
//        if (gridFsFile == null) {
//            return ResponseEntity.notFound().build();
//        }
//        System.out.println("here");
//        try {
//            Resource resource = new InputStreamResource(gridFsTemplate.getResource(gridFsFile).getInputStream());
//            System.out.println(fileDocument.getContentType());
//            return ResponseEntity.ok()
//                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileDocument.getFileName() + "\"")
//                    .header(HttpHeaders.CONTENT_TYPE, fileDocument.getContentType())
//                    .body(resource);
//        } catch (IOException e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }





//    @GetMapping("/ppt/{fileName}/pdf")
//    public ResponseEntity<InputStreamResource> getPptAsPdf(@PathVariable String fileName) throws IOException {
//        System.out.println(fileName);
//        Path filePath = Paths.get(uploadDir).resolve(fileName ).normalize();
//
//        if (!Files.exists(filePath)) {
//            throw new IOException("File not found: " + filePath.toString());
//        }
//
//        try (InputStream pptInputStream = new FileInputStream(filePath.toFile());
//             ByteArrayOutputStream pdfOutputStream = new ByteArrayOutputStream()) {
//
//            FileService.convertPptToPdf(pptInputStream, pdfOutputStream);
//
//            ByteArrayInputStream pdfInputStream = new ByteArrayInputStream(pdfOutputStream.toByteArray());
//
//            HttpHeaders headers = new HttpHeaders();
//            headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=" + fileName + ".pdf");
//
//            return ResponseEntity.ok()
//                    .headers(headers)
//                    .contentType(MediaType.APPLICATION_PDF)
//                    .body(new InputStreamResource(pdfInputStream));
//        }
//    }






//@GetMapping("/ppt/{fileName}/pdf")
//public ResponseEntity<InputStreamResource> getPptAsPdf(@PathVariable String fileName) throws IOException {
//    // Find the file in GridFS by its filename
//    GridFSFile gridFSFile = gridFsTemplate.findOne(new Query(Criteria.where("filename").is(fileName)));
//
//    // Check if the file exists
//    if (gridFSFile == null) {
//        throw new IOException("File not found: " + fileName);
//    }
//
//    // Get the file extension
//    String fileExtension = getFileExtension(fileName);
//
//    // Open the file's input stream from GridFS
//    try (InputStream fileInputStream = gridFSBucket.openDownloadStream(gridFSFile.getObjectId())) {
//        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
//        IOUtils.copy(fileInputStream, byteArrayOutputStream); // Copy the content to byteArrayOutputStream
//
//        byte[] fileBytes = byteArrayOutputStream.toByteArray(); // Get byte array of the file
//
//        // Convert to PDF if needed
//        if ("pdf".equalsIgnoreCase(fileExtension)) {
//            HttpHeaders headers = new HttpHeaders();
//            headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=" + fileName);
//
//            return ResponseEntity.ok()
//                    .headers(headers)
//                    .contentType(MediaType.APPLICATION_PDF)
//                    .body(new InputStreamResource(new ByteArrayInputStream(fileBytes)));
//        } else if ("ppt".equalsIgnoreCase(fileExtension) || "pptx".equalsIgnoreCase(fileExtension)) {
//            ByteArrayOutputStream pdfOutputStream = new ByteArrayOutputStream();
//            fileService.convertPptToPdf(new ByteArrayInputStream(fileBytes), pdfOutputStream);
//
//            byte[] pdfBytes = pdfOutputStream.toByteArray();
//
//            HttpHeaders headers = new HttpHeaders();
//            headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=" + fileName + ".pdf");
//
//            return ResponseEntity.ok()
//                    .headers(headers)
//                    .contentType(MediaType.APPLICATION_PDF)
//                    .body(new InputStreamResource(new ByteArrayInputStream(pdfBytes)));
//        } else {
//            throw new IOException("Unsupported file type: " + fileExtension);
//        }
//    }
//}
//





//    // Helper method to get the file extension
//    private String getFileExtension(String fileName) {
//        int lastIndexOfDot = fileName.lastIndexOf('.');
//        if (lastIndexOfDot == -1) {
//            return ""; // No extension found
//        }
//        return fileName.substring(lastIndexOfDot + 1);
//    }

}
