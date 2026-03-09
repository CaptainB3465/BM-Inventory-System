package com.example.inventory.controller;

import com.example.inventory.model.ChatMessage;
import com.example.inventory.model.ChatResponse;
import com.example.inventory.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    @Autowired
    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ChatResponse chat(@RequestBody ChatMessage message) {
        String reply = chatService.processMessage(message.getMessage());
        return new ChatResponse(reply);
    }
}
