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
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.management.Query;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@AllArgsConstructor
@RestController
@RequestMapping("/crackit/v1/student")
public class StudentController {

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








}
