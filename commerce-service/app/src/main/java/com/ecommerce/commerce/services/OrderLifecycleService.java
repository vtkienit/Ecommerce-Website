package com.ecommerce.commerce.services;

import com.ecommerce.commerce.entities.Inventory;
import com.ecommerce.commerce.entities.Order;
import com.ecommerce.commerce.entities.PaymentStatus;
import com.ecommerce.commerce.entities.StockReservation;
import com.ecommerce.commerce.entities.StockReservationStatus;
import com.ecommerce.commerce.exceptions.CommerceException;
import com.ecommerce.commerce.repositories.InventoryRepository;
import com.ecommerce.commerce.repositories.StockReservationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class OrderLifecycleService {

    private final InventoryRepository inventoryRepository;
    private final StockReservationRepository reservationRepository;
    private final PaymentService paymentService;
    private final VoucherService voucherService;

    public OrderLifecycleService(
            InventoryRepository inventoryRepository,
            StockReservationRepository reservationRepository,
            PaymentService paymentService,
            VoucherService voucherService
    ) {
        this.inventoryRepository = inventoryRepository;
        this.reservationRepository = reservationRepository;
        this.paymentService = paymentService;
        this.voucherService = voucherService;
    }

    public void confirm(Order order) {
        paymentService.ensureOrderCanBeConfirmed(order);
        reservationRepository
                .findByOrderId(order.getId())
                .stream()
                .filter(reservation -> reservation.getStatus() == StockReservationStatus.ACTIVE)
                .forEach(reservation -> reservation.setStatus(StockReservationStatus.CONFIRMED));
    }

    public void cancel(Order order) {
        paymentService.cancelPendingPayment(order);
        voucherService.release(order);
        for (StockReservation reservation : reservationRepository.findByOrderId(order.getId())) {
            if (!holdsStock(reservation)) continue;

            Inventory inventory = lockInventory(reservation);
            inventory.setReservedQuantity(Math.max(
                    0,
                    inventory.getReservedQuantity() - reservation.getQuantity()
            ));
            reservation.setStatus(StockReservationStatus.RELEASED);
        }

        order.getPayments()
                .stream()
                .filter(payment -> payment.getStatus() == PaymentStatus.PENDING)
                .forEach(payment -> payment.setStatus(PaymentStatus.CANCELLED));
    }

    public void ship(Order order) {
        for (StockReservation reservation : reservationRepository.findByOrderId(order.getId())) {
            if (!holdsStock(reservation)) continue;

            Inventory inventory = lockInventory(reservation);
            if (inventory.getOnHandQuantity() < reservation.getQuantity()
                    || inventory.getReservedQuantity() < reservation.getQuantity()) {
                throw new CommerceException(
                        "Inventory is inconsistent for SKU " + inventory.getSku(),
                        HttpStatus.CONFLICT
                );
            }

            inventory.setOnHandQuantity(inventory.getOnHandQuantity() - reservation.getQuantity());
            inventory.setReservedQuantity(inventory.getReservedQuantity() - reservation.getQuantity());
            reservation.setStatus(StockReservationStatus.CONSUMED);
        }
    }

    public void deliver(Order order) {
        order.getPayments()
                .stream()
                .filter(payment -> payment.getPaymentMethod().equalsIgnoreCase("COD"))
                .filter(payment -> payment.getStatus() == PaymentStatus.PENDING)
                .forEach(payment -> payment.setStatus(PaymentStatus.PAID));
    }

    private boolean holdsStock(StockReservation reservation) {
        return reservation.getStatus() == StockReservationStatus.ACTIVE
                || reservation.getStatus() == StockReservationStatus.CONFIRMED;
    }

    private Inventory lockInventory(StockReservation reservation) {
        return inventoryRepository
                .findByVariantIdForUpdate(reservation.getInventory().getVariantId())
                .orElseThrow(() -> new CommerceException("Inventory not found", HttpStatus.CONFLICT));
    }
}
