
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  XCircle,
  Download,
} from "lucide-react";
import jsPDF from "jspdf";
import {
  getMyOrders,
  cancelMyOrder,
  downloadInvoice
} from "../services/checkoutApi";

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      try {
        const data = await getMyOrders();

        if (active) {
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Unable to load orders:", err);

        if (active) {
          setError("Unable to load your orders.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      active = false;
    };
  }, []);

  const sortedOrders = orders
  .filter(
    (order) =>
      String(order.orderStatus || "").toUpperCase() !== "CANCELLED"
  )
  .sort(
    (a, b) =>
      new Date(b.orderDate).getTime() -
      new Date(a.orderDate).getTime()
  );

  const canCancelOrder = (order) => {
    const status = String(order.orderStatus || "").toUpperCase();
    const method = String(order.paymentMethod || "").toUpperCase();
    const paymentStatus = String(
      order.paymentStatus || ""
    ).toUpperCase();

    // COD orders can be cancelled before shipping.
    if (method === "COD" && status === "CONFIRMED") {
      return true;
    }

    // Unpaid online orders can be cancelled before expiry.
    if (
      method === "ONLINE" &&
      status === "PENDING_PAYMENT" &&
      paymentStatus === "PENDING"
    ) {
      return true;
    }

    return false;
  };

  const handleCancelOrder = async (order) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel order #${order.orderId}?`
    );

    if (!confirmed) return;

    setCancellingId(order.orderId);
    setError("");

    try {
      await cancelMyOrder(order.orderId);

      // Keep the cancelled order visible in order history.
      setOrders((previousOrders) =>
        previousOrders.map((item) =>
          item.orderId === order.orderId
            ? {
                ...item,
                orderStatus: "CANCELLED",
              }
            : item
        )
      );

      window.alert(`Order #${order.orderId} cancelled successfully.`);
    } catch (err) {
      console.error("Unable to cancel order:", err);

      window.alert(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to cancel this order. Please refresh and try again."
      );
    } finally {
      setCancellingId(null);
    }
  };

  const handleDownloadInvoice = async (order) => {
  if (String(order.orderStatus || "").toUpperCase() !== "DELIVERED") {
    return;
  }

  try {
    await downloadInvoice(order.orderId);
  } catch (error) {
    console.error("Unable to download invoice:", error);
    alert(
      "Unable to download the invoice. Please try again."
    );
  }
};

  return (
    <main
      className="container py-4"
      style={{ maxWidth: "900px", minHeight: "70vh" }}
    >
      <button
        type="button"
        onClick={() => navigate("/account")}
        className="btn btn-link text-decoration-none px-0 mb-3"
        style={{ color: "#ff6b00" }}
      >
        <ArrowLeft size={18} className="me-2" />
        Back to My Account
      </button>

      <h2 className="fw-bold mb-2">
        <Package size={28} className="me-2" />
        My Orders
      </h2>

      <p className="text-secondary mb-4">
        View your complete ShopSphere order history.
      </p>

      {loading ? (
        <p>Loading orders...</p>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : sortedOrders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        <>
          <p className="fw-semibold">
            Total Orders: {sortedOrders.length}
          </p>

          {sortedOrders.map((order) => {
            const status = String(
              order.orderStatus || ""
            ).toUpperCase();

            return (
              <div
                key={order.orderId}
                className="card border-0 shadow-sm rounded-3 mb-3"
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    <h5 className="fw-bold mb-0">
                      Order #{order.orderId}
                    </h5>

                    <span
                      className={`small fw-semibold ${
                        status === "DELIVERED"
                          ? "text-success"
                          : status === "CANCELLED"
                          ? "text-danger"
                          : "text-primary"
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  <p className="text-secondary small mt-2 mb-2">
                    {order.orderDate
                      ? new Date(order.orderDate).toLocaleDateString(
                          "en-IN"
                        )
                      : "Date not available"}
                  </p>

                  <h5
                    className="fw-bold"
                    style={{ color: "#ff6b00" }}
                  >
                    ₹
                    {Number(order.totalAmount || 0).toLocaleString(
                      "en-IN"
                    )}
                  </h5>

                  <p className="mb-3">
                    <strong>Payment Method:</strong>{" "}
                    {order.paymentMethod || "Not available"}
                  </p>

                  <div className="d-flex flex-wrap gap-2">
                    {canCancelOrder(order) && (
                      <button
                        type="button"
                        className="btn btn-sm d-inline-flex align-items-center gap-2"
                        style={{
                          backgroundColor: "#fff1f0",
                          color: "#c62828",
                          border: "1px solid #ffc9c5",
                          borderRadius: "7px",
                          fontWeight: 600,
                        }}
                        disabled={cancellingId === order.orderId}
                        onClick={() => handleCancelOrder(order)}
                      >
                        <XCircle size={15} />
                        {cancellingId === order.orderId
                          ? "Cancelling..."
                          : "Cancel Order"}
                      </button>
                    )}

                    {status === "DELIVERED" && (
                      <button
                        type="button"
                        className="btn btn-sm d-inline-flex align-items-center gap-2"
                        style={{
                          backgroundColor: "#fff0df",
                          color: "#c65300",
                          border: "1px solid #ffd0a3",
                          borderRadius: "7px",
                          fontWeight: 600,
                        }}
                        onClick={() => handleDownloadInvoice(order)}
                      >
                        <Download size={15} />
                        Download Invoice
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}
    </main>
  );
}

export default Orders;
