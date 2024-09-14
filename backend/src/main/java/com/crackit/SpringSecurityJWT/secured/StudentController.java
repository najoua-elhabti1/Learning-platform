package com.crackit.SpringSecurityJWT.secured;

import com.crackit.SpringSecurityJWT.service.FileService;

import com.crackit.SpringSecurityJWT.entities.mongo.CoursDocument;
import com.crackit.SpringSecurityJWT.entities.mongo.FileClass;
import com.crackit.SpringSecurityJWT.entities.postgres.Student;
import com.crackit.SpringSecurityJWT.entities.repository.mongo.CourseRepository;
import com.crackit.SpringSecurityJWT.entities.repository.jpa.StudentRepository;
import com.mongodb.client.gridfs.GridFSBucket;

import com.mongodb.client.gridfs.model.GridFSFile;
import org.apache.commons.compress.utils.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static com.mongodb.client.model.Filters.eq;

@RestController
@RequestMapping("/crackit/v1/student")
//@PreAuthorize("hasRole('Student')")
public class StudentController {





    private final GridFsTemplate gridFsTemplate;
    @Autowired
    private GridFSBucket gridFSBucket;

    @Autowired
    private StudentRepository studentRepository;


    private static final Logger logger = LoggerFactory.getLogger(StudentController.class);

@Autowired
private CourseRepository courseRepository;
    @Autowired
    public StudentController(GridFsTemplate gridFsTemplate, FileService fileService) {
        this.gridFsTemplate = gridFsTemplate;

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
    @GetMapping("/chapter_questions")
    public ResponseEntity<FileClass> getChapterQuestions(@RequestParam String courseName, @RequestParam String chapterName) {
        Optional<CoursDocument> courseOptional = courseRepository.findByCourseName(courseName);
        if (courseOptional.isPresent()) {
            CoursDocument course = courseOptional.get();
            FileClass fileClass = course.getChapterByChapterName(chapterName);

            // Ensure 'chapters' is never null
            if (fileClass != null) {
                return ResponseEntity.status(HttpStatus.OK).body(fileClass);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
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


    @GetMapping("/download/{courseName}/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String courseName, @PathVariable String id) {
        System.out.println("Course Name: " + courseName);
        System.out.println("Chapter ID: " + id);

        // Find the course by its name
        Optional<CoursDocument> courseOptional = courseRepository.findByCourseName(courseName);

        if (courseOptional.isPresent()) {
            // Get the specific course
            CoursDocument course = courseOptional.get();

            // Find the specific chapter by its ID
            FileClass chapter = course.getChapters().stream()
                    .filter(ch -> id.equals(ch.getId()))  // Ensure this matches your chapter ID field
                    .findFirst()
                    .orElse(null);

            if (chapter == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }

            System.out.println("Chapter found: " + chapter.getChapter());

            // Retrieve the file from GridFS
            GridFSFile gridFsFile = gridFsTemplate.findOne(new Query(Criteria.where("_id").is(id)));

            if (gridFsFile == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }

            System.out.println("GridFS File found: " + gridFsFile.getFilename());

            try {
                // Convert the GridFS file to a Resource
                Resource resource = new InputStreamResource(gridFsTemplate.getResource(gridFsFile).getInputStream());

                // Return the file with appropriate headers
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + chapter.getChapter() + "\"")
                        .header(HttpHeaders.CONTENT_TYPE, chapter.getContentType())
                        .body(resource);
            } catch (IOException e) {
                // Handle I/O exceptions
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
        } else {
            // If the course is not found, return 404
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @GetMapping("/ppt/{courseName}/{fileName}/pdf")
    public ResponseEntity<InputStreamResource> getPptAsPdf(@PathVariable String courseName, @PathVariable String fileName) throws IOException {
        // Fetch the course document by course name
        Optional<CoursDocument> courseOptional = courseRepository.findByCourseName(courseName);
        System.out.println("Course Name: " + courseName);
        System.out.println("Chapter ID: " + fileName);

        if (courseOptional.isPresent()) {
            CoursDocument course = courseOptional.get();

            // Find the specific chapter by its file name
            FileClass fileDocument = course.getChapters().stream()
                    .filter(ch -> fileName.equals(ch.getId()))  // Ensure this matches your file name field
                    .findFirst()
                    .orElse(null);
            System.out.println(fileDocument);

            if (fileDocument == null) {
                throw new IOException("File not found: " + fileName);
            }

            // Find the file in GridFS by its ID
            GridFSFile gridFSFile = gridFsTemplate.findOne(new Query(Criteria.where("_id").is(fileName)));

            // Check if the file exists in GridFS
            if (gridFSFile == null) {
                throw new IOException("File not found in GridFS: " + fileName);
            }

            // Get the content type from the GridFS file metadata
            String contentType = gridFSFile.getMetadata().getString("_contentType");
            System.out.println(contentType);
            // Open the file's input stream from GridFS
            try (InputStream fileInputStream = gridFSBucket.openDownloadStream(gridFSFile.getObjectId())) {
                ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
                IOUtils.copy(fileInputStream, byteArrayOutputStream); // Copy the content to byteArrayOutputStream

                byte[] fileBytes = byteArrayOutputStream.toByteArray(); // Get byte array of the file

                // Convert to PDF if needed
                if ("application/pdf".equalsIgnoreCase(contentType)) {
                    HttpHeaders headers = new HttpHeaders();
                    headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=" + fileName);

                    return ResponseEntity.ok()
                            .headers(headers)
                            .contentType(MediaType.APPLICATION_PDF)
                            .body(new InputStreamResource(new ByteArrayInputStream(fileBytes)));
                } else if ("application/vnd.ms-powerpoint".equalsIgnoreCase(contentType) ||
                        "application/vnd.openxmlformats-officedocument.presentationml.presentation".equalsIgnoreCase(contentType)) {
                    ByteArrayOutputStream pdfOutputStream = new ByteArrayOutputStream();
                    FileService.convertPptToPdf(new ByteArrayInputStream(fileBytes), pdfOutputStream);

                    byte[] pdfBytes = pdfOutputStream.toByteArray();

                    HttpHeaders headers = new HttpHeaders();
                    headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=" + fileName + ".pdf");

                    return ResponseEntity.ok()
                            .headers(headers)
                            .contentType(MediaType.APPLICATION_PDF)
                            .body(new InputStreamResource(new ByteArrayInputStream(pdfBytes)));
                } else {
                    throw new IOException("Unsupported file type: " + contentType);
                }
            }
        } else {
            throw new IOException("Course not found: " + courseName);
        }
    }




    // Helper method to get the file extension
    private String getFileExtension(String fileName) {
        int lastIndexOfDot = fileName.lastIndexOf('.');
        if (lastIndexOfDot == -1) {
            return ""; // No extension found
        }
        return fileName.substring(lastIndexOfDot + 1);
    }

    }
