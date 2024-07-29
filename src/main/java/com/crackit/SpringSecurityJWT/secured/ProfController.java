package com.crackit.SpringSecurityJWT.secured;

import com.crackit.SpringSecurityJWT.service.FileService;
import com.crackit.SpringSecurityJWT.user.*;
import com.crackit.SpringSecurityJWT.user.repository.FileDocumentRepository;
import com.mongodb.client.gridfs.model.GridFSFile;
import lombok.AllArgsConstructor;
import org.apache.kafka.common.errors.ResourceNotFoundException;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.apache.poi.xslf.usermodel.XSLFTextShape;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
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

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@AllArgsConstructor
@RestController
@RequestMapping("/crackit/v1/prof")
//@PreAuthorize("hasRole('Prof')")
public class ProfController {

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
    private FileDocumentRepository fileRepository;

    @Autowired
    private FileService fileService;

    @PostMapping("/upload_course")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file,
                                                          @RequestParam("chapter") String chapter,
                                                          @RequestParam("course") String course,
                                                          @RequestParam("isVisible") boolean isVisible) throws IOException {
        String fileId = gridFsTemplate.store(file.getInputStream(), file.getOriginalFilename(), file.getContentType()).toString();
        Map<String, String> response = new HashMap<>();

        // Extract content from PowerPoint file
        String objectifs = "";
        String plan = "";
        String introduction = "";
        String conclusion = "";

        try (XMLSlideShow ppt = new XMLSlideShow(file.getInputStream())) {
            XSLFSlide[] slides = ppt.getSlides().toArray(new XSLFSlide[0]);

            if (slides.length > 1) {
                objectifs = extractTextFromSlide(slides[1]);
            }
            if (slides.length > 2) {
                plan = extractTextFromSlide(slides[2]);
            }
            if (slides.length > 3) {
                introduction = extractTextFromSlide(slides[3]);
            }
            if (slides.length > 4) {
                conclusion = extractTextFromSlide(slides[slides.length - 1]);
            }
        }

        // Save file metadata and extracted content to database
        FileDocument fileDocument = new FileDocument();
        fileDocument.setFileName(file.getOriginalFilename());
        fileDocument.setContentType(file.getContentType());
        fileDocument.setId(fileId);
        fileDocument.setChapter(chapter);
        fileDocument.setCourse(course);
        fileDocument.setObjectifs(objectifs);
        fileDocument.setPlan(plan);
        fileDocument.setIntroduction(introduction);
        fileDocument.setConclusion(conclusion);
        fileDocument.setIsVisible(isVisible);
        fileRepository.save(fileDocument);

        String downloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/crackit/v1/prof/")
                .path(fileDocument.getId())
                .toUriString();
        response.put("message", String.valueOf(ResponseEntity.status(HttpStatus.OK).body(downloadUri)));

        return ResponseEntity.ok(response);
    }


    private String extractTextFromSlide(XSLFSlide slide) {
        StringBuilder text = new StringBuilder();
        slide.getShapes().forEach(shape -> {
            if (shape instanceof XSLFTextShape) {
                XSLFTextShape textShape = (XSLFTextShape) shape;
                text.append(textShape.getText()).append("\n");
            }
        });
        return text.toString().trim();
    }

    @PutMapping("/{courseId}/visibility")
    public ResponseEntity<?> updateVisibility(@PathVariable String courseId, @RequestBody boolean isVisible) {
        try {
            fileService.updateVisibility(courseId, isVisible);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update visibility: " + e.getMessage());
        }
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String id) {
        FileDocument fileDocument = fileRepository.findById(id).orElseThrow(() -> new RuntimeException("File not found with id " + id));
        GridFSFile gridFsFile = gridFsTemplate.findOne(new Query(Criteria.where("_id").is(id)));
        if (gridFsFile == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            Resource resource = new InputStreamResource(gridFsTemplate.getResource(gridFsFile).getInputStream());

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileDocument.getFileName() + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, fileDocument.getContentType())
                    .body(resource);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/all_courses")
    public ResponseEntity<List<FileDocument>> getAllFiles() {
        List<FileDocument> files = fileRepository.findAll();
        System.out.println(files);
        return ResponseEntity.status(HttpStatus.OK).body(files);
    }



    // Endpoint to read student information from Excel file
    @PostMapping("/read_students")
    public ResponseEntity<List<Student>> readStudents(@RequestParam("file") MultipartFile file) {
        try {
            List<Student> students = fileService.readExcelFile(file);
            return ResponseEntity.ok(students);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    //afichinahom f table
    @GetMapping("/all_questions")
    public ResponseEntity<List<QuestionDTO>> getAllQuestions() {
        try {
            List<QuestionDTO> questions = fileService.getAllQuestions();
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }




// ndwzohom mn excel n mongo
    @PostMapping("/add_questions")
    public ResponseEntity<String> addQuestionsFromExcel(@RequestParam("file") MultipartFile file) {
        try {
            fileService.addQuestionsFromExcel(file);
            return ResponseEntity.ok("Questions ajoutées avec succès.");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors de l'ajout des questions : " + e.getMessage());
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



    @GetMapping("/download/questions")
    public ResponseEntity<Resource> downloadExcelQuestions() {
        try {
            ByteArrayInputStream inputStream = fileService.generateExcelQuestions();
            ByteArrayResource resource = new ByteArrayResource(inputStream.readAllBytes());

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=questions.xlsx");
            headers.add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE);

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(resource.contentLength())
                    .body(resource);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/add_manual_question")
    public ResponseEntity<String> addQuestionToChapter(@RequestBody QuestionDTO questionDTO) {
        try {


            fileService.addQuestionToChapter(
                    questionDTO.getChapterName(),
                    questionDTO.getNumQuestion(),
                    questionDTO.getQuestionText(),
                    questionDTO.getResponseText()
            );
            System.out.println("Question added successfully to chapter: " + questionDTO.getChapterName()); // Afficher le message de succès dans la console
            return ResponseEntity.ok("Question added successfully to chapter: " + questionDTO.getChapterName());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error adding question: " + e.getMessage());
        }
    }





    @PutMapping("/update_question")
    public ResponseEntity<String> updateQuestion(@RequestBody UpdateChapterDTO updateQuestionDTO) {
        try {
            String chapterName = updateQuestionDTO.getChapter();
            int questionNumber = updateQuestionDTO.getNumQuestion();
            String newQuestionText = updateQuestionDTO.getQuestion();
            String newResponseText = updateQuestionDTO.getResponse();

            fileService.updateQuestion(chapterName, questionNumber, newQuestionText, newResponseText);

            return ResponseEntity.ok("Question updated successfully");
        } catch (IllegalArgumentException | ResourceNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }



    @DeleteMapping("/question/{chapterName}/{questionNumber}")
    public ResponseEntity<String> deleteQuestionByChapterAndNumber(
            @PathVariable String chapterName,
            @PathVariable int questionNumber) {
        try {
            fileService.deleteQuestionFromChapter(chapterName, questionNumber);
            return ResponseEntity.ok("Question deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting question: " + e.getMessage());
        }
    }


    @GetMapping("/question/{chapterName}/{questionNumber}")
    public ResponseEntity<QuestionDTO> getQuestionByChapterAndNumber(@PathVariable String chapterName, @PathVariable int questionNumber) {
        return fileService.getQuestionByChapterAndNumber(chapterName, questionNumber);
    }
}
