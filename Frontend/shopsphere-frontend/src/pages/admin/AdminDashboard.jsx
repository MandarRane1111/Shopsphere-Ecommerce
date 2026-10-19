
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  ChartNoAxesCombined,
  Settings,
  Search,
  Bell,
  Menu,
  ArrowUpRight,
  IndianRupee,
  CirclePlus,
  Store,
  Clock3,
  CheckCircle2,
  Truck,
  XCircle,
} from "lucide-react";

import "./admin.css";
import AdminProducts from "./AdminProducts";
import "./admin-products.css";
import AdminOrders from "./AdminOrders";
import "./admin-orders.css";
import { LogOut } from "lucide-react";


const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Products", icon: Package },
  { label: "Orders", icon: ShoppingBag },
];


const metrics = [
  {
    title: "Total Products",
    value: "128",
    change: "+12%",
    icon: Package,
    color: "orange",
  },
  {
    title: "Total Orders",
    value: "256",
    change: "+18%",
    icon: ShoppingBag,
    color: "blue",
  },
  {
    title: "Total Customers",
    value: "1,482",
    change: "+22%",
    icon: Users,
    color: "green",
  },
  {
    title: "Total Revenue",
    value: "₹5,24,890",
    change: "+25%",
    icon: IndianRupee,
    color: "purple",
  },
];

const sales = [38, 65, 48, 72, 80, 67, 96];

function AdminDashboard() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [period, setPeriod] = useState("Last 7 days");

  const handleAdminLogout = () => {
  localStorage.removeItem("shopsphere_admin_token");
  localStorage.removeItem("shopsphere_admin_user");

  setActivePage("Dashboard");
  window.location.replace("/admin/login");
};

  const renderStatusIcon = (status) => {
    if (status === "Confirmed") {
      return <CheckCircle2 size={14} />;
    }

    if (status === "Pending") {
      return <Clock3 size={14} />;
    }

    if (status === "Shipped") {
      return <Truck size={14} />;
    }

    if (status === "Delivered") {
      return <CheckCircle2 size={14} />;
    }

    return <XCircle size={14} />;
  };

  const formatCurrency = (amount) =>
    `₹${Number(amount).toLocaleString("en-IN")}`;

  const renderDashboard = () => (
    <>
      <section className="admin-metrics-grid">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <article className="admin-metric-card" key={metric.title}>
              <div className={`admin-metric-icon ${metric.color}`}>
                <Icon size={22} />
              </div>

              <div className="admin-metric-content">
                <span>{metric.title}</span>
                <strong>{metric.value}</strong>

                <small>
                  <ArrowUpRight size={14} />
                  {metric.change} <span>vs last period</span>
                </small>
              </div>
            </article>
          );
        })}
      </section>

      <section className="admin-dashboard-grid">
        <article className="admin-panel admin-orders-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Order Management</h2>
              <p>Manage customer orders and COD payments</p>
            </div>

            <button
              type="button"
              className="admin-text-button"
              onClick={() => setActivePage("Orders")}
            >
              View all <ArrowUpRight size={15} />
            </button>
          </div>

          <div className="admin-dashboard-shortcut">
            <div className="admin-quick-icon orange">
              <ShoppingBag size={20} />
            </div>

            <div>
              <strong>Manage customer orders</strong>
              <p>
                Update order status, track deliveries, and confirm
                Cash on Delivery payments.
              </p>
            </div>

            <button
              type="button"
              className="admin-primary-button"
              onClick={() => setActivePage("Orders")}
            >
              Open Orders
            </button>
          </div>
        </article>

        <article className="admin-panel admin-sales-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Sales Overview</h2>
              <p>Daily sales performance</p>
            </div>

            <ChartNoAxesCombined size={21} color="#ff6b00" />
          </div>

          <div className="admin-sales-total">
            <span>Revenue</span>
            <strong>₹5,24,890</strong>
            <small>
              <ArrowUpRight size={14} /> 25% growth
            </small>
          </div>

          <div className="admin-chart">
            <div className="admin-chart-grid">
              {[0, 1, 2, 3].map((line) => (
                <div key={line} />
              ))}
            </div>

            <div className="admin-chart-bars">
              {sales.map((height, index) => (
                <div className="admin-chart-column" key={index}>
                  <div
                    className={`admin-chart-bar ${
                      index === sales.length - 1 ? "highlight" : ""
                    }`}
                    style={{ height: `${height}%` }}
                    title={`Sales day ${index + 1}`}
                  />

                  <span>
                    {["8", "9", "10", "11", "12", "13", "14"][index]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-chart-legend">
            <span />
            Sales over the last 7 days
          </div>
        </article>
      </section>

      <section className="admin-bottom-grid">
        <article className="admin-panel admin-category-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Top Categories</h2>
              <p>Product distribution</p>
            </div>

            <button
              type="button"
              className="admin-small-link"
              onClick={() => setActivePage("Categories")}
            >
              Manage
            </button>
          </div>

          {[
            ["Mobiles", 32, "#ff6b00"],
            ["Laptops", 24, "#356ae6"],
            ["Electronics", 19, "#18a878"],
            ["Home Appliances", 15, "#a17be8"],
            ["Fashion", 10, "#f1b83b"],
          ].map(([name, percentage, color]) => (
            <div className="admin-category-row" key={name}>
              <div className="admin-category-label">
                <span style={{ backgroundColor: color }} />
                <span>{name}</span>
                <strong>{percentage}%</strong>
              </div>

              <div className="admin-progress-track">
                <div
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          ))}
        </article>

        <article className="admin-panel admin-quick-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Quick Actions</h2>
              <p>Shortcuts for your store</p>
            </div>
          </div>

          <button
            type="button"
            className="admin-quick-action"
            onClick={() => setActivePage("Products")}
          >
            <span className="admin-quick-icon orange">
              <CirclePlus size={19} />
            </span>

            <span>
              <strong>Add a product</strong>
              <small>Create a new store listing</small>
            </span>

            <ArrowUpRight size={17} />
          </button>

          <button
            type="button"
            className="admin-quick-action"
            onClick={() => setActivePage("Orders")}
          >
            <span className="admin-quick-icon blue">
              <ShoppingBag size={19} />
            </span>

            <span>
              <strong>Manage orders</strong>
              <small>Review purchases and payment status</small>
            </span>

            <ArrowUpRight size={17} />
          </button>

        
        </article>
      </section>

      <footer className="admin-footer">
        <span>© 2026 ShopSphere Admin</span>
        <span>Store management portal</span>
      </footer>
    </>
  );

  return (
    <div className="admin-layout">
      {mobileMenuOpen && (
        <button
          type="button"
          className="admin-mobile-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`admin-sidebar ${
          mobileMenuOpen ? "open" : ""
        }`}
      >
        <a
          href="/"
          className="admin-brand"
          onClick={() => setActivePage("Dashboard")}
        >
          <span>Shop</span>Sphere
        </a>

        <div className="admin-sidebar-caption">WORKSPACE</div>

        <nav className="admin-navigation">
          {navigation.map(({ label, icon: Icon }) => (
            <button
              type="button"
              key={label}
              className={`admin-nav-link ${
                activePage === label ? "active" : ""
              }`}
              onClick={() => {
                setActivePage(label);
                setMobileMenuOpen(false);
                setSearch("");
              }}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-store-badge">
            <div className="admin-store-icon">
              <Store size={19} />
            </div>

            <div>
              <strong>ShopSphere Store</strong>
              <span>Store management</span>
            </div>
          </div>

          <a href="/" className="admin-back-store">
            <ArrowUpRight size={17} />
            Back to Store
          </a>
          <button
  type="button"
  className="admin-logout-button"
  onClick={handleAdminLogout}
>
  <LogOut size={17} />
  Logout
</button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-icon-button admin-menu-toggle"
              onClick={() =>
                setMobileMenuOpen((open) => !open)
              }
              aria-label="Toggle navigation"
            >
              <Menu size={21} />
            </button>

            <div className="admin-search">
              <Search size={18} />

              <input
                type="search"
                placeholder="Search products, orders, customers..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search admin sections"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div className="admin-topbar-right">
            <button
              type="button"
              className="admin-icon-button admin-notification"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={20} />
              <span />
            </button>

            <div className="admin-user">
              <div className="admin-user-avatar">A</div>

              <div>
                <strong>Admin</strong>
                <span>Administrator</span>
              </div>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <div className="admin-page-heading">
            <div>
              <div className="admin-eyebrow">
                SHOPSPHERE / {activePage.toUpperCase()}
              </div>

              <h1>{activePage}</h1>

              <p>
                {activePage === "Dashboard"
                  ? "Here's what's happening with your store today."
                  : activePage === "Products"
                    ? "Manage your store's products."
                    : activePage === "Orders"
                      ? "Track orders, deliveries, and payment confirmations."
                      : `Manage your store's ${activePage.toLowerCase()}.`}
              </p>
            </div>

            {activePage === "Dashboard" && (
              <label className="admin-period">
                <span>Period</span>

                <select
                  value={period}
                  onChange={(event) =>
                    setPeriod(event.target.value)
                  }
                >
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                </select>
              </label>
            )}
          </div>

          {activePage === "Products" ? (
            <AdminProducts />
          ) : activePage === "Orders" ? (
            <AdminOrders />
          ) : activePage === "Dashboard" ? (
            renderDashboard()
          ) : (
            <section className="admin-placeholder">
              <div className="admin-placeholder-icon">
                {(() => {
                  const Item =
                    navigation.find(
                      (item) => item.label === activePage
                    )?.icon || Package;

                  return <Item size={30} />;
                })()}
              </div>

              <h2>{activePage}</h2>

              <p>
                This section is ready for implementation. We will
                connect it to the existing ShopSphere backend next.
              </p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
