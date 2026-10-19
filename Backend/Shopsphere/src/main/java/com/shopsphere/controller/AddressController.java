
package com.shopsphere.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.shopsphere.dto.AddressRequest;
import com.shopsphere.dto.AddressResponse;
import com.shopsphere.entity.Address;
import com.shopsphere.entity.User;
import com.shopsphere.repository.UserRepository;
import com.shopsphere.service.AddressService;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    @Autowired
    private AddressService addressService;

    @Autowired
    private UserRepository userRepository;

    private Long getUserId(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        return user.getId();
    }

    private Address toEntity(AddressRequest request) {
        Address address = new Address();

        address.setFullName(request.getFullName());
        address.setPhone(request.getPhone());
        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setLandmark(request.getLandmark());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPincode(request.getPincode());

        return address;
    }

    private AddressResponse toResponse(Address address) {
        AddressResponse response = new AddressResponse();

        response.setId(address.getId());
        response.setFullName(address.getFullName());
        response.setPhone(address.getPhone());
        response.setAddressLine1(address.getAddressLine1());
        response.setAddressLine2(address.getAddressLine2());
        response.setLandmark(address.getLandmark());
        response.setCity(address.getCity());
        response.setState(address.getState());
        response.setPincode(address.getPincode());

        return response;
    }

    @PostMapping
    public ResponseEntity<AddressResponse> addAddress(
            Principal principal,
            @RequestBody AddressRequest request) {

        Address saved = addressService.addAddress(
                getUserId(principal), toEntity(request));

        return ResponseEntity.ok(toResponse(saved));
    }

    @GetMapping
    public ResponseEntity<List<AddressResponse>> getAddresses(
            Principal principal) {

        List<AddressResponse> addresses = addressService
                .getUserAddresses(getUserId(principal))
                .stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(addresses);
    }

    @GetMapping("/{addressId}")
    public ResponseEntity<AddressResponse> getAddress(
            Principal principal,
            @PathVariable Long addressId) {

        Address address = addressService.getAddressById(
                getUserId(principal), addressId);

        return ResponseEntity.ok(toResponse(address));
    }

    @PutMapping("/{addressId}")
    public ResponseEntity<AddressResponse> updateAddress(
            Principal principal,
            @PathVariable Long addressId,
            @RequestBody AddressRequest request) {

        Address updated = addressService.updateAddress(
                getUserId(principal),
                addressId,
                toEntity(request));

        return ResponseEntity.ok(toResponse(updated));
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<Void> deleteAddress(
            Principal principal,
            @PathVariable Long addressId) {

        addressService.deleteAddress(getUserId(principal), addressId);

        return ResponseEntity.noContent().build();
    }
}
