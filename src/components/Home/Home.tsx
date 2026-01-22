import { useState } from "react";
import style from "./Home.module.scss";

const Home = () => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [formData, setFormData] = useState({
    accountNumber: "",
    bank: "",
    accountName: "",
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
        accountNumber: formData.accountNumber,
        bank: formData.bank,
        accountName: formData.accountName,
        amount: parseFloat(formData.amount),
      };

      const res = await fetch(
        "https://devapi.sloud.app/api/v1/transactions/simulate_payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      setResponse(data);
      console.log("API Response:", data);
    } catch (err) {
      setError("Failed to process payment. Please try again.");
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    setShowForm(false);
    setFormData({
      accountNumber: "",
      bank: "",
      accountName: "",
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

                <select
                  name="bank"
                  value={formData.bank}
                  onChange={handleInputChange}
                  className={style.formInput}
                >
                  <option value="">Select Bank</option>
                  <option value="gtb">Guaranty Trust Bank (GTB)</option>
                  <option value="zenith">Zenith Bank</option>
                  <option value="fcmb">FCMB</option>
                  <option value="access">Access Bank</option>
                </select>

                <input
                  type="text"
                  name="accountName"
                  placeholder="Account Name"
                  value={formData.accountName}
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
