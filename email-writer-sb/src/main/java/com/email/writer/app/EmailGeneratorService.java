package com.email.writer.app;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class EmailGeneratorService {

    private final WebClient webClient;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public EmailGeneratorService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String generateEmailReply(EmailRequest emailRequest) {
         //Build the prompt
          String prompt = buildPrompt(emailRequest);

         // Craft a request
          Map<String, Object> requestBody = Map.of(
                "contents", new Object[] {
                      Map.of("parts", new Object[]{
                              Map.of("text", prompt )
                      })
                }
          );
        // Make the HTTP POST request to Gemini API
          String response = webClient.post()   // 1. Initiates a POST HTTP request
                  .uri(geminiApiUrl + geminiApiKey) // 2. Specifies where to send the request
                  .header("Content-Type","application/json" )// 3. Tells the API we're sending JSON
                  .bodyValue(requestBody)// 4. Adds our data (the prompt) to the request
                  .retrieve()// 5. Starts getting the response
                  .bodyToMono(String.class)// 6. Converts response to a reactive typ
                  .block();// 7. Waits for the response


        //Extract Response and Return response
        return extractResponseContent(response);


    }

    // Helper method to extract content from Gemini API response
    private String extractResponseContent(String response) {
        try{
            // Create JSON parser
            ObjectMapper mapper = new ObjectMapper();
            // Parse the response string to JSON
            JsonNode rootNode = mapper.readTree(response);
            // Navigate through the JSON structure to get the generated text
            return rootNode.path("candidates")
                    .get(0)    // Get first candidate
                    .path("content")  // Get content object
                    .path("parts") // Get parts array
                    .get(0) // Get first part
                    .path("text") // Get text field
                    .asText(); // Convert to String
        } catch(Exception e){
            // Return error message if parsing fails
            return "Error processing request: " + e.getMessage();
        }
    }

    private String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt = new StringBuilder("Generate a professional email reply for the following email content. Please do not generate a subject line: ");
        if(emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()){
            prompt.append("Use a").append(emailRequest.getTone()).append("tone .");
        }
        prompt.append("\nOriginal email: \n").append(emailRequest.getEmailContent());
        return prompt.toString();
    }
}
