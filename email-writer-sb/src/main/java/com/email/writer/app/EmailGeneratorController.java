package com.email.writer.app;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController // Marks this class as a REST controller - handles HTTP requests and returns data directly (not views)

// Sets the base URL path for all methods in this controller
// All endpoints in this class will start with "/api.email"
@RequestMapping("/api/email")
@AllArgsConstructor
@CrossOrigin(origins = "*") //Allow from all origins
public class EmailGeneratorController {
    // This method handles HTTP POST requests to generate emails
    // @RequestBody - converts incoming JSON to EmailRequest object
    // ResponseEntity<String> - wrapper for HTTP response with status, headers, and body
     private final EmailGeneratorService emailGeneratorService;

    @PostMapping("/generate")
    // - ResponseEntity<String>: A wrapper for HTTP response (status, headers, body)
   // - @RequestBody: Tells Spring to convert incoming JSON to EmailRequest object
    public ResponseEntity<String> generateEmail(@RequestBody EmailRequest emailRequest)  {
        // Calls our service to generate the email
        String response = emailGeneratorService.generateEmailReply(emailRequest);
        // Returns HTTP 200 OK with the generated email in the response body
        return ResponseEntity.ok(response);
    }
}
