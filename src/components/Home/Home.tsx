import { useState } from "react";
import style from "./Home.module.scss";

const Home = () => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [formData, setFormData] = useState({
    accountNumber: "",
    amount: "",
  });

  const handleTransferClick = () => {
    setShowForm(true);
    setError("");
    setResponse(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProceed = async () => {
    // Validation
    if (!formData.accountNumber.trim()) {
      setError("Account Number is required");
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const payload = {
        virtual_account_number: formData.accountNumber,
        amount: String(formData.amount),
        dva: false,
      };

      // Use Vite environment variable (VITE_API_BASE) with a sensible fallback for local dev.
      // Create a .env.development file with VITE_API_BASE=http://localhost:4000 when developing locally.
  const API_BASE = (import.meta as unknown as { env?: { VITE_API_BASE?: string } }).env?.VITE_API_BASE ?? 'http://localhost:4000';
      const url = `${API_BASE.replace(/\/$/, '')}/api/v1/transactions/simulate_payment`;

      console.log('Sending request to', url, 'payload=', payload);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Surface non-2xx responses as errors with body text to help debugging
      if (!res.ok) {
        const text = await res.text().catch(() => null);
        const message = text || res.statusText || `HTTP ${res.status}`;
        throw new Error(message);
      }

      const data = await res.json();
      setResponse(data);
      console.log('API Response:', data);
    } catch (err: unknown) {
      // If server returned an error message, show it to help debugging (e.g. validation errors)
      const message =
        typeof err === 'string'
          ? err
          : err && typeof (err as { message?: unknown }).message === 'string'
          ? (err as { message: string }).message
          : 'Failed to process payment. Please try again.';
      setError(message);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    setShowForm(false);
    setFormData({
      accountNumber: "",
      amount: "",
    });
    setError("");
    setResponse(null);
  };

  return (
    <div className={style.container}>
      {!showForm ? (
        <>
          <div className={style.header}>Sloud Transfer</div>

          <div className={style.accountSection}>
            <div className={style.accountLabel}>Current Account</div>
            <div className={style.accountNumber}>0531136732</div>
          </div>

          <div className={style.balanceCard}>
            <div className={style.balance}>₦100,000,000</div>
          </div>

          <button className={style.transferBtn} onClick={handleTransferClick}>
            Transfer
          </button>

          <div className={style.historySection}>
            <div className={style.noHistory}>No Transaction History</div>
          </div>
        </>
      ) : (
        <>
          <div className={style.header}>SLOUD Transfer</div>

          {!response ? (
            <>
              <form className={style.form}>
                <input
                  type="text"
                  name="accountNumber"
                  placeholder="Account Number"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  className={style.formInput}
                />


                <input
                  type="number"
                  name="amount"
                  placeholder="Amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className={style.formInput}
                />

                {error && <div className={style.errorMessage}>{error}</div>}

                <button
                  type="button"
                  className={style.proceedBtn}
                  onClick={handleProceed}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Proceed"}
                </button>
              </form>

              <button className={style.backBtn} onClick={handleBackClick}>
                Back
              </button>
            </>
          ) : (
            <>
              <div className={style.responseContainer}>
                <div className={style.responseStatus}>
                  Status: {response.status || "N/A"}
                </div>
                <div className={style.responseDetails}>
                  {JSON.stringify(response, null, 2)}
                </div>
                <button className={style.backBtn} onClick={handleBackClick}>
                  Back
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
