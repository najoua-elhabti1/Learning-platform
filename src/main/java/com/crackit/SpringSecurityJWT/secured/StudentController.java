package com.crackit.SpringSecurityJWT.secured;

import com.crackit.SpringSecurityJWT.user.ChapterDetailsResponse;
import com.crackit.SpringSecurityJWT.user.FileDocument;
import com.crackit.SpringSecurityJWT.user.Question;
import com.crackit.SpringSecurityJWT.user.repository.FileDocumentRepository;
import com.mongodb.client.gridfs.model.GridFSFile;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.mongodb.client.gridfs.model.GridFSFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@AllArgsConstructor
@RestController
@RequestMapping("/crackit/v1/student")
@PreAuthorize("hasRole('Student')")
public class StudentController {

    private final GridFsTemplate gridFsTemplate;

    @Autowired
    private FileDocumentRepository fileRepository;

    @GetMapping
    public String getMember() {
        return "Secured Endpoint :: GET - Student controller";
    }

    @PostMapping
    public String post() {
        return "POST:: management controller";
    }




    //get chapter details by chapterName
    @GetMapping("/chapter/{chapterName}")
    public ResponseEntity<ChapterDetailsResponse> getChapterDetails(@PathVariable String chapterName) {
        Optional<FileDocument> fileDocumentOpt = fileRepository.findAll().stream()
                .filter(doc -> doc.getChapter().equals(chapterName))
                .findFirst();

        if (fileDocumentOpt.isPresent()) {
            FileDocument fileDocument = fileDocumentOpt.get();
            List<Question> questions = fileDocument.getQuestions();  // Récupérer les questions
            return ResponseEntity.ok(new ChapterDetailsResponse(
                    fileDocument.getId(),
                    fileDocument.getChapter(),
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



    //get all chapters
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

    @GetMapping("/view/{id}")
    public ResponseEntity<Resource> viewFile(@PathVariable String id) {
        FileDocument fileDocument = fileRepository.findById(id).orElseThrow(() -> new RuntimeException("File not found with id " + id));
        GridFSFile gridFsFile = gridFsTemplate.findOne(new Query(Criteria.where("_id").is(id)));
        if (gridFsFile == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            Resource resource = new InputStreamResource(gridFsTemplate.getResource(gridFsFile).getInputStream());
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileDocument.getFileName() + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, fileDocument.getContentType())
                    .body(resource);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }






}
