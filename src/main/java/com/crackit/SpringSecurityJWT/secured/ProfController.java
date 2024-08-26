package com.crackit.SpringSecurityJWT.secured;

import com.crackit.SpringSecurityJWT.entities.mongo.CoursDocument;
import com.crackit.SpringSecurityJWT.entities.mongo.FileClass;
import com.crackit.SpringSecurityJWT.entities.mongo.Question;
import com.crackit.SpringSecurityJWT.entities.postgres.StudentActivity;
import com.crackit.SpringSecurityJWT.entities.postgres.Student;
import com.crackit.SpringSecurityJWT.service.FileService;
import com.crackit.SpringSecurityJWT.service.StudentActivityService;
import com.crackit.SpringSecurityJWT.entities.repository.CourseRepository;
import com.crackit.SpringSecurityJWT.entities.repository.QuestionRepository;
import lombok.AllArgsConstructor;
import org.apache.kafka.common.errors.ResourceNotFoundException;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xslf.usermodel.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.util.*;

@AllArgsConstructor
@RestController
@RequestMapping("/crackit/v1/prof")
//@PreAuthorize("hasRole('Prof')")
public class ProfController {
    private static final String UPLOAD_Image_DIR = "uploads/images/";
    private CourseRepository courseRepository;

    @GetMapping
    public String getMember() {
        return "Secured Endpoint :: GET - Prof controller";
    }

    @PostMapping
    public String post() {
        return "POST:: management controller";
    }

    @Autowired
    private GridFsTemplate gridFsTemplate;


    @Autowired
    private FileService fileService;
    @Autowired
    private QuestionRepository questionRepository;


    //cela cree un document avec le nom de cours
    @PostMapping("/create_cours")
    public ResponseEntity<String> createCourse(
            @RequestParam("courseName") String courseName,
            @RequestParam("level") int level) {

        // Check if the course name is provided
        if (courseName == null || courseName.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Course name is required.");
        }

        // Check if the course already exists
        if (courseRepository.existsByCourseName(courseName)) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Course already exists.");
        }

        // Create a new course document and set the course name and level
        CoursDocument course = new CoursDocument();
        course.setCourseName(courseName);
        course.setLevel(level);
        courseRepository.save(course);

        // Return a success response
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body("Course created successfully.");
    }


    @GetMapping("/all_courses")
    public ResponseEntity<List<CoursDocument>> getAllCourses() {
        List<CoursDocument> courses = courseRepository.findAll();
        return ResponseEntity.status(HttpStatus.OK).body(courses);
    }


    @PostMapping("/upload_chapter_to_course")
    public ResponseEntity<Map<String, String>> uploadFile(
            @RequestParam("courseName") String courseName,
            @RequestParam("file") MultipartFile file,
            @RequestParam("chapter") String chapter,
            @RequestParam("isVisible") boolean isVisible) {


        System.out.println("Course Name: " + courseName);
        System.out.println("Chapter: " + chapter);
        System.out.println("Is Visible: " + isVisible);
        Map<String, String> response = new HashMap<>();

        if (file.isEmpty()) {
            response.put("error", "Aucun fichier sélectionné.");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            // Vérifiez si le cours existe déjà
            Optional<CoursDocument> optionalCourse = courseRepository.findByCourseName(courseName);
            CoursDocument course = optionalCourse.orElseGet(() -> {
                CoursDocument newCourse = new CoursDocument();
                newCourse.setCourseName(courseName);
                newCourse.setChapters(new ArrayList<>()); // Initialisation de la liste des chapitres
                return courseRepository.save(newCourse);
            });

            // Assurez-vous que la liste des chapitres est initialisée
            if (course.getChapters() == null) {
                course.setChapters(new ArrayList<>());
            }

            // Traitez le fichier téléchargé
            String fileId = gridFsTemplate.store(file.getInputStream(), file.getOriginalFilename(), file.getContentType()).toString();

            // Extraction du contenu du fichier
            String fileName = file.getOriginalFilename();
            if (fileName == null) {
                throw new IOException("Le nom du fichier est nul");
            }
            String fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();

            String objectifs = "";
            String plan = "";
            String introduction = "";
            String conclusion = "";

            if (fileExtension.equals("ppt") || fileExtension.equals("pptx")) {
                try (XMLSlideShow ppt = new XMLSlideShow(file.getInputStream())) {
                    XSLFSlide[] slides = ppt.getSlides().toArray(new XSLFSlide[0]);
                    if (slides.length > 1) {
                        objectifs = extractFormattedTextFromSlide(slides[1]);
                    }
                    if (slides.length > 2) {
                        plan = extractFormattedTextFromSlide(slides[2]);
                    }
                    if (slides.length > 3) {
                        introduction = extractFormattedTextFromSlide(slides[3]);
                    }
                    if (slides.length > 4) {
                        conclusion = extractFormattedTextFromSlide(slides[slides.length - 1]);
                    }
                }
            } else if (fileExtension.equals("pdf")) {
                try (PDDocument document = PDDocument.load(file.getInputStream())) {
                    int numberOfPages = document.getNumberOfPages();
                    if (numberOfPages > 1) {
                        objectifs = extractFormattedTextFromPdfPage(document, 2);
                    }
                    if (numberOfPages > 2) {
                        plan = extractFormattedTextFromPdfPage(document, 3);
                    }
                    if (numberOfPages > 3) {
                        introduction = extractFormattedTextFromPdfPage(document, 4);
                    }
                    if (numberOfPages > 4) {
                        conclusion = extractFormattedTextFromPdfPage(document, numberOfPages);
                    }
                }
            } else {
                throw new IOException("Type de fichier non pris en charge: " + fileExtension);
            }

            // Créez un nouveau File et sauvegardez-le
            FileClass chapter1 = new FileClass();
            chapter1.setId(fileId);
            chapter1.setChapter(chapter);
            chapter1.setContentType(file.getContentType());
            chapter1.setObjectifs(objectifs);
            chapter1.setPlan(plan);
            chapter1.setIntroduction(introduction);
            chapter1.setConclusion(conclusion);
            chapter1.setVisible(isVisible);
            chapter1.setPptFilePath(fileId);

            course.getChapters().add(chapter1);
            courseRepository.save(course);

            // Générez l'URI de téléchargement
            String downloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/crackit/v1/prof/")
                    .path(chapter1.getId())
                    .toUriString();
            response.put("message", "Fichier téléchargé avec succès.");
            response.put("fileId", fileId);
            response.put("downloadUri", downloadUri);

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            response.put("error", "Erreur lors du traitement du fichier: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        } catch (Exception e) {
            response.put("error", "Erreur inattendue: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }


    private String extractFormattedTextFromSlide(XSLFSlide slide) {
        StringBuilder slideText = new StringBuilder();
        boolean firstLineSkipped = false;

        for (XSLFShape shape : slide.getShapes()) {
            if (shape instanceof XSLFTextShape) {
                XSLFTextShape textShape = (XSLFTextShape) shape;
                for (XSLFTextParagraph paragraph : textShape.getTextParagraphs()) {
                    String paragraphText = paragraph.getText();

                    // Skip the first line of text
                    if (!firstLineSkipped) {
                        firstLineSkipped = true;  // Mark that the first line has been skipped
                    } else {
                        slideText.append("- ").append(paragraph.getText()).append("\n"); // Preserve line breaks
                    }
                }
                slideText.append("\n"); // Separate text shapes within a slide
            }
        }

        return slideText.toString().trim();
    }


    private String extractFormattedTextFromPdfPage(PDDocument document, int pageNumber) throws IOException {
        PDFTextStripper pdfStripper = new PDFTextStripper();
        pdfStripper.setStartPage(pageNumber);
        pdfStripper.setEndPage(pageNumber);

        String fullText = pdfStripper.getText(document);
        String[] lines = fullText.split("\n");
        StringBuilder formattedText = new StringBuilder();

        boolean firstLineSkipped = false;
        for (String line : lines) {
            if (!firstLineSkipped) {
                firstLineSkipped = true;
            } else {
                formattedText.append("- ").append(line.trim()).append("\n");
            }
        }

        return formattedText.toString().trim();
    }



    @PostMapping("/read_students")
    public ResponseEntity<List<Student>> readStudents(@RequestParam("file") MultipartFile file) {
        try {
            List<Student> students = fileService.readExcelFile(file);
            return ResponseEntity.ok(students);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }


    @PutMapping("/chapters/visibility")
    public ResponseEntity<Void> updateChapterVisibility(@RequestParam String courseName,
                                                        @RequestParam String chapterName,
                                                        @RequestParam boolean visibility) {
        // Rechercher le documentCours par nom de cours
        CoursDocument coursDocument = courseRepository.findByCourseName(courseName)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));


        FileClass chapter = coursDocument.getChapters().stream()
                .filter(c -> c.getChapter().equalsIgnoreCase(chapterName))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found"));


        chapter.setVisible(visibility);


        courseRepository.save(coursDocument);

        return ResponseEntity.ok().build();
    }


//    afichinahom f table
    @GetMapping("/all_questions")
    public ResponseEntity<List<Question>> getAllQuestions() {
        try {
            List<Question> questions = fileService.getAllQuestions();
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }
    @GetMapping("/all_chapters")
    public ResponseEntity<List<String>> getAllChapters() {
        try {
            List<String> chapters = fileService.getAllChapters();
            return ResponseEntity.ok(chapters);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }


    // ndwzohom mn excel n mongo
    @PostMapping("/add_questions")
    public ResponseEntity<String> addQuestionsFromExcelAndImages(@RequestParam("file") MultipartFile file, @RequestParam("folder") MultipartFile[] images) {
        try {
            fileService.addQuestionsFromExcelAndImages(file, images);
            return ResponseEntity.ok("Questions and images added successfully.");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error adding questions: " + e.getMessage());
        }
    }





    @DeleteMapping("/chapters/delete")
    public ResponseEntity<Void> deleteChapter(@RequestParam String courseName,
                                              @RequestParam String chapterName) {
        // Find the course by name
        CoursDocument coursDocument = courseRepository.findByCourseName(courseName)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        // Find and remove the chapter
        FileClass chapter = coursDocument.getChapters().stream()
                .filter(c -> c.getChapter().equalsIgnoreCase(chapterName))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found"));

        coursDocument.getChapters().remove(chapter);

        courseRepository.save(coursDocument);

        return ResponseEntity.ok().build();
    }



    //return chapter by nameChapter and nameCourse
    @GetMapping("/chapter")
    public ResponseEntity<FileClass> getChapterByCourseAndChapter(
            @RequestParam("courseName") String courseName,
            @RequestParam("chapterName") String chapterName) {

        try {
            // Rechercher le documentCours par nom de cours
            CoursDocument coursDocument = courseRepository.findByCourseName(courseName)
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

            // Chercher le chapitre par nom du chapitre dans la liste des chapitres
            FileClass chapter = coursDocument.getChapters().stream()
                    .filter(c -> c.getChapter().equalsIgnoreCase(chapterName))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Chapter not found"));

            // Retourner le chapitre trouvé
            return ResponseEntity.ok(chapter);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }




    @DeleteMapping("/delete_all_questions")
    public ResponseEntity<String> deleteAllQuestions() {
        try {
            fileService.deleteAllQuestions();
            return ResponseEntity.ok("All questions deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting questions.");
        }
    }



    @PostMapping("/add_manual_question")
    public ResponseEntity<String> addQuestionToChapter( @RequestParam("numQuestion") Integer numQuestion,
                                                        @RequestParam("question") String question,
                                                        @RequestParam("response") String response,
                                                        @RequestParam("course") String course,
                                                        @RequestParam("chapter") String chapter,
                                                        @RequestParam("imagePath") MultipartFile imageFile) {
        try {


            // Add question to chapter
            fileService.addQuestionToChapter(
                    course,
                    chapter,
                    numQuestion,
                    question,
                    response,
                    imageFile
            );

            System.out.println("Question added successfully to chapter: " + chapter);
            return ResponseEntity.ok("Question added successfully to chapter: " + chapter);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error adding question: " + e.getMessage());
        }
    }



    @PutMapping("/update_question")
    public ResponseEntity<String> updateQuestion(@RequestBody Question updateQuestionDTO) {
        try {
            String courseName = updateQuestionDTO.getCourse();
            String chapterName = updateQuestionDTO.getChapter();
            int questionNumber = updateQuestionDTO.getNumQuestion();
            String newQuestionText = updateQuestionDTO.getQuestion();
            String newResponseText = updateQuestionDTO.getResponse();
            String newImageContent = updateQuestionDTO.getImageContent();

            // Log received data for debugging
            System.out.println("Received courseName: " + courseName);
            System.out.println("Received chapterName: " + chapterName);
            System.out.println("Received questionNumber: " + questionNumber);
            System.out.println("Received newQuestionText: " + newQuestionText);
            System.out.println("Received newResponseText: " + newResponseText);
            System.out.println("Received newImageContent: " + newImageContent);

            fileService.updateQuestion(courseName, chapterName, questionNumber, newQuestionText, newResponseText, newImageContent);

            return ResponseEntity.ok("Question updated successfully");
        } catch (IllegalArgumentException | ResourceNotFoundException e) {
            // Log the exception message
            System.out.println("Error occurred: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }



    @DeleteMapping("/question/{courseName}/{chapterName}/{questionNumber}")
    public ResponseEntity<String> deleteQuestionByChapterAndNumber(
            @PathVariable String courseName,
            @PathVariable String chapterName,
            @PathVariable int questionNumber) {
        try {
            fileService.deleteQuestionFromChapter(courseName,chapterName, questionNumber);
            return ResponseEntity.ok("Question deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting question: " + e.getMessage());
        }
    }


    @GetMapping("/question/{courseName}/{chapterName}/{questionNumber}")
    public ResponseEntity<Question> getQuestionByChapterAndNumber(@PathVariable String courseName, @PathVariable String chapterName, @PathVariable int questionNumber) {
        return fileService.getQuestionByCourseAndChapterAndNumber(courseName,chapterName, questionNumber);
    }


    @Autowired
    private StudentActivityService service;

    @PostMapping("student-activities/log")
    public ResponseEntity<StudentActivity> logActivity(@RequestBody StudentActivity activity) {
//        System.out.println("Click Count: " + activity.getClickCount());
        StudentActivity savedActivity = service.logActivity(activity);
        return new ResponseEntity<>(savedActivity, HttpStatus.CREATED);
    }

    @GetMapping("student-activities/course/{courseId}")
    public List<StudentActivity> getActivitiesByCourse(@PathVariable String courseId) {
        return service.getActivitiesByCourse(courseId);
    }

    @GetMapping("student-activities/student/{studentId}")
    public List<StudentActivity> getActivitiesByStudent(@PathVariable String studentId) {
        return service.getActivitiesByStudent(studentId);
    }
    @GetMapping("student-activities/all")
    public List<StudentActivity> getAllActivities() {
        return service.getAllActivities();
    }



    @PutMapping("/update_chapter")
    public ResponseEntity<Map<String, String>> updateChapter(
            @RequestParam("courseName") String courseName,
            @RequestParam("chapter") String chapter,
            @RequestParam("file") MultipartFile file
    ) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "No file selected."));
        }

        try {
            CoursDocument course = courseRepository.findByCourseName(courseName)
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

            FileClass chapterToUpdate = course.getChapters().stream()
                    .filter(chap -> chap.getChapter().equals(chapter))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Chapter not found"));

            String fileId = gridFsTemplate.store(file.getInputStream(), file.getOriginalFilename(), file.getContentType()).toString();

            String fileExtension = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf('.') + 1).toLowerCase();
            String objectifs = "", plan = "", introduction = "", conclusion = "";

            if (fileExtension.equals("ppt") || fileExtension.equals("pptx")) {
                try (XMLSlideShow ppt = new XMLSlideShow(file.getInputStream())) {
                    XSLFSlide[] slides = ppt.getSlides().toArray(new XSLFSlide[0]);
                    if (slides.length > 1) objectifs = extractFormattedTextFromSlide(slides[1]);
                    if (slides.length > 2) plan = extractFormattedTextFromSlide(slides[2]);
                    if (slides.length > 3) introduction = extractFormattedTextFromSlide(slides[3]);
                    if (slides.length > 4) conclusion = extractFormattedTextFromSlide(slides[slides.length - 1]);
                }
            } else if (fileExtension.equals("pdf")) {
                try (PDDocument document = PDDocument.load(file.getInputStream())) {
                    int numberOfPages = document.getNumberOfPages();
                    if (numberOfPages > 1) objectifs = extractFormattedTextFromPdfPage(document, 2);
                    if (numberOfPages > 2) plan = extractFormattedTextFromPdfPage(document, 3);
                    if (numberOfPages > 3) introduction = extractFormattedTextFromPdfPage(document, 4);
                    if (numberOfPages > 4) conclusion = extractFormattedTextFromPdfPage(document, numberOfPages);
                }
            } else {
                throw new IOException("Unsupported file type: " + fileExtension);
            }

            chapterToUpdate.setPptFilePath(fileId);
            chapterToUpdate.setObjectifs(objectifs);
            chapterToUpdate.setPlan(plan);
            chapterToUpdate.setIntroduction(introduction);
            chapterToUpdate.setConclusion(conclusion);

            courseRepository.save(course);

            String downloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/crackit/v1/prof/")
                    .path(chapterToUpdate.getId())
                    .toUriString();

            Map<String, String> response = new HashMap<>();
            response.put("message", "Chapter updated successfully.");
            response.put("fileId", fileId);
            response.put("downloadUri", downloadUri);

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Error processing file: " + e.getMessage()));
        }
    }



}


