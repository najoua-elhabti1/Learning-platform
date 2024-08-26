package com.crackit.SpringSecurityJWT.service;


import com.crackit.SpringSecurityJWT.entities.mongo.CoursDocument;
import com.crackit.SpringSecurityJWT.entities.mongo.FileClass;
import com.crackit.SpringSecurityJWT.entities.mongo.Question;
import com.crackit.SpringSecurityJWT.entities.postgres.Student;
import com.crackit.SpringSecurityJWT.entities.repository.CourseRepository;
import com.crackit.SpringSecurityJWT.entities.repository.QuestionRepository;
import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSDownloadStream;
import com.mongodb.client.gridfs.model.GridFSFile;
import com.mongodb.client.model.Filters;
import org.apache.kafka.common.errors.ResourceNotFoundException;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.poi.sl.usermodel.SlideShow;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.List;

@Service
public class FileService {

    @Autowired
    private GridFSBucket gridFSBucket;


    @Autowired
    private CourseRepository courseRepository;



    public FileClass getChapterFromCourse(String chapterName, String courseName) {
        Optional<CoursDocument> coursDocument = courseRepository.findByCourseName(courseName);

        if (coursDocument.isPresent()) {
            for (FileClass f : coursDocument.get().getChapters()) {
//                System.out.println("Checking chapter: " + f);

                // Check if the chapter name matches the one provided
                if (f.getChapter().equals(chapterName)) {
                    return f; // Return the matching chapter
                }
            }
        } else {
            System.out.println("Course not found: " + courseName);
        }
        return null;
    }

    public ResponseEntity<InputStreamResource> getFile(String id) {
        GridFSFile gridFSFile = gridFSBucket.find(Filters.eq("_id", new ObjectId(id))).first();
        if (gridFSFile == null) {
            return ResponseEntity.notFound().build();
        }

        GridFSDownloadStream downloadStream = gridFSBucket.openDownloadStream(gridFSFile.getObjectId());
        InputStreamResource resource = new InputStreamResource(downloadStream);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + gridFSFile.getFilename() + "\"")
                .contentType(MediaType.parseMediaType(gridFSFile.getMetadata().getString("contentType")))
                .body(resource);
    }

    public List<Student> readExcelFile(MultipartFile file) throws IOException {
        List<Student> students = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0); // Assuming data is in the first sheet
            Iterator<Row> rows = sheet.iterator();

            boolean isFirstRow = true;
            while (rows.hasNext()) {
                Row row = rows.next();
                if (isFirstRow) {
                    isFirstRow = false; // Skip the header row
                    continue;
                }
                Student student = new Student();

                // Cell 0 - NumApoge (Integer)
                Cell cell0 = row.getCell(0);
                if (cell0 != null && cell0.getCellType() == CellType.NUMERIC) {
                    student.setNumApoge((int) cell0.getNumericCellValue());
                }

                // Cell 1 - FirstName (String)
                Cell cell1 = row.getCell(1);
                if (cell1 != null && cell1.getCellType() == CellType.STRING) {
                    student.setFirstName(cell1.getStringCellValue());
                }

                // Cell 2 - LastName (String)
                Cell cell2 = row.getCell(2);
                if (cell2 != null && cell2.getCellType() == CellType.STRING) {
                    student.setLastName(cell2.getStringCellValue());
                }

                // Cell 3 - Email (String)
                Cell cell3 = row.getCell(3);
                if (cell3 != null && cell3.getCellType() == CellType.STRING) {
                    student.setEmail(cell3.getStringCellValue());
                }
                Cell cell4 = row.getCell(4);
                if (cell4 != null && cell4.getCellType() == CellType.NUMERIC) {
                    student.setLevel((int) cell4.getNumericCellValue());
                }

                students.add(student);
            }
        }

        return students;
    }



    public void addQuestionsFromExcelAndImages(MultipartFile excelFile, MultipartFile[] imageFiles) throws IOException {
        Map<String, byte[]> imageMap = new HashMap<>();
        // Save images to a map
        for (MultipartFile imageFile : imageFiles) {
            String filePath = imageFile.getOriginalFilename();

            if (filePath != null) {
                String fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
                System.out.println(fileName);
                imageMap.put(fileName, imageFile.getBytes());
            }
        }

        // Process Excel file
        try (Workbook workbook = new XSSFWorkbook(excelFile.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            boolean isFirstRow = true;
            while (rows.hasNext()) {
                Row row = rows.next();
                if (isFirstRow) {
                    isFirstRow = false; // Skip header row
                    continue;
                }

                String chapterName = row.getCell(5).getStringCellValue();
                String courseName = row.getCell(4).getStringCellValue();
                Optional<CoursDocument> coursDocument = courseRepository.findByCourseName(courseName);
//                System.out.println(coursDocument);
                FileClass chapter = getChapterFromCourse(chapterName, courseName);
                System.out.println(chapter.getChapter());
                FileClass fileDocument;
                if (chapter != null) {
                    fileDocument = chapter;
                } else {
                    fileDocument = new FileClass();
                    fileDocument.setChapter("");
                    fileDocument.setContentType("");
                    fileDocument.setChapter(chapterName);

                    fileDocument.setObjectifs("");
                    fileDocument.setPlan("");
                    fileDocument.setIntroduction("");
                    fileDocument.setConclusion("");
                    fileDocument.setVisible(true);
                }

                List<Question> questions = chapter.getQuestions() != null ? chapter.getQuestions() : new ArrayList<>();

                Question question = new Question();
                question.setNumQuestion((int) row.getCell(0).getNumericCellValue());
                question.setQuestion(row.getCell(1).getStringCellValue());
                question.setResponse(row.getCell(2).getStringCellValue());

                // Handle image
                String imagePath = row.getCell(3).getStringCellValue();
                System.out.println(imagePath);
                System.out.println(imageMap);
                if (imageMap.containsKey(imagePath)) {
                    question.setImageContent(Base64.getEncoder().encodeToString(imageMap.get(imagePath)));
                } else {
                    question.setImageContent(""); // or handle missing image
                }
                System.out.println(chapter);
                questions.add(question);
                chapter.setQuestions(questions);

//                chapter.get().getQuestions().add(question);
                coursDocument.get().getChapterByChapterName(chapterName).setQuestions(questions);
                courseRepository.save(coursDocument.get());
            }
        }
    }


    public List<Question> getAllQuestions() {
        List<Question> allQuestions = new ArrayList<>();
        List<CoursDocument> allDocuments = courseRepository.findAll();

        for (CoursDocument fileDocument : allDocuments) {
            String courseName = fileDocument.getCourseName();
            for (FileClass file : fileDocument.getChapters()){
                String chapterName = file.getChapter();
                List<Question> questions = file.getQuestions();
                System.out.println(questions);
//                System.out.println("Chapter: " + chapterName);
//
//                System.out.println("Questions: " + (questions != null ? questions.size() : 0));

                if (questions != null) {
                    for (Question question : questions) {
                        question.setCourse(courseName);
                        question.setChapter(chapterName);
                        // Log les valeurs des questions
//                        System.out.println("NumQuestion: " + question.getNumQuestion());
//                        System.out.println("Question: " + question.getQuestion());
//                        System.out.println("Response: " + question.getResponse());
                        allQuestions.add(question);
                    }
                }
            }


        }

        return allQuestions;
    }


    public void deleteAllQuestions() {
        // Fetch all course documents
        List<CoursDocument> allDocuments = courseRepository.findAll();

        for (CoursDocument fileDocument : allDocuments) {
            // Iterate over each chapter in the course document
            for (FileClass file : fileDocument.getChapters()) {
//                file.getQuestions().clear();


                 fileDocument.getChapterByChapterName(file.getChapter()).setQuestions(new ArrayList<>());
            }

            courseRepository.save(fileDocument);
        }
    }


 public void addQuestionToChapter(String courseName, String chapterName, int numQuestion, String questionText, String responseText, MultipartFile imagePath) throws IOException {
     // Validate parameters
     if (chapterName == null || chapterName.trim().isEmpty() || questionText == null || questionText.trim().isEmpty() || responseText == null || responseText.trim().isEmpty()) {
         throw new IllegalArgumentException("Chapter name, question text, and response text must not be empty.");
     }

     // Find or create the FileDocument for the chapter
     Optional<CoursDocument> coursDocument = courseRepository.findByCourseName(courseName);
//                System.out.println(coursDocument);
     FileClass chapter = getChapterFromCourse(chapterName, courseName);
     FileClass fileDocument;
     if (chapter != null) {
         fileDocument = chapter;
     } else {
         fileDocument = new FileClass();
         fileDocument.setContentType("");
         fileDocument.setChapter(chapterName);

         fileDocument.setObjectifs("");
         fileDocument.setPlan("");
         fileDocument.setIntroduction("");
         fileDocument.setConclusion("");
         fileDocument.setVisible(true);
     }
     // Initialize the list of questions if null
     if (fileDocument.getQuestions() == null) {
         fileDocument.setQuestions(new ArrayList<>());
     }

     // Check if a question with the same number already exists
     Optional<Question> existingQuestion = fileDocument.getQuestions().stream()
             .filter(q -> q.getNumQuestion().equals(numQuestion))
             .findFirst();
     if (existingQuestion.isPresent()) {
         throw new IllegalArgumentException("A question with the same number already exists.");
     }
     List<Question> questions = chapter.getQuestions() != null ? chapter.getQuestions() : new ArrayList<>();

     // Create a new question and add it to the list
     Question question = new Question();
     question.setNumQuestion(numQuestion);
     question.setQuestion(questionText);
     question.setResponse(responseText);
     question.setImageContent(Base64.getEncoder().encodeToString(imagePath.getBytes()));


     questions.add(question);

     coursDocument.get().getChapterByChapterName(chapterName).setQuestions(questions);
     courseRepository.save(coursDocument.get());
 }








    public void updateQuestion(String courseName, String chapterName, int questionNumber, String newQuestionText, String newResponseText, String newImageContent) {
        // Validation des paramètres
        if (courseName == null || courseName.trim().isEmpty() || chapterName == null || chapterName.trim().isEmpty() || newQuestionText == null || newQuestionText.trim().isEmpty() || newResponseText == null || newResponseText.trim().isEmpty()) {
            throw new IllegalArgumentException("course name , Chapter name, new question text, and new response text must not be empty.");
        }
        Optional<CoursDocument> coursDocument = courseRepository.findByCourseName(courseName);

        // Chercher le document par le nom du chapitre
        FileClass file = getChapterFromCourse(chapterName,courseName);

        if (file != null) {
            List<Question> questions = file.getQuestions();

            if (questions != null) {
                // Trouver la question à mettre à jour
                for (Question question : questions) {
                    if (question.getNumQuestion() == questionNumber) {
                        // Mettre à jour les propriétés de la question
                        question.setQuestion(newQuestionText);
                        question.setResponse(newResponseText);
                        question.setImageContent(newImageContent);
                        coursDocument.get().getChapterByChapterName(chapterName).setQuestions(questions);
                        courseRepository.save(coursDocument.get());
                        return;
                    }
                }

                throw new ResourceNotFoundException("Question with number " + questionNumber + " not found in chapter " + chapterName);
            } else {
                throw new ResourceNotFoundException("No questions found in chapter " + chapterName);
            }
        } else {
            throw new ResourceNotFoundException("Document not found for chapter " + chapterName);
        }
    }

    public ResponseEntity<Question> getQuestionByCourseAndChapterAndNumber(String courseName, String chapterName, int questionNumber) {
        FileClass file = getChapterFromCourse(chapterName, courseName);

        if (file != null) {

            List<Question> questions = file.getQuestions();

            if (questions != null) {
                for (Question question : questions) {
                    if (question.getNumQuestion() == questionNumber) {
                        question.setCourse(courseName);
                        question.setChapter(chapterName);
                        return ResponseEntity.ok(question);
                    }
                }
            }
        }

        return ResponseEntity.notFound().build();
    }


public List<String> getAllChapters(){
    List<String> allChapters = new ArrayList<>();
    List<CoursDocument> allDocuments = courseRepository.findAll();

    for (CoursDocument fileDocument : allDocuments) {
        for (FileClass file : fileDocument.getChapters()){
            allChapters.add(file.getChapter());
        }
    }
    return allChapters;
}

    public void deleteQuestionFromChapter(String courseName, String chapterName, int questionNumber) {

        if (courseName == null || courseName.trim().isEmpty() || chapterName == null || chapterName.trim().isEmpty()) {
            throw new IllegalArgumentException("Course name or Chapter name must not be empty.");
        }
        Optional<CoursDocument> coursDocument = courseRepository.findByCourseName(courseName);

        FileClass file = getChapterFromCourse(chapterName,courseName);


        if (file != null) {
            List<Question> questions = file.getQuestions();

            if (questions != null) {
                boolean questionRemoved = questions.removeIf(question -> question.getNumQuestion() == questionNumber);


                        if (questionRemoved) {
                            coursDocument.get().getChapterByChapterName(chapterName).setQuestions(questions);
                            courseRepository.save(coursDocument.get());
                        }
                        else {
                            throw new ResourceNotFoundException("Question with number " + questionNumber + " not found in chapter " + chapterName);
                        }



            } else {
                throw new ResourceNotFoundException("No questions found in chapter " + chapterName);
            }
        } else {
            throw new ResourceNotFoundException("Document not found for chapter " + chapterName);
        }


    }

    public static void convertPptToPdf(InputStream pptInputStream, ByteArrayOutputStream pdfOutputStream) throws IOException {
        SlideShow<?, ?> ppt = new XMLSlideShow(pptInputStream);
        Dimension pgsize = ppt.getPageSize();
        PDDocument pdfDoc = new PDDocument();

        for (XSLFSlide slide : ((XMLSlideShow) ppt).getSlides()) {
            BufferedImage img = new BufferedImage(pgsize.width, pgsize.height, BufferedImage.TYPE_INT_RGB);
            Graphics2D graphics = img.createGraphics();
            // Clear the drawing area
            graphics.setPaint(java.awt.Color.white);
            graphics.fill(new java.awt.Rectangle(0, 0, pgsize.width, pgsize.height));


            slide.draw(graphics);

            // Add the image to the PDF document
            PDPage page = new PDPage(new org.apache.pdfbox.pdmodel.common.PDRectangle(pgsize.width, pgsize.height));
            pdfDoc.addPage(page);
            PDImageXObject pdImage = PDImageXObject.createFromByteArray(pdfDoc, convertBufferedImageToByteArray(img), "slide");
            PDPageContentStream contentStream = new PDPageContentStream(pdfDoc, page);
            contentStream.drawImage(pdImage, 0, 0, pgsize.width, pgsize.height);
            contentStream.close();
        }
        pdfDoc.save(pdfOutputStream);
        pdfDoc.close();
    }






     private static byte[] convertBufferedImageToByteArray(BufferedImage image) throws IOException {
         ByteArrayOutputStream baos = new ByteArrayOutputStream();
       ImageIO.write(image, "png", baos);
       return baos.toByteArray();
   }
}
