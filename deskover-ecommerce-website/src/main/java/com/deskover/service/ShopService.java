package com.deskover.service;

import java.util.List;

import com.deskover.model.entity.dto.ecommerce.BrandDTO;
import com.deskover.model.entity.dto.ecommerce.Filter;
import com.deskover.model.entity.dto.ecommerce.FlashSaleDTO;
import com.deskover.model.entity.dto.ecommerce.Item;
import com.deskover.model.entity.dto.ecommerce.ProductDTO;
import com.deskover.model.entity.dto.ecommerce.RatingDTO;
import com.deskover.model.entity.dto.ecommerce.Reviewer;
import com.deskover.model.entity.dto.ecommerce.Shop;

public interface ShopService {
	public Shop search(Filter filter);
	public ProductDTO getProduct(String slug);
	public List<Item> getRecommendList(Long category);
	public FlashSaleDTO getFlashSale();
	
	public List<Item> get4TopRate();
	public List<Item> get4TopSale();
	public List<Item> get4TopSold();
	
	public List<BrandDTO> getListBrand();
	public Reviewer getReviewer(String slug, Integer page);
}
