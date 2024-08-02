package com.crackit.SpringSecurityJWT.service;

import com.crackit.SpringSecurityJWT.user.FileDocument;
import com.crackit.SpringSecurityJWT.user.Question;
import com.crackit.SpringSecurityJWT.user.QuestionDTO;
import com.crackit.SpringSecurityJWT.user.Student;
import com.crackit.SpringSecurityJWT.user.repository.FileDocumentRepository;
import com.crackit.SpringSecurityJWT.user.repository.QuestionRepository;
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
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.List;

@Service
public class FileService {

    @Autowired
    private GridFSBucket gridFSBucket;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private FileDocumentRepository fileRepository;
    private static final String UPLOAD_Image_DIR = "uploads/images/";

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

    public void updateVisibility(String courseId, boolean isVisibleToStudents) {
        Optional<FileDocument> optionalCourse = fileRepository.findById(courseId);
        if (optionalCourse.isPresent()) {
            FileDocument course = optionalCourse.get();
            course.setIsVisible(isVisibleToStudents);
            fileRepository.save(course);
        } else {
            throw new ResourceNotFoundException("Course not found with id: " + courseId);
        }
    }


    // ouverture de fichier excel , recuperation des questions , ajouts aux document selon le nom de chapitre qu' on
    // l' extrait de la 4 emme colonne
    public void addQuestionsFromExcel(MultipartFile file) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
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
                Optional<FileDocument> optionalFileDocument = fileRepository.findByChapter(chapterName);

                FileDocument fileDocument;
                if (optionalFileDocument.isPresent()) {
                    fileDocument = optionalFileDocument.get();
                } else {
                    // Create a new FileDocument if none is found
                    fileDocument = new FileDocument();
                    fileDocument.setFileName(""); // Set default values or leave empty
                    fileDocument.setContentType(""); // Set default values or leave empty
                    fileDocument.setChapter(chapterName);
                    fileDocument.setCourse(""); // Set default values or leave empty
                    fileDocument.setObjectifs("");
                    fileDocument.setPlan("");
                    fileDocument.setIntroduction("");
                    fileDocument.setConclusion("");
                    fileDocument.setIsVisible(true); // Default visibility
                }

                List<Question> questions = fileDocument.getQuestions() != null ? fileDocument.getQuestions() : new ArrayList<>();

                Question question = new Question();
                question.setNumQuestion((int) row.getCell(0).getNumericCellValue());
                question.setQuestion(row.getCell(1).getStringCellValue());
                question.setResponse(row.getCell(2).getStringCellValue());
                question.setImagePath(row.getCell(3).getStringCellValue());

                questions.add(question);
                fileDocument.setQuestions(questions);

                fileRepository.save(fileDocument);
            }
        }
    }
    public String encodeImageToBase64(Path imagePath) throws IOException {
        byte[] imageBytes = Files.readAllBytes(imagePath);
        return Base64.getEncoder().encodeToString(imageBytes);
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
                Optional<FileDocument> optionalFileDocument = fileRepository.findByChapter(chapterName);

                FileDocument fileDocument;
                if (optionalFileDocument.isPresent()) {
                    fileDocument = optionalFileDocument.get();
                } else {
                    fileDocument = new FileDocument();
                    fileDocument.setFileName("");
                    fileDocument.setContentType("");
                    fileDocument.setChapter(chapterName);
                    fileDocument.setCourse("");
                    fileDocument.setObjectifs("");
                    fileDocument.setPlan("");
                    fileDocument.setIntroduction("");
                    fileDocument.setConclusion("");
                    fileDocument.setIsVisible(true);
                }

                List<Question> questions = fileDocument.getQuestions() != null ? fileDocument.getQuestions() : new ArrayList<>();

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

                questions.add(question);
                fileDocument.setQuestions(questions);

                fileRepository.save(fileDocument);
            }
        }
    }




    public List<QuestionDTO> getAllQuestions() {
        List<QuestionDTO> allQuestions = new ArrayList<>();
        List<FileDocument> allDocuments = fileRepository.findAll();

        for (FileDocument fileDocument : allDocuments) {
            String chapterName = fileDocument.getChapter();
            String courseName = fileDocument.getCourse();
            List<Question> questions = fileDocument.getQuestions();


            System.out.println("Chapter: " + chapterName);
            System.out.println("Course: " + courseName);
            System.out.println("Questions: " + (questions != null ? questions.size() : 0));

            if (questions != null) {
                for (Question question : questions) {
                    // Log les valeurs des questions
                    System.out.println("NumQuestion: " + question.getNumQuestion());
                    System.out.println("Question: " + question.getQuestion());
                    System.out.println("Response: " + question.getResponse());

                    QuestionDTO questionDTO = new QuestionDTO(
                            chapterName,
                            courseName,
                            question.getNumQuestion(),
                            question.getQuestion(),
                            question.getResponse()
                    );
                    allQuestions.add(questionDTO);
                }
            }
        }

        return allQuestions;
    }

    public void deleteAllQuestions() {
        // Retrieve all FileDocuments
        List<FileDocument> allDocuments = fileRepository.findAll();

        // Iterate through each FileDocument
        for (FileDocument fileDocument : allDocuments) {
            // Get the current list of questions
            List<Question> questions = fileDocument.getQuestions();

            // Check if the list is not null and not empty
            if (questions != null && !questions.isEmpty()) {
                // Log or print the number of questions being removed (optional)
                System.out.println("Deleting " + questions.size() + " questions from document with ID: " + fileDocument.getId());

                // Clear the list of questions
                questions.clear();

                // Save the updated FileDocument
                fileRepository.save(fileDocument);
            }
        }

        // Optionally, if you have a separate repository or collection for questions,
        // you might also want to clear questions from there
        // questionRepository.deleteAll(); // Uncomment if you have a separate repository
    }

    public ByteArrayInputStream generateExcelQuestions() throws IOException {
        List<QuestionDTO> allQuestions = getAllQuestions(); // Retrieve all questions as DTOs

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Questions");

            // Create header row
            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("Chapter");
            headerRow.createCell(1).setCellValue("Course");
            headerRow.createCell(2).setCellValue("Question Number");
            headerRow.createCell(3).setCellValue("Question");
            headerRow.createCell(4).setCellValue("Response");

            // Populate the rows with question data
            int rowIndex = 1;
            for (QuestionDTO questionDTO : allQuestions) {
                Row row = sheet.createRow(rowIndex++);
                row.createCell(0).setCellValue(questionDTO.getChapter());
                row.createCell(1).setCellValue(questionDTO.getCourse());
                row.createCell(2).setCellValue(questionDTO.getNumQuestion());
                row.createCell(3).setCellValue(questionDTO.getQuestion());
                row.createCell(4).setCellValue(questionDTO.getResponse());
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return new ByteArrayInputStream(outputStream.toByteArray());
        }
    }



 //ajouter les questions manuellement
 public void addQuestionToChapter(String chapterName, int numQuestion, String questionText, String responseText, String imagePath) {
     // Validate parameters
     if (chapterName == null || chapterName.trim().isEmpty() || questionText == null || questionText.trim().isEmpty() || responseText == null || responseText.trim().isEmpty()) {
         throw new IllegalArgumentException("Chapter name, question text, and response text must not be empty.");
     }

     // Find or create the FileDocument for the chapter
     FileDocument fileDocument = fileRepository.findByChapter(chapterName)
             .orElseGet(() -> {
                 FileDocument newDocument = new FileDocument();
                 newDocument.setFileName("");
                 newDocument.setContentType("");
                 newDocument.setChapter(chapterName);
                 newDocument.setCourse("");
                 newDocument.setObjectifs("");
                 newDocument.setPlan("");
                 newDocument.setIntroduction("");
                 newDocument.setConclusion("");
                 newDocument.setIsVisible(true);
                 return newDocument;
             });

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

     // Create a new question and add it to the list
     Question question = new Question();
     question.setNumQuestion(numQuestion);
     question.setQuestion(questionText);
     question.setResponse(responseText);
     question.setImagePath(imagePath);

     // Add the question to the list of questions
     fileDocument.getQuestions().add(question);

     // Save the updated document
     fileRepository.save(fileDocument);
 }

    private String saveImage(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("File is empty");
        }

        // Define the directory where the image will be saved
        Path uploadPath = Paths.get(UPLOAD_Image_DIR);

        // Create the directory if it does not exist
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Get the original filename and define the path to save the file
        String originalFilename = file.getOriginalFilename();
        Path destinationPath = uploadPath.resolve(originalFilename);

        // Check if the file already exists
        if (Files.exists(destinationPath)) {
            // Return the existing filename without saving the file again
            return destinationPath.toString();
        }

        // Save the file
        Files.copy(file.getInputStream(), destinationPath, StandardCopyOption.REPLACE_EXISTING);

        // Return the relative path
        return destinationPath.toString();
    }

    public void updateQuestion(String chapterName, int questionNumber, String newQuestionText, String newResponseText) {
        // Validation des paramètres
        if (chapterName == null || chapterName.trim().isEmpty() || newQuestionText == null || newQuestionText.trim().isEmpty() || newResponseText == null || newResponseText.trim().isEmpty()) {
            throw new IllegalArgumentException("Chapter name, new question text, and new response text must not be empty.");
        }

        // Chercher le document par le nom du chapitre
        Optional<FileDocument> optionalFileDocument = fileRepository.findByChapter(chapterName);

        if (optionalFileDocument.isPresent()) {
            FileDocument fileDocument = optionalFileDocument.get();
            List<Question> questions = fileDocument.getQuestions();

            if (questions != null) {
                // Trouver la question à mettre à jour
                for (Question question : questions) {
                    if (question.getNumQuestion() == questionNumber) {
                        // Mettre à jour les propriétés de la question
                        question.setQuestion(newQuestionText);
                        question.setResponse(newResponseText);

                        // Sauvegarder le document mis à jour
                        fileRepository.save(fileDocument);
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



    public ResponseEntity<QuestionDTO> getQuestionByChapterAndNumber(String chapterName, int questionNumber) {
        Optional<FileDocument> optionalFileDocument = fileRepository.findByChapter(chapterName);

        if (optionalFileDocument.isPresent()) {
            FileDocument fileDocument = optionalFileDocument.get();
            List<Question> questions = fileDocument.getQuestions();

            if (questions != null) {
                for (Question question : questions) {
                    if (question.getNumQuestion() == questionNumber) {
                        QuestionDTO questionDTO = new QuestionDTO(
                                chapterName,
                                fileDocument.getCourse(),
                                question.getNumQuestion(),
                                question.getQuestion(),
                                question.getResponse()

                        );
                        return ResponseEntity.ok(questionDTO);
                    }
                }
            }
        }

        return ResponseEntity.notFound().build();
    }




    public void deleteQuestionFromChapter(String chapterName, int questionNumber) {
        // Validation des paramètres
        if (chapterName == null || chapterName.trim().isEmpty()) {
            throw new IllegalArgumentException("Chapter name must not be empty.");
        }

        // Chercher le document par le nom du chapitre
        Optional<FileDocument> optionalFileDocument = fileRepository.findByChapter(chapterName);

        if (optionalFileDocument.isPresent()) {
            FileDocument fileDocument = optionalFileDocument.get();
            List<Question> questions = fileDocument.getQuestions();

            if (questions != null) {
                // Trouver et supprimer la question correspondante
                boolean questionRemoved = questions.removeIf(question -> question.getNumQuestion() == questionNumber);

                if (questionRemoved) {
                    // Sauvegarder le document mis à jour
                    fileRepository.save(fileDocument);
                } else {
                    throw new ResourceNotFoundException("Question with number " + questionNumber + " not found in chapter " + chapterName);
                }
            } else {
                throw new ResourceNotFoundException("No questions found in chapter " + chapterName);
            }
        } else {
            throw new ResourceNotFoundException("Document not found for chapter " + chapterName);
        }
    }
    private final String uploadDir = "uploads/";

//    public void saveFile(MultipartFile file, String chapter, String course, String objectifs, String plan, String introduction, String conclusion, boolean isVisible) throws IOException {
//        Path path = Paths.get(uploadDir + file.getOriginalFilename());
//        Files.createDirectories(path.getParent());
//        Files.write(path, file.getBytes());
//
//    }
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

            // Render the slide
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
