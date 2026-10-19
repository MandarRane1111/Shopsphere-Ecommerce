
package com.shopsphere.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.shopsphere.entity.Address;
import com.shopsphere.entity.User;
import com.shopsphere.repository.AddressRepository;
import com.shopsphere.repository.UserRepository;

@Service
public class AddressService {

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private UserRepository userRepository;

    // Add new delivery address
    public Address addAddress(Long userId, Address address) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        address.setId(null);
        address.setUser(user);

        return addressRepository.save(address);
    }

    // Get all addresses of a customer
    public List<Address> getUserAddresses(Long userId) {

        return addressRepository.findByUserId(userId);
    }

    // Get a specific address belonging to the customer
    public Address getAddressById(Long userId, Long addressId) {

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Address not found"));

        if (!address.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }

        return address;
    }

    // Update delivery address
    public Address updateAddress(
            Long userId, Long addressId, Address updatedAddress) {

        Address address = getAddressById(userId, addressId);

        address.setFullName(updatedAddress.getFullName());
        address.setPhone(updatedAddress.getPhone());
        address.setAddressLine1(updatedAddress.getAddressLine1());
        address.setAddressLine2(updatedAddress.getAddressLine2());
        address.setLandmark(updatedAddress.getLandmark());
        address.setCity(updatedAddress.getCity());
        address.setState(updatedAddress.getState());
        address.setPincode(updatedAddress.getPincode());

        return addressRepository.save(address);
    }

    // Delete delivery address
    public void deleteAddress(Long userId, Long addressId) {

        Address address = getAddressById(userId, addressId);

        addressRepository.delete(address);
    }
}
