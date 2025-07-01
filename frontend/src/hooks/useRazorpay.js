import { useState } from "react";
import { useSelector } from "react-redux";

const useRazorpay = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const createOrder = async (courseId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/payment/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ courseId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const verifyPayment = async (paymentData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/payment/verify-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(paymentData),
        }
      );

      if (!response.ok) {
        throw new Error("Payment verification failed");
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const initiatePayment = async (courseId, courseTitle, amount) => {
    setLoading(true);
    setError(null);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Razorpay SDK failed to load");
      }

      // Create order
      const orderData = await createOrder(courseId);

      return new Promise((resolve) => {
        // Configure Razorpay options
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_your_key_id",
          amount: orderData.amount,
          currency: orderData.currency,
          name: "EduSphere",
          description: `Enrollment for ${courseTitle}`,
          order_id: orderData.orderId,
          prefill: {
            name: user?.name || "",
            email: user?.email || "",
            contact: user?.phone || "",
          },
          theme: {
            color: "#2563eb",
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
              setError("Payment cancelled by user");
              resolve({ success: false, error: "User cancelled payment" });
            },
          },
          handler: async (response) => {
            try {
              // Verify payment
              const verificationData = {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                courseId,
              };

              const verificationResult = await verifyPayment(verificationData);
              setLoading(false);
              resolve({ success: true, data: verificationResult });
            } catch (error) {
              setLoading(false);
              setError(error.message);
              resolve({ success: false, error: error.message });
            }
          },
        };

        // Open Razorpay payment modal
        const rzp = new window.Razorpay(options);
        rzp.open();
      });
    } catch (error) {
      setLoading(false);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  return {
    initiatePayment,
    loading,
    error,
  };
};

export default useRazorpay;
