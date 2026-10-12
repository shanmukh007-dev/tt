package com.autopulse.vsm.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping(value = {
            "/login",
            "/dashboard",
            "/services",
            "/vehicles",
            "/customers",
            "/portal",
            "/portal/**"
    })
    public String forwardSpa() {
        return "forward:/index.html";
    }
}
