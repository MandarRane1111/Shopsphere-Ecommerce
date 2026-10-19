import API_BASE_URL from "../../services/apiConfig";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  ShoppingBag,
  IndianRupee,
  CheckCircle2,
  Clock3,
  Truck,
  XCircle,
  CreditCard,
  Mail,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import "./admin-orders.css";

const API = API_BASE_URL;

const orderApi = axios.create({
  baseURL: API,
  timeout: 15000,
});

orderApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("shopsphere_admin_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const STATUS_OPTIONS = [
  "PENDING",
  "PENDING_PAYMENT",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

function getOrderId(order) {
  return order.id ?? order.orderId;
}

function getOrderStatus(order) {
  return String(
    order.orderStatus ?? order.status ?? "PENDING"
  ).toUpperCase();
}

function getPaymentMethod(order) {
  return String(
    order.paymentMethod ?? order.paymentType ?? ""
  ).toUpperCase();
}

function getPaymentStatus(order) {
  return String(
    order.paymentStatus ?? order.payment?.status ?? ""
  ).toUpperCase();
}

function isCodOrder(order) {
  const method = getPaymentMethod(order);
  return method === "COD" || method === "CASH_ON_DELIVERY";
}

function isPaymentConfirmed(order) {
  const status = getPaymentStatus(order);

  return [
    "PAID",
    "SUCCESS",
    "SUCCESSFUL",
    "COMPLETED",
    "CONFIRMED",
  ].includes(status);
}

function getCustomerName(order) {
  return (
    order.customerName ||
    order.user?.name ||
    order.customer?.name ||
    order.customer?.fullName ||
    order.deliveryAddress?.fullName ||
    order.address?.fullName ||
    "Customer"
  );
}

function getCustomerEmail(order) {
  return (
    order.customerEmail ||
    order.user?.email ||
    order.customer?.email ||
    order.deliveryAddress?.email ||
    order.address?.email ||
    "—"
  );
}

function getAmount(order) {
  return Number(
    order.totalAmount ??
      order.totalPrice ??
      order.total ??
      order.amount ??
      0
  );
}

function getDate(order) {
  const value =
    order.orderDate ?? order.createdAt ?? order.createdOn;

  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(value) {
  return `₹${Number(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function getErrorMessage(error) {
  if (error.response?.status === 401) {
    return "Your admin token is missing or expired. Please sign in again.";
  }

  if (error.response?.status === 403) {
    return "Access denied. Please sign in with an administrator account.";
  }

  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    "Something went wrong. Please try again."
  );
}

function StatusBadge({ status }) {
  const normalized = String(status || "PENDING").toUpperCase();

  let className = "ao-status-pending";
  let Icon = Clock3;

  if (normalized === "DELIVERED") {
    className = "ao-status-delivered";
    Icon = CheckCircle2;
  } else if (
    ["CONFIRMED", "PROCESSING"].includes(normalized)
  ) {
    className = "ao-status-confirmed";
    Icon = CheckCircle2;
  } else if (
    ["SHIPPED", "OUT_FOR_DELIVERY"].includes(normalized)
  ) {
    className = "ao-status-shipped";
    Icon = Truck;
  } else if (normalized === "CANCELLED") {
    className = "ao-status-cancelled";
    Icon = XCircle;
  }

  return (
    <span className={`ao-status ${className}`}>
      <Icon size={13} />
      {normalized.replaceAll("_", " ")}
    </span>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
const ORDERS_PER_PAGE = 10;

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const response = await orderApi.get("/admin/orders");

      const data = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.orders)
          ? response.data.orders
          : null;

      if (!data) {
        throw new Error(
          "The orders API returned an unexpected response format."
        );
      }

      setOrders(data);
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const id = String(getOrderId(order) ?? "");
      const customer = getCustomerName(order);
      const email = getCustomerEmail(order);
      const status = getOrderStatus(order);
      const paymentMethod = getPaymentMethod(order);
      const paymentStatus = getPaymentStatus(order);

      const matchesSearch =
        !query ||
        [id, customer, email, status, paymentMethod, paymentStatus].some(
          (value) => String(value).toLowerCase().includes(query)
        );

      const matchesStatus =
        statusFilter === "ALL" || status === statusFilter;

      const matchesPayment =
        paymentFilter === "ALL" ||
        (paymentFilter === "COD" && isCodOrder(order)) ||
        (paymentFilter === "ONLINE" && !isCodOrder(order));

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, search, statusFilter, paymentFilter]);

  const totalPages = Math.ceil(
  filteredOrders.length / ORDERS_PER_PAGE
);

const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;

const paginatedOrders = filteredOrders.slice(
  startIndex,
  startIndex + ORDERS_PER_PAGE
);

const firstOrder = filteredOrders.length === 0 ? 0 : startIndex + 1;
const lastOrder = Math.min(
  startIndex + ORDERS_PER_PAGE,
  filteredOrders.length
);

const goToPage = (page) => {
  setCurrentPage(Math.max(1, Math.min(page, totalPages)));
};

  const totalRevenue = orders.reduce(
    (total, order) => total + getAmount(order),
    0
  );

  const pendingOrders = orders.filter((order) =>
    ["PENDING", "PENDING_PAYMENT"].includes(getOrderStatus(order))
  ).length;

  const deliveredOrders = orders.filter(
    (order) => getOrderStatus(order) === "DELIVERED"
  ).length;

  const handleStatusChange = async (order, nextStatus) => {
    const id = getOrderId(order);
    const currentStatus = getOrderStatus(order);

    if (id == null || nextStatus === currentStatus) return;

    if (
      nextStatus === "CANCELLED" &&
      !window.confirm(`Cancel order #${id}?`)
    ) {
      return;
    }

    setUpdatingId(id);
    setPageError("");
    setSuccessMessage("");

    try {
      await orderApi.put(
        `/admin/orders/${encodeURIComponent(id)}/status`,
        null,
        {
          params: { status: nextStatus },
        }
      );

      setOrders((previous) =>
        previous.map((item) =>
          String(getOrderId(item)) === String(id)
            ? {
                ...item,
                status: nextStatus,
                orderStatus: nextStatus,
              }
            : item
        )
      );

      setSuccessMessage(
        `Order #${id} status updated to ${nextStatus.replaceAll("_", " ")}.`
      );

      // Refresh from the backend to reflect persisted status.
      await loadOrders();
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmPayment = async (order) => {
    const id = getOrderId(order);

    if (id == null) {
      setPageError("This order has no valid ID.");
      return;
    }

    if (!isCodOrder(order)) {
      setPageError("COD payment confirmation is only for COD orders.");
      return;
    }

    if (getOrderStatus(order) !== "DELIVERED") {
      setPageError(
        "Mark the order as DELIVERED before confirming COD payment."
      );
      return;
    }

    if (isPaymentConfirmed(order)) {
      setPageError("Payment is already confirmed for this order.");
      return;
    }

    const confirmed = window.confirm(
      `Confirm that payment for COD order #${id} has been collected? The backend may notify the customer by email.`
    );

    if (!confirmed) return;

    setConfirmingId(id);
    setPageError("");
    setSuccessMessage("");

    try {
      await orderApi.put(
        `/admin/orders/${encodeURIComponent(id)}/confirm-cod-payment`
      );

      setSuccessMessage(
        `Payment confirmation submitted for order #${id}.`
      );

      // The backend is responsible for payment persistence and email.
      await loadOrders();
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <section className="ao-page">
      <div className="ao-heading">
        <div>
          <span className="ao-eyebrow">SHOPSPHERE / MANAGEMENT</span>
          <h2>Order Management</h2>
          <p>Track orders, update delivery status, and confirm COD payments.</p>
        </div>

        <button
          type="button"
          className="ao-refresh"
          onClick={loadOrders}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh Orders
        </button>
      </div>

      {pageError && (
        <div className="ao-alert ao-alert-error" role="alert">
          <AlertCircle size={17} />
          <span>{pageError}</span>
          <button
            type="button"
            onClick={() => setPageError("")}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {successMessage && (
        <div className="ao-alert ao-alert-success" role="status">
          <CheckCircle2 size={17} />
          <span>{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      <div className="ao-stats">
        <article className="ao-stat-card">
          <div className="ao-stat-icon ao-icon-orange">
            <ShoppingBag size={21} />
          </div>
          <div>
            <span>Total Orders</span>
            <strong>{orders.length}</strong>
          </div>
        </article>

        <article className="ao-stat-card">
          <div className="ao-stat-icon ao-icon-amber">
            <Clock3 size={21} />
          </div>
          <div>
            <span>Pending Orders</span>
            <strong>{pendingOrders}</strong>
          </div>
        </article>

        <article className="ao-stat-card">
          <div className="ao-stat-icon ao-icon-green">
            <CheckCircle2 size={21} />
          </div>
          <div>
            <span>Delivered Orders</span>
            <strong>{deliveredOrders}</strong>
          </div>
        </article>

        <article className="ao-stat-card">
          <div className="ao-stat-icon ao-icon-blue">
            <IndianRupee size={21} />
          </div>
          <div>
            <span>Order Value</span>
            <strong>{formatPrice(totalRevenue)}</strong>
          </div>
        </article>
      </div>

      <div className="ao-payment-note">
        <Mail size={18} />
        <div>
          <strong>COD payment confirmation</strong>
          <p>
            Mark a COD order as Delivered first, then confirm the collected
            payment. The backend handles the payment update and customer email.
          </p>
        </div>
      </div>

      <div className="ao-toolbar">
        <div className="ao-search">
          <Search size={17} />
          <input
            type="search"
            placeholder="Search order ID, customer, email..."
            value={search}
            onChange={(event) => {
  setSearch(event.target.value);
  setCurrentPage(1);
}}
            aria-label="Search orders"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => {
  setStatusFilter(event.target.value);
  setCurrentPage(1);
}}
          aria-label="Filter by order status"
        >
          <option value="ALL">All statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>

        <select
          value={paymentFilter}
          onChange={(event) => {
  setPaymentFilter(event.target.value);
  setCurrentPage(1);
}}
          aria-label="Filter by payment method"
        >
          <option value="ALL">All payment methods</option>
          <option value="COD">Cash on Delivery</option>
          <option value="ONLINE">Online payment</option>
        </select>
      </div>

      <div className="ao-table-card">
        {loading ? (
          <div className="ao-empty">
            <RefreshCw className="ao-spin" size={25} />
            <p>Loading orders from the backend...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="ao-empty">
            <ShoppingBag size={35} />
            <h3>No orders found</h3>
            <p>Try changing the search text or filters.</p>
          </div>
        ) : (
          <div className="ao-table-scroll">
            <table className="ao-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Order Status</th>
                  <th>Update Status</th>
                  <th>Confirm COD Payment</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => {
                  const id = getOrderId(order);
                  const status = getOrderStatus(order);
                  const paymentMethod = getPaymentMethod(order);
                  const paymentStatus = getPaymentStatus(order);
                  const cod = isCodOrder(order);
                  const paid = isPaymentConfirmed(order);
                  const delivered = status === "DELIVERED";

                  return (
                    <tr key={id}>
                      <td>
                        <strong className="ao-order-id">#{id}</strong>
                      </td>

                      <td>
                        <div className="ao-customer">
                          <strong>{getCustomerName(order)}</strong>
                          <span>{getCustomerEmail(order)}</span>
                        </div>
                      </td>

                      <td>{getDate(order)}</td>

                      <td className="ao-amount">
                        {formatPrice(getAmount(order))}
                      </td>

                      <td>
                        <div className="ao-payment-cell">
                          <span>
                            {paymentMethod.replaceAll("_", " ") || "—"}
                          </span>
                          {paymentStatus ? (
                            <small
                              className={
                                paid ? "ao-payment-paid" : "ao-payment-unpaid"
                              }
                            >
                              {paymentStatus.replaceAll("_", " ")}
                            </small>
                          ) : (
                            <small className="ao-payment-unpaid">
                              {cod ? "Awaiting collection" : "Status unavailable"}
                            </small>
                          )}
                        </div>
                      </td>

                      <td>
                        <StatusBadge status={status} />
                      </td>

                      <td>
                        <select
                          className="ao-status-select"
                          value={status}
                          disabled={updatingId === id || confirmingId === id}
                          onChange={(event) =>
                            handleStatusChange(order, event.target.value)
                          }
                          aria-label={`Update order ${id} status`}
                        >
                          {!STATUS_OPTIONS.includes(status) && (
                            <option value={status}>
                              {status.replaceAll("_", " ")}
                            </option>
                          )}

                          {STATUS_OPTIONS.map((option) => (
                            <option
                              key={option}
                              value={option}
                              disabled={
                                status === "CANCELLED" && option !== status
                              }
                            >
                              {option.replaceAll("_", " ")}
                            </option>
                          ))}
                        </select>

                        {updatingId === id && (
                          <small className="ao-row-progress">
                            Updating...
                          </small>
                        )}
                      </td>

                      <td>
                        {cod ? (
                          paid ? (
                            <span className="ao-payment-confirmed">
                              <CheckCircle2 size={15} />
                              Confirmed
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="ao-confirm-button"
                              disabled={
                                !delivered ||
                                confirmingId === id ||
                                updatingId === id
                              }
                              title={
                                delivered
                                  ? "Confirm cash collected"
                                  : "Mark as Delivered first"
                              }
                              onClick={() => handleConfirmPayment(order)}
                            >
                              {confirmingId === id ? (
                                <>
                                  <RefreshCw
                                    size={14}
                                    className="ao-spin"
                                  />
                                  Confirming...
                                </>
                              ) : (
                                <>
                                  <CreditCard size={14} />
                                  Confirm Payment
                                </>
                              )}
                            </button>
                          )
                        ) : (
                          <span className="ao-not-applicable">Not required</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredOrders.length > 0 && (
  <div className="ao-table-footer ao-pagination">
    <span>
      Showing {firstOrder}–{lastOrder} of {filteredOrders.length} orders
    </span>

    <div className="ao-pagination-controls">
      <button
        type="button"
        className="ao-page-button"
        disabled={currentPage === 1}
        onClick={() => goToPage(currentPage - 1)}
      >
        Previous
      </button>

      
{(() => {
  const pages = new Set();

  pages.add(1);
  pages.add(totalPages);

  for (
    let page = Math.max(1, currentPage - 2);
    page <= Math.min(totalPages, currentPage + 2);
    page++
  ) {
    pages.add(page);
  }

  const visiblePages = [...pages].sort((a, b) => a - b);

  return visiblePages.map((page, index) => {
    const previousPage = visiblePages[index - 1];

    return (
      <span key={page} className="ao-page-group">
        {previousPage && page - previousPage > 1 && (
          <span className="ao-page-ellipsis">...</span>
        )}

        <button
          type="button"
          className={`ao-page-button ${
            currentPage === page ? "active" : ""
          }`}
          aria-current={currentPage === page ? "page" : undefined}
          onClick={() => goToPage(page)}
        >
          {page}
        </button>
      </span>
    );
  });
})()}


      <button
        type="button"
        className="ao-page-button"
        disabled={currentPage >= totalPages}
        onClick={() => goToPage(currentPage + 1)}
      >
        Next
      </button>
    </div>
  </div>
)}
      </div>
    </section>
  );
}
