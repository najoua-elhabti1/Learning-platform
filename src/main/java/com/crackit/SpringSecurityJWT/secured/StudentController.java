package com.crackit.SpringSecurityJWT.secured;

import com.crackit.SpringSecurityJWT.service.FileService;
import com.crackit.SpringSecurityJWT.user.ChapterDetailsResponse;
import com.crackit.SpringSecurityJWT.user.FileDocument;
import com.crackit.SpringSecurityJWT.user.Question;
import com.crackit.SpringSecurityJWT.user.repository.FileDocumentRepository;
import com.mongodb.client.gridfs.model.GridFSFile;
import lombok.AllArgsConstructor;
import org.apache.kafka.common.errors.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.mongodb.client.gridfs.model.GridFSFile;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/crackit/v1/student")
public class StudentController {

    @Value("${app.upload.dir}")
    private String uploadDir;

    private final GridFsTemplate gridFsTemplate;
    private final FileService fileService;
    private final FileDocumentRepository fileRepository;

    @Autowired
    public StudentController(GridFsTemplate gridFsTemplate, FileService fileService, FileDocumentRepository fileRepository) {
        this.gridFsTemplate = gridFsTemplate;
        this.fileService = fileService;
        this.fileRepository = fileRepository;
    }

    @GetMapping
    public String getMember() {
        return "Secured Endpoint :: GET - Student controller";
    }

    @PostMapping
    public String post() {
        return "POST:: management controller";
    }

    @GetMapping("/chapter/{chapterName}")
    public ResponseEntity<ChapterDetailsResponse> getChapterDetails(@PathVariable String chapterName) {
        Optional<FileDocument> fileDocumentOpt = fileRepository.findAll().stream()
                .filter(doc -> doc.getChapter().equals(chapterName))
                .findFirst();

        if (fileDocumentOpt.isPresent()) {
            FileDocument fileDocument = fileDocumentOpt.get();
            List<Question> questions = fileDocument.getQuestions();
            return ResponseEntity.ok(new ChapterDetailsResponse(
                    fileDocument.getId(),
                    fileDocument.getChapter(),
                    fileDocument.getFileName(),
                    fileDocument.getObjectifs(),
                    fileDocument.getPlan(),
                    fileDocument.getIntroduction(),
                    fileDocument.getConclusion(),
                    fileDocument.getIsVisible(),
                    questions
            ));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/chapters")
    public ResponseEntity<List<String>> getAllChapters() {
        List<FileDocument> fileDocuments = fileRepository.findAll();
        List<String> chapters = fileDocuments.stream()
                .map(FileDocument::getChapter)
                .collect(Collectors.toList());
        return ResponseEntity.ok(chapters);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String id) {
        FileDocument fileDocument = fileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found with id " + id));
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


    @GetMapping("/ppt/{fileName}/pdf")
    public ResponseEntity<InputStreamResource> getPptAsPdf(@PathVariable String fileName) throws IOException {
        Path filePath = Paths.get(uploadDir).resolve(fileName ).normalize();

        if (!Files.exists(filePath)) {
            throw new IOException("File not found: " + filePath.toString());
        }

        try (InputStream pptInputStream = new FileInputStream(filePath.toFile());
             ByteArrayOutputStream pdfOutputStream = new ByteArrayOutputStream()) {

            FileService.convertPptToPdf(pptInputStream, pdfOutputStream);

            ByteArrayInputStream pdfInputStream = new ByteArrayInputStream(pdfOutputStream.toByteArray());

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=" + fileName + ".pdf");

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(new InputStreamResource(pdfInputStream));
        }
    }

}
