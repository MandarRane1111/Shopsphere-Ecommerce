package com.shopsphere.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name="orders")
public class Order {
	
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long id;
	@NotNull
	@Positive
	private Double totalAmount;
	@NotBlank
	private String orderStatus;
	@NotBlank
	private String paymentMethod;
	@NotBlank
	private String paymentStatus;
	
	private String deliveryStatus = "PENDING";
	
	private String checkoutType;
	@NotNull
	private LocalDateTime orderDate;
	
	private LocalDateTime paymentConfirmedAt;
	
	// Razorpay payment details
	private String razorpayOrderId;

	private String razorpayPaymentId;

	private String razorpaySignature;
	
	@ManyToOne
	@JoinColumn(name="user_id", nullable=false)
	private User user;
	@ManyToOne
	@JoinColumn(name="address_id", nullable=false)
	private Address address;
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public Double getTotalAmount() {
		return totalAmount;
	}
	public void setTotalAmount(Double totalAmount) {
		this.totalAmount = totalAmount;
	}
	public String getOrderStatus() {
		return orderStatus;
	}
	public void setOrderStatus(String orderStatus) {
		this.orderStatus = orderStatus;
	}
	public String getPaymentMethod() {
		return paymentMethod;
	}
	public void setPaymentMethod(String paymentMethod) {
		this.paymentMethod = paymentMethod;
	}
	public String getPaymentStatus() {
		return paymentStatus;
	}
	public void setPaymentStatus(String paymentStatus) {
		this.paymentStatus = paymentStatus;
	}
	public LocalDateTime getOrderDate() {
		return orderDate;
	}
	public void setOrderDate(LocalDateTime orderDate) {
		this.orderDate = orderDate;
	}
	
	
	public String getDeliveryStatus() {
		return deliveryStatus;
	}
	public void setDeliveryStatus(String deliveryStatus) {
		this.deliveryStatus = deliveryStatus;
	}
	public LocalDateTime getPaymentConfirmedAt() {
		return paymentConfirmedAt;
	}
	public void setPaymentConfirmedAt(LocalDateTime paymentConfirmedAt) {
		this.paymentConfirmedAt = paymentConfirmedAt;
	}
	public User getUser() {
		return user;
	}
	public void setUser(User user) {
		this.user = user;
	}
	public Address getAddress() {
		return address;
	}
	public void setAddress(Address address) {
		this.address = address;
	}
	
	public String getRazorpayOrderId() {
		return razorpayOrderId;
	}
	public void setRazorpayOrderId(String razorpayOrderId) {
		this.razorpayOrderId = razorpayOrderId;
	}
	public String getRazorpayPaymentId() {
		return razorpayPaymentId;
	}
	public void setRazorpayPaymentId(String razorpayPaymentId) {
		this.razorpayPaymentId = razorpayPaymentId;
	}
	public String getRazorpaySignature() {
		return razorpaySignature;
	}
	public void setRazorpaySignature(String razorpaySignature) {
		this.razorpaySignature = razorpaySignature;
	}
	
	public String getCheckoutType() {
		return checkoutType;
	}
	public void setCheckoutType(String checkoutType) {
		this.checkoutType = checkoutType;
	}
	public Order() {
		
	}
	
	
}
