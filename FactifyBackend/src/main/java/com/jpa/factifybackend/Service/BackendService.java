package com.jpa.factifybackend.Service;

import com.jpa.factifybackend.DTO.RequestType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.buffer.DataBufferFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserter;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.servlet.View;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
public class BackendService {

    private final View error;

    public BackendService(View error) {
        this.error = error;
    }


    public String textOutput(RequestType requestType) {


        //System.out.println(requestType.toString());

        String endpoint = "https://api-inference.huggingface.co/models/"+ requestType.getModel();

        WebClient client = WebClient.builder().defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + requestType.getApikey())
                .build();

        Mono<String> response = client.post().uri(endpoint)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestType.getText())
                .retrieve()
                .bodyToMono(String.class)
                .onErrorResume(e -> {
                    System.out.println("Error: " + e.getMessage());
                    return Mono.just("Error: " + e.getMessage());
                });

        String result = response.block();
        return result;
    }

    public String imageOutput(ByteArrayResource resource, String apikey, String model, String text) {

        String endpoint = "https://api-inference.huggingface.co/models/"+ model;

        WebClient client = WebClient.builder().defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apikey)
                .build();

        Mono<String> response = client.post().uri(endpoint)
                .contentType(MediaType.IMAGE_JPEG)
                .bodyValue(BodyInserters.fromResource(resource))
                .retrieve()
                .bodyToMono(String.class)
                .onErrorResume(e -> {
                    System.out.println("Error: " + e.getMessage());
                    return Mono.just("Error: " + e.getMessage());
                });

        String result = response.block();
        return result;
    }


}
