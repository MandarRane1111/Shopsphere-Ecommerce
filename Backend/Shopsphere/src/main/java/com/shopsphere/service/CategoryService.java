package com.shopsphere.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.shopsphere.entity.Category;
import com.shopsphere.repository.CategoryRepository;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public Category addCategory(Category category) {
        return categoryRepository.save(category);
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() ->
                    new IllegalArgumentException("Category not found: " + id));
    }

    public Category updateCategory(Long id, Category category) {

        Category existing = getCategoryById(id);

        existing.setName(category.getName());
        existing.setDescription(category.getDescription());

        return categoryRepository.save(existing);
    }

    public void deleteCategory(Long id) {
        Category existing = getCategoryById(id);
        categoryRepository.delete(existing);
    }
}