package com.ecommerce.app.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RefreshTokenData {

    private Long userId;
    private boolean persistent;
}
