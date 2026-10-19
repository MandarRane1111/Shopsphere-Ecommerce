
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
} from "../services/cartApi";

const CartContext = createContext(null);

const GUEST_CART_KEY = "shopsphere_cart";

// Convert MySQL cart data into frontend cart format
function normalizeServerCart(items) {
  return items.map((item) => ({
    id: item.productId,
    cartItemId: item.id,
    name: item.productName,
    image: item.imageUrl,
    price: Number(item.price),
    quantity: item.quantity,
  }));
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);

  const operationQueue = useRef(Promise.resolve());
  const generation = useRef(0);

  const isLoggedIn = () => {
    return Boolean(
      sessionStorage.getItem("shopsphere_token")
    );
  };

  // Redirect guest users to the login page
  const requireLogin = () => {
    if (!isLoggedIn()) {
      window.location.assign("/login");
      return false;
    }

    return true;
  };

  // Run cart operations sequentially
  const enqueue = (operation) => {
    const result = operationQueue.current.then(operation);

    operationQueue.current = result.catch((error) => {
      console.error("Cart operation failed:", error);
    });

    return result;
  };

  // Load the logged-in customer's MySQL cart
  const loadCart = useCallback(async () => {
    const currentGeneration = ++generation.current;

    const token = sessionStorage.getItem(
      "shopsphere_token"
    );

    setCartLoading(true);

    // Remove any previously saved guest cart
    localStorage.removeItem(GUEST_CART_KEY);

    if (!token) {
      setCartItems([]);
      setCartLoading(false);
      return;
    }

    try {
      await enqueue(async () => {
        const serverItems = await getCart();

        if (currentGeneration !== generation.current) {
          return;
        }

        setCartItems(normalizeServerCart(serverItems));
      });
    } catch (error) {
      console.error(
        "Unable to load MySQL cart:",
        error
      );
    } finally {
      if (currentGeneration === generation.current) {
        setCartLoading(false);
      }
    }
  }, []);

  // Reload cart when login/logout changes
  useEffect(() => {
    loadCart();

    window.addEventListener(
      "shopsphere-auth-change",
      loadCart
    );

    return () => {
      generation.current++;

      window.removeEventListener(
        "shopsphere-auth-change",
        loadCart
      );
    };
  }, [loadCart]);

  // Refresh cart from MySQL
  const refreshCart = async () => {
    if (!isLoggedIn()) {
      setCartItems([]);
      return;
    }

    const currentGeneration = generation.current;
    const serverItems = await getCart();

    if (
      currentGeneration !== generation.current ||
      !isLoggedIn()
    ) {
      return;
    }

    setCartItems(normalizeServerCart(serverItems));
  };

  // Add product to cart
  const addToCart = async (product, quantity = 1) => {
    // Redirect to login if customer is not logged in
    if (!requireLogin()) {
      return false;
    }

    const amount = Math.max(
      1,
      Number(quantity) || 1
    );

    return enqueue(async () => {
      await addCartItem(product.id, amount);
      await refreshCart();

      return true;
    });
  };

  // Remove product from cart
  const removeFromCart = async (id) => {
    if (!requireLogin()) {
      return false;
    }

    return enqueue(async () => {
      const item = cartItems.find(
        (item) => String(item.id) === String(id)
      );

      if (!item) {
        return false;
      }

      await removeCartItem(item.cartItemId);
      await refreshCart();

      return true;
    });
  };

  // Update product quantity
  const updateQuantity = async (id, quantity) => {
    if (!requireLogin()) {
      return false;
    }

    const amount = Math.max(
      1,
      Number(quantity) || 1
    );

    return enqueue(async () => {
      const item = cartItems.find(
        (item) => String(item.id) === String(id)
      );

      if (!item) {
        return false;
      }

      await updateCartItem(item.cartItemId, amount);
      await refreshCart();

      return true;
    });
  };

  // Clear all products from MySQL cart
  const clearCart = async () => {
    if (!requireLogin()) {
      return false;
    }

    return enqueue(async () => {
      const items = await getCart();

      for (const item of items) {
        await removeCartItem(item.id);
      }

      await refreshCart();

      return true;
    });
  };

  // Total quantity of products
  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Total price of products
  const cartTotal = cartItems.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}
