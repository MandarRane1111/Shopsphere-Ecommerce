package com.shopsphere.event;

public class OrderEmailEvent {
	
	public OrderEmailEvent(
	        Long orderId,
	        String recipientEmail,
	        String emailType) {

	    this.orderId = orderId;
	    this.recipientEmail = recipientEmail;
	    this.emailType = emailType;
	}
	
	Long orderId;
    String recipientEmail;
    String emailType;
	 public Long getOrderId() {
		 return orderId;
	 }
	 public void setOrderId(Long orderId) {
		 this.orderId = orderId;
	 }
	 public String getRecipientEmail() {
		 return recipientEmail;
	 }
	 public void setRecipientEmail(String recipientEmail) {
		 this.recipientEmail = recipientEmail;
	 }
	 public String getEmailType() {
		 return emailType;
	 }
	 public void setEmailType(String emailType) {
		 this.emailType = emailType;
	 }
    

}
