package com.jpa.factifybackend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RequestType {

    String text;
    Map<String, Boolean> enableOptions;
    String apikey;
    String model;

}
