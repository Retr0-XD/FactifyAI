package com.jpa.factifybackend.Controller;

import com.jpa.factifybackend.DTO.RequestType;
import com.jpa.factifybackend.Service.BackendService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/analyze")
public class BackendController {

    @Autowired
    BackendService backendService;


    @PostMapping(value = "/text", headers = "Accept=application/json")
    public ResponseEntity<String> textRequest(@RequestBody RequestType textRequest){

        if(textRequest.getText().equals("") || textRequest.getEnableOptions().isEmpty() || textRequest.getApikey().equals("")){

            //System.out.println(textRequest.toString() + textRequest.getText().equals("") + textRequest.getEnableOptions().isEmpty() + textRequest.getApikey().equals(""));

            return new  ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        return new ResponseEntity<>(backendService.textOutput(textRequest), HttpStatus.OK);
    }


    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> imageRequest(@RequestParam("file") MultipartFile file, @RequestParam("apikey") String apikey, @RequestParam("model") String model, @RequestParam("text") String text ){

        if(text.equals("") || file.isEmpty() || apikey.equals("")){

            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        ByteArrayResource resource = new ByteArrayResource(text.getBytes()){
            @Override
            public String getFilename() {
                return "text.jpeg";
            }
        };

        return new ResponseEntity<>(backendService.imageOutput(resource, apikey, model, text), HttpStatus.OK);
    }


    @GetMapping("/health")
    public ResponseEntity<?> healthRequest(){

        return new ResponseEntity<>("", HttpStatus.OK);
    }

}
