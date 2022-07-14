package com.deskover.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.server.ResponseStatusException;

import com.deskover.entity.Product;
import com.deskover.service.ProductService;

@RequestMapping("shop")
@Controller
public class ShopController {
	
	@Autowired
	private ProductService pservice;
	
	@GetMapping("item")
	public String item(@RequestParam("id") String id, Model model) {
		if(id.isBlank()) return "redirect:index";
		
		try {
			Product product = pservice.findById(Long.parseLong(id));
			model.addAttribute("product", product);
		} catch (Exception e) {
			 throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
		}
		
		return "item";
	}
	
}
