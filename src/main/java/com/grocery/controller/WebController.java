package com.grocery.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {

    @GetMapping("/")
    public String home() {
        return "redirect:/frontend/index.html";
    }

    @GetMapping("/login")
    public String login() {
        return "redirect:/frontend/login.html";
    }

    @GetMapping("/register")
    public String register() {
        return "redirect:/frontend/register.html";
    }

    @GetMapping("/shopping")
    public String shopping() {
        return "redirect:/frontend/shopping.html";
    }

    @GetMapping("/profile")
    public String profile() {
        return "redirect:/frontend/profile.html";
    }

    @GetMapping("/delivery-dashboard")
    public String delivery() {
        return "redirect:/frontend/delivery-dashboard.html";
    }
}
