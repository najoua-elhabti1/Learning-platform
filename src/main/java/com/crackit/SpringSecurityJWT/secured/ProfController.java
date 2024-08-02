package com.crackit.SpringSecurityJWT.secured;

import com.crackit.SpringSecurityJWT.service.FileService;
import com.crackit.SpringSecurityJWT.user.*;
import com.crackit.SpringSecurityJWT.user.repository.FileDocumentRepository;
import com.crackit.SpringSecurityJWT.user.repository.QuestionRepository;
import com.mongodb.client.gridfs.model.GridFSFile;
import lombok.AllArgsConstructor;
import org.apache.kafka.common.errors.ResourceNotFoundException;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xslf.usermodel.*;
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
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@AllArgsConstructor
@RestController
@RequestMapping("/crackit/v1/prof")
@PreAuthorize("hasRole('Prof')")
public class ProfController {
    private static final String UPLOAD_Image_DIR = "uploads/images/";

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
    @Autowired
    private QuestionRepository questionRepository;

    @PostMapping("/upload_course")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file,
                                                          @RequestParam("chapter") String chapter,
                                                          @RequestParam("course") String course,
                                                          @RequestParam("isVisible") boolean isVisible) throws IOException {
        String fileId = gridFsTemplate.store(file.getInputStream(), file.getOriginalFilename(), file.getContentType()).toString();
        Map<String, String> response = new HashMap<>();

        // Determine the file extension
        String fileName = file.getOriginalFilename();
        if (fileName == null) {
            throw new IOException("File name is null");
        }
        String fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();

        String objectifs = "";
        String plan = "";
        String introduction = "";
        String conclusion = "";

        if (fileExtension.equals("ppt") || fileExtension.equals("pptx")) {
            // Process PowerPoint file
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
            // Process PDF file
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
            throw new IOException("Unsupported file type: " + fileExtension);
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
//        fileService.saveFile(file, chapter, course, objectifs, plan, introduction, conclusion, isVisible);
        fileRepository.save(fileDocument);

        String downloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/crackit/v1/prof/")
                .path(fileDocument.getId())
                .toUriString();
        response.put("message", String.valueOf(ResponseEntity.status(HttpStatus.OK).body(fileDocument)));

        return ResponseEntity.ok(response);
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
        System.out.println(id);

        FileDocument fileDocument = fileRepository.findById(id).orElseThrow(() -> new RuntimeException("File not found with id " + id));
        GridFSFile gridFsFile = gridFsTemplate.findOne(new Query(Criteria.where("_id").is(id)));

        System.out.println(gridFsFile);
        if (gridFsFile == null) {
            return ResponseEntity.notFound().build();
        }
        System.out.println("here");
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
public ResponseEntity<String> addQuestionsFromExcelAndImages(@RequestParam("file") MultipartFile file, @RequestParam("folder") MultipartFile[] images) {
    try {
        fileService.addQuestionsFromExcelAndImages(file, images);
        return ResponseEntity.ok("Questions and images added successfully.");
    } catch (IOException e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error adding questions: " + e.getMessage());
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
    public ResponseEntity<String> addQuestionToChapter( @RequestParam("numQuestion") Integer numQuestion,
                                                        @RequestParam("question") String question,
                                                        @RequestParam("response") String response,
                                                        @RequestParam("course") String course,
                                                        @RequestParam("chapter") String chapter,
                                                        @RequestParam("imagePath") MultipartFile imageFile) {
        try {
            // Save image and get its path
            String imageFilePath = saveImage(imageFile);

            // Add question to chapter
            fileService.addQuestionToChapter(
                    chapter,
                    numQuestion,
                    question,
                    response,
                    imageFilePath
            );

            System.out.println("Question added successfully to chapter: " + chapter);
            return ResponseEntity.ok("Question added successfully to chapter: " + chapter);
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

    @PostMapping("/addQuestion")
    public ResponseEntity<Map<String, String>> addQuestion(
            @RequestParam("numQuestion") Integer numQuestion,
            @RequestParam("question") String question,
            @RequestParam("response") String response,
            @RequestParam("course") String course,
            @RequestParam("chapter") String chapter,
            @RequestParam("imagePath") MultipartFile file) {
        Map<String, String> reponse = new HashMap<>();

        try {
            if (questionRepository.existsById(numQuestion)) {
                // Return a response indicating that the question already exists
                reponse.put("message", "Question with this number already exists.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(reponse);
            }
            // Save image and get its path
            String imageFilePath = saveImage(file);

            // Create and save QuestionReponse object with the image path
            QuestionReponse questionReponse = new QuestionReponse();
            questionReponse.setNumQuestion(numQuestion);
            questionReponse.setQuestion(question);
            questionReponse.setResponse(response);
            questionReponse.setCourse(course);
            questionReponse.setChapter(chapter);
            questionReponse.setImagePath(imageFilePath);
//            fileService.addQuestionToChapter(
//                    questionDTO.getChapterName(),
//                    questionDTO.getNumQuestion(),
//                    questionDTO.getQuestionText(),
//                    questionDTO.getResponseText()
//            );
            // Save the QuestionReponse object
            // Assuming you have a repository for saving the object
            questionRepository.save(questionReponse);
            reponse.put("message", "Question added successfully!");
            return ResponseEntity.ok(reponse);
        } catch (IOException e) {
            reponse.put("message", "Failed to save the image.");
            return ResponseEntity.ok(reponse);
        }
    }

    private String saveImage(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("File is empty");
        }

        // Define the directory where the image will be saved
        Path uploadPath = Paths.get("UPLOAD_Image_DIR");

        // Create the directory if it does not exist
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Get the original filename and define the path to save the file
        String originalFilename = file.getOriginalFilename();
        Path destinationPath = uploadPath.resolve(originalFilename);

        // Check if the file already exists
        if (Files.exists(destinationPath)) {
            return destinationPath.toString();
        }

        // Save the file
        Files.copy(file.getInputStream(), destinationPath, StandardCopyOption.REPLACE_EXISTING);

        return destinationPath.toString();
    }


}
