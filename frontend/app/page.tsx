"use client";

import { useState } from "react";
import Image from "next/image";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

const RATINGS = [1, 2, 3, 4, 5];

interface FeedbackFormState {
  customerName: string;
  business: string;
  mobile: string;
  email: string;
  rating: number;
  feedbackText: string;
}

const initialForm: FeedbackFormState = {
  customerName: "",
  business: "",
  mobile: "",
  email: "",
  rating: 0,
  feedbackText: "",
};

type Status = "idle" | "submitting" | "success" | "error";

export default function FeedbackForm() {
  const [form, setForm] = useState<FeedbackFormState>(initialForm);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRatingSelect = (value: number) => {
    setForm((prev) => ({ ...prev, rating: value }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (form.rating < 1) {
      setStatus("error");
      setErrorMessage("Please select a rating.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch(`${BACKEND_URL}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          business: form.business,
          mobile: form.mobile,
          email: form.email || undefined,
          rating: form.rating,
          feedbackText: form.feedbackText,
          sourceUrl:
            typeof window !== "undefined" ? window.location.href : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        const message = Array.isArray(result.message)
          ? result.message.join(", ")
          : result.message || "Something went wrong. Please try again.";
        throw new Error(message);
      }

      setStatus("success");
      setForm(initialForm);
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    }
  };

  if (status === "success") {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.header}>
            <Image
              src="/ipk-wealth-logo.png"
              alt="IPK Wealth"
              width={360}
              height={120}
              style={styles.logo}
              priority
            />
            <h1 style={styles.title}>Thank You!</h1>
          </div>
          <p style={styles.successText}>
            Your feedback has been submitted successfully. We appreciate you
            taking the time to share your thoughts.
          </p>
          <button
            style={styles.button}
            onClick={() => setStatus("idle")}
            type="button"
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <Image
            src="/ipk-wealth-logo.png"
            alt="IPK Wealth"
            width={360}
            height={120}
            style={styles.logo}
            priority
          />
          <h1 style={styles.title}>Feedback Form</h1>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            name="customerName"
            placeholder="Full Name"
            value={form.customerName}
            onChange={handleChange}
            required
          />

          <input
            style={styles.input}
            name="business"
            placeholder="Business Name"
            value={form.business}
            onChange={handleChange}
            required
          />

          <input
            style={styles.input}
            name="mobile"
            placeholder="Mobile Number"
            value={form.mobile}
            onChange={handleChange}
            required
          />

          <input
            style={styles.input}
            type="email"
            name="email"
            placeholder="Email Address (optional)"
            value={form.email}
            onChange={handleChange}
          />

          <div>
            <label style={styles.ratingLabel}>Rating</label>
            <div style={styles.ratingGroup}>
              {RATINGS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleRatingSelect(value)}
                  style={{
                    ...styles.ratingButton,
                    ...(form.rating === value
                      ? styles.ratingButtonActive
                      : {}),
                  }}
                  aria-pressed={form.rating === value}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <textarea
            style={styles.textarea}
            name="feedbackText"
            placeholder="Write your feedback..."
            value={form.feedbackText}
            onChange={handleChange}
            required
          />

          {status === "error" && (
            <p style={styles.errorText}>{errorMessage}</p>
          )}

          <button
            type="submit"
            style={styles.button}
            disabled={status === "submitting"}
          >
            {status === "submitting" ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f6f8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 520,
    background: "#ffffff",
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
  },
  logo: {
    objectFit: "contain",
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    color: "#0b3d78",
    margin: 0,
    fontWeight: 700,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  input: {
    height: 48,
    borderRadius: 10,
    border: "1px solid #ccc",
    padding: "0 14px",
    fontSize: 15,
    outline: "none",
  },
  textarea: {
    minHeight: 120,
    borderRadius: 10,
    border: "1px solid #ccc",
    padding: 14,
    fontSize: 15,
    outline: "none",
    resize: "vertical",
  },
  ratingLabel: {
    display: "block",
    marginBottom: 8,
    fontSize: 14,
    fontWeight: 600,
    color: "#333",
  },
  ratingGroup: {
    display: "flex",
    gap: 8,
  },
  ratingButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    border: "1px solid #ccc",
    background: "#ffffff",
    color: "#333",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
  },
  ratingButtonActive: {
    background: "#003f7f",
    borderColor: "#003f7f",
    color: "#ffffff",
  },
  errorText: {
    color: "#c0392b",
    fontSize: 14,
    margin: 0,
  },
  successText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    lineHeight: 1.6,
    marginBottom: 20,
  },
  button: {
    height: 50,
    border: "none",
    borderRadius: 10,
    background: "#003f7f",
    color: "#ffffff",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
  },
} as const;
