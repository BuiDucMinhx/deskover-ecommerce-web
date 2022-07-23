package com.deskover.api.app;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.deskover.service.UserAddressService;

@RestController
@RequestMapping("v1/api/custumer")
public class UserAppApi {
	@Autowired
	private UserAddressService contactService;
	
	@GetMapping("/user/address")
	public ResponseEntity<?> doGetAddress(){
		try {
//			Order order = new Order();
//			OrderItem orderItem = new OrderItem();
//			List<OrderItem> items = new ArrayList<OrderItem>();
//			items.add(orderItem);
//			OrderDetail detail = new OrderDetail();
//			AddOrderResponse addOrderResponse = new AddOrderResponse();
//			addOrderResponse.setOrder(order);
//			addOrderResponse.setItem(items);
//			addOrderResponse.setAddress(detail);
			return ResponseEntity.ok(contactService.findByUsername("minhbd"));
		} catch (Exception e) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(),e);
		}
	}
	
	@PutMapping("/user/address/{id}")
	public ResponseEntity<?> changeActive(@PathVariable("id") Long id){
		try {
			contactService.changeActive(id, "minhbd");
			return ResponseEntity.ok(contactService.findByUsername("minhbd"));
		} catch (Exception e) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(),e);
		}
	}
	
}
