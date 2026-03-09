package com.example.inventory.service;

import com.example.inventory.model.Product;
import org.springframework.ai.chat.ChatClient;
import org.springframework.ai.chat.ChatResponse;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.SystemPromptTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ProductService productService;
    private final ChatClient chatClient;

    @Autowired
    public ChatService(ProductService productService, ChatClient chatClient) {
        this.productService = productService;
        this.chatClient = chatClient;
    }

    public String processMessage(String message) {
        List<Product> products = productService.getAllProducts();
        
        String inventoryContext = products.isEmpty() ? "The inventory is currently empty." :
            products.stream()
                .map(p -> String.format("- %s (SKU: %s): %d units in stock, Price: $%.2f. Description: %s", 
                    p.getName(), p.getSku(), p.getQuantity(), p.getPrice(), p.getDescription()))
                .collect(Collectors.joining("\n"));

        String systemPromptText = """
                You are a helpful and intelligent AI assistant for an Inventory Management System. 
                Your primary role is to answer user questions about their current inventory.
                
                Here is the real-time data of the current inventory:
                {inventoryContext}
                
                Please answer the user's questions based ONLY on this provided inventory data. 
                If the user asks about something not related to inventory, politely decline and remind them of your purpose.
                If they ask about a product that is not in the list, inform them it is out of stock or not currently tracked.
                Keep your answers concise, professional, and directly address the user's inquiry.
                """;
                
        SystemPromptTemplate systemPromptTemplate = new SystemPromptTemplate(systemPromptText);
        Message systemMessage = systemPromptTemplate.createMessage(Map.of("inventoryContext", inventoryContext));
        Message userMessage = new UserMessage(message);
        
        Prompt prompt = new Prompt(List.of(systemMessage, userMessage));
        
        try {
            ChatResponse response = chatClient.call(prompt);
            return response.getResult().getOutput().getContent();
        } catch (Exception e) {
            System.err.println("Error calling AI: " + e.getMessage());
            return "I'm sorry, I'm currently experiencing issues connecting to my AI brain. Please try again later. (Error: " + e.getMessage() + ")";
        }
    }
}
