package com.ecommerce.app.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class GoogleUserInfo {

    private String subject;
    private String email;
    private String name;
}
